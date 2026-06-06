-- =============================================================================
-- 0113_profiles_roll_number.sql
-- Capture roll number (student ID) per cohort. Unique within each cohort,
-- captured on student's first login after this migration.
-- =============================================================================

alter table registrations
  add column if not exists roll_number text;

-- Unique constraint: each cohort can only have one registration per roll number.
-- Scoped to (cohort_id, roll_number, status='confirmed') so draft/cancelled
-- registrations don't block new enrollments.
create unique index idx_registrations_cohort_roll_number
  on registrations(cohort_id, roll_number)
  where status = 'confirmed' and roll_number is not null;
