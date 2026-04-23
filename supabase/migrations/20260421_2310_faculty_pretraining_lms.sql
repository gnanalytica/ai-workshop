create table if not exists public.faculty_pretraining_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  signoff boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, cohort_id)
);

alter table public.faculty_pretraining_progress enable row level security;

drop policy if exists "faculty_pretraining_select" on public.faculty_pretraining_progress;
create policy "faculty_pretraining_select"
on public.faculty_pretraining_progress
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
  or exists (
    select 1 from public.faculty_cohort_ids() f
    where f = cohort_id
  )
);

drop policy if exists "faculty_pretraining_insert" on public.faculty_pretraining_progress;
create policy "faculty_pretraining_insert"
on public.faculty_pretraining_progress
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
    or exists (
      select 1 from public.faculty_cohort_ids() f
      where f = cohort_id
    )
    or user_id = auth.uid()
  )
);

drop policy if exists "faculty_pretraining_update" on public.faculty_pretraining_progress;
create policy "faculty_pretraining_update"
on public.faculty_pretraining_progress
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
  or exists (
    select 1 from public.faculty_cohort_ids() f
    where f = cohort_id
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "faculty_pretraining_delete" on public.faculty_pretraining_progress;
create policy "faculty_pretraining_delete"
on public.faculty_pretraining_progress
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);
