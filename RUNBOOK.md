# RUNBOOK

Operational procedures for the AI Workshop SaaS LMS. Pair with `README.md` (orientation) and `CLAUDE.md` (architecture / RBAC).

## Initial setup

1. **Create the Supabase project**
   - New project in the Supabase dashboard. Copy the project URL, anon key, and service-role key.
   - Enable email auth; set the site URL to your Vercel domain (and `http://localhost:3000` for dev).

2. **Configure env vars**
   - Locally: `cp web/.env.example web/.env.local` and fill the variables from the README env table.
   - Vercel: same variables on Production (and Preview if used). `SUPABASE_SERVICE_ROLE_KEY` and `EDGE_FUNCTION_SHARED_SECRET` must be marked secret.

3. **Apply migrations 0001–0009 in order**
   ```bash
   export DB_URL='postgres://postgres:<pw>@db.<ref>.supabase.co:5432/postgres'
   for f in supabase/migrations/000{1..9}_*.sql; do
     echo "== $f =="
     psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$f"
   done
   ```
   Migrations are: `0001_init_schema`, `0002_helpers`, `0003_rls`, `0004_rpcs`, `0005_triggers`, `0006_seed_curriculum`, `0007_views`, `0008_extensions_schema`, `0009_quiz_scoring`.

4. **Seed staging data** (optional, only on non-prod)
   ```bash
   psql "$DB_URL" -f supabase/seed/cohort.sql
   ```

5. **Verify with the RBAC spec**
   ```bash
   psql "$DB_URL" -f supabase/tests/rbac.sql 2>&1 | tee /tmp/rbac.log
   ! grep -q '^FAIL:' /tmp/rbac.log
   ```
   Any `FAIL:` is a blocker — do not proceed until clean.

6. **Deploy edge functions**
   ```bash
   supabase functions deploy send-daily-digest --project-ref <ref>
   supabase functions deploy send-registration-email --project-ref <ref>
   supabase secrets set RESEND_API_KEY=... EDGE_FUNCTION_SHARED_SECRET=... --project-ref <ref>
   ```

## Day-2 ops

### Deploying schema changes

- Add a new numbered migration: `supabase/migrations/00NN_<description>.sql`. Never edit applied files.
- Policies use `drop policy if exists` + `create policy` (Postgres has no `CREATE POLICY IF NOT EXISTS`).
- Apply to staging first (`psql "$STAGING_DB_URL" -f …`), re-run `supabase/tests/rbac.sql`, then apply to prod in the same transaction-bracketed psql call.
- After touching `auth_caps`, `has_cap`, `can_grade`, or any policy: re-run the RBAC spec on every environment.

### Deploying edge functions

```bash
supabase functions deploy <name> --project-ref <ref>
supabase functions logs <name> --project-ref <ref>            # tail
```

### Rotating the service role key

1. Supabase dashboard → Settings → API → "Reset service role key".
2. Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel (Production + Preview) and any CI secret store.
3. Re-deploy the web app so the server runtime picks up the new value.
4. Update `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...` for any edge function that uses `_shared/` admin client.
5. Confirm: `pnpm build` locally with the new key, hit a server action that writes (e.g. admin announcement), and check logs for 401s.

### Viewing logs

- **Web**: Vercel → Project → Logs (filter by route). `console.error` shows up here.
- **Postgres**: Supabase dashboard → Logs → Postgres / API / Auth. RLS denials surface as `permission denied for table …`.
- **Edge functions**: `supabase functions logs <name> --project-ref <ref>` or the dashboard.

### Restoring from backup

- Supabase point-in-time recovery: dashboard → Database → Backups → "Restore". Pick a timestamp; restore creates a new database — repoint env vars on Vercel and edge functions.
- For a single-table mistake, prefer a targeted restore via `pg_dump` / `pg_restore` from the daily backup against a scratch DB, then `INSERT … SELECT` what you need.

## Cron schedules

`send-daily-digest` is expected to run once per day in the cohort's timezone (target: 06:00 local). Two ways to schedule:

- **`pg_cron`** (preferred — already enabled by `0008_extensions_schema.sql`):
  ```sql
  select cron.schedule(
    'daily-digest',
    '0 0 * * *',  -- 00:00 UTC; adjust per cohort tz
    $$ select net.http_post(
         url:='https://<ref>.functions.supabase.co/send-daily-digest',
         headers:='{"Authorization":"Bearer ' || current_setting('app.edge_secret') || '"}'::jsonb
       ); $$
  );
  ```
- **Supabase scheduled functions**: dashboard → Functions → `send-daily-digest` → Schedules → add a cron expression. Pass the shared secret via the `Authorization` header.

`send-registration-email` is event-driven (called from a trigger / server action on registration confirmation); no cron.

## Incident response

### RLS denial debugging

1. Reproduce as the affected user; capture timestamp + cohort id.
2. Inspect `rbac_events` (audit log written by the RBAC helpers):
   ```sql
   select * from rbac_events
   where actor = '<auth.uid>' and at > now() - interval '15 min'
   order by at desc;
   ```
3. Resolve their capabilities directly:
   ```sql
   select auth_caps('<cohort-id>'::uuid)
   from auth.users where id = '<auth.uid>';
   ```
4. If a capability is missing, check the source: `profiles.staff_roles`, `cohort_faculty.college_role`, `pod_members`, `registrations.status`.
5. If the policy is wrong, fix it in a new migration and re-run `supabase/tests/rbac.sql`.

### Reset cohort data (staging only)

```sql
begin;
delete from submissions where assignment_id in (select id from assignments where cohort_id = '<id>');
delete from lab_progress where cohort_id = '<id>';
delete from pod_members where cohort_id = '<id>';
delete from pod_faculty where pod_id in (select id from pods where cohort_id = '<id>');
delete from pods where cohort_id = '<id>';
delete from registrations where cohort_id = '<id>';
commit;
```
Then re-seed: `psql "$DB_URL" -f supabase/seed/cohort.sql`.

### Rebuild profiles from `auth.users`

If `profiles` drifts from `auth.users` (rare; trigger failed):
```sql
insert into profiles (id, email, full_name)
select u.id,
       u.email,
       coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1))
from auth.users u
left join profiles p on p.id = u.id
where p.id is null;
```
Verify with `select count(*) from auth.users` vs `select count(*) from profiles`.

## Cutover steps

1. **DNS**: add the apex / `app.` record per Vercel's instructions; wait for SSL provisioning.
2. **Vercel domain**: assign the production domain; mark the previous preview as not-production.
3. **Supabase auth**: update Site URL + Redirect URLs to the production domain. Keep the staging URL only if still needed.
4. **Env vars**: confirm `NEXT_PUBLIC_SITE_URL` and any callback URLs match the new domain.
5. **Edge function secrets**: re-set `EDGE_FUNCTION_SHARED_SECRET` and `RESEND_API_KEY` against the prod project.
6. **Smoke checklist** (do all six):
   - Magic-link sign-in completes and lands on `/dashboard`.
   - A student sees today's day card on `/dashboard` and `/day/[n]` renders.
   - A faculty member's `/faculty/today` lists their pod's submissions.
   - An admin can write an announcement on `/admin` and a student sees it.
   - `send-daily-digest` runs (manually invoke once) and Resend shows a delivered email.
   - `psql "$PROD_DB_URL" -f supabase/tests/rbac.sql` reports zero `FAIL:` lines.
