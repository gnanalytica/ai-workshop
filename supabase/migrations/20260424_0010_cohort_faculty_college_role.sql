-- cohort_faculty gains college_role: college-side per-cohort role.
-- Values: 'support' (pod support faculty) or 'executive' (cohort oversight).
-- Existing is_admin column on cohort_faculty is retained for now; it will
-- be dropped in Plan 2 once RLS no longer depends on it.

alter table public.cohort_faculty
  add column if not exists college_role text;

alter table public.cohort_faculty
  drop constraint if exists cohort_faculty_college_role_values_chk;
alter table public.cohort_faculty
  add constraint cohort_faculty_college_role_values_chk
  check (college_role is null or college_role in ('support','executive'));

-- Backfill: every existing row is a support faculty.
update public.cohort_faculty
  set college_role = 'support'
  where college_role is null;

-- Enforce NOT NULL now that rows are filled.
alter table public.cohort_faculty
  alter column college_role set not null;

-- One college role per person per cohort (idempotent).
create unique index if not exists cohort_faculty_unique_user_per_cohort
  on public.cohort_faculty (cohort_id, user_id);
