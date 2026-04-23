create table if not exists public.rubric_templates (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  name text not null,
  narrative text null,
  rubric_items jsonb not null default '[]'::jsonb,
  points integer not null default 0,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rubric_templates_cohort_id
  on public.rubric_templates (cohort_id);

create index if not exists idx_rubric_templates_updated_at
  on public.rubric_templates (updated_at desc);

alter table public.rubric_templates enable row level security;

drop policy if exists "rubric_templates_select" on public.rubric_templates;
create policy "rubric_templates_select"
  on public.rubric_templates
  for select
  using (
    public.is_admin()
    or exists (select 1 from public.faculty_cohort_ids() f where f = cohort_id)
  );

drop policy if exists "rubric_templates_insert" on public.rubric_templates;
create policy "rubric_templates_insert"
  on public.rubric_templates
  for insert
  with check (
    public.is_admin()
    or exists (select 1 from public.faculty_cohort_ids() f where f = cohort_id)
  );

drop policy if exists "rubric_templates_update" on public.rubric_templates;
create policy "rubric_templates_update"
  on public.rubric_templates
  for update
  using (
    public.is_admin()
    or exists (select 1 from public.faculty_cohort_ids() f where f = cohort_id)
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.faculty_cohort_ids() f where f = cohort_id)
  );

drop policy if exists "rubric_templates_delete" on public.rubric_templates;
create policy "rubric_templates_delete"
  on public.rubric_templates
  for delete
  using (
    public.is_admin()
    or exists (select 1 from public.faculty_cohort_ids() f where f = cohort_id)
  );

create or replace function public.set_rubric_templates_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_rubric_templates_updated_at on public.rubric_templates;
create trigger trg_rubric_templates_updated_at
before update on public.rubric_templates
for each row execute function public.set_rubric_templates_updated_at();
