-- =============================================================================
-- 0086_polls_drafts.sql
--
-- Allow polls to exist as DRAFTS (pre-built, not yet shown to students).
-- A draft is a polls row with opened_at IS NULL. Admin pre-creates drafts
-- ahead of class, then "launches" via the launchPoll server action which
-- sets opened_at = now() (and closes_at = now() + duration if a timer).
--
-- Two changes:
--   1) drop NOT NULL on polls.opened_at so drafts can be saved without
--      flipping to live.
--   2) replace rpc_active_poll so drafts (opened_at IS NULL) are never
--      returned. Without this, the existing WHERE branch
--      `closed_at is null and (closes_at is null or closes_at > now)`
--      would match drafts and surface them to students. Body is otherwise
--      unchanged from 0073.
-- =============================================================================

alter table public.polls
  alter column opened_at drop not null;

-- ---- rpc_active_poll: filter out drafts ----
drop function if exists public.rpc_active_poll(uuid);

create function public.rpc_active_poll(p_cohort uuid)
returns table (
  id          uuid,
  question    text,
  options     jsonb,
  opened_at   timestamptz,
  closes_at   timestamptz,
  closed_at   timestamptz,
  my_choice   text,
  phase       text,
  results     jsonb,
  kind        text
)
language plpgsql stable security definer
set search_path = public, auth
as $$
declare
  v_now timestamptz := now();
begin
  if not (is_enrolled_in(p_cohort) or has_cap('schedule.read', p_cohort)) then
    return;
  end if;

  return query
  with picked as (
    select p.*,
           pv.choice as my_choice,
           case
             when p.closed_at is null
                  and (p.closes_at is null or p.closes_at > v_now)
               then 'open'
             when (p.closed_at is not null or p.closes_at <= v_now)
                  and pv.user_id is not null
               then 'results'
             else null
           end as phase
      from polls p
      left join poll_votes pv
        on pv.poll_id = p.id and pv.user_id = auth.uid()
     where p.cohort_id = p_cohort
       -- 0086: drafts (opened_at IS NULL) never surface as active.
       and p.opened_at is not null
       and p.opened_at <= v_now
       and (
         (p.closed_at is null and (p.closes_at is null or p.closes_at > v_now))
         or (
           pv.user_id is not null
           and (
             (p.closed_at is not null and p.closed_at > v_now - interval '5 minutes')
             or (p.closes_at is not null and p.closes_at > v_now - interval '5 minutes')
           )
         )
       )
       and (
         (p.closed_at is null and (p.closes_at is null or p.closes_at > v_now))
         or pv.user_id is not null
       )
  )
  select
    pk.id,
    pk.question,
    pk.options,
    pk.opened_at,
    pk.closes_at,
    pk.closed_at,
    pk.my_choice,
    pk.phase,
    case
      when pk.phase = 'results' then (
        with opts as (
          select
            coalesce(o->>'id', o->>'value', o::text) as choice,
            coalesce(o->>'label', o->>'text', o::text) as label
          from jsonb_array_elements(pk.options) o
        ),
        tally as (
          select pv.choice, count(*)::bigint as votes
            from poll_votes pv
           where pv.poll_id = pk.id
           group by pv.choice
        )
        select jsonb_agg(
          jsonb_build_object('choice', o.choice, 'label', o.label, 'votes', coalesce(t.votes, 0))
          order by o.choice
        )
        from opts o
        left join tally t on t.choice = o.choice
      )
      else null
    end as results,
    pk.kind
  from picked pk
  where pk.phase is not null
  order by
    case when pk.phase = 'open' then 0 else 1 end,
    coalesce(pk.opened_at, '-infinity'::timestamptz) desc
  limit 1;
end
$$;

grant execute on function public.rpc_active_poll(uuid) to authenticated;
