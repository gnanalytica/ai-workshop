-- Support faculty (cohort_faculty, non-admin): triage + observe, not curriculum/grading/roster ops.
-- Trainers (profiles.is_admin): full cohort operations.

-- ---------- submissions: faculty read-only; admin full access ----------
drop policy if exists submissions_faculty_cohort_rw on public.submissions;
create policy submissions_faculty_cohort_select on public.submissions
  for select to authenticated
  using (
    exists(
      select 1 from public.assignments a
      where a.id = submissions.assignment_id
        and a.cohort_id in (select public.faculty_cohort_ids())
    )
  );

drop policy if exists submissions_admin_all on public.submissions;
create policy submissions_admin_all on public.submissions
  for all to authenticated
  using (public.current_profile_is_admin())
  with check (public.current_profile_is_admin());

-- ---------- peer_reviews ----------
drop policy if exists peer_reviews_faculty_cohort_rw on public.peer_reviews;
create policy peer_reviews_faculty_cohort_select on public.peer_reviews
  for select to authenticated
  using (
    exists(
      select 1
      from public.submissions s
      join public.assignments a on a.id = s.assignment_id
      where s.id = peer_reviews.submission_id
        and a.cohort_id in (select public.faculty_cohort_ids())
    )
  );

drop policy if exists peer_reviews_admin_all on public.peer_reviews;
create policy peer_reviews_admin_all on public.peer_reviews
  for all to authenticated
  using (public.current_profile_is_admin())
  with check (public.current_profile_is_admin());

-- ---------- attendance ----------
drop policy if exists attendance_faculty_cohort_rw on public.attendance;
create policy attendance_faculty_cohort_select on public.attendance
  for select to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()));

drop policy if exists attendance_admin_all on public.attendance;
create policy attendance_admin_all on public.attendance
  for all to authenticated
  using (public.current_profile_is_admin())
  with check (public.current_profile_is_admin());

-- ---------- lab_progress ----------
drop policy if exists lab_progress_faculty_cohort_rw on public.lab_progress;
create policy lab_progress_faculty_cohort_select on public.lab_progress
  for select to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()));

drop policy if exists lab_progress_admin_all on public.lab_progress;
create policy lab_progress_admin_all on public.lab_progress
  for all to authenticated
  using (public.current_profile_is_admin())
  with check (public.current_profile_is_admin());

-- stuck_queue: keep faculty read/write for in-room triage (existing policy name unchanged)

-- ---------- registrations: unenroll is trainer-only ----------
drop policy if exists registrations_delete_faculty on public.registrations;

-- ---------- pod roster / pod renames: trainer-only (was faculty-managed) ----------
drop policy if exists pod_members_faculty_insert on public.pod_members;
drop policy if exists pod_members_faculty_update on public.pod_members;
drop policy if exists pod_members_faculty_delete on public.pod_members;
drop policy if exists cohort_pods_faculty_update on public.cohort_pods;

-- ---------- rubric templates: trainer-only writes ----------
drop policy if exists "rubric_templates_insert" on public.rubric_templates;
create policy "rubric_templates_insert"
  on public.rubric_templates
  for insert
  with check (public.current_profile_is_admin());

drop policy if exists "rubric_templates_update" on public.rubric_templates;
create policy "rubric_templates_update"
  on public.rubric_templates
  for update
  using (public.current_profile_is_admin())
  with check (public.current_profile_is_admin());

drop policy if exists "rubric_templates_delete" on public.rubric_templates;
create policy "rubric_templates_delete"
  on public.rubric_templates
  for delete
  using (public.current_profile_is_admin());

-- ---------- Pod faculty RPC: trainer-only (pod assignment / handoff) ----------
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
  v_ins int;
begin
  select cohort_id into v_cohort_id from public.cohort_pods where id = p_pod_id;
  if v_cohort_id is null then raise exception 'pod not found'; end if;

  select coalesce(is_admin, false) into v_is_admin from public.profiles where id = auth.uid();

  if not coalesce(v_is_admin, false) then
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
    get diagnostics v_ins = row_count;
    if v_ins = 0 then
      raise exception 'This faculty member is already on this pod.';
    end if;

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
