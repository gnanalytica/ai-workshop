-- 20260421_0300_pods_rls.sql
-- RLS for the new pod tables.
-- Uses drop-if-exists + create because Postgres has no CREATE POLICY IF NOT EXISTS.

-- cohort_pods
drop policy if exists cohort_pods_admin on public.cohort_pods;
create policy cohort_pods_admin on public.cohort_pods
  for all to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists cohort_pods_faculty_read on public.cohort_pods;
create policy cohort_pods_faculty_read on public.cohort_pods
  for select to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()));

-- pod_faculty
drop policy if exists pod_faculty_admin on public.pod_faculty;
create policy pod_faculty_admin on public.pod_faculty
  for all to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists pod_faculty_read on public.pod_faculty;
create policy pod_faculty_read on public.pod_faculty
  for select to authenticated
  using (
    exists(
      select 1 from public.cohort_pods cp
      where cp.id = pod_faculty.pod_id
        and cp.cohort_id in (select public.faculty_cohort_ids())
    )
  );

drop policy if exists pod_faculty_self_remove on public.pod_faculty;
create policy pod_faculty_self_remove on public.pod_faculty
  for delete to authenticated
  using (faculty_user_id = auth.uid());

-- pod_members
drop policy if exists pod_members_admin on public.pod_members;
create policy pod_members_admin on public.pod_members
  for all to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists pod_members_faculty_read on public.pod_members;
create policy pod_members_faculty_read on public.pod_members
  for select to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()));

drop policy if exists pod_members_self_read on public.pod_members;
create policy pod_members_self_read on public.pod_members
  for select to authenticated
  using (student_user_id = auth.uid());

-- pod_faculty_events
drop policy if exists pod_faculty_events_read on public.pod_faculty_events;
create policy pod_faculty_events_read on public.pod_faculty_events
  for select to authenticated
  using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
    or exists(
      select 1 from public.cohort_pods cp
      where cp.id = pod_faculty_events.pod_id
        and cp.cohort_id in (select public.faculty_cohort_ids())
    )
  );
-- No INSERT/UPDATE/DELETE policy: only the SECURITY DEFINER RPC writes.
