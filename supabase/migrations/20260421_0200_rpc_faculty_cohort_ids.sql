-- 20260421_0200_rpc_faculty_cohort_ids.sql
-- Helper RPC that returns cohort ids for which the caller is faculty.

create or replace function public.faculty_cohort_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select cohort_id from public.cohort_faculty where user_id = auth.uid();
$$;

grant execute on function public.faculty_cohort_ids() to authenticated;
