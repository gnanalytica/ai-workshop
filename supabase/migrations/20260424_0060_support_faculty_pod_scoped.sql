-- Defensive pod-scoped update policy using can_grade_submission.
-- OR-combines with the existing broader submissions_faculty_cohort_rw policy,
-- so this doesn't restrict anything today. It's here so a later tightening
-- pass can drop the broader policy while preserving support faculty's pod-scoped
-- grading rights. Applied 2026-04-24 via Supabase MCP.

drop policy if exists support_grade_submission on public.submissions;
create policy support_grade_submission on public.submissions
  for update to authenticated
  using (public.can_grade_submission(id))
  with check (public.can_grade_submission(id));
