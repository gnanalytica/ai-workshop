-- Indexes for admin readiness dashboards and cohort filtering.
create index if not exists idx_faculty_pretraining_progress_cohort_id
  on public.faculty_pretraining_progress (cohort_id);

create index if not exists idx_faculty_pretraining_progress_updated_at
  on public.faculty_pretraining_progress (updated_at desc);
