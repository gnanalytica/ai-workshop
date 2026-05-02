-- =============================================================================
-- 0073_pulse_and_banners.sql
--
-- Two new live interactions:
--   1) "Pulse" — a poll variant with fixed emoji options ("got it / fuzzy /
--      lost"). Stored in the same polls table with a new `kind` column so
--      we don't duplicate cron / RPC infrastructure; the UI renders the
--      lightweight pulse layout when kind='pulse'.
--   2) "Banner" — a per-cohort top-of-page strip with optional countdown.
--      Used for shared timers ("5-min break") and ephemeral announcements.
--      Anyone in the cohort sees it; only content.write can create.
-- =============================================================================

begin;

-- ---------- 1. polls.kind ----------------------------------------------------
alter table polls
  add column if not exists kind text not null default 'poll'
    check (kind in ('poll', 'pulse'));

-- Existing rpc_active_poll already returns the freshest active poll (any
-- kind). Extend it to surface `kind` so the popup can render correctly.
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

-- ---------- 2. cohort_banners table ------------------------------------------
create table if not exists cohort_banners (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references cohorts (id) on delete cascade,
  kind        text not null check (kind in ('timer', 'announcement')),
  label       text not null,
  ends_at     timestamptz,
  created_by  uuid references profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  dismissed_at timestamptz
);

create index if not exists cohort_banners_cohort_active_idx
  on cohort_banners (cohort_id, ends_at)
  where dismissed_at is null;

alter table cohort_banners enable row level security;

drop policy if exists cb_read on cohort_banners;
create policy cb_read on cohort_banners
  for select using (
    is_enrolled_in(cohort_id) or has_cap('schedule.read', cohort_id)
  );

drop policy if exists cb_write on cohort_banners;
create policy cb_write on cohort_banners
  for all using (has_cap('content.write', cohort_id))
  with check (has_cap('content.write', cohort_id));

-- ---------- 3. rpc_active_banner(cohort) -- single most-recent active --------
-- Returns at most one row — the freshest non-dismissed banner whose
-- countdown (if any) hasn't expired. Used by the per-cohort top banner.
drop function if exists public.rpc_active_banner(uuid);
create function public.rpc_active_banner(p_cohort uuid)
returns table (
  id        uuid,
  kind      text,
  label     text,
  ends_at   timestamptz,
  created_at timestamptz
)
language sql stable security definer
set search_path = public, auth
as $$
  select b.id, b.kind, b.label, b.ends_at, b.created_at
    from cohort_banners b
   where b.cohort_id = p_cohort
     and b.dismissed_at is null
     and (b.ends_at is null or b.ends_at > now())
     and (
       is_enrolled_in(p_cohort)
       or has_cap('schedule.read', p_cohort)
     )
   order by b.created_at desc
   limit 1
$$;

grant execute on function public.rpc_active_banner(uuid) to authenticated;

commit;
