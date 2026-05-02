-- =============================================================================
-- 0069_cron_auto_close_polls.sql
--
-- Schedules a once-per-minute pg_cron job that POSTs to the auto-close-polls
-- edge function. The function flips `polls.closed_at = now()` for any poll
-- whose `closes_at` deadline has passed.
--
-- Mirrors the pattern in 0011_cron_daily_digest.sql: gracefully no-ops when
-- pg_net / pg_cron aren't installed (e.g. CI's plain Postgres).
-- =============================================================================

create schema if not exists extensions;

do $do$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net')
     and exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    execute 'create extension if not exists pg_net with schema extensions';
    execute 'create extension if not exists pg_cron';

    if exists (select 1 from cron.job where jobname = 'auto-close-polls') then
      perform cron.unschedule('auto-close-polls');
    end if;

    perform cron.schedule(
      'auto-close-polls',
      '* * * * *',
      $cmd$
      select net.http_post(
        url := concat(
          current_setting('app.settings.supabase_url', true),
          '/functions/v1/auto-close-polls'
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'X-Shared-Secret', coalesce(
            (select decrypted_secret from vault.decrypted_secrets where name = 'edge_function_shared_secret' limit 1),
            ''
          )
        ),
        body := '{}'::jsonb
      );
      $cmd$
    );
  else
    raise notice '0069_cron_auto_close_polls: skipped (pg_net/pg_cron not available on this server)';
  end if;
end
$do$;
