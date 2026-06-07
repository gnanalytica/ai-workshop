# Capstone Team Submissions — Spec & Plan

Status: **proposed** (awaiting approval before implementation)
Owner: sandeep@gnanalytica.com
Branch: `claude/capstone-team-creation-s6H8S`

## Problem

Final-project groups are already finalized off-platform in a spreadsheet:
one row per group with a **team name/number**, **3–5 roll numbers**, and the
**3 ideas** they pitched. We need in-app UI/UX so that, on login, students see
their locked team and submit **one group deliverable**: a presentation link, a
live website/app URL, and a GitHub repo.

## Decisions (locked)

| Question | Decision |
|---|---|
| Roll number → account mapping | Key on `registrations.roll_number` (already exists, `0113`). No new mapping field. |
| Who can edit/submit deliverables | **Any team member**. |
| Team model | **Locked / admin-managed** — teams come only from the import; no student self-service create/join/leave. |
| Rollout | Plan-first (this doc), then implement on the branch. |

## What already exists (reuse, don't rebuild)

- `teams` (`id, cohort_id, name, description, created_by, unique(cohort_id,name)`)
  and `team_members` (`team_id, user_id, role`) — `0008_extensions_schema.sql`,
  RLS already routed through `is_enrolled_in()` / `has_cap('roster.*')`.
- `registrations.roll_number` (text, unique per confirmed reg per cohort) — `0113`.
- `/teams` page + `lib/queries/teams.ts` + `lib/actions/teams.ts` (currently
  self-service create/join/leave — to be repurposed to read-only).
- URL validation (`githubRe`, `http(s)://` check) in `lib/actions/capstone.ts` — reuse.
- Nav entries for Teams + Capstone in `lib/rbac/menus.ts`.

`capstone_projects` stays as-is (per-student milestone work). Team deliverables
are a **separate, team-scoped** concept and must not be jammed into it.

## Schema changes — one migration: `0115_team_capstone_submissions.sql`

1. **Extend `teams`** (admin-managed, read-only to students):
   - `team_number int`
   - `pitched_ideas jsonb not null default '[]'::jsonb` (array of the 3 ideas)
   - `chosen_idea text` (nullable — which idea they're building, optional)

2. **New `team_submissions`** (1:1 with team; this is what members edit):
   ```
   team_id        uuid primary key references teams(id) on delete cascade
   cohort_id      uuid not null references cohorts(id) on delete cascade
   presentation_url text
   product_url      text   -- live website / app
   repo_url         text   -- github
   status         text not null default 'draft'  -- draft | submitted | reviewed
   submitted_at   timestamptz
   updated_at     timestamptz not null default now()
   updated_by     uuid references profiles(id) on delete set null
   ```
   `cohort_id` denormalized so RLS/`has_cap` checks don't need a join through `teams`.

3. **RLS on `team_submissions`** (route through helpers, no role math):
   - `select`: team members **or** `has_cap('roster.read', cohort_id)`.
   - `insert`/`update`: caller is a member of that team
     (`exists (select 1 from team_members tm where tm.team_id = team_submissions.team_id and tm.user_id = auth.uid())`)
     **and** `is_enrolled_in(cohort_id)`.
   - admin `for all`: `has_cap('roster.write', cohort_id)`.
   - A `before update`/`insert` trigger stamps `updated_at`/`updated_by` and sets
     `submitted_at` when status first flips to `submitted` (members can't backdate).

4. **Lock down self-service** (because teams are admin-managed):
   - Drop `teams_create` (students can no longer create teams).
   - Replace `tm_self` (currently `for all`) with a **select-only** self policy so
     students can't add/remove themselves; membership is admin-only via `tm_admin`.

Run `supabase/tests/rbac.sql` after, per repo convention.

## App changes (`web/`)

**Queries — `lib/queries/teams.ts`**
- `getMyTeam(cohortId)` → the caller's team with members (names + roll numbers),
  `pitched_ideas`, and current `team_submissions` row (or null). `null` if unassigned.
- `listTeamsWithSubmissions(cohortId)` → admin/faculty overview: each team, member
  count, submission status, the three links.

**Actions — `lib/actions/teams.ts`**
- `upsertTeamSubmission({ team_id, presentation_url, product_url, repo_url, status })`
  — any member; reuse `githubRe` + `http(s)` validation; `revalidatePath('/teams')`.
- `importTeams({ cohort_id, rows })` — admin (`requireCapability('roster.write', cohortId)`).
  Each row = `{ team_number, name, roll_numbers[], ideas[] }`. For each roll number,
  resolve `registrations.roll_number → user_id` within the cohort; upsert the team
  (on `cohort_id,name`), set `team_number`/`pitched_ideas`, and replace `team_members`.
  Returns a per-row report: matched members, **unmatched roll numbers**, errors.
- Remove/retire `createTeam` / `joinTeam` / `leaveTeam` from the student surface
  (keep `leaveTeam`/`joinTeam` only behind admin, or delete — TBD in review).

**Student UI — repurpose `app/(authed)/capstone/` (or `/teams`)**
- Replace "Find your capstone team" with **"Your Team"**: team name/number,
  teammates (read-only), the 3 pitched ideas, and a submission card with three
  validated fields (presentation, live URL, repo) + a Submit toggle and status badge.
- If the signed-in student isn't in any imported team → a clear "not assigned yet,
  contact faculty" empty state (no create button).

**Admin UI — `app/(authed)/admin/cohorts/[cohortId]/teams/`**
- Import page: paste CSV / TSV (matching the spreadsheet columns) → preview with
  matched/unmatched roll numbers → confirm. Surfaces every unmatched roll number so
  staff can fix the sheet or the student's roll number.
- Overview table: all teams, members, submission status, links — extends the existing
  `…/capstones` pattern.

**Nav — `lib/rbac/menus.ts`**
- Point the student "Teams" entry at the new Your-Team surface; add an admin
  "Teams" entry under the cohort admin section (cap `roster.read`/`roster.write`).

## CSV import format (matches the spreadsheet)

```
team_number,team_name,roll_numbers,idea_1,idea_2,idea_3
1,Neural Ninjas,"23BCE1001;23BCE1002;23BCE1003",Idea A,Idea B,Idea C
```
`roll_numbers` is a `;`-separated list (3–5). Ideas map into `pitched_ideas`.

## Open items for review

- Confirm the student surface lives at `/capstone` vs `/teams` (I lean `/capstone`
  since that's the "final project" mental model; `/teams` then redirects there).
- Whether to hard-delete `createTeam/joinTeam/leaveTeam` or keep them admin-only.
- Whether `chosen_idea` is needed now or later.

## Test plan

- `supabase/tests/rbac.sql`: non-member can't read/write another team's submission;
  member can upsert; faculty read-only; admin all.
- Vitest: `importTeams` roll-number resolution incl. unmatched rows; submission
  URL validation.
- Playwright: student sees locked team + ideas, submits links, status flips to
  submitted; non-assigned student sees empty state.
