-- 20260421_0310_widen_faculty_rls.sql
-- Widen RLS on existing cohort-scoped tables so faculty can read/write rows
-- belonging to cohorts they teach. Uses the public.faculty_cohort_ids() helper.
--
-- Notes on schema (informed by actual column names):
--   * submissions has NO direct cohort_id — join via assignments(cohort_id).
--   * peer_reviews has NO direct cohort_id or reviewee_id — join via
--     submissions → assignments.
--   * stuck_queue, attendance, lab_progress all have cohort_id directly.
--   * profiles: faculty can SELECT profiles of users with a confirmed
--     registrations row in one of their cohorts.
--
-- Postgres does not support CREATE POLICY IF NOT EXISTS; we drop-if-exists
-- first so the migration is idempotent.

-- submissions: join via assignments.cohort_id
drop policy if exists submissions_faculty_cohort_rw on public.submissions;
create policy submissions_faculty_cohort_rw on public.submissions
  for all to authenticated
  using (
    exists(
      select 1 from public.assignments a
      where a.id = submissions.assignment_id
        and a.cohort_id in (select public.faculty_cohort_ids())
    )
  )
  with check (
    exists(
      select 1 from public.assignments a
      where a.id = submissions.assignment_id
        and a.cohort_id in (select public.faculty_cohort_ids())
    )
  );

-- peer_reviews: join via submissions → assignments
drop policy if exists peer_reviews_faculty_cohort_rw on public.peer_reviews;
create policy peer_reviews_faculty_cohort_rw on public.peer_reviews
  for all to authenticated
  using (
    exists(
      select 1
      from public.submissions s
      join public.assignments a on a.id = s.assignment_id
      where s.id = peer_reviews.submission_id
        and a.cohort_id in (select public.faculty_cohort_ids())
    )
  )
  with check (
    exists(
      select 1
      from public.submissions s
      join public.assignments a on a.id = s.assignment_id
      where s.id = peer_reviews.submission_id
        and a.cohort_id in (select public.faculty_cohort_ids())
    )
  );

-- stuck_queue: direct cohort_id
drop policy if exists stuck_queue_faculty_cohort_rw on public.stuck_queue;
create policy stuck_queue_faculty_cohort_rw on public.stuck_queue
  for all to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()))
  with check (cohort_id in (select public.faculty_cohort_ids()));

-- attendance: direct cohort_id
drop policy if exists attendance_faculty_cohort_rw on public.attendance;
create policy attendance_faculty_cohort_rw on public.attendance
  for all to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()))
  with check (cohort_id in (select public.faculty_cohort_ids()));

-- lab_progress: direct cohort_id
drop policy if exists lab_progress_faculty_cohort_rw on public.lab_progress;
create policy lab_progress_faculty_cohort_rw on public.lab_progress
  for all to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()))
  with check (cohort_id in (select public.faculty_cohort_ids()));

-- profiles: faculty can SELECT profiles of students confirmed-registered in
-- one of their cohorts.
drop policy if exists profiles_faculty_cohort_read on public.profiles;
create policy profiles_faculty_cohort_read on public.profiles
  for select to authenticated
  using (
    exists(
      select 1 from public.registrations r
      where r.user_id = profiles.id
        and r.status = 'confirmed'
        and r.cohort_id in (select public.faculty_cohort_ids())
    )
  );
