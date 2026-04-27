-- At most one pod assignment per faculty per cohort (move = delete + insert via RPC).

alter table pod_faculty
  add column if not exists cohort_id uuid references cohorts (id) on delete cascade;

update pod_faculty pf
set cohort_id = p.cohort_id
from pods p
where p.id = pf.pod_id
  and pf.cohort_id is distinct from p.cohort_id;

delete from pod_faculty pf
where pf.cohort_id is null;

alter table pod_faculty alter column cohort_id set not null;

delete from pod_faculty a
  using pod_faculty b
  where a.faculty_user_id = b.faculty_user_id
    and a.cohort_id = b.cohort_id
    and a.ctid > b.ctid;

create or replace function pod_faculty_sync_cohort()
returns trigger
language plpgsql
as $$
begin
  select p.cohort_id into strict new.cohort_id
  from pods p
  where p.id = new.pod_id;
  return new;
end;
$$;

drop trigger if exists trg_pod_faculty_cohort on pod_faculty;
create trigger trg_pod_faculty_cohort
  before insert or update of pod_id on pod_faculty
  for each row
  execute function pod_faculty_sync_cohort();

create unique index if not exists pod_faculty_one_per_faculty_cohort
  on pod_faculty (faculty_user_id, cohort_id);

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
      delete from pod_faculty
        where faculty_user_id = p_target_id
          and cohort_id = v_cohort;
      insert into pod_faculty(pod_id, faculty_user_id)
        values (p_pod_id, p_target_id);
    when 'faculty_removed' then
      delete from pod_faculty where pod_id = p_pod_id and faculty_user_id = p_target_id;
    when 'primary_changed', 'handoff' then
      null;
  end case;

  insert into pod_events(pod_id, kind, actor_user_id, payload)
    values (p_pod_id, p_kind, auth.uid(),
            p_payload || jsonb_build_object('target', p_target_id, 'to', p_to_user_id))
    returning * into v_event;

  return v_event;
end;
$$;
