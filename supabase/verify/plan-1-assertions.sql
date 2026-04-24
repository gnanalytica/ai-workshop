-- plan-1-assertions.sql
-- Purpose: SQL verification scaffold for Plan 1 (Role Foundations).
-- Run each section in the Supabase SQL editor (staging) AFTER applying
-- the corresponding migration. Fill in the TODO markers with actual
-- output from staging once the migrations are applied.
--
-- Header (fill in after staging run):
-- TODO(fill in after staging run): Date applied to staging:
-- TODO(fill in after staging run): Staging project ref:
-- TODO(fill in after staging run): Count of profiles with staff_roles populated, by role combination:
-- TODO(fill in after staging run): Count of cohort_faculty rows by college_role:
-- TODO(fill in after staging run): Admin UUID used for helper testing (so Plan 2 can reuse it):
-- TODO(fill in after staging run): Postgres version (select version();):

-- =============================================================================
-- TASK 1: profiles.staff_roles column + backfill
-- Migration: 20260424_0000_staff_roles_column.sql
-- =============================================================================

-- (a) All is_admin=true profiles have staff_roles = {admin,trainer}.
-- select count(*) as mismatched
-- from public.profiles
-- where is_admin = true
--   and not (staff_roles @> array['admin','trainer']);
-- Expected: mismatched = 0
-- TODO(fill in after staging run): Actual output:

-- (b) No profile has an out-of-vocab role.
-- select count(*) as bad_rows
-- from public.profiles
-- where exists (
--   select 1 from unnest(staff_roles) r
--   where r not in ('admin','trainer','tech_support')
-- );
-- Expected: bad_rows = 0
-- TODO(fill in after staging run): Actual output:

-- (c) Constraint works: update an existing profile to an invalid role, expect failure.
-- do $$
-- declare v_id uuid;
-- begin
--   select id into v_id from public.profiles limit 1;
--   if v_id is null then
--     raise notice 'no profiles to test against; skipping constraint test';
--     return;
--   end if;
--   begin
--     update public.profiles set staff_roles = array['evil_role'] where id = v_id;
--     raise exception 'constraint did not fire';
--   exception when check_violation then null;
--   end;
-- end $$;
-- Expected: Success. No rows returned. (exception caught = constraint fired)
-- TODO(fill in after staging run): Actual output:

-- =============================================================================
-- TASK 2: cohort_faculty.college_role column + backfill
-- Migration: 20260424_0010_cohort_faculty_college_role.sql
-- =============================================================================

-- (a) Every row has college_role populated.
-- select count(*) as null_rows
-- from public.cohort_faculty
-- where college_role is null;
-- Expected: null_rows = 0
-- TODO(fill in after staging run): Actual output:

-- (b) All existing rows backfilled to 'support'.
-- select college_role, count(*)
-- from public.cohort_faculty
-- group by college_role;
-- Expected: one row, college_role='support', count = total existing rows.
-- TODO(fill in after staging run): Actual output:

-- (c) Unique index prevents duplicate (cohort, user).
-- select cohort_id, user_id, count(*)
-- from public.cohort_faculty
-- group by cohort_id, user_id
-- having count(*) > 1;
-- Expected: 0 rows.
-- TODO(fill in after staging run): Actual output:

-- =============================================================================
-- TASK 3: announcements.deleted_at soft-delete column
-- Migration: 20260424_0020_announcements_soft_delete.sql
-- =============================================================================

-- (a) Column exists.
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'announcements' and column_name = 'deleted_at';
-- Expected: 1 row, data_type='timestamp with time zone', is_nullable='YES'.
-- TODO(fill in after staging run): Actual output:

-- (b) Index exists.
-- select indexname from pg_indexes where tablename='announcements' and indexname='announcements_active_idx';
-- Expected: 1 row.
-- TODO(fill in after staging run): Actual output:

-- (c) No rows soft-deleted yet.
-- select count(*) from public.announcements where deleted_at is not null;
-- Expected: 0.
-- TODO(fill in after staging run): Actual output:

-- =============================================================================
-- TASK 4: New SQL role helpers
-- Migration: 20260424_0030_role_helpers.sql
-- =============================================================================

-- (a) All four functions exist.
-- select proname from pg_proc where pronamespace = 'public'::regnamespace
--   and proname in ('has_staff_role','college_role_in','executive_cohort_ids','can_grade_submission');
-- Expected: 4 rows.
-- TODO(fill in after staging run): Actual output:

-- (b) Grab an admin UUID to impersonate:
-- select id from public.profiles where 'admin' = any(staff_roles) limit 1;
-- TODO(fill in after staging run): Admin UUID:

-- (c) Run as admin user (use "Run as user" selector in Supabase SQL editor):
-- select public.has_staff_role('admin') as is_admin,
--        public.has_staff_role('trainer') as is_trainer,
--        public.has_staff_role('tech_support') as is_tech;
-- Expected: is_admin=true, is_trainer=true, is_tech=false (given default backfill).
-- TODO(fill in after staging run): Actual output:

-- =============================================================================
-- TASK 6: End-to-end verification + handoff note
-- =============================================================================

-- TODO(fill in after staging run): Smoke test results (index.html, admin-home.html, faculty.html, dashboard.html):
-- TODO(fill in after staging run): Any regressions observed:
-- TODO(fill in after staging run): Final sign-off date and reviewer:
