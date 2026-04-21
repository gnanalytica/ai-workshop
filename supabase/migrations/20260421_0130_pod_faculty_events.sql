-- 20260421_0130_pod_faculty_events.sql
-- Faculty pods: pod_faculty_events audit table

create table if not exists public.pod_faculty_events (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references public.cohort_pods(id) on delete cascade,
  from_user_id uuid references auth.users(id),
  to_user_id uuid references auth.users(id),
  kind text not null check (kind in ('added','removed','handoff','primary_transfer')),
  note text,
  at timestamptz not null default now(),
  actor_user_id uuid references auth.users(id)
);

create index if not exists pod_faculty_events_pod_at on public.pod_faculty_events (pod_id, at desc);
alter table public.pod_faculty_events enable row level security;
