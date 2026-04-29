-- =============================================================================
-- 0058_drop_legacy_role_refs_in_policies.sql
-- Migration 0057 retired the `trainer` and `tech_support` staff roles, but
-- several pre-existing RLS policies still OR'd against has_staff_role for
-- those values. They were dead branches (no profile holds those roles), but
-- left behind they're misleading when auditing the policy surface. Rewrite
-- each policy to keep only `admin` (and any other live branches it had).
-- =============================================================================

-- ---------- profiles -----------------------------------------------------------

drop policy if exists profiles_staff_read on profiles;
create policy profiles_staff_read on profiles
  for select to authenticated
  using (has_staff_role('admin'));

-- ---------- cohorts ------------------------------------------------------------

drop policy if exists cohorts_read on cohorts;
create policy cohorts_read on cohorts
  for select to authenticated
  using (
    has_staff_role('admin')
    or exists (
      select 1 from cohort_faculty f
      where f.cohort_id = cohorts.id and f.user_id = auth.uid()
    )
    or exists (
      select 1 from registrations r
      where r.cohort_id = cohorts.id and r.user_id = auth.uid()
    )
    or status = 'live'::cohort_status
  );

-- ---------- rubric_templates ---------------------------------------------------

drop policy if exists rubric_read on rubric_templates;
create policy rubric_read on rubric_templates
  for select to authenticated
  using (
    has_staff_role('admin')
    or exists (
      select 1 from cohort_faculty
      where cohort_faculty.user_id = auth.uid()
    )
  );

drop policy if exists rubric_write on rubric_templates;
create policy rubric_write on rubric_templates
  for all to authenticated
  using (has_staff_role('admin'))
  with check (has_staff_role('admin'));

-- ---------- faculty_pretraining_modules ----------------------------------------

drop policy if exists fpm_admin_write on faculty_pretraining_modules;
create policy fpm_admin_write on faculty_pretraining_modules
  for all to authenticated
  using (has_staff_role('admin'))
  with check (has_staff_role('admin'));

-- ---------- faculty_pretraining_progress ---------------------------------------

drop policy if exists fpp_admin_read on faculty_pretraining_progress;
create policy fpp_admin_read on faculty_pretraining_progress
  for select to authenticated
  using (has_staff_role('admin'));

-- ---------- faculty_pod_notes --------------------------------------------------

drop policy if exists fpn_read on faculty_pod_notes;
create policy fpn_read on faculty_pod_notes
  for select to authenticated
  using (
    has_staff_role('admin')
    or (
      has_cap('roster.read', cohort_id)
      and exists (
        select 1 from cohort_faculty cf
        where cf.cohort_id = faculty_pod_notes.cohort_id and cf.user_id = auth.uid()
      )
    )
  );

-- Original fpn_write had qual=null (i.e. `using (true)`) and only gated INSERT
-- via with_check. Preserve that shape — fpn_read handles SELECT visibility.
drop policy if exists fpn_write on faculty_pod_notes;
create policy fpn_write on faculty_pod_notes
  for all to authenticated
  using (true)
  with check (
    author_id = auth.uid()
    and (
      has_staff_role('admin')
      or exists (
        select 1 from cohort_faculty cf
        where cf.cohort_id = faculty_pod_notes.cohort_id and cf.user_id = auth.uid()
      )
    )
  );
