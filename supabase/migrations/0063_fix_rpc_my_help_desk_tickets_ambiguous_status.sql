-- 0063_fix_rpc_my_help_desk_tickets_ambiguous_status.sql
--
-- rpc_my_help_desk_tickets returned 400 in production with
--   ERROR: column reference "status" is ambiguous
-- Cause: the function's OUT params (status, kind, ...) shadow the
-- help_desk_queue columns referenced unqualified inside the
-- `open_cnt` CTE. Qualify the column refs so the OUT params can't win.

create or replace function public.rpc_my_help_desk_tickets(p_cohort_id uuid)
returns table (
  id uuid,
  kind help_desk_kind,
  status help_desk_status,
  message text,
  created_at timestamptz,
  updated_at timestamptz,
  escalated_at timestamptz,
  queue_position int,
  open_in_cohort int
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not is_enrolled_in(p_cohort_id) then
    raise exception 'not enrolled' using errcode = '42501';
  end if;

  return query
  with open_ranked as (
    select
      s.id,
      row_number() over (order by s.created_at asc, s.id asc) as pos
    from help_desk_queue s
    where s.cohort_id = p_cohort_id
      and s.status = 'open'
  ),
  open_cnt as (
    select count(*)::int as c
    from help_desk_queue h
    where h.cohort_id = p_cohort_id
      and h.status = 'open'
  )
  select
    m.id,
    m.kind,
    m.status,
    m.message,
    m.created_at,
    m.updated_at,
    m.escalated_at,
    (case when m.status = 'open' then o.pos else null end)::int,
    (select c from open_cnt)
  from help_desk_queue m
  left join open_ranked o on o.id = m.id
  where m.cohort_id = p_cohort_id
    and m.user_id = auth.uid()
  order by m.created_at desc;
end;
$$;

revoke all on function public.rpc_my_help_desk_tickets(uuid) from public;
grant execute on function public.rpc_my_help_desk_tickets(uuid) to authenticated;
