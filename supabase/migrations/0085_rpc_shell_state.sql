-- =============================================================================
-- 0085_rpc_shell_state.sql
--
-- Combine three hot AppShell-time RPCs into one round-trip:
--   - auth_caps(p_cohort)           → text[]
--   - rpc_active_banner(p_cohort)   → row
--   - rpc_active_poll(p_cohort)     → row
--
-- Every authed page render fired all three (plus auth_persona) in parallel.
-- On free-tier shared compute that's 4 transaction starts + 4 PostgREST
-- round-trips per page; during a class-start burst (128 students opening
-- /day/[n] inside ~10s) it adds up. This RPC composes the existing
-- SECURITY DEFINER helpers and returns one jsonb so the shell does one
-- combined round-trip plus auth_persona instead of four parallel ones.
--
-- auth_persona stays out of this RPC because getTruePersona/getEffectivePersona
-- are cache()-wrapped helpers used by many other server components; we want
-- one canonical persona source per render rather than two.
--
-- security_invoker: each inner call is already SECURITY DEFINER and resolves
-- auth.uid() correctly from the caller's context. No new privilege surface.
-- =============================================================================

create or replace function public.rpc_shell_state(p_cohort uuid)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public, pg_temp
as $$
declare
  v_caps text[];
  v_banner jsonb;
  v_poll jsonb;
begin
  select coalesce(public.auth_caps(p_cohort), array[]::text[]) into v_caps;

  if p_cohort is not null then
    select to_jsonb(b) into v_banner
    from public.rpc_active_banner(p_cohort) as b
    limit 1;

    select to_jsonb(p) into v_poll
    from public.rpc_active_poll(p_cohort) as p
    limit 1;
  end if;

  return jsonb_build_object(
    'caps', v_caps,
    'banner', v_banner,
    'poll', v_poll
  );
end;
$$;

revoke all on function public.rpc_shell_state(uuid) from public;
grant execute on function public.rpc_shell_state(uuid) to authenticated;
