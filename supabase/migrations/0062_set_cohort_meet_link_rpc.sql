-- =============================================================================
-- 0062_set_cohort_meet_link_rpc.sql
--
-- Lets faculty (in addition to admins) update only the `meet_link` column on a
-- cohort_day for their assigned cohort, without granting them the broader
-- schedule.write capability. Admin still uses the regular updateCohortDay path
-- to edit title / live_session_at / unlock; faculty go through this narrow
-- SECURITY DEFINER RPC, which is scoped to a single column on a single row.
-- =============================================================================

create or replace function public.set_cohort_day_meet_link(
  p_cohort uuid,
  p_day    int,
  p_link   text
) returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid       uuid := auth.uid();
  v_is_admin  boolean := has_staff_role('admin');
  v_is_fac    boolean;
  v_link_clean text;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if p_day is null or p_day < 1 or p_day > 60 then
    raise exception 'invalid day_number' using errcode = '22023';
  end if;

  v_is_fac := exists (
    select 1 from cohort_faculty
     where cohort_id = p_cohort and user_id = v_uid
  );

  if not (v_is_admin or v_is_fac) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- Empty/whitespace link clears the value. Otherwise require an http(s) URL.
  v_link_clean := nullif(btrim(coalesce(p_link, '')), '');
  if v_link_clean is not null and v_link_clean !~* '^https?://' then
    raise exception 'meet_link must be an http(s) URL' using errcode = '22023';
  end if;

  update cohort_days
     set meet_link = v_link_clean,
         updated_at = now()
   where cohort_id = p_cohort
     and day_number = p_day;

  if not found then
    raise exception 'cohort_day not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.set_cohort_day_meet_link(uuid, int, text) from public;
grant execute on function public.set_cohort_day_meet_link(uuid, int, text) to authenticated;
