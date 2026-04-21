-- 20260421_0210_rpc_my_pod.sql
-- RPC returning the caller's pod (if any) for a given cohort, along with
-- faculty metadata. avatar_url intentionally omitted (column may not exist).

create or replace function public.my_pod(p_cohort uuid)
returns table (
  pod_id uuid,
  pod_name text,
  mentor_note text,
  faculty jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  with m as (
    select pm.pod_id
    from public.pod_members pm
    where pm.student_user_id = auth.uid() and pm.cohort_id = p_cohort
    limit 1
  ),
  f as (
    select pf.pod_id,
           jsonb_agg(
             jsonb_build_object(
               'user_id', pf.faculty_user_id,
               'is_primary', pf.is_primary,
               'contact_note', pf.contact_note,
               'full_name', p.full_name,
               'college', p.college
             )
             order by pf.is_primary desc, p.full_name
           ) as faculty
    from public.pod_faculty pf
    join public.profiles p on p.id = pf.faculty_user_id
    where pf.pod_id in (select pod_id from m)
    group by pf.pod_id
  )
  select cp.id, cp.name, cp.mentor_note, coalesce(f.faculty, '[]'::jsonb)
  from public.cohort_pods cp
  join m on m.pod_id = cp.id
  left join f on f.pod_id = cp.id;
$$;

grant execute on function public.my_pod(uuid) to authenticated;
