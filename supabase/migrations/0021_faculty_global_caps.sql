-- =============================================================================
-- 0021_faculty_global_caps.sql -- Grant faculty their capability bundle when
-- auth_caps() is called WITHOUT a cohort id.
--
-- Bug: pages like /faculty, /faculty/handbook, /admin call
-- requireCapability("schedule.read") with no cohort, so auth_caps(null) ran.
-- The faculty branch was gated behind `p_cohort is not null`, so any logged-in
-- faculty user got an empty cap array and was bounced to /denied.
--
-- Fix: when p_cohort is null, check whether the user is in *any* cohort_faculty
-- row and union in the same global-safe caps. Per-cohort caps that depend on a
-- specific cohort (analytics.read:cohort, announcements.*:cohort) stay gated
-- behind the per-cohort branch. The same global treatment is extended to
-- enrolled students so /day, /board etc. work without an explicit cohort.
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
  else
    -- Global path: grant the cohort-agnostic subset to any user who has at
    -- least one cohort_faculty row (or one confirmed registration).
    is_faculty := exists (
      select 1 from cohort_faculty where user_id = auth.uid()
    );

    if is_faculty then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
        'grading.read','grading.write:pod',
        'attendance.mark:pod',
        'announcements.read:cohort',
        'support.triage'
      ];
    end if;

    enrolled := exists (
      select 1 from registrations
       where user_id = auth.uid() and status = 'confirmed'
    );

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
