-- =============================================================================
-- 0022_faculty_simplify.sql -- Drop primary/secondary faculty distinction,
-- prune the announcements + manual-attendance capability surface, and add a
-- stuck-queue escalation channel that lets faculty hand a thread up to staff
-- (admin / trainer / tech_support).
--
-- Faculty are now equal peers per pod: any faculty in a pod can act on the
-- pod, multiple faculty can be assigned, and there is no "primary" anymore.
-- Attendance is derived from login + activity, not faculty checkboxes, so the
-- attendance.mark caps are removed. Announcements are dropped as a UI surface
-- in favor of the cohort-wide community board; the table is kept (no inserts
-- expected) for safety until a later cleanup migration.
-- =============================================================================

-- ----- pod_faculty: drop primary/secondary -----------------------------------

drop index if exists pod_faculty_one_primary;

alter table pod_faculty drop column if exists is_primary;

-- ----- rpc_pod_faculty_event: drop primary_changed / handoff -----------------

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
      insert into pod_faculty(pod_id, faculty_user_id)
        values (p_pod_id, p_target_id)
        on conflict (pod_id, faculty_user_id) do nothing;
    when 'faculty_removed' then
      delete from pod_faculty where pod_id = p_pod_id and faculty_user_id = p_target_id;
    when 'primary_changed', 'handoff' then
      -- Deprecated: faculty are now equal peers. Treat as no-op; keep enum
      -- values for audit-log compatibility.
      null;
  end case;

  insert into pod_events(pod_id, kind, actor_user_id, payload)
    values (p_pod_id, p_kind, auth.uid(),
            p_payload || jsonb_build_object('target', p_target_id, 'to', p_to_user_id))
    returning * into v_event;

  return v_event;
end
$$;

-- ----- rpc_my_pod: drop is_primary from payload ------------------------------

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

-- ----- v_pod_summary: drop primary_faculty_id --------------------------------

drop view if exists v_pod_summary;
create view v_pod_summary as
select
  p.id as pod_id,
  p.cohort_id,
  p.name,
  (select count(*) from pod_members m where m.pod_id = p.id) as member_count,
  (select count(*) from pod_faculty f where f.pod_id = p.id) as faculty_count
from pods p;

-- ----- stuck_queue: escalation channel ---------------------------------------

alter table stuck_queue
  add column if not exists escalated_at  timestamptz,
  add column if not exists escalated_by  uuid references profiles (id) on delete set null,
  add column if not exists escalation_note text;

create index if not exists stuck_queue_escalated_idx
  on stuck_queue (cohort_id) where escalated_at is not null;

-- ----- auth_caps: prune faculty bundle, add support.escalate -----------------

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
      'analytics.read:cohort','analytics.read:program',
      'moderation.write',
      'support.triage','support.tech_only','support.escalate',
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
      'analytics.read:cohort',
      'support.triage','support.escalate'
    ];
  end if;

  if is_tech_supp then
    caps := caps || array[
      'content.read','schedule.read','roster.read',
      'support.triage','support.tech_only','support.escalate',
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
        'support.triage','support.escalate',
        'moderation.write'
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
    is_faculty := exists (
      select 1 from cohort_faculty where user_id = auth.uid()
    );

    if is_faculty then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
        'grading.read','grading.write:pod',
        'support.triage','support.escalate',
        'moderation.write'
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
