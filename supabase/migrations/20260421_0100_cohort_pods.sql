-- 20260421_0100_cohort_pods.sql
-- Faculty pods: cohort_pods table

create table if not exists public.cohort_pods (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  name text not null,
  mentor_note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique (cohort_id, name)
);

alter table public.cohort_pods enable row level security;
