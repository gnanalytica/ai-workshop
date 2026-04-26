-- Daily-digest cron: invokes the send-daily-digest edge function at 14:00 UTC.
-- Requires:
--   * pg_net extension (created here)
--   * Vault secret "edge_function_shared_secret" matching the function env.
--   * GUC `app.settings.supabase_url` set on the project (Supabase auto-provides it).

create extension if not exists pg_net with schema extensions;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'daily-digest') then
    perform cron.unschedule('daily-digest');
  end if;
end $$;

select cron.schedule(
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
