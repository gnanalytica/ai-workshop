-- 0079_help_desk_my_tickets_include_resolution.sql
--
-- Surface the staff/admin-authored `resolution` text back to the student
-- who filed the ticket. `rpc_my_help_desk_tickets` previously omitted the
-- column, so the help-desk page rendered nothing once a ticket was
-- resolved. Re-create the function with `resolution` in the RETURNS
-- TABLE and SELECT list; behavior is otherwise identical to 0063.

drop function if exists rpc_my_help_desk_tickets(uuid);

create or replace function public.rpc_my_help_desk_tickets(p_cohort_id uuid)
returns table (
  id uuid,
  kind help_desk_kind,
  status help_desk_status,
  message text,
  resolution text,
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
    m.resolution,
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
