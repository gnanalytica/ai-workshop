-- 0029_rename_legacy_terms.sql
--
-- Aligns DB names with the post-refactor terminology used in the UI:
--   stuck_queue            -> help_desk_queue
--   stuck_kind             -> help_desk_kind
--   stuck_status           -> help_desk_status
--   pods.mentor_note       -> pods.shared_notes
--
-- Recreates every dependent view, RPC, policy, index, FK, and trigger that
-- referenced the old names. Pre-launch rename: no real users, no data
-- preservation tricks needed beyond the column/table rename itself.

begin;

-- ----- 1. drop dependents that pin the old names ----------------------------

drop view if exists v_stuck_open;
drop view if exists v_help_desk_open;

drop function if exists rpc_claim_stuck(uuid);
drop function if exists rpc_claim_help_desk_ticket(uuid);
drop function if exists rpc_my_help_desk_tickets(uuid);
drop function if exists rpc_create_pod(uuid, text, text);
drop function if exists rpc_update_pod(uuid, text, text);
drop function if exists rpc_my_pod(uuid);

-- ----- 2. table + column + enum + index + FK + trigger renames --------------

alter type stuck_kind   rename to help_desk_kind;
alter type stuck_status rename to help_desk_status;

alter table stuck_queue rename to help_desk_queue;

alter table help_desk_queue rename constraint stuck_queue_pkey            to help_desk_queue_pkey;
alter table help_desk_queue rename constraint stuck_queue_user_id_fkey   to help_desk_queue_user_id_fkey;
alter table help_desk_queue rename constraint stuck_queue_cohort_id_fkey to help_desk_queue_cohort_id_fkey;
alter table help_desk_queue rename constraint stuck_queue_claimed_by_fkey to help_desk_queue_claimed_by_fkey;
alter table help_desk_queue rename constraint stuck_queue_escalated_by_fkey to help_desk_queue_escalated_by_fkey;

alter index stuck_queue_open_idx       rename to help_desk_queue_open_idx;
alter index stuck_queue_escalated_idx  rename to help_desk_queue_escalated_idx;

alter trigger trg_stuck_queue_updated_at on help_desk_queue rename to trg_help_desk_queue_updated_at;

alter table pods rename column mentor_note to shared_notes;

-- ----- 3. RLS policies (rename for clarity) ---------------------------------

drop policy if exists sq_self    on help_desk_queue;
drop policy if exists sq_triage  on help_desk_queue;

create policy hdq_self on help_desk_queue
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy hdq_triage on help_desk_queue
  for all to authenticated
  using (
    has_cap('support.triage', cohort_id)
    and (kind <> 'tech' or has_cap('support.tech_only'))
  )
  with check (
    has_cap('support.triage', cohort_id)
    and (kind <> 'tech' or has_cap('support.tech_only'))
  );

-- ----- 4. recreate the support / triage view --------------------------------

create or replace view v_help_desk_open as
select
  s.id, s.cohort_id, s.kind, s.status, s.message, s.created_at,
  prof.full_name    as student_name,
  prof.email        as student_email,
  claimer.full_name as claimed_by_name
from help_desk_queue s
join profiles prof on prof.id = s.user_id
left join profiles claimer on claimer.id = s.claimed_by
where s.status in ('open', 'helping');

alter view public.v_help_desk_open set (security_invoker = on);

-- ----- 5. recreate ticket-claim RPC under new name --------------------------

create or replace function rpc_claim_help_desk_ticket(p_id uuid)
returns help_desk_queue
language plpgsql security definer set search_path = public, auth
as $$
declare
  row      help_desk_queue;
  v_cohort uuid;
  v_kind   help_desk_kind;
begin
  select cohort_id, kind into v_cohort, v_kind from help_desk_queue where id = p_id;
  if v_cohort is null then raise exception 'not found'; end if;

  if not (has_cap('support.triage', v_cohort)
          and (v_kind <> 'tech' or has_cap('support.tech_only'))) then
    raise exception 'permission denied: support.triage';
  end if;

  update help_desk_queue
     set claimed_by = auth.uid(), status = 'helping', updated_at = now()
   where id = p_id and status = 'open'
  returning * into row;

  return row;
end
$$;

revoke all on function rpc_claim_help_desk_ticket(uuid) from public;
grant execute on function rpc_claim_help_desk_ticket(uuid) to authenticated;

-- ----- 6. recreate "my tickets" RPC under the renamed table -----------------

create or replace function public.rpc_my_help_desk_tickets(p_cohort_id uuid)
returns table (
  id uuid,
  kind help_desk_kind,
  status help_desk_status,
  message text,
  created_at timestamptz,
  updated_at timestamptz,
  escalated_at timestamptz,
  queue_position int,
  open_in_cohort int
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not is_enrolled_in(p_cohort_id) then
    raise exception 'not enrolled' using errcode = '42501';
  end if;

  return query
  with open_ranked as (
    select
      s.id,
      row_number() over (order by s.created_at asc, s.id asc) as pos
    from help_desk_queue s
    where s.cohort_id = p_cohort_id
      and s.status = 'open'
  ),
  open_cnt as (
    select count(*)::int as c
    from help_desk_queue
    where cohort_id = p_cohort_id
      and status = 'open'
  )
  select
    m.id,
    m.kind,
    m.status,
    m.message,
    m.created_at,
    m.updated_at,
    m.escalated_at,
    (case when m.status = 'open' then o.pos else null end)::int,
    (select c from open_cnt)
  from help_desk_queue m
  left join open_ranked o on o.id = m.id
  where m.cohort_id = p_cohort_id
    and m.user_id = auth.uid()
  order by m.created_at desc;
end;
$$;

revoke all on function public.rpc_my_help_desk_tickets(uuid) from public;
grant execute on function public.rpc_my_help_desk_tickets(uuid) to authenticated;

-- ----- 7. recreate pod RPCs with renamed param/column -----------------------

create or replace function rpc_create_pod(
  p_cohort       uuid,
  p_name         text,
  p_shared_notes text default null
) returns pods
language plpgsql security definer set search_path = public, auth
as $$
declare
  v_pod pods;
begin
  if not has_cap('pods.write', p_cohort) then
    insert into rbac_events(user_id, cap, granted, ctx)
      values (auth.uid(), 'pods.write', false,
              jsonb_build_object('action','create_pod','cohort',p_cohort));
    raise exception 'permission denied: pods.write on cohort %', p_cohort;
  end if;

  insert into pods(cohort_id, name, shared_notes)
    values (p_cohort, p_name, p_shared_notes)
  returning * into v_pod;

  return v_pod;
end
$$;

create or replace function rpc_update_pod(
  p_pod_id       uuid,
  p_name         text default null,
  p_shared_notes text default null
) returns pods
language plpgsql security definer set search_path = public, auth
as $$
declare
  v_cohort uuid;
  v_pod    pods;
begin
  select cohort_id into v_cohort from pods where id = p_pod_id;
  if v_cohort is null then
    raise exception 'pod % not found', p_pod_id;
  end if;
  if not has_cap('pods.write', v_cohort) then
    raise exception 'permission denied: pods.write on cohort %', v_cohort;
  end if;

  update pods
     set name         = coalesce(p_name, name),
         shared_notes = coalesce(p_shared_notes, shared_notes)
   where id = p_pod_id
  returning * into v_pod;

  return v_pod;
end
$$;

grant execute on function rpc_create_pod(uuid, text, text) to authenticated;
grant execute on function rpc_update_pod(uuid, text, text) to authenticated;

-- ----- 8. recreate rpc_my_pod with the renamed column -----------------------

create or replace function rpc_my_pod(p_cohort uuid)
returns table(
  pod_id uuid,
  pod_name text,
  shared_notes text,
  faculty jsonb
)
language sql stable security definer set search_path = public, auth
as $$
  select
    p.id,
    p.name,
    p.shared_notes,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', pf.faculty_user_id,
        'full_name', prof.full_name,
        'avatar_url', prof.avatar_url
      ))
      from pod_faculty pf
      join profiles prof on prof.id = pf.faculty_user_id
      where pf.pod_id = p.id
    ), '[]'::jsonb) as faculty
  from pod_members m
  join pods p on p.id = m.pod_id
  where m.cohort_id = p_cohort
    and m.student_user_id = auth.uid();
$$;

grant execute on function rpc_my_pod(uuid) to authenticated;

-- ----- 9. capability rename: board.{read,write} -> community.{read,write} ---
-- The DB grants these strings via auth_caps(); the actual board_posts table
-- name is intentionally left alone here (no UI exposure).

create or replace function auth_caps(p_cohort uuid default null)
returns text[]
language plpgsql stable security definer set search_path = public, auth
as $$
declare
  caps text[] := array[]::text[];
  is_admin       boolean := has_staff_role('admin');
  is_trainer     boolean := has_staff_role('trainer');
  is_tech_supp   boolean := has_staff_role('tech_support');
  is_faculty     boolean;
  enrolled       boolean;
begin
  if auth.uid() is null then
    return caps;
  end if;

  if is_admin then
    caps := caps || array[
      'content.read','content.write',
      'schedule.read','schedule.write',
      'roster.read','roster.write',
      'pods.write','faculty.write',
      'grading.read','grading.write:cohort',
      'analytics.read:cohort','analytics.read:program',
      'moderation.write',
      'support.triage','support.tech_only','support.escalate',
      'orgs.write'
    ];
  end if;

  if is_trainer then
    caps := caps || array[
      'content.read','content.write',
      'schedule.read','schedule.write',
      'roster.read',
      'pods.write','faculty.write',
      'grading.read','grading.write:cohort',
      'analytics.read:cohort',
      'support.triage','support.escalate'
    ];
  end if;

  if is_tech_supp then
    caps := caps || array[
      'content.read','schedule.read','roster.read',
      'support.triage','support.tech_only','support.escalate',
      'moderation.write'
    ];
  end if;

  if p_cohort is not null then
    is_faculty := exists (
      select 1 from cohort_faculty
       where cohort_id = p_cohort and user_id = auth.uid()
    );

    if is_faculty then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
        'grading.read','grading.write:pod',
        'support.triage','support.escalate',
        'moderation.write',
        'community.read','community.write'
      ];
    end if;

    enrolled := is_enrolled_in(p_cohort);
    if enrolled then
      caps := caps || array[
        'content.read','schedule.read',
        'self.read','self.write',
        'community.read','community.write',
        'attendance.self'
      ];
    end if;
  else
    is_faculty := exists (
      select 1 from cohort_faculty where user_id = auth.uid()
    );

    if is_faculty then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
        'grading.read','grading.write:pod',
        'support.triage','support.escalate',
        'moderation.write',
        'community.read','community.write'
      ];
    end if;

    enrolled := exists (
      select 1 from registrations
       where user_id = auth.uid() and status = 'confirmed'
    );

    if enrolled then
      caps := caps || array[
        'content.read','schedule.read',
        'self.read','self.write',
        'community.read','community.write',
        'attendance.self'
      ];
    end if;
  end if;

  return (select array_agg(distinct c) from unnest(caps) c);
end
$$;

grant execute on function auth_caps(uuid) to authenticated;

-- ----- 10. board_* tables -> community_* ------------------------------------
-- Rename the Q&A board tables to match the post-refactor "Community" naming.
-- Drops the leaderboard view that depends on them, then recreates it.

drop view if exists v_student_score;

drop policy if exists bp_read on board_posts;
drop policy if exists bp_self_write on board_posts;
drop policy if exists bp_self_update on board_posts;
drop policy if exists bp_mod on board_posts;
drop policy if exists br_read on board_replies;
drop policy if exists br_self_write on board_replies;
drop policy if exists br_self_update on board_replies;
drop policy if exists br_mod on board_replies;
drop policy if exists bv_self on board_votes;

alter table board_posts   rename to community_posts;
alter table board_replies rename to community_replies;
alter table board_votes   rename to community_votes;

alter table community_posts   rename constraint board_posts_pkey            to community_posts_pkey;
alter table community_posts   rename constraint board_posts_author_id_fkey  to community_posts_author_id_fkey;
alter table community_posts   rename constraint board_posts_cohort_id_fkey  to community_posts_cohort_id_fkey;

alter table community_replies rename constraint board_replies_pkey            to community_replies_pkey;
alter table community_replies rename constraint board_replies_author_id_fkey  to community_replies_author_id_fkey;
alter table community_replies rename constraint board_replies_post_id_fkey   to community_replies_post_id_fkey;

alter table community_votes rename constraint board_votes_user_id_fkey  to community_votes_user_id_fkey;
alter table community_votes rename constraint board_votes_post_id_fkey  to community_votes_post_id_fkey;
alter table community_votes rename constraint board_votes_reply_id_fkey to community_votes_reply_id_fkey;

alter index board_posts_cohort_active_idx rename to community_posts_cohort_active_idx;
alter index board_posts_canonical_idx     rename to community_posts_canonical_idx;

alter trigger trg_board_posts_updated_at   on community_posts   rename to trg_community_posts_updated_at;
alter trigger trg_board_replies_updated_at on community_replies rename to trg_community_replies_updated_at;

create policy cp_read on community_posts
  for select using (
    deleted_at is null and (is_enrolled_in(cohort_id) or has_cap('content.read', cohort_id))
  );
create policy cp_self_write on community_posts
  for insert with check (author_id = auth.uid() and is_enrolled_in(cohort_id));
create policy cp_self_update on community_posts
  for update using (author_id = auth.uid() and deleted_at is null)
  with check (author_id = auth.uid());
create policy cp_mod on community_posts
  for all using (has_cap('moderation.write')) with check (has_cap('moderation.write'));

create policy cr_read on community_replies
  for select using (
    deleted_at is null and exists (
      select 1 from community_posts p where p.id = community_replies.post_id
        and (is_enrolled_in(p.cohort_id) or has_cap('content.read', p.cohort_id))
    )
  );
create policy cr_self_write on community_replies
  for insert with check (
    author_id = auth.uid() and exists (
      select 1 from community_posts p where p.id = community_replies.post_id and is_enrolled_in(p.cohort_id)
    )
  );
create policy cr_self_update on community_replies
  for update using (author_id = auth.uid() and deleted_at is null)
  with check (author_id = auth.uid());
create policy cr_mod on community_replies
  for all using (has_cap('moderation.write')) with check (has_cap('moderation.write'));

create policy cv_self on community_votes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

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

commit;
