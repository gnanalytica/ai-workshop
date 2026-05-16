-- 0101_day_feedback_summary_exclude.sql
-- Adds an optional `p_exclude_user_ids` parameter to rpc_day_feedback_summary
-- so the Pulse dashboard can exclude admin/staff-pod members from the per-day
-- feedback rollups (matches the filtering already done in JS-side queries).
--
-- Param is optional with a default of NULL — existing callers (and any
-- non-Pulse consumers) keep working unchanged.

-- Postgres has no "create function if not exists" with parameter additions,
-- so drop-and-recreate is the safest path. Both the old and new signatures
-- are dropped to avoid leaving a stale overload.
drop function if exists public.rpc_day_feedback_summary(uuid, integer, uuid);
drop function if exists public.rpc_day_feedback_summary(uuid, integer, uuid, uuid[]);

create or replace function public.rpc_day_feedback_summary(
  p_cohort uuid,
  p_day integer,
  p_pod uuid default null,
  p_exclude_user_ids uuid[] default null
)
returns table (
  total_responses integer,
  avg_rating numeric,
  rating_1 integer,
  rating_2 integer,
  rating_3 integer,
  rating_4 integer,
  rating_5 integer,
  rows jsonb
)
language plpgsql
stable
security definer
set search_path to 'public', 'auth'
as $function$
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
       and (
         p_exclude_user_ids is null
         or not (df.user_id = any(p_exclude_user_ids))
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
$function$;

grant execute on function public.rpc_day_feedback_summary(uuid, integer, uuid, uuid[]) to authenticated;
