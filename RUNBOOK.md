# RUNBOOK

Operational reference for the AI Workshop SaaS LMS.

## Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript strict + Tailwind v4 + shadcn-style primitives. Hosted on Vercel.
- **Backend**: Supabase Postgres (RLS-driven RBAC), Supabase Auth (magic link), Supabase Edge Functions for email, Resend for delivery.
- **Tooling**: pnpm, ESLint flat, Prettier, Vitest, Playwright.

## Provisioning a new environment

1. Create a Supabase project. Note the URL, anon key, service-role key.
2. Apply migrations in order: `0001_init_schema.sql … 0007_views.sql` (Supabase Dashboard SQL editor or `supabase db push`).
3. (Optional) Apply `supabase/seed/cohort.sql` for staging only — never in prod.
4. Run `supabase/tests/rbac.sql` to verify capability resolution: every assertion must print `PASS`.
5. Deploy edge functions: `supabase functions deploy send-registration-email send-daily-digest`.
6. Set Edge Function env: `RESEND_API_KEY`, `EMAIL_FROM`, `SITE_URL`, `EDGE_FUNCTION_SHARED_SECRET`.
7. Schedule the daily digest (Supabase Cron):
   ```
   0 7 * * *  POST /functions/v1/send-daily-digest  (Bearer EDGE_FUNCTION_SHARED_SECRET)
   ```
8. Vercel project: link `web/`. Set env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Build cmd `pnpm build`, output dir `.next`.

## Provisioning users

- **Admin/Trainer/Tech Support** (global staff): create the auth user, then `update profiles set staff_roles = '{admin}'` (or `{trainer}`, `{tech_support}`).
- **Support / Executive Faculty** (per cohort): `insert into cohort_faculty(user_id, cohort_id, college_role) values (..., 'support')` (or `'executive'`).
- **Students**: insert a `registrations` row with `status='pending'`; flip to `'confirmed'` to enroll. The `send-registration-email` webhook fires on the status change.

## Common ops

| Task                            | How                                                            |
|---------------------------------|----------------------------------------------------------------|
| Unlock a day                    | `update cohort_days set is_unlocked=true where cohort_id=… and day_number=N` |
| Move a student between pods     | `select rpc_pod_faculty_event(pod_id, 'member_added', student_id)` (also handles old pod removal via unique index) |
| Hand off pod primary            | `select rpc_pod_faculty_event(pod_id, 'handoff', from_user, to_user_id := …)` |
| Self check-in                   | `select rpc_self_check_in(cohort_id, day_number)`              |
| Mark attendance (faculty)       | `select rpc_mark_attendance(cohort, day, user, 'present')`     |
| Grade a submission              | `select rpc_grade_submission(submission_id, score, feedback)`  |
| Soft-delete announcement        | `update announcements set deleted_at=now() where id=…`         |

## Email

Both edge functions write to `notifications_log` (with `status` ∈ `queued|sent|failed`). Use it for delivery debugging:
```sql
select * from notifications_log where status='failed' order by created_at desc limit 50;
```

## RLS spec

`supabase/tests/rbac.sql` exercises capability resolution per persona. Run it whenever you change `0002_helpers.sql` or `0003_rls.sql`. Any FAIL means a capability is wrong.

## Schema change workflow

1. Add migration `00NN_description.sql` (next sequential number).
2. Run all migrations against a clean DB locally.
3. Re-run `rbac.sql` — should still all PASS.
4. Add a query in `web/lib/queries/<entity>.ts` if needed; never reach into Supabase from a component.
5. Deploy: dashboard SQL editor or `supabase db push`.
