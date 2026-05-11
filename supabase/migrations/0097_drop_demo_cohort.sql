-- =============================================================================
-- 0097_drop_demo_cohort.sql
--
-- Permanently remove the Demo Cohort (uuid 99999999-...) and the sandbox
-- preview machinery built around it. Migrations 0049 / 0059 / 0061 seed the
-- demo cohort and its 10 demo students; 0057 installs an
-- ensure_demo_cohort_faculty trigger that auto-inserts new faculty into it.
-- That trigger now FK-fails whenever the demo cohort is absent.
--
-- This migration:
--   1. Drops the trigger + function so faculty inserts don't blow up.
--   2. Deletes any remaining demo cohort + demo seed users idempotently, so
--      a fresh `db reset` ends up clean even after the earlier seed migrations
--      re-create everything.
-- =============================================================================

-- 1. Drop the auto-join trigger and its function.
drop trigger if exists trg_ensure_demo_cohort_faculty on cohort_faculty;
drop function if exists public.ensure_demo_cohort_faculty();

-- 2. Idempotent cleanup. Cohort delete cascades to 21 child tables.
delete from cohorts where id = '99999999-9999-9999-9999-999999999999'::uuid;

-- 3. Demo seed users. auth.users delete cascades to profiles + everything
-- profile-scoped (registrations, submissions, etc.) via existing FKs.
delete from auth.users where id in (
  '99999999-0000-0000-0000-000000000001'::uuid,
  '99999999-0000-0000-0000-000000000002'::uuid,
  '99999999-0000-0000-0000-000000000003'::uuid,
  '99999999-0000-0000-0000-000000000004'::uuid,
  '99999999-0000-0000-0000-000000000005'::uuid,
  '99999999-0000-0000-0000-000000000006'::uuid,
  '99999999-0000-0000-0000-000000000007'::uuid,
  '99999999-0000-0000-0000-000000000008'::uuid,
  '99999999-0000-0000-0000-000000000009'::uuid,
  '99999999-0000-0000-0000-000000000010'::uuid
);
