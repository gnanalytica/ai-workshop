-- =============================================================================
-- 0018_fix_cf_recursion.sql -- Break the infinite-recursion loop in
-- cohort_faculty.cf_read.
--
-- The previous policy contained:
--   EXISTS (SELECT 1 FROM cohort_faculty cf2 WHERE cf2.cohort_id = ... AND cf2.user_id = auth.uid())
-- Postgres re-applies cf_read to that inner query, recurses, and aborts with
--   42P17: infinite recursion detected in policy for relation "cohort_faculty"
-- The blast radius reaches profiles too: profiles_faculty_read joins
-- cohort_faculty, so any read on profiles (e.g. AppShell.getProfile) fails.
--
-- Fix: lift the "is the current user a co-faculty in this cohort?" check into
-- a SECURITY DEFINER helper that bypasses RLS and is therefore non-recursive.
-- =============================================================================

create or replace function _is_cohort_faculty(p_cohort uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from cohort_faculty
     where cohort_id = p_cohort
       and user_id = auth.uid()
  );
$$;

revoke execute on function _is_cohort_faculty(uuid) from public;
grant  execute on function _is_cohort_faculty(uuid) to anon, authenticated;

drop policy if exists cf_read on cohort_faculty;
create policy cf_read on cohort_faculty
  for select using (
    user_id = auth.uid()
    or has_cap('roster.read', cohort_id)
    or _is_cohort_faculty(cohort_id)
  );
