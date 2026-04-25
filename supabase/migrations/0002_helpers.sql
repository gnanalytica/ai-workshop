-- =============================================================================
-- 0002_helpers.sql  --  Role + capability helpers used by every RLS policy.
-- All security definer; stable; safe to call from policies and clients.
-- =============================================================================

-- Convenience: current user's profile id (= auth.uid()) without nullable noise.
create or replace function current_user_id()
returns uuid language sql stable as $$
  select auth.uid()
$$;

-- Does the current user hold a given staff role (admin / trainer / tech_support)?
create or replace function has_staff_role(role text)
returns boolean
language sql stable security definer set search_path = public, auth
as $$
  select coalesce(
    (select role = any(staff_roles) from profiles where id = auth.uid()),
    false
  )
$$;

-- College role of the current user in a given cohort, or null.
create or replace function college_role_in(p_cohort uuid)
returns text
language sql stable security definer set search_path = public, auth
as $$
  select college_role::text
    from cohort_faculty
   where user_id = auth.uid() and cohort_id = p_cohort
   limit 1
$$;

-- Is current user an enrolled (confirmed) student in this cohort?
create or replace function is_enrolled_in(p_cohort uuid)
returns boolean
language sql stable security definer set search_path = public, auth
as $$
  select exists (
    select 1 from registrations
     where user_id = auth.uid()
       and cohort_id = p_cohort
       and status = 'confirmed'
  )
$$;

-- Cohorts where the user is faculty of any kind (support or executive).
create or replace function faculty_cohort_ids()
returns setof uuid
language sql stable security definer set search_path = public, auth
as $$
  select cohort_id from cohort_faculty where user_id = auth.uid()
$$;

-- Cohorts where the user is executive (read-only) faculty.
create or replace function executive_cohort_ids()
returns setof uuid
language sql stable security definer set search_path = public, auth
as $$
  select cohort_id from cohort_faculty
   where user_id = auth.uid() and college_role = 'executive'
$$;

-- Pod-membership helper: does faculty share a pod with student in this cohort?
create or replace function shares_pod_with(p_student uuid, p_cohort uuid)
returns boolean
language sql stable security definer set search_path = public, auth
as $$
  select exists (
    select 1
      from pod_members m
      join pod_faculty f on f.pod_id = m.pod_id
     where m.cohort_id = p_cohort
       and m.student_user_id = p_student
       and f.faculty_user_id = auth.uid()
  )
$$;

-- Authorization core: capabilities the current user holds, scoped to cohort.
-- Returned as text[] of the form 'cap.name' or 'cap.name:scope'.
-- This is the SINGLE place where role -> capability math happens server-side.
create or replace function auth_caps(p_cohort uuid default null)
returns text[]
language plpgsql stable security definer set search_path = public, auth
as $$
declare
  caps text[] := array[]::text[];
  is_admin       boolean := has_staff_role('admin');
  is_trainer     boolean := has_staff_role('trainer');
  is_tech_supp   boolean := has_staff_role('tech_support');
  cr             text;
  enrolled       boolean;
begin
  if auth.uid() is null then
    return caps;
  end if;

  -- Global staff roles
  if is_admin then
    caps := caps || array[
      'content.read','content.write',
      'schedule.read','schedule.write',
      'roster.read','roster.write',
      'pods.write','faculty.write',
      'grading.read','grading.write:cohort',
      'attendance.mark:cohort',
      'analytics.read:cohort','analytics.read:program',
      'announcements.write:cohort',
      'moderation.write',
      'support.triage','support.tech_only',
      'orgs.write'
    ];
  end if;

  if is_trainer then
    caps := caps || array[
      'content.read','content.write',
      'schedule.read','schedule.write',
      'roster.read',
      'pods.write','faculty.write',
      'grading.read','grading.write:cohort',
      'attendance.mark:cohort',
      'analytics.read:cohort',
      'announcements.write:cohort',
      'support.triage'
    ];
  end if;

  if is_tech_supp then
    caps := caps || array[
      'content.read','schedule.read','roster.read',
      'support.triage','support.tech_only',
      'moderation.write'
    ];
  end if;

  -- Per-cohort overlays (only if a cohort is given)
  if p_cohort is not null then
    cr := college_role_in(p_cohort);

    if cr = 'support' then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'grading.read','grading.write:pod',
        'attendance.mark:pod',
        'announcements.read:cohort',
        'support.triage'
      ];
    elsif cr = 'executive' then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'grading.read',
        'analytics.read:cohort',
        'announcements.write:cohort',
        'announcements.read:cohort'
      ];
    end if;

    enrolled := is_enrolled_in(p_cohort);
    if enrolled then
      caps := caps || array[
        'content.read','schedule.read',
        'self.read','self.write',
        'board.read','board.write',
        'attendance.self'
      ];
    end if;
  end if;

  -- Deduplicate
  return (select array_agg(distinct c) from unnest(caps) c);
end
$$;

-- Convenience: does the current user hold cap X (optionally in cohort)?
create or replace function has_cap(p_cap text, p_cohort uuid default null)
returns boolean
language sql stable security definer set search_path = public, auth
as $$
  select p_cap = any(coalesce(auth_caps(p_cohort), array[]::text[]))
$$;

-- Submission grading authorization: trainers/admins anywhere; support faculty only
-- in shared pods; executive faculty read-only (handled separately).
create or replace function can_grade(p_submission uuid)
returns boolean
language sql stable security definer set search_path = public, auth
as $$
  with s as (
    select s.user_id as student_id, a.cohort_id
      from submissions s
      join assignments a on a.id = s.assignment_id
     where s.id = p_submission
  )
  select case
    when has_staff_role('admin') or has_staff_role('trainer') then true
    when (select college_role_in(s.cohort_id) from s) = 'support'
         and shares_pod_with((select student_id from s), (select cohort_id from s)) then true
    else false
  end
$$;
