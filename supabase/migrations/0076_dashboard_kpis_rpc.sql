-- =============================================================================
-- 0076_dashboard_kpis_rpc.sql
--
-- Collapses three count-style queries from web/lib/queries/dashboard.ts into a
-- single round-trip. Also replaces the service-role escape hatch the TS code
-- used for admin-previewing-as-student: callers pass p_user; the function
-- itself enforces "only admin may target a different user".
--
-- Returns:
--   days_complete       — distinct days with lab_progress.status='done'
--   attendance_count    — attendance rows status='present'
--   pending_assignments — submissions with status='draft' for this cohort
-- =============================================================================

begin;

drop function if exists public.rpc_dashboard_kpis(uuid, uuid);

create function public.rpc_dashboard_kpis(
  p_cohort uuid,
  p_user   uuid default null
)
returns table (
  days_complete       int,
  attendance_count    int,
  pending_assignments int
)
language plpgsql stable security definer
set search_path = public, auth
as $$
declare
  v_caller   uuid := auth.uid();
  v_target   uuid;
  v_is_admin boolean;
begin
  if v_caller is null then
    return;
  end if;

  v_is_admin := has_staff_role('admin');

  -- Only admins may target a different user (preview-as-student).
  if p_user is not null and p_user <> v_caller and not v_is_admin then
    return;
  end if;

  v_target := coalesce(p_user, v_caller);

  -- Cohort scope: admin, faculty in this cohort, or enrolled student.
  if not (
    v_is_admin
    or is_enrolled_in(p_cohort)
    or exists (
      select 1 from cohort_faculty
       where cohort_id = p_cohort and user_id = v_caller
    )
  ) then
    return;
  end if;

  return query
    select
      (select count(distinct lp.day_number)::int
         from lab_progress lp
        where lp.cohort_id = p_cohort
          and lp.user_id   = v_target
          and lp.status    = 'done')                as days_complete,
      (select count(*)::int
         from attendance a
        where a.cohort_id = p_cohort
          and a.user_id   = v_target
          and a.status    = 'present')              as attendance_count,
      (select count(*)::int
         from submissions s
         join assignments a on a.id = s.assignment_id
        where a.cohort_id = p_cohort
          and s.user_id   = v_target
          and s.status    = 'draft')                as pending_assignments;
end
$$;

grant execute on function public.rpc_dashboard_kpis(uuid, uuid) to authenticated;

commit;
