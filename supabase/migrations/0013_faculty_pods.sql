-- =============================================================================
-- 0013_faculty_pods.sql  --  Cohort faculty get pods.write in their cohort.
-- Adds rpc_create_pod / rpc_update_pod / rpc_delete_pod, all cap-checked.
-- =============================================================================

-- ----- broaden auth_caps() to grant pods.write to cohort_faculty ------------
-- Same shape as 0002_helpers.sql; we only add pods.write to the support and
-- executive overlays. Everything else is unchanged.

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
    cr := college_role_in(p_cohort);

    if cr = 'support' then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
        'grading.read','grading.write:pod',
        'attendance.mark:pod',
        'announcements.read:cohort',
        'support.triage'
      ];
    elsif cr = 'executive' then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
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

  return (select array_agg(distinct c) from unnest(caps) c);
end
$$;

-- ----- pod CRUD RPCs ---------------------------------------------------------

create or replace function rpc_create_pod(
  p_cohort      uuid,
  p_name        text,
  p_mentor_note text default null
) returns pods
language plpgsql security definer set search_path = public, auth
as $$
declare
  v_pod pods;
begin
  if not has_cap('pods.write', p_cohort) then
    insert into rbac_events(user_id, cap, granted, ctx)
      values (auth.uid(), 'pods.write', false,
              jsonb_build_object('action','create_pod','cohort',p_cohort));
    raise exception 'permission denied: pods.write on cohort %', p_cohort;
  end if;

  insert into pods(cohort_id, name, mentor_note)
    values (p_cohort, p_name, p_mentor_note)
  returning * into v_pod;

  return v_pod;
end
$$;

create or replace function rpc_update_pod(
  p_pod_id      uuid,
  p_name        text default null,
  p_mentor_note text default null
) returns pods
language plpgsql security definer set search_path = public, auth
as $$
declare
  v_cohort uuid;
  v_pod    pods;
begin
  select cohort_id into v_cohort from pods where id = p_pod_id;
  if v_cohort is null then
    raise exception 'pod % not found', p_pod_id;
  end if;
  if not has_cap('pods.write', v_cohort) then
    raise exception 'permission denied: pods.write on cohort %', v_cohort;
  end if;

  update pods
     set name        = coalesce(p_name, name),
         mentor_note = coalesce(p_mentor_note, mentor_note)
   where id = p_pod_id
  returning * into v_pod;

  return v_pod;
end
$$;

create or replace function rpc_delete_pod(p_pod_id uuid)
returns uuid
language plpgsql security definer set search_path = public, auth
as $$
declare
  v_cohort uuid;
begin
  select cohort_id into v_cohort from pods where id = p_pod_id;
  if v_cohort is null then
    raise exception 'pod % not found', p_pod_id;
  end if;
  if not has_cap('pods.write', v_cohort) then
    raise exception 'permission denied: pods.write on cohort %', v_cohort;
  end if;

  delete from pods where id = p_pod_id;
  return p_pod_id;
end
$$;

grant execute on function rpc_create_pod(uuid, text, text) to authenticated;
grant execute on function rpc_update_pod(uuid, text, text) to authenticated;
grant execute on function rpc_delete_pod(uuid)             to authenticated;
