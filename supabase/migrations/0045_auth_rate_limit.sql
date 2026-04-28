-- =============================================================================
-- 0045_auth_rate_limit.sql
-- Lightweight Postgres-backed rate limiter for unauthenticated auth actions
-- (sign-up, magic-link request, invite-code preview). Caller passes a bucket
-- key (e.g. "signup:1.2.3.4" or "invite_preview:1.2.3.4"), a window in
-- seconds, and a max-hits-per-window. The function inserts/updates the row
-- atomically and returns true if the request is allowed.
--
-- Storage is intentionally trivial — one row per bucket, refreshed every
-- window. Auto-pruning of stale rows happens lazily via DELETE on bucket
-- access, plus an opportunistic sweep when the table gets too big.
-- =============================================================================

create table if not exists auth_rate_limit (
  bucket       text primary key,
  window_start timestamptz not null,
  hits         int not null default 0
);

-- Index so the opportunistic sweep is cheap.
create index if not exists auth_rate_limit_window_start_idx
  on auth_rate_limit (window_start);

alter table auth_rate_limit enable row level security;
-- No policies: only callable through the SECURITY DEFINER RPC below.

create or replace function rpc_auth_rate_limit_check(
  p_bucket   text,
  p_window_s int,
  p_max      int
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_now    timestamptz := now();
  v_cutoff timestamptz := v_now - make_interval(secs => p_window_s);
  v_hits   int;
begin
  -- Reset stale buckets and bump.
  insert into auth_rate_limit(bucket, window_start, hits)
    values (p_bucket, v_now, 1)
  on conflict (bucket) do update
     set hits         = case when auth_rate_limit.window_start < v_cutoff then 1
                              else auth_rate_limit.hits + 1 end,
         window_start = case when auth_rate_limit.window_start < v_cutoff then v_now
                              else auth_rate_limit.window_start end
  returning hits into v_hits;

  -- Opportunistic sweep: 1 in 50 calls deletes stale rows.
  if (random() < 0.02) then
    delete from auth_rate_limit where window_start < v_cutoff;
  end if;

  return v_hits <= p_max;
end
$$;

grant execute on function rpc_auth_rate_limit_check(text, int, int) to anon, authenticated;
