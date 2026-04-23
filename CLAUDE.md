# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A 30-day AI workshop delivery platform: static HTML pages + a Supabase backend (Postgres, Auth, Edge Functions, Storage). No build step, no framework — every page is a standalone `.html` file with ES-module `<script type="module">` blocks importing shared helpers from `assets/`.

## Key surfaces

- `index.html` — public landing + magic-link sign-in.
- `dashboard.html` — student home after sign-in.
- `day.html` + `content/day-XX.md` — per-day curriculum pages (post-class quiz copy assumes `quizzes_v2.sql` then `quizzes_enhancements_20260423.sql` are applied for that cohort; enhancement seed is idempotent).
- `admin-*.html` — admin surfaces (one page per concern: home, content, schedule, teams, attendance, stuck, polls, faculty, pods, analytics, …).
- `faculty.html` — faculty landing (Today / My pod / Whole cohort / Analytics / Handbook).
- `supabase/migrations/` — timestamped SQL migrations, applied in filename order via Supabase dashboard or CLI.
- `supabase/functions/` — edge functions (digest email, registration email).

## Architecture notes that aren't obvious

- **No direct `cohort_id` on `submissions`** — filter via `assignments!inner(cohort_id)`.
- **Enrolled students** = `registrations` rows with `status='confirmed'` (not an `enrollments` table).
- **Per-day progress** lives in `lab_progress`; day metadata in `cohort_days`.
- **Faculty auth** goes through `assets/admin-auth.js::checkAdminOrFaculty`. **Support faculty** (`cohort_faculty` without `is_admin`) get a reduced sidebar (`SUPPORT_FACULTY_PAGES` in `assets/admin-nav.js`) and read-only schedule; grading, content, pods/teams, attendance exports, and cohort analytics are **trainer-only** (UI gate + RLS in `20260423_support_faculty_scope.sql`). **Trainers** use `profiles.is_admin` for full admin surfaces.
- **Mentor pods**: `cohort_pods` → `pod_faculty` (many, one `is_primary`) → `pod_members`. Atomic mutations go through the `rpc_pod_faculty_event` SECURITY DEFINER RPC; `pod_faculty_events` is the audit log. Students read their pod via the `my_pod(cohort uuid)` RPC.
- **RLS**: faculty permissions widen via `faculty_cohort_ids()` helper; grants read+write across all cohort students, not just pod members.

## Conventions

- New admin surfaces copy the `admin-faculty.html` skeleton: gate → denied → panel, toast component, theme toggle, shared nav.
- Mutations go inline (prompt/confirm are acceptable for v1 interim flows).
- Migrations are timestamped `YYYYMMDD_HHMM_description.sql`. Policies use `drop policy if exists` + `create policy` (Postgres has no `CREATE POLICY IF NOT EXISTS`).
- Specs live in `docs/superpowers/specs/`; plans in `docs/superpowers/plans/`.

## Commands

No build or test harness. Verify by opening pages directly in a browser against a staging Supabase project; apply migrations via dashboard SQL editor or `supabase db push`.
