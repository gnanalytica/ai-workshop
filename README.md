# AI Workshop SaaS LMS

## What this is

A SaaS learning-management system for a 30-day AI workshop: students follow a daily curriculum, work in pods with assigned faculty, submit labs/quizzes, and get reviewed. Faculty grade and run attendance; admins manage the cohort, schedule, roster, and announcements. The whole product is a single Next.js 15 app under `web/` backed by Supabase (Postgres + Auth + Edge Functions).

## Architecture

- **Frontend**: Next.js 15 (App Router, RSC), React 19, Tailwind v4, shadcn-style primitives. One `AppShell` wraps every authenticated route.
- **Backend**: Supabase Postgres with row-level security as the security boundary. Auth is magic-link via `@supabase/ssr`. Heavy logic lives in SQL (RPCs, triggers, views).
- **RBAC**: six personas resolved by the `auth_caps(cohort uuid)` SECURITY DEFINER function. UI gates with `requireCapability(...)` from `web/lib/auth/`. All RLS goes through `has_cap()` / `can_grade()` — no role math in policies.
- **Curriculum**: `web/content/day-XX.mdx` rendered server-side via `next-mdx-remote/rsc`, frontmatter validated by zod (`web/lib/content/schema.ts`).
- **Edge functions**: `send-daily-digest`, `send-registration-email` (Resend) — gated by `EDGE_FUNCTION_SHARED_SECRET`.

## Repo layout

```
web/                        Next.js app (single frontend)
  app/                      App Router routes
    (authed)/               shared AppShell — dashboard, day/[n], pod, faculty/*, admin/*
    sign-in/, auth/callback/, denied/
  components/               shell/, ui/, data-table/, kpi/, day-card/, pod-card/, ...
  lib/
    supabase/               server / client / service factories
    auth/                   session, requireCapability, magic-link action
    rbac/                   capabilities.ts, menus.ts
    queries/                server-only data access (no from('…') in components)
    actions/                server actions (mutations)
    content/                MDX loader + zod frontmatter schema
    format/                 esc, fmtDate, relTime
  content/                  day-01.mdx … day-30.mdx
  middleware.ts             Supabase session cookie refresh
  tests/                    Vitest unit + Playwright e2e
supabase/
  migrations/               0001 … 0009 (schema, helpers, RLS, RPCs, triggers, views)
  functions/                send-daily-digest, send-registration-email, _shared/
  seed/cohort.sql           1 cohort, 50 students, 5 pods, 6 faculty
  tests/rbac.sql            pgTAP-style RBAC spec
docs/                       specs and plans
.github/workflows/ci.yml    typecheck + lint + vitest + build + migrations + RBAC spec
```

## Quickstart

```bash
git clone <repo> ai-workshop
cd ai-workshop/web
pnpm install
cp .env.example .env.local        # fill the keys listed below
pnpm dev                          # http://localhost:3000
```

Apply schema and seed against your Supabase project (or local Postgres):

```bash
export DB_URL='postgres://postgres:<pw>@<host>:5432/postgres'
for f in supabase/migrations/000{1..9}_*.sql; do
  psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$f"
done
psql "$DB_URL" -f supabase/seed/cohort.sql
psql "$DB_URL" -f supabase/tests/rbac.sql      # all assertions should PASS
```

## Environment variables

Set these in `web/.env.local` (and in Vercel for deploys):

| Variable                         | Where used                       | Notes                                       |
|----------------------------------|----------------------------------|---------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | browser + server                 | `https://<project>.supabase.co`             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | browser + server                 | safe to expose; RLS enforces access         |
| `SUPABASE_SERVICE_ROLE_KEY`      | server only (`lib/supabase/service.ts`) | admin client; never expose to the browser |
| `EDGE_FUNCTION_SHARED_SECRET`    | edge functions + cron triggers   | gates webhook calls into edge functions     |
| `RESEND_API_KEY`                 | edge functions                   | used by `send-daily-digest` + registration  |
| `NEXT_PUBLIC_SITE_URL`           | server                           | magic-link redirect target                  |

## Tests

```bash
cd web
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint flat config
pnpm test           # Vitest (unit + component)
pnpm e2e            # Playwright (boots dev server itself)
pnpm build          # production build
```

CI (`.github/workflows/ci.yml`) runs typecheck, lint, vitest, build, applies all migrations against a stubbed Postgres, then executes `supabase/tests/rbac.sql` and fails on any `FAIL:` line.

## Deploy

- **Frontend**: Vercel — point at `web/` as the project root, set the environment variables above.
- **Backend**: a Supabase project with the migrations from `supabase/migrations/` applied in order. Deploy edge functions with `supabase functions deploy <name>`. See `RUNBOOK.md` for cutover, schema-change, and incident-response procedures.

## Personas + RBAC

| Persona            | Stored in                                 | Scope        |
|--------------------|-------------------------------------------|--------------|
| Admin              | `profiles.staff_roles ⊇ {'admin'}`        | global       |
| Trainer            | `profiles.staff_roles ⊇ {'trainer'}`      | global       |
| Tech Support       | `profiles.staff_roles ⊇ {'tech_support'}` | global       |
| Support Faculty    | `cohort_faculty.college_role='support'`   | per cohort   |
| Executive Faculty  | `cohort_faculty.college_role='executive'` | per cohort   |
| Student            | `registrations.status='confirmed'`        | per cohort   |

UI checks against capabilities (`content.read`, `grading.write:pod`, `attendance.mark:cohort`, `analytics.read:cohort`, `announcements.write:cohort`, …) — never against role names. Full list: `web/lib/rbac/capabilities.ts`. Server-side gate:

```ts
await requireCapability("grading.write:pod", cohortId);
```

## Where to find things

- **Routes / UI**: `web/app/`, `web/components/`
- **Data access + auth**: `web/lib/queries/`, `web/lib/actions/`, `web/lib/auth/`, `web/lib/rbac/`
- **Schema + RLS + RPCs**: `supabase/migrations/`
- **Edge functions**: `supabase/functions/`
- **Curriculum**: `web/content/day-XX.mdx`
- **Specs and plans**: `docs/superpowers/specs/`, `docs/superpowers/plans/`
- **Agent guidance**: `CLAUDE.md`
- **Operations**: `RUNBOOK.md`
