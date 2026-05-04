-- =============================================================================
-- 0088_cohort_meet_link.sql
--
-- Move the live-session "Join" link from cohort_days.meet_link (per-day) to
-- cohorts.meet_link (per-cohort). Workshops use one recurring room — admins
-- don't want to set the same link 30 times. cohort_days.meet_link is left
-- in place as legacy data; the app now reads/writes cohorts.meet_link.
-- =============================================================================

alter table public.cohorts
  add column if not exists meet_link text;

-- Backfill: if every existing day on a cohort had the same non-null meet_link,
-- promote it to the cohort row. Otherwise leave the cohort row null and the
-- admin can set it explicitly.
update public.cohorts c
   set meet_link = sub.link
  from (
    select cohort_id, min(meet_link) as link
      from public.cohort_days
     where meet_link is not null
     group by cohort_id
    having count(distinct meet_link) = 1
  ) sub
 where sub.cohort_id = c.id
   and c.meet_link is null;

-- Faculty/admin RPC mirroring 0062 but cohort-scoped.
create or replace function public.set_cohort_meet_link(
  p_cohort uuid,
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

  v_is_fac := exists (
    select 1 from cohort_faculty
     where cohort_id = p_cohort and user_id = v_uid
  );

  if not (v_is_admin or v_is_fac) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- Empty/whitespace clears. Otherwise require an http(s) URL.
  v_link_clean := nullif(btrim(coalesce(p_link, '')), '');
  if v_link_clean is not null and v_link_clean !~* '^https?://' then
    raise exception 'meet_link must be an http(s) URL' using errcode = '22023';
  end if;

  update cohorts
     set meet_link = v_link_clean,
         updated_at = now()
   where id = p_cohort;

  if not found then
    raise exception 'cohort not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.set_cohort_meet_link(uuid, text) from public;
grant execute on function public.set_cohort_meet_link(uuid, text) to authenticated;
