-- 20260421_0110_pod_faculty.sql
-- Faculty pods: pod_faculty table with primary-uniqueness

create table if not exists public.pod_faculty (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references public.cohort_pods(id) on delete cascade,
  faculty_user_id uuid not null references auth.users(id),
  is_primary boolean not null default false,
  contact_note text,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id),
  unique (pod_id, faculty_user_id)
);

create unique index if not exists pod_faculty_one_primary
  on public.pod_faculty (pod_id) where is_primary;

alter table public.pod_faculty enable row level security;
