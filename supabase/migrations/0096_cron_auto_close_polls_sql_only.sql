-- 0096_cron_auto_close_polls_sql_only.sql
--
-- The original 0069 cron POSTed to an edge function (auto-close-polls). In
-- practice this turned out fragile: the cron was disabled at some point
-- (active=false in cron.job), and even when active it relied on a deployed
-- edge function + shared secret + pg_net round-trip. We had 22 polls
-- stranded past their closes_at deadline as of today.
--
-- This migration replaces it with a pure-SQL pg_cron job that runs the same
-- UPDATE directly. No edge function, no shared secret, no http_post — one
-- statement per minute against an indexed `closes_at` predicate. Closure
-- is the only thing the edge function was doing that the DB needs; client
-- broadcasts will still get triggered by RLS-visible row updates via
-- Supabase Realtime.
--
-- Idempotent: drops any existing auto-close-polls job first.
-- =============================================================================

do $do$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    execute 'create extension if not exists pg_cron';

    if exists (select 1 from cron.job where jobname = 'auto-close-polls') then
      perform cron.unschedule('auto-close-polls');
    end if;

    perform cron.schedule(
      'auto-close-polls',
      '* * * * *',
      $cmd$
      update public.polls
         set closed_at = now()
       where closed_at is null
         and closes_at is not null
         and closes_at < now();
      $cmd$
    );
  else
    raise notice '0096_cron_auto_close_polls_sql_only: skipped (pg_cron unavailable)';
  end if;
end
$do$;
