-- Per-day faculty assignment (main + support) with prep notes.
-- Driven by CSV topic plan for cohort ai-workshop-may-2026.
-- Main = lead trainer for the day; Support = shadow/rotation faculty.

begin;

-- ---------- table ----------
create table if not exists public.day_faculty (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  day_number int not null check (day_number between 1 and 30),
  main_name text,                     -- CSV name (before user mapping)
  support_name text,                  -- CSV name (before user mapping)
  main_user_id uuid references auth.users(id) on delete set null,
  support_user_id uuid references auth.users(id) on delete set null,
  main_notes text default '',         -- lead trainer's prep notes (classroom script, props, gotchas)
  support_notes text default '',      -- support faculty prep notes (setup help, stuck-queue prep)
  shared_notes text default '',       -- visible to students as "faculty note" (optional)
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (cohort_id, day_number)
);

create index if not exists day_faculty_cohort_day_idx on public.day_faculty (cohort_id, day_number);
create index if not exists day_faculty_main_user_idx on public.day_faculty (main_user_id);
create index if not exists day_faculty_support_user_idx on public.day_faculty (support_user_id);

alter table public.day_faculty enable row level security;

-- ---------- policies ----------
drop policy if exists day_faculty_admin_all on public.day_faculty;
create policy day_faculty_admin_all on public.day_faculty
  for all to authenticated
  using (public.current_profile_is_admin())
  with check (public.current_profile_is_admin());

-- Any cohort faculty can read rows for their cohort.
drop policy if exists day_faculty_faculty_read on public.day_faculty;
create policy day_faculty_faculty_read on public.day_faculty
  for select to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()));

-- Lead trainer for a day can update their own main_notes and shared_notes.
-- Support faculty for a day can update their own support_notes.
drop policy if exists day_faculty_self_update on public.day_faculty;
create policy day_faculty_self_update on public.day_faculty
  for update to authenticated
  using (
    main_user_id = auth.uid() or support_user_id = auth.uid()
  )
  with check (
    main_user_id = auth.uid() or support_user_id = auth.uid()
  );

-- Students (and everyone) can read shared_notes only via a view below.

-- ---------- public view (shared notes only) ----------
create or replace view public.day_faculty_shared as
  select cohort_id, day_number, main_name, support_name, shared_notes, updated_at
  from public.day_faculty;

grant select on public.day_faculty_shared to authenticated, anon;

-- ---------- updated_at trigger ----------
create or replace function public.day_faculty_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists day_faculty_touch on public.day_faculty;
create trigger day_faculty_touch before update on public.day_faculty
  for each row execute function public.day_faculty_touch_updated_at();

-- ---------- seed from CSV ----------
with target as (
  select id as cohort_id from public.cohorts where slug = 'cohort-01' limit 1
)
insert into public.day_faculty (cohort_id, day_number, main_name, support_name)
select cohort_id, d, m, s from target, (values
  (1,  'Sandeep',    'Sanjana'),
  (2,  'Sanjana',    'Raunak'),
  (3,  'Raunak',     'Sanjana'),
  (4,  'Sanjana',    'Harshith'),
  (5,  'Jayasaagar', 'Aparna'),
  (6,  'Sandeep',    'Harshith'),
  (7,  'Harshith',   'Aparna'),
  (8,  'TBD',        'TBD'),
  (9,  'TBD',        'TBD'),
  (10, 'TBD',        'TBD'),
  (11, 'Sandeep',    'TBD'),
  (12, 'Jayasaagar', 'Sanjana'),
  (13, 'Sandeep',    'Harshith'),
  (14, 'Sanjana',    'Jayasaagar'),
  (15, 'Raunak',     'Harshith'),
  (16, 'Sandeep',    'Jayasaagar'),
  (17, 'Raunak',     'Sandeep'),
  (18, 'Harshith',   'Sandeep'),
  (19, 'Sanjana',    'Sandeep'),
  (20, 'Harshith',   'Sanjana'),
  (21, 'Harshith',   'Sanjana'),
  (22, 'Sandeep',    'Harshith'),
  (23, 'Harshith',   'Sandeep'),
  (24, 'Jayasaagar', 'Sanjana'),
  (25, 'Harshith',   'Sanjana'),
  (26, 'Sandeep',    'Harshith'),
  (27, 'Sanjana',    'Sandeep'),
  (28, 'Jayasaagar', 'TBD'),
  (29, 'Sandeep',    'TBD'),
  (30, 'Sandeep',    'TBD')
) as v(d,m,s)
on conflict (cohort_id, day_number) do update
set main_name = excluded.main_name,
    support_name = excluded.support_name;

-- ---------- backfill main_user_id / support_user_id from profiles.full_name when unique match ----------
-- Best-effort; harmless if nothing matches.
-- Match by exact full_name OR first-name prefix (CSV uses single first names).
update public.day_faculty df
set main_user_id = p.id
from public.profiles p
where df.main_user_id is null
  and df.main_name is not null
  and df.main_name not in ('TBD','<>','')
  and (lower(p.full_name) = lower(df.main_name)
       or split_part(lower(p.full_name),' ',1) = lower(df.main_name));

update public.day_faculty df
set support_user_id = p.id
from public.profiles p
where df.support_user_id is null
  and df.support_name is not null
  and df.support_name not in ('TBD','<>','')
  and (lower(p.full_name) = lower(df.support_name)
       or split_part(lower(p.full_name),' ',1) = lower(df.support_name));

commit;
