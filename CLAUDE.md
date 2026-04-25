# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A 30-day AI workshop SaaS LMS. Single Next.js 15 (App Router) app under `web/` against a Supabase backend (Postgres, Auth, Edge Functions). Replaces an earlier static-HTML implementation; that history is preserved in git but no longer present in the working tree.

## Repository layout

```
web/                   Next.js app — single source of truth for the frontend.
  app/                 App Router routes
    (authed)/          shared AppShell layout for every authenticated route
      dashboard/, day/[n]/, pod/, people/, board/, ...
      faculty/         /faculty/today, /review, /pod, /handbook
      admin/           /admin/{home,roster,pods,faculty,schedule,…}
    sign-in/           magic-link sign-in (server action)
    auth/callback/     OAuth/magic-link landing
    denied/            capability-denied page
  components/
    shell/             AppShell, Sidebar, Topbar, NavSearch (cmd-K), DayRail
    ui/                shadcn-style primitives (Button, Input, Badge, Card)
    data-table/        generic filterable/sortable table
    kpi/, day-card/, pod-card/, student-row/, filter-bar/, markdown/
  lib/
    supabase/          server (SSR cookies), client (browser), service (admin)
    auth/              session, requireCapability, signInWithMagicLink action
    rbac/              capabilities.ts (TS), menus.ts (cap-filtered nav)
    queries/           server-only data access — no from('…') in components
    format/            esc, fmtDate, relTime — single source of truth
    content/           MDX loader + zod-validated frontmatter schema
  content/             day-01.mdx … day-30.mdx (curriculum)
  middleware.ts        Supabase session cookie refresh
  tests/               Vitest unit + Playwright e2e
supabase/
  migrations/          fresh 0001_…_0007 schema (no legacy history)
  functions/           edge: send-daily-digest, send-registration-email,
                       _shared/ (email + admin client)
  seed/                staging seed (1 cohort, 50 students, 5 pods, 6 faculty)
  tests/               pgTAP-style RBAC spec (rbac.sql)
docs/                  specs, plans, design notes
```

## RBAC model (single source of truth)

Six personas:

| Persona            | Stored in                                 | Scope        |
|--------------------|-------------------------------------------|--------------|
| Admin              | `profiles.staff_roles ⊇ {'admin'}`        | global       |
| Trainer            | `profiles.staff_roles ⊇ {'trainer'}`      | global       |
| Tech Support       | `profiles.staff_roles ⊇ {'tech_support'}` | global       |
| Support Faculty    | `cohort_faculty.college_role='support'`   | per cohort   |
| Executive Faculty  | `cohort_faculty.college_role='executive'` | per cohort   |
| Student            | `registrations.status='confirmed'`        | per cohort   |

Capabilities (UI checks against these, **never** role names):
`content.{read,write}`, `schedule.{read,write}`, `roster.{read,write}`, `pods.write`, `faculty.write`, `grading.read`, `grading.write:{cohort,pod}`, `attendance.mark:{cohort,pod}`, `attendance.self`, `analytics.read:{cohort,program}`, `announcements.{read,write}:cohort`, `moderation.write`, `support.{triage,tech_only}`, `orgs.write`, `self.{read,write}`, `board.{read,write}`.

The Postgres `auth_caps(cohort uuid)` SECURITY DEFINER function is the canonical capability resolver. `lib/rbac/capabilities.ts` mirrors it for UI hints. Every RLS policy routes through `has_cap()` / `can_grade()`. **No policy hand-rolls role math.**

Server-side gate: `await requireCapability("grading.write:pod", cohortId)` in any RSC, server action, or route handler. Soft check: `await checkCapability(...)`.

## Architecture notes that aren't obvious

- **`submissions` has no direct `cohort_id`** — filter via `assignments!inner(cohort_id)`.
- **Enrolled students** = `registrations.status='confirmed'`. There is no `enrollments` table.
- **Per-day progress**: `lab_progress`; day metadata: `cohort_days`.
- **Pods**: `pods` → `pod_faculty` (many, exactly one `is_primary` per pod via partial unique index) → `pod_members` (one pod per student per cohort, enforced by unique index). Atomic mutations go through the `rpc_pod_faculty_event` RPC; `pod_events` is the audit log. Students fetch their pod via `rpc_my_pod(cohort)`.
- **Submissions grading** authorization: `can_grade(submission)` — true for admin/trainer cohort-wide, true for support faculty when `shares_pod_with(student, cohort)`, false for executive faculty.
- **Curriculum**: `web/content/day-XX.mdx` is the source. Frontmatter validated by `lib/content/schema.ts` (zod). Body is rendered server-side via `next-mdx-remote/rsc`.
- **Theme**: tokens are HSL CSS variables in `app/globals.css`, exposed to Tailwind via `@theme`. Persona is `data-theme="light"|"dark"` on `<html>`, switched by `next-themes`.

## Conventions

- New routes go under `app/(authed)/<group>/<surface>/page.tsx`. Always start with `await requireCapability("<cap>", cohortId)` if the page has any gated content.
- Data access: every query lives in `lib/queries/<entity>.ts`. **No `from('…')` calls inside components.** Mutations go through server actions in `lib/actions/<entity>.ts` (call `requireCapability` first; tag with `"use server"`).
- New shared UI bits go in `components/<feature>/`. If you find yourself rewriting a table, escape, date format, etc., reuse the existing one — duplication is what we just removed.
- Migrations are numbered `NNNN_description.sql`. Policies use `drop policy if exists` + `create policy` (Postgres has no `CREATE POLICY IF NOT EXISTS`). Always re-run `supabase/tests/rbac.sql` after touching helpers or policies.
- Specs live in `docs/superpowers/specs/`; plans in `docs/superpowers/plans/`.

## Commands

```bash
cd web
pnpm install
cp .env.example .env.local       # fill Supabase URL/keys
pnpm dev                         # http://localhost:3000
pnpm typecheck                   # tsc --noEmit
pnpm lint                        # ESLint flat
pnpm test                        # Vitest unit
pnpm e2e                         # Playwright (boots dev server itself)
pnpm build                       # production build
```

Database (against a Supabase project or local Postgres):
```bash
# apply schema (in order)
psql "$DB_URL" -f supabase/migrations/0001_init_schema.sql
… 0007_views.sql
# seed for staging
psql "$DB_URL" -f supabase/seed/cohort.sql
# RBAC spec (psql NOTICE PASS/WARNING FAIL)
psql "$DB_URL" -f supabase/tests/rbac.sql
```

Deploy: Vercel (frontend) + Supabase (backend). `EDGE_FUNCTION_SHARED_SECRET` gates webhook calls into edge functions.
