-- =============================================================================
-- 0004_rpcs.sql  --  Atomic RPCs exposed to clients via PostgREST.
-- All authorization checks happen inside the function; functions are SECURITY
-- DEFINER so they can perform multi-row mutations without breaking RLS.
-- =============================================================================

-- ----- pod faculty event ------------------------------------------------------
-- Single entry point for adding/removing pod members or faculty, transferring
-- primary, or handing off. Emits an audit row to pod_events.

create or replace function rpc_pod_faculty_event(
  p_pod_id     uuid,
  p_kind       pod_event_kind,
  p_target_id  uuid,
  p_to_user_id uuid default null,
  p_payload    jsonb default '{}'
)
returns pod_events
language plpgsql security definer set search_path = public, auth
as $$
declare
  v_cohort uuid;
  v_event  pod_events;
begin
  select cohort_id into v_cohort from pods where id = p_pod_id;
  if v_cohort is null then
    raise exception 'pod % not found', p_pod_id;
  end if;

  if not has_cap('pods.write', v_cohort) then
    insert into rbac_events(user_id, cap, granted, ctx)
      values (auth.uid(), 'pods.write', false, jsonb_build_object('pod', p_pod_id, 'kind', p_kind));
    raise exception 'permission denied: pods.write on cohort %', v_cohort;
  end if;

  case p_kind
    when 'member_added' then
      insert into pod_members(pod_id, student_user_id, cohort_id)
        values (p_pod_id, p_target_id, v_cohort)
        on conflict (cohort_id, student_user_id) do update set pod_id = excluded.pod_id;
    when 'member_removed' then
      delete from pod_members where pod_id = p_pod_id and student_user_id = p_target_id;
    when 'faculty_added' then
      insert into pod_faculty(pod_id, faculty_user_id, is_primary)
        values (p_pod_id, p_target_id, false)
        on conflict (pod_id, faculty_user_id) do nothing;
    when 'faculty_removed' then
      delete from pod_faculty where pod_id = p_pod_id and faculty_user_id = p_target_id;
    when 'primary_changed' then
      update pod_faculty set is_primary = false where pod_id = p_pod_id;
      update pod_faculty set is_primary = true
        where pod_id = p_pod_id and faculty_user_id = p_target_id;
    when 'handoff' then
      update pod_faculty set is_primary = (faculty_user_id = p_to_user_id)
        where pod_id = p_pod_id and faculty_user_id in (p_target_id, p_to_user_id);
  end case;

  insert into pod_events(pod_id, kind, actor_user_id, payload)
    values (p_pod_id, p_kind, auth.uid(),
            p_payload || jsonb_build_object('target', p_target_id, 'to', p_to_user_id))
    returning * into v_event;

  return v_event;
end
$$;

-- ----- my_pod -----------------------------------------------------------------
-- Student fetches their pod for a cohort + faculty list.

create or replace function rpc_my_pod(p_cohort uuid)
returns table(
  pod_id uuid,
  pod_name text,
  mentor_note text,
  faculty jsonb
)
language sql stable security definer set search_path = public, auth
as $$
  select
    p.id,
    p.name,
    p.mentor_note,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', pf.faculty_user_id,
        'full_name', prof.full_name,
        'is_primary', pf.is_primary,
        'avatar_url', prof.avatar_url
      ))
      from pod_faculty pf
      join profiles prof on prof.id = pf.faculty_user_id
      where pf.pod_id = p.id
    ), '[]'::jsonb) as faculty
  from pod_members m
  join pods p on p.id = m.pod_id
  where m.cohort_id = p_cohort
    and m.student_user_id = auth.uid();
$$;

-- ----- mark_attendance --------------------------------------------------------
-- Single-call attendance with cap check (faculty mark for pod, trainers cohort-wide).

create or replace function rpc_mark_attendance(
  p_cohort uuid,
  p_day    int,
  p_user   uuid,
  p_status attendance_status
) returns attendance
language plpgsql security definer set search_path = public, auth
as $$
declare
  row attendance;
  ok  boolean;
begin
  ok := has_cap('attendance.mark:cohort', p_cohort)
        or (has_cap('attendance.mark:pod', p_cohort) and shares_pod_with(p_user, p_cohort));
  if not ok then
    raise exception 'permission denied: attendance.mark';
  end if;

  insert into attendance(cohort_id, day_number, user_id, status, marked_by)
    values (p_cohort, p_day, p_user, p_status, auth.uid())
  on conflict (cohort_id, day_number, user_id)
    do update set status = excluded.status, marked_by = auth.uid(), marked_at = now()
  returning * into row;

  return row;
end
$$;

-- ----- self attendance check-in ----------------------------------------------

create or replace function rpc_self_check_in(p_cohort uuid, p_day int)
returns attendance
language plpgsql security definer set search_path = public, auth
as $$
declare
  row attendance;
begin
  if not is_enrolled_in(p_cohort) then
    raise exception 'not enrolled in cohort';
  end if;

  insert into attendance(cohort_id, day_number, user_id, status, marked_by)
    values (p_cohort, p_day, auth.uid(), 'present', auth.uid())
  on conflict (cohort_id, day_number, user_id) do nothing
  returning * into row;

  if row is null then
    select * into row from attendance
     where cohort_id = p_cohort and day_number = p_day and user_id = auth.uid();
  end if;
  return row;
end
$$;

-- ----- grade_submission -------------------------------------------------------

create or replace function rpc_grade_submission(
  p_submission uuid,
  p_score      numeric,
  p_feedback   text default null
) returns submissions
language plpgsql security definer set search_path = public, auth
as $$
declare
  row submissions;
begin
  if not can_grade(p_submission) then
    raise exception 'permission denied: grading';
  end if;

  update submissions
     set score = p_score,
         feedback_md = coalesce(p_feedback, feedback_md),
         status = 'graded',
         graded_at = now(),
         graded_by = auth.uid(),
         updated_at = now()
   where id = p_submission
  returning * into row;

  return row;
end
$$;

-- ----- claim_stuck ------------------------------------------------------------

create or replace function rpc_claim_stuck(p_id uuid)
returns stuck_queue
language plpgsql security definer set search_path = public, auth
as $$
declare
  row stuck_queue;
  v_cohort uuid;
  v_kind   stuck_kind;
begin
  select cohort_id, kind into v_cohort, v_kind from stuck_queue where id = p_id;
  if v_cohort is null then raise exception 'not found'; end if;

  if not (has_cap('support.triage', v_cohort)
          and (v_kind <> 'tech' or has_cap('support.tech_only'))) then
    raise exception 'permission denied: support.triage';
  end if;

  update stuck_queue
     set claimed_by = auth.uid(), status = 'helping', updated_at = now()
   where id = p_id and status = 'open'
  returning * into row;

  return row;
end
$$;

-- ----- expose helpers to clients ---------------------------------------------

grant execute on function auth_caps(uuid)            to authenticated;
grant execute on function has_cap(text, uuid)        to authenticated;
grant execute on function has_staff_role(text)       to authenticated;
grant execute on function college_role_in(uuid)      to authenticated;
grant execute on function is_enrolled_in(uuid)       to authenticated;
grant execute on function faculty_cohort_ids()       to authenticated;
grant execute on function executive_cohort_ids()     to authenticated;
grant execute on function shares_pod_with(uuid,uuid) to authenticated;
grant execute on function can_grade(uuid)            to authenticated;

grant execute on function rpc_pod_faculty_event(uuid, pod_event_kind, uuid, uuid, jsonb) to authenticated;
grant execute on function rpc_my_pod(uuid)                to authenticated;
grant execute on function rpc_mark_attendance(uuid, int, uuid, attendance_status) to authenticated;
grant execute on function rpc_self_check_in(uuid, int)    to authenticated;
grant execute on function rpc_grade_submission(uuid, numeric, text) to authenticated;
grant execute on function rpc_claim_stuck(uuid)           to authenticated;
