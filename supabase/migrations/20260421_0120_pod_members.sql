-- 20260421_0120_pod_members.sql
-- Faculty pods: pod_members table with per-cohort uniqueness and cohort-sync trigger

create table if not exists public.pod_members (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references public.cohort_pods(id) on delete cascade,
  student_user_id uuid not null references auth.users(id),
  cohort_id uuid not null references public.cohorts(id),
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id),
  unique (pod_id, student_user_id),
  unique (cohort_id, student_user_id)
);

create or replace function public.pod_members_sync_cohort()
returns trigger language plpgsql as $$
begin
  select cohort_id into new.cohort_id from public.cohort_pods where id = new.pod_id;
  if new.cohort_id is null then
    raise exception 'pod % not found', new.pod_id;
  end if;
  return new;
end $$;

drop trigger if exists pod_members_cohort_sync on public.pod_members;
create trigger pod_members_cohort_sync
  before insert or update of pod_id on public.pod_members
  for each row execute function public.pod_members_sync_cohort();

alter table public.pod_members enable row level security;
