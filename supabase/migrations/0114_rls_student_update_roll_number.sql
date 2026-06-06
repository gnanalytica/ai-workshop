-- =============================================================================
-- 0114_rls_student_update_roll_number.sql
-- Allow students to update their roll_number on confirmed registrations.
-- Scoped to prevent status changes or other field modifications.
-- =============================================================================

drop policy if exists reg_self_update_roll_number on registrations;
create policy reg_self_update_roll_number on registrations
  for update
  using (user_id = (select auth.uid()) and status = 'confirmed')
  with check (
    user_id = (select auth.uid())
    and status = 'confirmed'
  );
