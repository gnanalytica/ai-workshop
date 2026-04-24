-- Retire profiles.is_admin — the role source of truth is now profiles.staff_roles.
-- Applied 2026-04-24 via Supabase MCP. Required because 9 existing policies
-- referenced the column directly; they're rewritten through the is_admin()
-- helper (which now reads staff_roles).

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select public.has_staff_role('admin'); $$;

create or replace function public.current_profile_is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select public.has_staff_role('admin'); $$;

drop policy if exists cohort_pods_admin on public.cohort_pods;
create policy cohort_pods_admin on public.cohort_pods
  for all to public using (public.is_admin()) with check (public.is_admin());

drop policy if exists pod_faculty_admin on public.pod_faculty;
create policy pod_faculty_admin on public.pod_faculty
  for all to public using (public.is_admin()) with check (public.is_admin());

drop policy if exists pod_members_admin on public.pod_members;
create policy pod_members_admin on public.pod_members
  for all to public using (public.is_admin()) with check (public.is_admin());

drop policy if exists pod_faculty_events_read on public.pod_faculty_events;
create policy pod_faculty_events_read on public.pod_faculty_events
  for select to public
  using (
    public.is_admin()
    or exists (
      select 1 from public.cohort_pods cp
      where cp.id = pod_faculty_events.pod_id
        and cp.cohort_id in (select public.faculty_cohort_ids())
    )
  );

drop policy if exists registrations_delete_admin on public.registrations;
create policy registrations_delete_admin on public.registrations
  for delete to public using (public.is_admin());

drop policy if exists faculty_pretraining_select on public.faculty_pretraining_progress;
create policy faculty_pretraining_select on public.faculty_pretraining_progress
  for select to public
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.faculty_cohort_ids() f(f)
      where f.f = faculty_pretraining_progress.cohort_id
    )
  );

drop policy if exists faculty_pretraining_insert on public.faculty_pretraining_progress;
create policy faculty_pretraining_insert on public.faculty_pretraining_progress
  for insert to public
  with check (
    user_id = auth.uid()
    and (
      public.is_admin()
      or exists (
        select 1 from public.faculty_cohort_ids() f(f)
        where f.f = faculty_pretraining_progress.cohort_id
      )
      or user_id = auth.uid()
    )
  );

drop policy if exists faculty_pretraining_update on public.faculty_pretraining_progress;
create policy faculty_pretraining_update on public.faculty_pretraining_progress
  for update to public
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.faculty_cohort_ids() f(f)
      where f.f = faculty_pretraining_progress.cohort_id
    )
  )
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists faculty_pretraining_delete on public.faculty_pretraining_progress;
create policy faculty_pretraining_delete on public.faculty_pretraining_progress
  for delete to public using (user_id = auth.uid() or public.is_admin());

alter table public.profiles drop column if exists is_admin;
