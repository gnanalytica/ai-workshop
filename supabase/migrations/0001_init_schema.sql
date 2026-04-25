-- =============================================================================
-- 0001_init_schema.sql  --  Initial schema for the redesigned LMS.
-- Greenfield: assumes an empty database (or one where the legacy public schema
-- has been dropped). Run once.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ----- enums ------------------------------------------------------------------

create type registration_status as enum ('pending', 'confirmed', 'waitlist', 'cancelled');
create type cohort_status       as enum ('draft', 'live', 'archived');
create type college_role        as enum ('support', 'executive');
create type assignment_kind     as enum ('lab', 'capstone', 'reflection', 'quiz');
create type submission_status   as enum ('draft', 'submitted', 'graded', 'returned');
create type peer_review_status  as enum ('assigned', 'completed', 'skipped');
create type quiz_question_kind  as enum ('single', 'multi', 'short');
create type lab_status          as enum ('not_started', 'in_progress', 'done');
create type attendance_status   as enum ('present', 'absent', 'late', 'excused');
create type stuck_kind          as enum ('content', 'tech', 'team', 'other');
create type stuck_status        as enum ('open', 'helping', 'resolved', 'cancelled');
create type announcement_audience as enum ('all', 'students', 'faculty', 'staff');
create type pod_event_kind      as enum ('member_added', 'member_removed', 'faculty_added', 'faculty_removed', 'primary_changed', 'handoff');
create type day_capstone_kind   as enum ('none', 'spec_review', 'mid_review', 'demo_day');
create type notification_kind   as enum ('daily_digest', 'registration_status', 'announcement', 'grade_returned');
create type notification_status as enum ('queued', 'sent', 'failed');

-- ----- core tables ------------------------------------------------------------

create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       citext unique not null,
  full_name   text,
  college     text,
  avatar_url  text,
  staff_roles text[] not null default '{}',  -- subset of {'admin','trainer','tech_support'}
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint staff_roles_valid check (
    staff_roles <@ array['admin','trainer','tech_support']::text[]
  )
);

create index profiles_staff_roles_idx on profiles using gin (staff_roles);

create table organizations (
  id        uuid primary key default gen_random_uuid(),
  slug      text unique not null,
  name      text not null,
  created_at timestamptz not null default now()
);

create table promo_codes (
  code            text primary key,
  organization_id uuid references organizations (id) on delete set null,
  uses            int not null default 0,
  max_uses        int,
  valid_until     timestamptz,
  created_at      timestamptz not null default now()
);

create table cohorts (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  starts_on  date not null,
  ends_on    date not null,
  status     cohort_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cohorts_dates_valid check (ends_on >= starts_on)
);

create table cohort_days (
  cohort_id        uuid not null references cohorts (id) on delete cascade,
  day_number       int  not null check (day_number between 1 and 60),
  title            text not null,
  is_unlocked      boolean not null default false,
  live_session_at  timestamptz,
  meet_link        text,
  notes            text,
  capstone_kind    day_capstone_kind not null default 'none',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (cohort_id, day_number)
);

create table registrations (
  user_id       uuid not null references profiles (id) on delete cascade,
  cohort_id     uuid not null references cohorts (id) on delete cascade,
  status        registration_status not null default 'pending',
  source        text,
  promo_code    text references promo_codes (code) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, cohort_id)
);

create index registrations_cohort_idx on registrations (cohort_id, status);

-- ----- faculty + pods ---------------------------------------------------------

create table cohort_faculty (
  user_id      uuid not null references profiles (id) on delete cascade,
  cohort_id    uuid not null references cohorts (id) on delete cascade,
  college_role college_role not null,
  created_at   timestamptz not null default now(),
  primary key (user_id, cohort_id)
);

create index cohort_faculty_cohort_idx on cohort_faculty (cohort_id, college_role);

create table day_faculty (
  cohort_id        uuid not null,
  day_number       int  not null,
  main_user_id     uuid references profiles (id) on delete set null,
  support_user_id  uuid references profiles (id) on delete set null,
  main_notes       text,
  support_notes    text,
  shared_notes     text,
  updated_at       timestamptz not null default now(),
  primary key (cohort_id, day_number),
  foreign key (cohort_id, day_number) references cohort_days (cohort_id, day_number) on delete cascade
);

create table pods (
  id         uuid primary key default gen_random_uuid(),
  cohort_id  uuid not null references cohorts (id) on delete cascade,
  name       text not null,
  mentor_note text,
  created_at timestamptz not null default now(),
  unique (cohort_id, name)
);

create table pod_faculty (
  pod_id           uuid not null references pods (id) on delete cascade,
  faculty_user_id  uuid not null references profiles (id) on delete cascade,
  is_primary       boolean not null default false,
  added_at         timestamptz not null default now(),
  primary key (pod_id, faculty_user_id)
);

create unique index pod_faculty_one_primary
  on pod_faculty (pod_id) where is_primary;

create table pod_members (
  pod_id            uuid not null references pods (id) on delete cascade,
  student_user_id   uuid not null references profiles (id) on delete cascade,
  cohort_id         uuid not null references cohorts (id) on delete cascade,
  added_at          timestamptz not null default now(),
  primary key (pod_id, student_user_id)
);

create unique index pod_members_one_pod_per_cohort
  on pod_members (cohort_id, student_user_id);

create table pod_events (
  id              uuid primary key default gen_random_uuid(),
  pod_id          uuid not null references pods (id) on delete cascade,
  kind            pod_event_kind not null,
  actor_user_id   uuid references profiles (id) on delete set null,
  payload         jsonb not null default '{}',
  at              timestamptz not null default now()
);

create index pod_events_pod_idx on pod_events (pod_id, at desc);

-- ----- assignments + submissions ---------------------------------------------

create table rubric_templates (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  criteria   jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table assignments (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references cohorts (id) on delete cascade,
  day_number  int  not null,
  kind        assignment_kind not null,
  title       text not null,
  body_md     text,
  rubric_id   uuid references rubric_templates (id),
  due_at      timestamptz,
  created_at  timestamptz not null default now(),
  foreign key (cohort_id, day_number) references cohort_days (cohort_id, day_number) on delete cascade
);

create index assignments_cohort_day_idx on assignments (cohort_id, day_number);

create table submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments (id) on delete cascade,
  user_id       uuid not null references profiles (id) on delete cascade,
  body          text,
  attachments   jsonb not null default '[]',
  status        submission_status not null default 'draft',
  score         numeric,
  graded_at     timestamptz,
  graded_by     uuid references profiles (id) on delete set null,
  feedback_md   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (assignment_id, user_id)
);

create index submissions_user_idx on submissions (user_id);
create index submissions_status_idx on submissions (status, graded_at);

create table peer_reviews (
  submission_id uuid not null references submissions (id) on delete cascade,
  reviewer_id   uuid not null references profiles (id) on delete cascade,
  status        peer_review_status not null default 'assigned',
  score         numeric,
  body          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (submission_id, reviewer_id)
);

-- ----- quizzes ----------------------------------------------------------------

create table quizzes (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references cohorts (id) on delete cascade,
  day_number  int not null,
  title       text not null,
  version     int not null default 1,
  created_at  timestamptz not null default now(),
  foreign key (cohort_id, day_number) references cohort_days (cohort_id, day_number) on delete cascade
);

create table quiz_questions (
  quiz_id   uuid not null references quizzes (id) on delete cascade,
  ordinal   int not null,
  prompt    text not null,
  kind      quiz_question_kind not null,
  options   jsonb not null default '[]',
  answer    jsonb not null,
  primary key (quiz_id, ordinal)
);

create table quiz_attempts (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references quizzes (id) on delete cascade,
  user_id       uuid not null references profiles (id) on delete cascade,
  score         numeric,
  answers       jsonb not null default '{}',
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  unique (quiz_id, user_id)
);

-- ----- lab progress + attendance ---------------------------------------------

create table lab_progress (
  user_id     uuid not null references profiles (id) on delete cascade,
  cohort_id   uuid not null references cohorts (id) on delete cascade,
  day_number  int  not null,
  lab_id      text not null,
  status      lab_status not null default 'not_started',
  updated_at  timestamptz not null default now(),
  primary key (user_id, cohort_id, day_number, lab_id),
  foreign key (cohort_id, day_number) references cohort_days (cohort_id, day_number) on delete cascade
);

create index lab_progress_cohort_day_idx on lab_progress (cohort_id, day_number, status);

create table attendance (
  cohort_id   uuid not null,
  day_number  int  not null,
  user_id     uuid not null references profiles (id) on delete cascade,
  status      attendance_status not null,
  marked_by   uuid references profiles (id) on delete set null,
  marked_at   timestamptz not null default now(),
  primary key (cohort_id, day_number, user_id),
  foreign key (cohort_id, day_number) references cohort_days (cohort_id, day_number) on delete cascade
);

-- ----- support / triage -------------------------------------------------------

create table stuck_queue (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  cohort_id    uuid not null references cohorts (id) on delete cascade,
  kind         stuck_kind not null,
  status       stuck_status not null default 'open',
  message      text,
  claimed_by   uuid references profiles (id) on delete set null,
  resolution   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index stuck_queue_open_idx on stuck_queue (cohort_id, status) where status in ('open','helping');

-- ----- announcements + polls --------------------------------------------------

create table announcements (
  id         uuid primary key default gen_random_uuid(),
  cohort_id  uuid not null references cohorts (id) on delete cascade,
  title      text not null,
  body_md    text not null,
  audience   announcement_audience not null default 'all',
  pinned_at  timestamptz,
  deleted_at timestamptz,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index announcements_cohort_active_idx on announcements (cohort_id) where deleted_at is null;

create table polls (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references cohorts (id) on delete cascade,
  day_number  int,
  question    text not null,
  options     jsonb not null,
  opened_at   timestamptz not null default now(),
  closed_at   timestamptz,
  created_by  uuid references profiles (id) on delete set null,
  foreign key (cohort_id, day_number) references cohort_days (cohort_id, day_number) on delete set null
);

create table poll_votes (
  poll_id  uuid not null references polls (id) on delete cascade,
  user_id  uuid not null references profiles (id) on delete cascade,
  choice   text not null,
  voted_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

-- ----- board (Q&A) ------------------------------------------------------------

create table board_posts (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references cohorts (id) on delete cascade,
  author_id   uuid references profiles (id) on delete set null,
  title       text not null,
  body_md     text not null,
  tags        text[] not null default '{}',
  pinned_at   timestamptz,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index board_posts_cohort_active_idx on board_posts (cohort_id) where deleted_at is null;

create table board_replies (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references board_posts (id) on delete cascade,
  author_id   uuid references profiles (id) on delete set null,
  body_md     text not null,
  is_accepted boolean not null default false,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table board_votes (
  user_id  uuid not null references profiles (id) on delete cascade,
  post_id  uuid references board_posts (id) on delete cascade,
  reply_id uuid references board_replies (id) on delete cascade,
  value    smallint not null check (value in (-1, 1)),
  voted_at timestamptz not null default now(),
  check ((post_id is not null) <> (reply_id is not null)),
  unique (user_id, post_id, reply_id)
);

-- ----- audit + notifications --------------------------------------------------

create table notifications_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles (id) on delete set null,
  kind       notification_kind not null,
  payload    jsonb not null default '{}',
  status     notification_status not null default 'queued',
  error      text,
  email_to   citext,
  sent_at    timestamptz,
  created_at timestamptz not null default now()
);

create table rbac_events (
  id        bigserial primary key,
  user_id   uuid references profiles (id) on delete set null,
  cap       text not null,
  granted   boolean not null,
  ctx       jsonb not null default '{}',
  at        timestamptz not null default now()
);

create index rbac_events_user_idx on rbac_events (user_id, at desc);

-- ----- enable RLS on every table; policies live in 0003_rls.sql --------------

do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename
      from pg_tables
     where schemaname = 'public'
  loop
    execute format('alter table %I.%I enable row level security', r.schemaname, r.tablename);
  end loop;
end $$;
