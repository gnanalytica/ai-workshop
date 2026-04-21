-- Cohort faculty can manage student pod membership and rename pods in their cohorts.
-- Pod creation, CSV import, and pod deletion remain super-admin only (cohort_pods INSERT/DELETE).

-- pod_members: insert / update / delete for students in faculty cohorts
drop policy if exists pod_members_faculty_insert on public.pod_members;
create policy pod_members_faculty_insert on public.pod_members
  for insert to authenticated
  with check (cohort_id in (select public.faculty_cohort_ids()));

drop policy if exists pod_members_faculty_update on public.pod_members;
create policy pod_members_faculty_update on public.pod_members
  for update to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()))
  with check (cohort_id in (select public.faculty_cohort_ids()));

drop policy if exists pod_members_faculty_delete on public.pod_members;
create policy pod_members_faculty_delete on public.pod_members
  for delete to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()));

-- cohort_pods: faculty can update name / mentor_note for pods in their cohorts
drop policy if exists cohort_pods_faculty_update on public.cohort_pods;
create policy cohort_pods_faculty_update on public.cohort_pods
  for update to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()))
  with check (cohort_id in (select public.faculty_cohort_ids()));
