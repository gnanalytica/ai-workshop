-- Allow removing a student's registration row (unenroll from cohort).
-- Deletes are OR'd across permissive policies.

drop policy if exists registrations_delete_admin on public.registrations;
create policy registrations_delete_admin on public.registrations
  for delete to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and coalesce(p.is_admin, false) = true
    )
  );

drop policy if exists registrations_delete_faculty on public.registrations;
create policy registrations_delete_faculty on public.registrations
  for delete to authenticated
  using (
    cohort_id in (select public.faculty_cohort_ids())
  );
