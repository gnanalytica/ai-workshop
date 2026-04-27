-- Daily-digest cron: invokes send-daily-digest (Supabase only).
-- Requires pg_net, pg_cron, vault, and project GUC app.settings.supabase_url.
-- Skipped on plain Postgres (e.g. GitHub Actions) where those extensions are absent.

create schema if not exists extensions;

do $do$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net')
     and exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    execute 'create extension if not exists pg_net with schema extensions';
    execute 'create extension if not exists pg_cron';

    if exists (select 1 from cron.job where jobname = 'daily-digest') then
      perform cron.unschedule('daily-digest');
    end if;

    perform cron.schedule(
      'daily-digest',
      '0 14 * * *',
      $cmd$
      select net.http_post(
        url := concat(
          current_setting('app.settings.supabase_url', true),
          '/functions/v1/send-daily-digest'
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
    raise notice '0011_cron_daily_digest: skipped (pg_net/pg_cron not available on this server)';
  end if;
end
$do$;
