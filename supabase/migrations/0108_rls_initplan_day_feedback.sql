-- 0108_rls_initplan_day_feedback.sql
--
-- Two `auth_rls_initplan` advisors still flag `day_feedback` policies that
-- call bare `auth.uid()` (added in 0074 — predates the 0065 sweep).
-- Wrap with `(select auth.uid())` so the planner hoists it to an InitPlan.
-- Per-policy logic preserved exactly.

drop policy if exists df_self on public.day_feedback;
create policy df_self on public.day_feedback
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists df_staff_read on public.day_feedback;
create policy df_staff_read on public.day_feedback
  for select using (
    has_staff_role('admin')
    or exists (
      select 1 from public.cohort_faculty
       where cohort_id = day_feedback.cohort_id
         and user_id = (select auth.uid())
    )
  );
