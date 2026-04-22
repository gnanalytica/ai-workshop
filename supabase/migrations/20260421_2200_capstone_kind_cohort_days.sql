-- Optional capstone session label on cohort_days (used by dashboard Capstone tab + admin schedule).
alter table public.cohort_days
  add column if not exists capstone_kind text;

alter table public.cohort_days
  drop constraint if exists cohort_days_capstone_kind_check;

alter table public.cohort_days
  add constraint cohort_days_capstone_kind_check
  check (capstone_kind is null or capstone_kind in ('spec_review', 'mid_review', 'demo_day'));
