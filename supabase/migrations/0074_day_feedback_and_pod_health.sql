-- =============================================================================
-- 0074_day_feedback_and_pod_health.sql
--
-- Three additions:
--   1) day_feedback — end-of-day rating + fuzzy topic + free notes from each
--      student. One row per (cohort, day, student). Default visibility is
--      named; student can flip an `anonymous` flag and the staff-facing RPC
--      redacts identity for that row.
--   2) rpc_day_feedback_summary — staff-only aggregate per day (and optional
--      pod filter). Honors the anonymous flag in the per-row breakdown.
--   3) v_pod_score_summary view + grant — exposes the existing pod-score
--      math (currently faculty-only via lib/queries/faculty-cohort.ts) to
--      enrolled students so they can see their own pod's standing.
-- =============================================================================

begin;

-- ---------- 1. day_feedback table --------------------------------------------
create table if not exists day_feedback (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references cohorts (id) on delete cascade,
  day_number  int  not null,
  user_id     uuid not null references profiles (id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  fuzzy_topic text,
  notes       text,
  anonymous   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (cohort_id, day_number, user_id),
  foreign key (cohort_id, day_number) references cohort_days (cohort_id, day_number) on delete cascade
);

create index if not exists day_feedback_cohort_day_idx
  on day_feedback (cohort_id, day_number);
create index if not exists day_feedback_user_idx
  on day_feedback (user_id);

alter table day_feedback enable row level security;

-- Student: own row only.
drop policy if exists df_self on day_feedback;
create policy df_self on day_feedback
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Staff (admin or any cohort_faculty member of the cohort): read all.
drop policy if exists df_staff_read on day_feedback;
create policy df_staff_read on day_feedback
  for select using (
    has_staff_role('admin')
    or exists (
      select 1 from cohort_faculty
       where cohort_id = day_feedback.cohort_id
         and user_id = auth.uid()
    )
  );

-- ---------- 2. rpc_day_feedback_summary --------------------------------------
-- Returns aggregate + per-row breakdown for a (cohort, day). Optional p_pod
-- restricts rows to students in that pod (faculty filter their own pod).
-- Identity columns (user_id, full_name) are NULL for rows where the
-- student opted into anonymity. Caller must be admin or cohort_faculty.
drop function if exists public.rpc_day_feedback_summary(uuid, int, uuid);
create function public.rpc_day_feedback_summary(
  p_cohort uuid,
  p_day    int,
  p_pod    uuid default null
)
returns table (
  total_responses int,
  avg_rating      numeric,
  rating_1        int,
  rating_2        int,
  rating_3        int,
  rating_4        int,
  rating_5        int,
  rows            jsonb
)
language plpgsql stable security definer
set search_path = public, auth
as $$
declare
  is_admin boolean := has_staff_role('admin');
  is_fac   boolean;
begin
  is_fac := exists (
    select 1 from cohort_faculty
     where cohort_id = p_cohort and user_id = auth.uid()
  );
  if not (is_admin or is_fac) then
    return;
  end if;

  return query
  with scoped as (
    select df.*
      from day_feedback df
     where df.cohort_id = p_cohort
       and df.day_number = p_day
       and (
         p_pod is null
         or exists (
           select 1 from pod_members pm
            where pm.pod_id = p_pod
              and pm.cohort_id = p_cohort
              and pm.student_user_id = df.user_id
         )
       )
  ),
  rows_redacted as (
    select
      df.id,
      df.rating,
      df.fuzzy_topic,
      df.notes,
      df.anonymous,
      df.created_at,
      case when df.anonymous then null else df.user_id end as user_id,
      case when df.anonymous then null else p.full_name end as full_name
    from scoped df
    left join profiles p on p.id = df.user_id
    order by df.created_at desc
  )
  select
    (select count(*)::int from scoped) as total_responses,
    (select round(avg(rating)::numeric, 2) from scoped) as avg_rating,
    (select count(*)::int from scoped where rating = 1) as rating_1,
    (select count(*)::int from scoped where rating = 2) as rating_2,
    (select count(*)::int from scoped where rating = 3) as rating_3,
    (select count(*)::int from scoped where rating = 4) as rating_4,
    (select count(*)::int from scoped where rating = 5) as rating_5,
    (select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) from rows_redacted r) as rows;
end
$$;

grant execute on function public.rpc_day_feedback_summary(uuid, int, uuid) to authenticated;

-- ---------- 3. v_pod_score_summary view + grant ------------------------------
-- Surfaces per-pod aggregate score so students can see their pod ranked
-- against other pods in their cohort. Identical math to the existing
-- faculty-only computation in lib/queries/faculty-cohort.ts; we move it
-- to a SQL view so RLS can be applied uniformly.
create or replace view public.v_pod_score_summary
with (security_invoker = true) as
select
  p.cohort_id,
  p.id as pod_id,
  p.name as pod_name,
  count(distinct pm.student_user_id) as member_count,
  coalesce(sum(s.total_score), 0)::numeric as total_score,
  coalesce(round(avg(s.total_score)::numeric, 2), 0)::numeric as avg_score
from pods p
left join pod_members pm
  on pm.pod_id = p.id and pm.cohort_id = p.cohort_id
left join v_student_score s
  on s.user_id = pm.student_user_id and s.cohort_id = p.cohort_id
group by p.cohort_id, p.id, p.name;

grant select on public.v_pod_score_summary to authenticated;

commit;
