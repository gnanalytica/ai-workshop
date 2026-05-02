-- =============================================================================
-- 0068_polls_v2_timer_results.sql
--
-- Adds a deadline + per-cohort live-poll lookup + per-option results count for
-- the dynamic poll experience: admins create with a duration, students see a
-- popup until they vote or the timer expires, and admins see a per-option
-- vote breakdown for graphing.
--
-- Conventions: drop-if-exists everywhere, security_invoker not used since we
-- need definer to surface vote counts to admins/faculty without exposing
-- per-row votes. RLS on poll_votes (pv_self) stays intact — these RPCs
-- aggregate behind security_definer with explicit cap checks.
-- =============================================================================

begin;

-- ----- 1. closes_at column ---------------------------------------------------
alter table polls add column if not exists closes_at timestamptz;

-- An open poll is one that has no closed_at AND (no closes_at OR closes_at
-- is in the future). The UI treats both as "active".
create index if not exists polls_cohort_active_idx
  on polls (cohort_id, closes_at)
  where closed_at is null;

-- ----- 2. rpc_active_poll(cohort) -- single most-recent active poll ---------
-- Returns at most one row — the freshest open poll for the cohort that the
-- caller can read. Used by the student-facing popup poller. Joins my vote
-- so the popup can dismiss itself once the user has voted.
drop function if exists public.rpc_active_poll(uuid);
create function public.rpc_active_poll(p_cohort uuid)
returns table (
  id          uuid,
  question    text,
  options     jsonb,
  opened_at   timestamptz,
  closes_at   timestamptz,
  my_choice   text
)
language sql stable security definer
set search_path = public, auth
as $$
  select
    p.id, p.question, p.options, p.opened_at, p.closes_at,
    pv.choice as my_choice
  from polls p
  left join poll_votes pv
    on pv.poll_id = p.id and pv.user_id = auth.uid()
  where p.cohort_id = p_cohort
    and p.closed_at is null
    and (p.closes_at is null or p.closes_at > now())
    and (
      is_enrolled_in(p_cohort)
      or has_cap('schedule.read', p_cohort)
    )
  order by p.opened_at desc
  limit 1
$$;

grant execute on function public.rpc_active_poll(uuid) to authenticated;

-- ----- 3. rpc_poll_results(poll) -- per-option vote counts -------------------
-- Caller must be able to read the poll (enrolled student or content-read cap
-- on the parent cohort). Returns one row per option with its label and the
-- vote count, suitable for a horizontal bar chart.
drop function if exists public.rpc_poll_results(uuid);
create function public.rpc_poll_results(p_poll uuid)
returns table (
  choice  text,
  label   text,
  votes   bigint
)
language plpgsql stable security definer
set search_path = public, auth
as $$
declare
  v_cohort uuid;
begin
  select cohort_id into v_cohort from polls where id = p_poll;
  if v_cohort is null then
    return;
  end if;
  if not (is_enrolled_in(v_cohort) or has_cap('schedule.read', v_cohort)) then
    return;
  end if;

  return query
  with opts as (
    select
      coalesce(o->>'id', o->>'value', o::text) as choice,
      coalesce(o->>'label', o->>'text', o::text) as label
    from polls p, jsonb_array_elements(p.options) o
    where p.id = p_poll
  ),
  tally as (
    select pv.choice, count(*)::bigint as votes
      from poll_votes pv
     where pv.poll_id = p_poll
     group by pv.choice
  )
  select o.choice, o.label, coalesce(t.votes, 0)::bigint
    from opts o
    left join tally t on t.choice = o.choice
    order by o.choice;
end
$$;

grant execute on function public.rpc_poll_results(uuid) to authenticated;

commit;
