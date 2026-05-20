-- Rename `submissions` -> `assignment_submissions`.
-- The frontend (lib/queries/*, lib/actions/submissions.ts) already references
-- the new name; this migration aligns the database.
--
-- Postgres stores views and RLS policies as OID-bound expression trees, so
-- they survive ALTER TABLE ... RENAME transparently. PL/pgSQL function
-- bodies resolve table names at execution time and must be recreated.

alter table public.submissions rename to assignment_submissions;

-- rename indexes + constraints for naming consistency
alter index public.submissions_pkey rename to assignment_submissions_pkey;
alter index public.submissions_assignment_id_user_id_key rename to assignment_submissions_assignment_id_user_id_key;
alter index public.submissions_user_idx rename to assignment_submissions_user_idx;
alter index public.submissions_ai_graded_idx rename to assignment_submissions_ai_graded_idx;
alter index public.submissions_status_idx rename to assignment_submissions_status_idx;
alter index public.submissions_graded_by_idx rename to assignment_submissions_graded_by_idx;
alter index public.submissions_human_reviewer_id_idx rename to assignment_submissions_human_reviewer_id_idx;

alter table public.assignment_submissions rename constraint submissions_assignment_id_fkey to assignment_submissions_assignment_id_fkey;
alter table public.assignment_submissions rename constraint submissions_graded_by_fkey to assignment_submissions_graded_by_fkey;
alter table public.assignment_submissions rename constraint submissions_human_reviewer_id_fkey to assignment_submissions_human_reviewer_id_fkey;
alter table public.assignment_submissions rename constraint submissions_user_id_fkey to assignment_submissions_user_id_fkey;

-- Recreate functions that referenced the old name (PL/pgSQL late-binds).
create or replace function public.rpc_dashboard_kpis(p_cohort uuid, p_user uuid default null)
returns table(days_complete int, attendance_count int, pending_assignments int)
language plpgsql stable security definer
set search_path to 'public','auth'
as $$
declare
  v_caller   uuid := auth.uid();
  v_target   uuid;
  v_is_admin boolean;
begin
  if v_caller is null then return; end if;
  v_is_admin := has_staff_role('admin');
  if p_user is not null and p_user <> v_caller and not v_is_admin then return; end if;
  v_target := coalesce(p_user, v_caller);
  if not (
    v_is_admin
    or is_enrolled_in(p_cohort)
    or exists (select 1 from cohort_faculty where cohort_id = p_cohort and user_id = v_caller)
  ) then return; end if;

  return query
    select
      (select count(distinct lp.day_number)::int
         from lab_progress lp
        where lp.cohort_id = p_cohort and lp.user_id = v_target and lp.status = 'done') as days_complete,
      (select count(*)::int
         from attendance a
        where a.cohort_id = p_cohort and a.user_id = v_target and a.status = 'present') as attendance_count,
      (select count(*)::int
         from assignment_submissions s
         join assignments a on a.id = s.assignment_id
        where a.cohort_id = p_cohort and s.user_id = v_target and s.status = 'draft') as pending_assignments;
end
$$;

create or replace function public.set_submission_faculty_note(p_submission_id uuid, p_note text)
returns void
language plpgsql security definer
set search_path to 'public','auth'
as $$
declare
  v_cohort uuid;
begin
  select a.cohort_id into v_cohort
    from assignment_submissions s
    join assignments a on a.id = s.assignment_id
   where s.id = p_submission_id;

  if v_cohort is null then
    raise exception 'submission not found' using errcode = 'P0002';
  end if;

  if not has_cap('grading.read', v_cohort) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update assignment_submissions
     set faculty_notes_md = nullif(btrim(p_note), '')
   where id = p_submission_id;
end;
$$;
