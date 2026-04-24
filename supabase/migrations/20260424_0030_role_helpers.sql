-- New role helpers. SECURITY DEFINER + STABLE so they can be called
-- inside RLS policies without recursive checks. Existing helpers
-- (current_profile_is_admin, faculty_cohort_ids) are left in place
-- for now; Plan 2 migrates policies off them.

-- has_staff_role: does the current user hold `role` in profiles.staff_roles?
create or replace function public.has_staff_role(role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = any(staff_roles) from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.has_staff_role(text) from public;
grant execute on function public.has_staff_role(text) to authenticated;

-- college_role_in: what college role (if any) does the current user hold
-- in a given cohort? Returns 'support', 'executive', or NULL.
create or replace function public.college_role_in(cohort uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select college_role
  from public.cohort_faculty
  where user_id = auth.uid() and cohort_id = cohort
  limit 1;
$$;

revoke all on function public.college_role_in(uuid) from public;
grant execute on function public.college_role_in(uuid) to authenticated;

-- executive_cohort_ids: cohorts where the current user is executive faculty.
create or replace function public.executive_cohort_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select cohort_id
  from public.cohort_faculty
  where user_id = auth.uid() and college_role = 'executive';
$$;

revoke all on function public.executive_cohort_ids() from public;
grant execute on function public.executive_cohort_ids() to authenticated;

-- can_grade_submission: admin/trainer unrestricted; support faculty only if
-- the submission's student shares a pod with them in the submission's cohort.
-- Real column names (verified 2026-04-24 against ai-workshop):
--   pod_faculty.faculty_user_id  (NOT user_id)
--   pod_members.student_user_id  (NOT user_id)
--   pod_members.cohort_id        (so no join through cohort_pods needed)
create or replace function public.can_grade_submission(submission uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with s as (
    select sub.id as submission_id, sub.user_id as student_id, a.cohort_id
    from public.submissions sub
    join public.assignments a on a.id = sub.assignment_id
    where sub.id = submission
  )
  select
    public.has_staff_role('admin')
    or public.has_staff_role('trainer')
    or exists (
      select 1
      from s
      join public.pod_members pm
        on pm.student_user_id = s.student_id
       and pm.cohort_id = s.cohort_id
      join public.pod_faculty pf
        on pf.pod_id = pm.pod_id
       and pf.faculty_user_id = auth.uid()
      where public.college_role_in(s.cohort_id) = 'support'
    );
$$;

revoke all on function public.can_grade_submission(uuid) from public;
grant execute on function public.can_grade_submission(uuid) to authenticated;
