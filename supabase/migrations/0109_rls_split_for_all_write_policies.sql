-- 0109_rls_split_for_all_write_policies.sql
--
-- Advisor `multiple_permissive_policies` flagged 113 row-level overlaps.
-- Most come from a common pattern: a `_read for select` policy paired with
-- a `_write for all` policy. The `for all` write policy ALSO evaluates on
-- SELECT (Postgres OR-combines permissive policies), so every read does
-- two policy checks even when the second is redundant.
--
-- Fix: split each `_write for all` policy on hot tables into three policies
-- — `for insert`, `for update`, `for delete` — preserving the same
-- using/with-check predicates. SELECT is then governed solely by the
-- existing `_read for select` policy.
--
-- Safety: all callers granted by the write policy ALSO carry the matching
-- read capability (verified in web/lib/rbac/capabilities.ts: admins have
-- both content.write and schedule.read/content.read; faculty/students do
-- not have these write caps). So no caller loses SELECT access.
--
-- Scope: limited to the hottest tables queried on every page load or
-- during class peaks. Self-CRUD policies (qa_self, lp_self, df_self) and
-- mixed grader/self policies (assignment_submissions) are out of scope —
-- they require extra care and don't fire as often.

-- =============================================================================
-- polls — queried by rpc_active_poll on every navigation + PollPopup tickle
-- =============================================================================
drop policy if exists polls_write on public.polls;

create policy polls_write_insert on public.polls
  for insert to authenticated
  with check (has_cap('content.write', cohort_id));

create policy polls_write_update on public.polls
  for update to authenticated
  using (has_cap('content.write', cohort_id))
  with check (has_cap('content.write', cohort_id));

create policy polls_write_delete on public.polls
  for delete to authenticated
  using (has_cap('content.write', cohort_id));

-- =============================================================================
-- cohort_days — read on every layout (DayRail, current-day metadata)
-- =============================================================================
drop policy if exists cohort_days_write on public.cohort_days;

create policy cohort_days_write_insert on public.cohort_days
  for insert to authenticated
  with check (has_cap('schedule.write', cohort_id));

create policy cohort_days_write_update on public.cohort_days
  for update to authenticated
  using (has_cap('schedule.write', cohort_id))
  with check (has_cap('schedule.write', cohort_id));

create policy cohort_days_write_delete on public.cohort_days
  for delete to authenticated
  using (has_cap('schedule.write', cohort_id));

-- =============================================================================
-- profiles — read by AppShell on every authed page
-- =============================================================================
drop policy if exists profiles_admin_write on public.profiles;

create policy profiles_admin_write_insert on public.profiles
  for insert to authenticated
  with check (has_staff_role('admin'));

create policy profiles_admin_write_update on public.profiles
  for update to authenticated
  using (has_staff_role('admin'))
  with check (has_staff_role('admin'));

create policy profiles_admin_write_delete on public.profiles
  for delete to authenticated
  using (has_staff_role('admin'));

-- =============================================================================
-- quizzes
-- =============================================================================
drop policy if exists q_write on public.quizzes;

create policy q_write_insert on public.quizzes
  for insert to authenticated
  with check (has_cap('content.write', cohort_id));

create policy q_write_update on public.quizzes
  for update to authenticated
  using (has_cap('content.write', cohort_id))
  with check (has_cap('content.write', cohort_id));

create policy q_write_delete on public.quizzes
  for delete to authenticated
  using (has_cap('content.write', cohort_id));

-- =============================================================================
-- quiz_questions
-- =============================================================================
drop policy if exists qq_write on public.quiz_questions;

create policy qq_write_insert on public.quiz_questions
  for insert to authenticated
  with check (
    exists (select 1 from public.quizzes q
             where q.id = quiz_questions.quiz_id
               and has_cap('content.write', q.cohort_id))
  );

create policy qq_write_update on public.quiz_questions
  for update to authenticated
  using (
    exists (select 1 from public.quizzes q
             where q.id = quiz_questions.quiz_id
               and has_cap('content.write', q.cohort_id))
  )
  with check (
    exists (select 1 from public.quizzes q
             where q.id = quiz_questions.quiz_id
               and has_cap('content.write', q.cohort_id))
  );

create policy qq_write_delete on public.quiz_questions
  for delete to authenticated
  using (
    exists (select 1 from public.quizzes q
             where q.id = quiz_questions.quiz_id
               and has_cap('content.write', q.cohort_id))
  );

-- =============================================================================
-- announcements
-- =============================================================================
drop policy if exists ann_write on public.announcements;

create policy ann_write_insert on public.announcements
  for insert to authenticated
  with check (has_cap('announcements.write:cohort', cohort_id));

create policy ann_write_update on public.announcements
  for update to authenticated
  using (has_cap('announcements.write:cohort', cohort_id))
  with check (has_cap('announcements.write:cohort', cohort_id));

create policy ann_write_delete on public.announcements
  for delete to authenticated
  using (has_cap('announcements.write:cohort', cohort_id));

-- =============================================================================
-- cohort_banners — read by rpc_active_banner on every navigation
-- =============================================================================
drop policy if exists cb_write on public.cohort_banners;

create policy cb_write_insert on public.cohort_banners
  for insert to authenticated
  with check (has_cap('content.write', cohort_id));

create policy cb_write_update on public.cohort_banners
  for update to authenticated
  using (has_cap('content.write', cohort_id))
  with check (has_cap('content.write', cohort_id));

create policy cb_write_delete on public.cohort_banners
  for delete to authenticated
  using (has_cap('content.write', cohort_id));

-- =============================================================================
-- pod_members — read by AppShell (rpc_my_pod), shouldn't double-fire on SELECT
-- =============================================================================
drop policy if exists pm_write on public.pod_members;

create policy pm_write_insert on public.pod_members
  for insert to authenticated
  with check (has_cap('pods.write', cohort_id));

create policy pm_write_update on public.pod_members
  for update to authenticated
  using (has_cap('pods.write', cohort_id))
  with check (has_cap('pods.write', cohort_id));

create policy pm_write_delete on public.pod_members
  for delete to authenticated
  using (has_cap('pods.write', cohort_id));

-- =============================================================================
-- registrations — read on enrollment lookup
-- =============================================================================
drop policy if exists reg_staff_write on public.registrations;

create policy reg_staff_write_insert on public.registrations
  for insert to authenticated
  with check (has_cap('roster.write', cohort_id));

create policy reg_staff_write_update on public.registrations
  for update to authenticated
  using (has_cap('roster.write', cohort_id))
  with check (has_cap('roster.write', cohort_id));

create policy reg_staff_write_delete on public.registrations
  for delete to authenticated
  using (has_cap('roster.write', cohort_id));
