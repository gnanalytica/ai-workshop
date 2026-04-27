-- =============================================================================
-- 0030_help_desk_pod_scoped_triage.sql
-- Faculty with support.triage may only triage help-desk tickets opened by
-- students in pods where they appear in pod_faculty. Global staff
-- (admin / trainer / tech_support) keep cohort-wide triage.
-- Also hardens rpc_claim_help_desk_ticket (SECURITY DEFINER) to match.
-- =============================================================================

create or replace function public.help_desk_ticket_triagable(p_cohort uuid, p_ticket_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select
    has_staff_role('admin')
    or has_staff_role('trainer')
    or has_staff_role('tech_support')
    or exists (
      select 1
      from pod_members pm
      join pod_faculty pf on pf.pod_id = pm.pod_id and pf.faculty_user_id = auth.uid()
      join pods p on p.id = pm.pod_id and p.cohort_id = p_cohort
      where pm.student_user_id = p_ticket_user_id
    );
$$;

revoke all on function public.help_desk_ticket_triagable(uuid, uuid) from public;
grant execute on function public.help_desk_ticket_triagable(uuid, uuid) to authenticated;

drop policy if exists hdq_triage on help_desk_queue;

create policy hdq_triage on help_desk_queue
  for all to authenticated
  using (
    has_cap('support.triage', cohort_id)
    and (kind <> 'tech'::help_desk_kind or has_cap('support.tech_only'))
    and public.help_desk_ticket_triagable(cohort_id, user_id)
  )
  with check (
    has_cap('support.triage', cohort_id)
    and (kind <> 'tech'::help_desk_kind or has_cap('support.tech_only'))
    and public.help_desk_ticket_triagable(cohort_id, user_id)
  );

create or replace function public.rpc_claim_help_desk_ticket(p_id uuid)
returns help_desk_queue
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  row      help_desk_queue;
  v_cohort uuid;
  v_kind   help_desk_kind;
  v_student uuid;
begin
  select cohort_id, kind, user_id into v_cohort, v_kind, v_student
  from help_desk_queue where id = p_id;
  if v_cohort is null then raise exception 'not found'; end if;

  if not (has_cap('support.triage', v_cohort)
          and (v_kind <> 'tech'::help_desk_kind or has_cap('support.tech_only'))) then
    raise exception 'permission denied: support.triage';
  end if;

  if not (
    has_staff_role('admin')
    or has_staff_role('trainer')
    or has_staff_role('tech_support')
    or exists (
      select 1
      from pod_members pm
      join pod_faculty pf on pf.pod_id = pm.pod_id and pf.faculty_user_id = auth.uid()
      join pods p on p.id = pm.pod_id and p.cohort_id = v_cohort
      where pm.student_user_id = v_student
    )
  ) then
    raise exception 'permission denied: triage limited to your pods (or cohort staff)';
  end if;

  update help_desk_queue
     set claimed_by = auth.uid(), status = 'helping', updated_at = now()
   where id = p_id and status = 'open'
  returning * into row;

  return row;
end
$$;

revoke all on function public.rpc_claim_help_desk_ticket(uuid) from public;
grant execute on function public.rpc_claim_help_desk_ticket(uuid) to authenticated;
