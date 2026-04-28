-- =============================================================================
-- 0044_profiles_cofaculty_read.sql
-- Faculty members need to see each other's profile (full_name, avatar) for
-- the cohort kanban / roster views. The existing profiles_faculty_read policy
-- only grants visibility to *students* in the same cohort, not to peer faculty.
-- The kanban shows other faculty's chips with blank names because the embedded
-- profiles rows are silently RLS-filtered to null.
--
-- Add a SELECT policy that allows a faculty user to read profiles of any
-- other user assigned to one of their cohorts as faculty.
-- =============================================================================

drop policy if exists profiles_cofaculty_read on profiles;
create policy profiles_cofaculty_read on profiles
  for select
  using (
    exists (
      select 1
        from cohort_faculty me
        join cohort_faculty other on other.cohort_id = me.cohort_id
       where me.user_id = auth.uid()
         and other.user_id = profiles.id
    )
  );
