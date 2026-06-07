-- =============================================================================
-- 0115_team_capstone_submissions.sql
--
-- The final capstone is now a TEAM deliverable, not per-student. Teams are
-- finalized off-platform (spreadsheet) and imported by an admin, so this
-- migration:
--   1. extends `teams` with the imported metadata (team_number, pitched_ideas);
--   2. adds a per-cohort submission deadline on `cohorts`;
--   3. adds `team_submissions` (one shared deliverable per team, editable by any
--      member until the deadline) and `team_grades` (one shared grade, admin-only);
--   4. locks down the old student self-service team create/join/leave — teams are
--      now admin-managed.
--
-- The per-student `capstone_projects` table is left intact (archived data); it is
-- simply no longer surfaced in the student UI.
-- =============================================================================

-- ----- 1. extend teams + cohorts ---------------------------------------------

alter table teams
  add column if not exists team_number   int,
  add column if not exists pitched_ideas jsonb not null default '[]'::jsonb;

alter table cohorts
  add column if not exists team_submission_deadline timestamptz;

-- ----- 2. helper functions ---------------------------------------------------

-- Is the current user a member of this team?
create or replace function is_team_member(p_team uuid)
returns boolean
language sql stable security definer set search_path = public, auth
as $$
  select exists (
    select 1 from team_members tm
     where tm.team_id = p_team and tm.user_id = auth.uid()
  )
$$;

-- Is editing still open for this team's submission?
-- Open when: the team has been explicitly unlocked by an admin, OR the cohort
-- deadline is unset/in the future. A past deadline closes editing for members.
create or replace function team_edit_open(p_team uuid)
returns boolean
language sql stable security definer set search_path = public, auth
as $$
  select coalesce(
           (select ts.unlocked from team_submissions ts where ts.team_id = p_team),
           false
         )
      or coalesce(
           (select c.team_submission_deadline > now()
              from teams t join cohorts c on c.id = t.cohort_id
             where t.id = p_team),
           true  -- no deadline set => still open
         )
$$;

-- ----- 3. team_submissions (member-editable shared deliverable) ---------------

create table if not exists team_submissions (
  team_id          uuid primary key references teams (id)   on delete cascade,
  cohort_id        uuid not null      references cohorts (id) on delete cascade,
  title            text,
  pitch            text,          -- 1–2 line description for the gallery card
  chosen_idea      text,          -- which of the pitched ideas they built
  presentation_url text,
  product_url      text,          -- live website / app
  repo_url         text,          -- github
  demo_video_url   text,          -- youtube / loom
  cover_image_url  text,          -- gallery card image (URL only for now)
  status           text not null default 'draft',  -- draft | submitted
  unlocked         boolean not null default false, -- admin reopen override
  submitted_at     timestamptz,
  updated_at       timestamptz not null default now(),
  updated_by       uuid references profiles (id) on delete set null,
  constraint team_submissions_status_chk check (status in ('draft', 'submitted'))
);

create index if not exists team_submissions_cohort_idx on team_submissions (cohort_id);

-- Guard trigger: stamps audit columns, manages submitted_at, and prevents
-- non-admins from flipping the `unlocked` override.
create or replace function team_submissions_guard()
returns trigger
language plpgsql security definer set search_path = public, auth
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();

  -- Pin cohort_id to the team's real cohort so a member can never re-scope the
  -- row (which would mis-target the is_enrolled_in / roster.read checks).
  new.cohort_id := (select cohort_id from teams where id = new.team_id);

  if new.status = 'submitted' and (tg_op = 'INSERT' or old.submitted_at is null) then
    new.submitted_at := now();
  elsif new.status = 'draft' then
    new.submitted_at := null;
  end if;

  -- Only admins (roster.write) may set the reopen override.
  if not has_cap('roster.write', new.cohort_id) then
    new.unlocked := coalesce((case when tg_op = 'UPDATE' then old.unlocked end), false);
  end if;

  return new;
end
$$;

drop trigger if exists trg_team_submissions_guard on team_submissions;
create trigger trg_team_submissions_guard
  before insert or update on team_submissions
  for each row execute function team_submissions_guard();

-- ----- 4. team_grades (one shared grade, admin-only) -------------------------

create table if not exists team_grades (
  team_id     uuid primary key references teams (id)    on delete cascade,
  cohort_id   uuid not null      references cohorts (id) on delete cascade,
  score       int,
  feedback_md text,
  reviewed_by uuid references profiles (id) on delete set null,
  reviewed_at timestamptz not null default now()
);

-- ----- 5. RLS ----------------------------------------------------------------

alter table team_submissions enable row level security;
alter table team_grades      enable row level security;

-- team_submissions: public-to-cohort read (the gallery shows every team, incl.
-- drafts); members write while editing is open; admins do anything.
drop policy if exists ts_read          on team_submissions;
drop policy if exists ts_member_insert on team_submissions;
drop policy if exists ts_member_update on team_submissions;
drop policy if exists ts_admin         on team_submissions;

create policy ts_read on team_submissions
  for select using (
    is_enrolled_in(cohort_id) or has_cap('roster.read', cohort_id)
  );

create policy ts_member_insert on team_submissions
  for insert with check (
    is_team_member(team_id) and is_enrolled_in(cohort_id) and team_edit_open(team_id)
  );

create policy ts_member_update on team_submissions
  for update using (
    is_team_member(team_id) and team_edit_open(team_id)
  ) with check (
    is_team_member(team_id) and team_edit_open(team_id)
  );

create policy ts_admin on team_submissions
  for all using (has_cap('roster.write', cohort_id))
  with check (has_cap('roster.write', cohort_id));

-- team_grades: private to the team + staff; only admins (grading.write:cohort)
-- may write. Faculty stay review-only per the RBAC model.
drop policy if exists tg_read  on team_grades;
drop policy if exists tg_admin on team_grades;

create policy tg_read on team_grades
  for select using (
    is_team_member(team_id) or has_cap('roster.read', cohort_id)
  );

create policy tg_admin on team_grades
  for all using (has_cap('grading.write:cohort', cohort_id))
  with check (has_cap('grading.write:cohort', cohort_id));

-- ----- 6. lock down student self-service on teams ----------------------------
-- Teams are admin-managed (imported). Students can no longer create teams or
-- add/remove themselves; only `teams_admin` / `tm_admin` (roster.write) write.

drop policy if exists teams_create      on teams;
drop policy if exists teams_self_update on teams;
drop policy if exists tm_self           on team_members;

-- Members keep read access to their own membership rows (tm_read already grants
-- broader cohort read; this is the explicit self fallback).
create policy tm_self on team_members
  for select using (user_id = auth.uid());

-- ----- 7. grants -------------------------------------------------------------

-- Members read/write submissions; admins write grades (RLS gates both — these
-- grants are the table-level floor, RLS the ceiling). No delete path is needed.
grant select, insert, update on team_submissions to authenticated;
grant select, insert, update on team_grades      to authenticated;
