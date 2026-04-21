-- 20260421_0220_rpc_pod_faculty_event.sql
-- Atomic RPC for pod_faculty mutations (add/remove/handoff/primary_transfer)
-- with audit row emission. Callable by admins or faculty on the pod's cohort.

create or replace function public.rpc_pod_faculty_event(
  p_pod_id uuid,
  p_kind text,
  p_from_user_id uuid default null,
  p_to_user_id uuid default null,
  p_note text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cohort_id uuid;
  v_is_admin boolean;
  v_is_cohort_faculty boolean;
begin
  select cohort_id into v_cohort_id from public.cohort_pods where id = p_pod_id;
  if v_cohort_id is null then raise exception 'pod not found'; end if;

  select coalesce(is_admin, false) into v_is_admin from public.profiles where id = auth.uid();
  select exists(select 1 from public.cohort_faculty where user_id = auth.uid() and cohort_id = v_cohort_id)
    into v_is_cohort_faculty;

  if not (v_is_admin or v_is_cohort_faculty) then
    raise exception 'not permitted';
  end if;

  if p_to_user_id is not null and not exists(
    select 1 from public.cohort_faculty where user_id = p_to_user_id and cohort_id = v_cohort_id
  ) then
    raise exception 'target user is not faculty on this cohort';
  end if;

  if p_kind = 'added' then
    insert into public.pod_faculty (pod_id, faculty_user_id, assigned_by)
    values (p_pod_id, p_to_user_id, auth.uid())
    on conflict (pod_id, faculty_user_id) do nothing;

  elsif p_kind = 'removed' then
    delete from public.pod_faculty where pod_id = p_pod_id and faculty_user_id = p_from_user_id;

  elsif p_kind = 'primary_transfer' then
    update public.pod_faculty set is_primary = false where pod_id = p_pod_id;
    insert into public.pod_faculty (pod_id, faculty_user_id, is_primary, assigned_by)
    values (p_pod_id, p_to_user_id, true, auth.uid())
    on conflict (pod_id, faculty_user_id) do update set is_primary = true;

  elsif p_kind = 'handoff' then
    update public.pod_faculty set is_primary = false where pod_id = p_pod_id;
    insert into public.pod_faculty (pod_id, faculty_user_id, is_primary, assigned_by)
    values (p_pod_id, p_to_user_id, true, auth.uid())
    on conflict (pod_id, faculty_user_id) do update set is_primary = true;
    if p_from_user_id is not null and p_from_user_id <> p_to_user_id then
      delete from public.pod_faculty where pod_id = p_pod_id and faculty_user_id = p_from_user_id;
    end if;

  else
    raise exception 'unknown kind %', p_kind;
  end if;

  insert into public.pod_faculty_events (pod_id, from_user_id, to_user_id, kind, note, actor_user_id)
  values (p_pod_id, p_from_user_id, p_to_user_id, p_kind, p_note, auth.uid());
end $$;

grant execute on function public.rpc_pod_faculty_event(uuid, text, uuid, uuid, text) to authenticated;
