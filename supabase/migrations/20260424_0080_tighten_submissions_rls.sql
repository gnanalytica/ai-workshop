-- Tighten submissions grading. Applied 2026-04-24 via MCP.
-- After: admin + trainer (via staff_roles) have full grade rights; support
-- faculty can UPDATE only submissions where can_grade_submission(id) is true
-- (i.e. the student is in a pod they're assigned to). All faculty can still
-- SELECT cohort submissions for listing via subs_faculty_read + is_faculty_of.

drop policy if exists submissions_faculty_cohort_rw on public.submissions;
drop policy if exists subs_faculty_update on public.submissions;

drop policy if exists subs_trainer_update on public.submissions;
create policy subs_trainer_update on public.submissions
  for update to authenticated
  using (public.has_staff_role('trainer') or public.has_staff_role('admin'))
  with check (public.has_staff_role('trainer') or public.has_staff_role('admin'));
