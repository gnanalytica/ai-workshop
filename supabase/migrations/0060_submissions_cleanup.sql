-- =============================================================================
-- 0060_submissions_cleanup.sql
--
-- Cleanup pass on the submission/assignment model:
--   1. Drop the orphan peer_review_status enum (table was dropped in 0025).
--   2. Drop 'quiz' from assignment_kind (quizzes live in their own tables).
--   3. Drop 'returned' from submission_status (never used).
--   4. Rename submissions.attachments -> submissions.links and reshape JSON
--      from {name,url}[] to {label,url}[].
--   5. Add assignments.weight (numeric, default 1) and assignments.auto_grade
--      (bool, default true). Reflections weight=0 (unscored), capstones
--      auto_grade=false (admin-only manual review).
--   6. Add capstone_projects table — one project per (cohort_id, user_id).
--   7. Recreate v_student_score to honor weights + skip reflections.
-- =============================================================================

-- ----- 1. drop orphan peer_review_status enum --------------------------------

drop type if exists peer_review_status;

-- ----- 2/3. rebuild assignment_kind (drop 'quiz') and submission_status -----

-- assignment_kind: 'lab' | 'capstone' | 'reflection'
-- v_student_score and v_student_progress both reference submissions.status,
-- so they must be dropped before the type swap; recreated below.

drop view if exists v_student_score;
drop view if exists v_student_progress;

-- safety: defensively delete any orphan kind='quiz' rows. Seeds don't create
-- them, but production data may.
delete from assignments where kind = 'quiz';

alter type assignment_kind rename to assignment_kind_old;
create type assignment_kind as enum ('lab', 'capstone', 'reflection');
alter table assignments
  alter column kind type assignment_kind using kind::text::assignment_kind;
drop type assignment_kind_old;

-- submission_status: 'draft' | 'submitted' | 'graded'
delete from submissions where status = 'returned';

-- subs_self_update policy references the status enum; drop + recreate around
-- the type swap.
drop policy if exists subs_self_update on submissions;

alter type submission_status rename to submission_status_old;
create type submission_status as enum ('draft', 'submitted', 'graded');
alter table submissions
  alter column status drop default;
alter table submissions
  alter column status type submission_status using status::text::submission_status;
alter table submissions
  alter column status set default 'draft';
drop type submission_status_old;

create policy subs_self_update on submissions
  for update
  using ((user_id = auth.uid()) and (status = any (array['draft'::submission_status, 'submitted'::submission_status])))
  with check ((user_id = auth.uid()) and (status = any (array['draft'::submission_status, 'submitted'::submission_status])));

-- recreate v_student_progress (mirrors the original definition).
create view v_student_progress with (security_invoker = on) as
  select r.cohort_id,
         r.user_id,
         prof.full_name,
         prof.email,
         (select count(*) from lab_progress lp
           where lp.user_id = r.user_id and lp.cohort_id = r.cohort_id and lp.status = 'done'::lab_status) as labs_done,
         (select count(*) from submissions s
           join assignments a on a.id = s.assignment_id
           where s.user_id = r.user_id and a.cohort_id = r.cohort_id and s.status = 'graded'::submission_status) as graded_subs,
         (select count(*) from attendance a
           where a.user_id = r.user_id and a.cohort_id = r.cohort_id and a.status = 'present'::attendance_status) as days_present
    from registrations r
    join profiles prof on prof.id = r.user_id
   where r.status = 'confirmed'::registration_status;

grant select on v_student_progress to authenticated;

-- ----- 4. rename attachments -> links ----------------------------------------

-- The old shape was {name,url}[]; new shape is {label,url}[]. Existing rows
-- carry an empty array (per seeds) so a key rename is safe; coerce any
-- legacy 'name' keys to 'label' just in case.

alter table submissions rename column attachments to links;
update submissions
   set links = coalesce(
     (select jsonb_agg(
        jsonb_build_object(
          'label', coalesce(elem->>'label', elem->>'name', ''),
          'url',   coalesce(elem->>'url',   '')
        )
      )
      from jsonb_array_elements(links) elem),
     '[]'::jsonb
   )
 where jsonb_typeof(links) = 'array' and jsonb_array_length(links) > 0;

-- ----- 5. assignments.weight + auto_grade ------------------------------------

alter table assignments
  add column if not exists weight numeric not null default 1,
  add column if not exists auto_grade boolean not null default true;

-- Reflections are unscored (completion-only). Capstones are admin-graded.
update assignments set weight = 0,        auto_grade = true  where kind = 'reflection';
update assignments set weight = 3,        auto_grade = false where kind = 'capstone';
update assignments set weight = 1,        auto_grade = true  where kind = 'lab';

-- ----- 6. capstone_projects --------------------------------------------------

create table if not exists capstone_projects (
  id                 uuid primary key default gen_random_uuid(),
  cohort_id          uuid not null references cohorts (id)  on delete cascade,
  user_id            uuid not null references profiles (id) on delete cascade,
  title              text,
  problem_statement  text,
  target_user        text,
  repo_url           text,
  demo_url           text,
  status             text not null default 'exploring'
                     check (status in ('exploring', 'locked', 'building', 'shipped')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (cohort_id, user_id)
);

create index if not exists capstone_projects_cohort_idx
  on capstone_projects (cohort_id);

drop trigger if exists trg_capstone_projects_updated on capstone_projects;
create trigger trg_capstone_projects_updated
  before update on capstone_projects
  for each row execute function set_updated_at();

alter table capstone_projects enable row level security;

drop policy if exists cap_self        on capstone_projects;
drop policy if exists cap_self_write  on capstone_projects;
drop policy if exists cap_staff_read  on capstone_projects;
drop policy if exists cap_staff_write on capstone_projects;

-- Student: read + write own row, only inside a cohort they're enrolled in.
create policy cap_self on capstone_projects
  for select using (user_id = auth.uid() and is_enrolled_in(cohort_id));
create policy cap_self_write on capstone_projects
  for insert with check (user_id = auth.uid() and is_enrolled_in(cohort_id));
create policy cap_self_update on capstone_projects
  for update using (user_id = auth.uid() and is_enrolled_in(cohort_id))
            with check (user_id = auth.uid() and is_enrolled_in(cohort_id));

-- Staff (admin/faculty with roster.read on this cohort): read everything.
create policy cap_staff_read on capstone_projects
  for select using (has_cap('roster.read', cohort_id));

grant select, insert, update on capstone_projects to authenticated;

-- ----- 7. v_student_score: weighted submission_score, exclude reflections ----

create view v_student_score with (security_invoker = on) as
with
  q as (
    select qz.cohort_id, qa.user_id, sum(coalesce(qa.score, 0)) as score
      from quiz_attempts qa
      join quizzes qz on qz.id = qa.quiz_id
     where qa.completed_at is not null
     group by qz.cohort_id, qa.user_id
  ),
  s as (
    select a.cohort_id,
           sub.user_id,
           sum(coalesce(sub.score, 0) * coalesce(a.weight, 1)) as score
      from submissions sub
      join assignments a on a.id = sub.assignment_id
     where sub.status = 'graded'
       and a.kind <> 'reflection'
       and coalesce(a.weight, 1) > 0
     group by a.cohort_id, sub.user_id
  ),
  p as (
    select cohort_id, author_id as user_id, count(*) * 5 as score
      from community_posts
     where deleted_at is null and author_id is not null
     group by cohort_id, author_id
  ),
  c as (
    select bp.cohort_id, br.author_id as user_id, count(*) * 2 as score
      from community_replies br
      join community_posts bp on bp.id = br.post_id
     where br.deleted_at is null and br.author_id is not null
     group by bp.cohort_id, br.author_id
  ),
  v_post as (
    select bp.cohort_id, bp.author_id as user_id, sum(bv.value)::int as score
      from community_votes bv
      join community_posts bp on bp.id = bv.post_id
     where bp.deleted_at is null and bp.author_id is not null
     group by bp.cohort_id, bp.author_id
  ),
  v_reply as (
    select bp.cohort_id, br.author_id as user_id, sum(bv.value)::int as score
      from community_votes bv
      join community_replies br on br.id = bv.reply_id
      join community_posts bp on bp.id = br.post_id
     where br.deleted_at is null and br.author_id is not null
     group by bp.cohort_id, br.author_id
  ),
  ids as (
    select cohort_id, user_id from q
    union select cohort_id, user_id from s
    union select cohort_id, user_id from p
    union select cohort_id, user_id from c
    union select cohort_id, user_id from v_post
    union select cohort_id, user_id from v_reply
  )
select
  ids.cohort_id,
  ids.user_id,
  coalesce(q.score, 0)::numeric         as quiz_score,
  coalesce(s.score, 0)::numeric         as submission_score,
  coalesce(p.score, 0)::numeric         as posts_score,
  coalesce(c.score, 0)::numeric         as comments_score,
  (coalesce(v_post.score, 0) + coalesce(v_reply.score, 0))::numeric as upvotes_score,
  (coalesce(q.score, 0)
    + coalesce(s.score, 0)
    + coalesce(p.score, 0)
    + coalesce(c.score, 0)
    + coalesce(v_post.score, 0)
    + coalesce(v_reply.score, 0))::numeric as total_score
from ids
left join q       on q.cohort_id = ids.cohort_id and q.user_id = ids.user_id
left join s       on s.cohort_id = ids.cohort_id and s.user_id = ids.user_id
left join p       on p.cohort_id = ids.cohort_id and p.user_id = ids.user_id
left join c       on c.cohort_id = ids.cohort_id and c.user_id = ids.user_id
left join v_post  on v_post.cohort_id  = ids.cohort_id and v_post.user_id  = ids.user_id
left join v_reply on v_reply.cohort_id = ids.cohort_id and v_reply.user_id = ids.user_id;

grant select on v_student_score to authenticated;
