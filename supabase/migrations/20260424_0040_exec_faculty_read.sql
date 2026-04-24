-- Executive Faculty: read-only cohort-scoped access to student data for reporting.
-- Uses the Plan-1 helper executive_cohort_ids().
-- Applied 2026-04-24 via Supabase MCP.

drop policy if exists exec_read_submissions on public.submissions;
create policy exec_read_submissions on public.submissions
  for select to authenticated
  using (
    exists (
      select 1 from public.assignments a
      where a.id = submissions.assignment_id
        and a.cohort_id in (select public.executive_cohort_ids())
    )
  );

drop policy if exists exec_read_attendance on public.attendance;
create policy exec_read_attendance on public.attendance
  for select to authenticated
  using (cohort_id in (select public.executive_cohort_ids()));

drop policy if exists exec_read_lab_progress on public.lab_progress;
create policy exec_read_lab_progress on public.lab_progress
  for select to authenticated
  using (cohort_id in (select public.executive_cohort_ids()));

drop policy if exists exec_read_registrations on public.registrations;
create policy exec_read_registrations on public.registrations
  for select to authenticated
  using (cohort_id in (select public.executive_cohort_ids()));

drop policy if exists exec_read_quiz_attempts on public.quiz_attempts;
create policy exec_read_quiz_attempts on public.quiz_attempts
  for select to authenticated
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_attempts.quiz_id
        and q.cohort_id in (select public.executive_cohort_ids())
    )
  );

drop policy if exists exec_read_profiles on public.profiles;
create policy exec_read_profiles on public.profiles
  for select to authenticated
  using (
    exists (
      select 1 from public.registrations r
      where r.user_id = profiles.id
        and r.status = 'confirmed'
        and r.cohort_id in (select public.executive_cohort_ids())
    )
  );
