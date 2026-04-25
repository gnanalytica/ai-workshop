-- =============================================================================
-- 0008_extensions_schema.sql
-- Adds tables that were carried in the legacy schema but pruned from the
-- initial 0001 redesign: buddies, kudos, day comments, capstones, faculty
-- pretraining LMS. Each table follows the same idioms as 0001 (RLS on,
-- helpers from 0002, policies one-liners through has_cap()).
-- =============================================================================

-- ----- enums ------------------------------------------------------------------

create type buddy_checkin_kind as enum ('day_open', 'day_close', 'weekly');
create type capstone_phase     as enum ('idea', 'spec', 'mid', 'demo', 'shipped');
create type pretraining_status as enum ('not_started', 'in_progress', 'completed');

-- ----- buddy system ----------------------------------------------------------
-- Pair-matching for accountability buddies. Refresh per week.

create table buddy_pairs (
  id            uuid primary key default gen_random_uuid(),
  cohort_id     uuid not null references cohorts (id) on delete cascade,
  week_number   int  not null check (week_number between 1 and 8),
  student_a     uuid not null references profiles (id) on delete cascade,
  student_b     uuid not null references profiles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  constraint buddy_pairs_distinct check (student_a <> student_b)
);

-- one student can only be in one pair per week per cohort
create unique index buddy_pairs_a_unique on buddy_pairs (cohort_id, week_number, student_a);
create unique index buddy_pairs_b_unique on buddy_pairs (cohort_id, week_number, student_b);

create table buddy_checkins (
  id              uuid primary key default gen_random_uuid(),
  buddy_pair_id   uuid not null references buddy_pairs (id) on delete cascade,
  user_id         uuid not null references profiles (id) on delete cascade,
  kind            buddy_checkin_kind not null,
  day_number      int,
  body_md         text,
  created_at      timestamptz not null default now()
);

create index buddy_checkins_pair_idx on buddy_checkins (buddy_pair_id, created_at desc);

-- ----- kudos -----------------------------------------------------------------

create table kudos (
  id            uuid primary key default gen_random_uuid(),
  cohort_id     uuid not null references cohorts (id) on delete cascade,
  from_user_id  uuid not null references profiles (id) on delete cascade,
  to_user_id    uuid not null references profiles (id) on delete cascade,
  day_number    int,
  note          text not null,
  created_at    timestamptz not null default now(),
  constraint kudos_no_self check (from_user_id <> to_user_id)
);

create index kudos_cohort_idx on kudos (cohort_id, created_at desc);
create index kudos_to_idx     on kudos (to_user_id);

-- ----- day comments (per-day chat thread) ------------------------------------

create table day_comments (
  id            uuid primary key default gen_random_uuid(),
  cohort_id     uuid not null,
  day_number    int  not null,
  user_id       uuid references profiles (id) on delete set null,
  parent_id     uuid references day_comments (id) on delete cascade,
  body_md       text not null,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  foreign key (cohort_id, day_number) references cohort_days (cohort_id, day_number) on delete cascade
);

create index day_comments_thread_idx on day_comments (cohort_id, day_number, created_at);

-- ----- capstones (dedicated table; richer than a generic assignment) ---------

create table capstones (
  id              uuid primary key default gen_random_uuid(),
  cohort_id       uuid not null references cohorts (id) on delete cascade,
  owner_user_id   uuid not null references profiles (id) on delete cascade,
  title           text not null,
  problem_md      text,
  solution_md     text,
  deck_url        text,
  demo_url        text,
  repo_url        text,
  phase           capstone_phase not null default 'idea',
  is_public       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (cohort_id, owner_user_id)
);

create index capstones_phase_idx on capstones (cohort_id, phase);
create index capstones_public_idx on capstones (is_public) where is_public;

-- ----- faculty pre-training LMS ----------------------------------------------

create table faculty_pretraining_modules (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  body_md      text,
  ordinal      int not null default 0,
  created_at   timestamptz not null default now()
);

create table faculty_pretraining_progress (
  faculty_user_id uuid not null references profiles (id) on delete cascade,
  module_id       uuid not null references faculty_pretraining_modules (id) on delete cascade,
  cohort_id       uuid references cohorts (id) on delete set null,
  status          pretraining_status not null default 'not_started',
  started_at      timestamptz,
  completed_at    timestamptz,
  primary key (faculty_user_id, module_id)
);

-- ----- teams (capstone groupings, distinct from pods) -----------------------

create table teams (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references cohorts (id) on delete cascade,
  name        text not null,
  description text,
  created_by  uuid references profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (cohort_id, name)
);

create table team_members (
  team_id  uuid not null references teams (id) on delete cascade,
  user_id  uuid not null references profiles (id) on delete cascade,
  role     text default 'member',
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

-- ----- enable RLS on all the above -------------------------------------------

alter table teams                        enable row level security;
alter table team_members                 enable row level security;
alter table buddy_pairs                  enable row level security;
alter table buddy_checkins               enable row level security;
alter table kudos                        enable row level security;
alter table day_comments                 enable row level security;
alter table capstones                    enable row level security;
alter table faculty_pretraining_modules  enable row level security;
alter table faculty_pretraining_progress enable row level security;

-- ----- RLS policies (single-pass, all in this migration) ---------------------

-- teams: enrolled students + cohort staff
drop policy if exists teams_read on teams;
create policy teams_read on teams
  for select using (
    is_enrolled_in(cohort_id) or has_cap('roster.read', cohort_id)
  );

drop policy if exists teams_create on teams;
create policy teams_create on teams
  for insert with check (
    is_enrolled_in(cohort_id) and created_by = auth.uid()
  );

drop policy if exists teams_self_update on teams;
create policy teams_self_update on teams
  for update using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists teams_admin on teams;
create policy teams_admin on teams
  for all using (has_cap('roster.write', cohort_id))
  with check (has_cap('roster.write', cohort_id));

drop policy if exists tm_read on team_members;
create policy tm_read on team_members
  for select using (
    user_id = auth.uid()
    or exists (select 1 from teams t where t.id = team_members.team_id and is_enrolled_in(t.cohort_id))
    or exists (select 1 from teams t where t.id = team_members.team_id and has_cap('roster.read', t.cohort_id))
  );

drop policy if exists tm_self on team_members;
create policy tm_self on team_members
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists tm_admin on team_members;
create policy tm_admin on team_members
  for all using (
    exists (select 1 from teams t where t.id = team_members.team_id and has_cap('roster.write', t.cohort_id))
  ) with check (
    exists (select 1 from teams t where t.id = team_members.team_id and has_cap('roster.write', t.cohort_id))
  );

-- buddy_pairs: students see pairs they're in; faculty/admin see cohort
drop policy if exists bp_self on buddy_pairs;
create policy bp_self on buddy_pairs
  for select using (
    student_a = auth.uid() or student_b = auth.uid()
    or has_cap('roster.read', cohort_id)
  );

drop policy if exists bp_admin_write on buddy_pairs;
create policy bp_admin_write on buddy_pairs
  for all using (has_cap('roster.write', cohort_id))
  with check (has_cap('roster.write', cohort_id));

-- buddy_checkins: anyone in the pair can read/write their own checkin
drop policy if exists bc_pair_read on buddy_checkins;
create policy bc_pair_read on buddy_checkins
  for select using (
    exists (
      select 1 from buddy_pairs p
      where p.id = buddy_checkins.buddy_pair_id
        and (p.student_a = auth.uid() or p.student_b = auth.uid()
             or has_cap('roster.read', p.cohort_id))
    )
  );

drop policy if exists bc_self_write on buddy_checkins;
create policy bc_self_write on buddy_checkins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- kudos: visible to cohort members (students or faculty)
drop policy if exists kudos_read on kudos;
create policy kudos_read on kudos
  for select using (
    is_enrolled_in(cohort_id) or has_cap('roster.read', cohort_id)
  );

drop policy if exists kudos_self_write on kudos;
create policy kudos_self_write on kudos
  for insert with check (
    from_user_id = auth.uid() and is_enrolled_in(cohort_id)
  );

drop policy if exists kudos_self_delete on kudos;
create policy kudos_self_delete on kudos
  for delete using (from_user_id = auth.uid() or has_cap('moderation.write'));

-- day_comments: enrolled students + faculty
drop policy if exists dc_read on day_comments;
create policy dc_read on day_comments
  for select using (
    deleted_at is null and (
      is_enrolled_in(cohort_id) or has_cap('content.read', cohort_id)
    )
  );

drop policy if exists dc_self_write on day_comments;
create policy dc_self_write on day_comments
  for insert with check (
    user_id = auth.uid() and is_enrolled_in(cohort_id)
  );

drop policy if exists dc_self_update on day_comments;
create policy dc_self_update on day_comments
  for update using (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

drop policy if exists dc_mod on day_comments;
create policy dc_mod on day_comments
  for all using (has_cap('moderation.write')) with check (has_cap('moderation.write'));

-- capstones: owner + public (when is_public) + cohort staff
drop policy if exists cap_read on capstones;
create policy cap_read on capstones
  for select using (
    owner_user_id = auth.uid()
    or is_public
    or has_cap('grading.read', cohort_id)
  );

drop policy if exists cap_self_write on capstones;
create policy cap_self_write on capstones
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists cap_staff_write on capstones;
create policy cap_staff_write on capstones
  for update using (has_cap('grading.write:cohort', cohort_id))
  with check (has_cap('grading.write:cohort', cohort_id));

-- faculty_pretraining_modules: any authenticated reads; admin writes
drop policy if exists fpm_read on faculty_pretraining_modules;
create policy fpm_read on faculty_pretraining_modules
  for select using (auth.uid() is not null);

drop policy if exists fpm_admin_write on faculty_pretraining_modules;
create policy fpm_admin_write on faculty_pretraining_modules
  for all using (has_staff_role('admin') or has_staff_role('trainer'))
  with check (has_staff_role('admin') or has_staff_role('trainer'));

-- faculty_pretraining_progress: faculty sees own, admin sees all
drop policy if exists fpp_self on faculty_pretraining_progress;
create policy fpp_self on faculty_pretraining_progress
  for all using (faculty_user_id = auth.uid())
  with check (faculty_user_id = auth.uid());

drop policy if exists fpp_admin_read on faculty_pretraining_progress;
create policy fpp_admin_read on faculty_pretraining_progress
  for select using (has_staff_role('admin') or has_staff_role('trainer'));

-- ----- updated_at triggers ---------------------------------------------------

drop trigger if exists trg_day_comments_updated on day_comments;
create trigger trg_day_comments_updated
  before update on day_comments
  for each row execute function set_updated_at();

drop trigger if exists trg_capstones_updated on capstones;
create trigger trg_capstones_updated
  before update on capstones
  for each row execute function set_updated_at();

-- ----- give kudos RPC (idempotency: one per (from,to,day) per cohort) -------

create or replace function rpc_give_kudos(
  p_to_user uuid,
  p_cohort  uuid,
  p_note    text,
  p_day     int default null
) returns kudos
language plpgsql security definer set search_path = public, auth
as $$
declare
  row kudos;
begin
  if not is_enrolled_in(p_cohort) then
    raise exception 'not enrolled in cohort';
  end if;
  if p_to_user = auth.uid() then
    raise exception 'cannot kudos yourself';
  end if;

  insert into kudos (cohort_id, from_user_id, to_user_id, day_number, note)
    values (p_cohort, auth.uid(), p_to_user, p_day, p_note)
  returning * into row;
  return row;
end
$$;

grant execute on function rpc_give_kudos(uuid, uuid, text, int) to authenticated;

-- ----- pair_match RPC (deterministic pairing for a week) ---------------------

create or replace function rpc_generate_buddy_pairs(
  p_cohort uuid,
  p_week   int
) returns int
language plpgsql security definer set search_path = public, auth
as $$
declare
  ids uuid[];
  n int;
  i int;
  inserted int := 0;
begin
  if not (has_staff_role('admin') or has_staff_role('trainer')) then
    raise exception 'permission denied: roster.write';
  end if;

  -- shuffle confirmed students in the cohort
  select array_agg(user_id order by random())
    into ids
    from registrations
    where cohort_id = p_cohort and status = 'confirmed';

  n := coalesce(array_length(ids, 1), 0);
  delete from buddy_pairs where cohort_id = p_cohort and week_number = p_week;

  i := 1;
  while i + 1 <= n loop
    insert into buddy_pairs (cohort_id, week_number, student_a, student_b)
      values (p_cohort, p_week, ids[i], ids[i + 1]);
    inserted := inserted + 1;
    i := i + 2;
  end loop;
  -- Odd one out gets paired with first to keep everyone in
  if i = n then
    insert into buddy_pairs (cohort_id, week_number, student_a, student_b)
      values (p_cohort, p_week, ids[n], ids[1]);
    inserted := inserted + 1;
  end if;
  return inserted;
end
$$;

grant execute on function rpc_generate_buddy_pairs(uuid, int) to authenticated;

-- ----- seed faculty pretraining modules --------------------------------------

insert into faculty_pretraining_modules (slug, title, ordinal) values
  ('orientation',  'Orientation: how this cohort runs',  1),
  ('grading',      'Grading philosophy + rubric tour',   2),
  ('mentoring',    'Pod mentoring playbook',             3),
  ('escalation',   'Stuck queue + escalation lanes',     4),
  ('handbook',     'Faculty handbook (full read)',       5)
on conflict (slug) do nothing;
