-- =============================================================================
-- 0023_leaderboard_and_notes.sql -- Cumulative student score view powering the
-- leaderboard, plus a faculty private-notes table for per-student observations
-- inside a pod. Notes are private to faculty (admin/trainer/tech_support can
-- read; students cannot read other students' notes).
-- =============================================================================

-- ----- v_student_score -------------------------------------------------------
-- Cumulative score per (cohort, student). Components are intentionally simple
-- and additive; tune weights here as the workshop evolves.
--
--   quiz_score        = sum of completed quiz_attempts.score (0–100 each)
--   submission_score  = sum of submissions.score for graded submissions
--   posts_score       = 5 * count(non-deleted board_posts authored)
--   comments_score    = 2 * count(non-deleted board_replies authored)
--   upvotes_score     = sum of (+1 votes received on own posts/replies)
--                     - sum of (-1 votes received)

create or replace view v_student_score as
with
  q as (
    select qz.cohort_id, qa.user_id, sum(coalesce(qa.score, 0)) as score
      from quiz_attempts qa
      join quizzes qz on qz.id = qa.quiz_id
     where qa.completed_at is not null
     group by qz.cohort_id, qa.user_id
  ),
  s as (
    select a.cohort_id, sub.user_id, sum(coalesce(sub.score, 0)) as score
      from submissions sub
      join assignments a on a.id = sub.assignment_id
     where sub.status = 'graded'
     group by a.cohort_id, sub.user_id
  ),
  p as (
    select cohort_id, author_id as user_id, count(*) * 5 as score
      from board_posts
     where deleted_at is null and author_id is not null
     group by cohort_id, author_id
  ),
  c as (
    select bp.cohort_id, br.author_id as user_id, count(*) * 2 as score
      from board_replies br
      join board_posts bp on bp.id = br.post_id
     where br.deleted_at is null and br.author_id is not null
     group by bp.cohort_id, br.author_id
  ),
  v_post as (
    select bp.cohort_id, bp.author_id as user_id, sum(bv.value)::int as score
      from board_votes bv
      join board_posts bp on bp.id = bv.post_id
     where bp.deleted_at is null and bp.author_id is not null
     group by bp.cohort_id, bp.author_id
  ),
  v_reply as (
    select bp.cohort_id, br.author_id as user_id, sum(bv.value)::int as score
      from board_votes bv
      join board_replies br on br.id = bv.reply_id
      join board_posts bp on bp.id = br.post_id
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

-- ----- faculty_pod_notes -----------------------------------------------------
-- Private observations a faculty leaves on a student in their pod. Visible to
-- any faculty in that cohort + admin/trainer/tech_support. Never visible to
-- the student or to other students.

create table if not exists faculty_pod_notes (
  id           uuid primary key default gen_random_uuid(),
  cohort_id    uuid not null references cohorts (id) on delete cascade,
  student_id   uuid not null references profiles (id) on delete cascade,
  author_id    uuid not null references profiles (id) on delete set null,
  body_md      text not null,
  needs_followup boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists faculty_pod_notes_student_idx
  on faculty_pod_notes (cohort_id, student_id, created_at desc);

create index if not exists faculty_pod_notes_followup_idx
  on faculty_pod_notes (cohort_id) where needs_followup;

alter table faculty_pod_notes enable row level security;

drop policy if exists fpn_read on faculty_pod_notes;
create policy fpn_read on faculty_pod_notes
  for select using (
    has_cap('roster.read', cohort_id)
    and exists (select 1 from cohort_faculty cf
                 where cf.cohort_id = faculty_pod_notes.cohort_id
                   and cf.user_id = auth.uid())
    or has_staff_role('admin')
    or has_staff_role('trainer')
    or has_staff_role('tech_support')
  );

drop policy if exists fpn_write on faculty_pod_notes;
create policy fpn_write on faculty_pod_notes
  for insert with check (
    author_id = auth.uid()
    and (has_staff_role('admin') or has_staff_role('trainer')
         or exists (select 1 from cohort_faculty cf
                     where cf.cohort_id = faculty_pod_notes.cohort_id
                       and cf.user_id = auth.uid()))
  );

drop policy if exists fpn_update on faculty_pod_notes;
create policy fpn_update on faculty_pod_notes
  for update using (author_id = auth.uid() or has_staff_role('admin'));

drop policy if exists fpn_delete on faculty_pod_notes;
create policy fpn_delete on faculty_pod_notes
  for delete using (author_id = auth.uid() or has_staff_role('admin'));

-- ----- pods.name rename via existing pods.write cap --------------------------
-- (no schema change; documenting that update on `pods` is gated by has_cap on
-- the row's cohort_id; pods_write policy already enforces this.)
