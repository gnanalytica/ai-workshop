-- =============================================================================
-- 0019_unify_faculty_role.sql -- Collapse "support" and "executive" faculty
-- distinctions into a single "faculty" role. Both stored values now resolve
-- to the same capability bundle (union of the two old sets) and the same
-- grading authorization.
--
-- We keep the college_role enum + cohort_faculty.college_role column for
-- schema stability, but client UIs no longer surface the choice and new
-- invites default to 'support'.
-- =============================================================================

create or replace function auth_caps(p_cohort uuid default null)
returns text[]
language plpgsql stable security definer set search_path = public, auth
as $$
declare
  caps text[] := array[]::text[];
  is_admin       boolean := has_staff_role('admin');
  is_trainer     boolean := has_staff_role('trainer');
  is_tech_supp   boolean := has_staff_role('tech_support');
  is_faculty     boolean;
  enrolled       boolean;
begin
  if auth.uid() is null then
    return caps;
  end if;

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

  -- Unified faculty overlay (per-cohort): union of the old support+executive
  -- bundles, granted to any cohort_faculty row regardless of college_role.
  if p_cohort is not null then
    is_faculty := exists (
      select 1 from cohort_faculty
       where cohort_id = p_cohort and user_id = auth.uid()
    );

    if is_faculty then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
        'grading.read','grading.write:pod',
        'attendance.mark:pod',
        'analytics.read:cohort',
        'announcements.read:cohort','announcements.write:cohort',
        'support.triage'
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

  return (select array_agg(distinct c) from unnest(caps) c);
end
$$;

-- Grading authorization: any faculty can grade their own pod members.
-- Previously this was support-only; executives had read-only.
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
    when exists (
      select 1 from cohort_faculty cf
       where cf.user_id = auth.uid()
         and cf.cohort_id = (select cohort_id from s)
    )
      and shares_pod_with((select student_id from s), (select cohort_id from s)) then true
    else false
  end
$$;
