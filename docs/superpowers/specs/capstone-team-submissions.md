# Capstone Team Submissions — Spec & Plan

Status: **approved-design / awaiting build go-ahead**
Owner: sandeep@gnanalytica.com
Branch: `claude/capstone-team-creation-s6H8S`

## Problem

Final-project groups are finalized off-platform in a spreadsheet: one row per
group with a **team name/number**, **3–5 roll numbers**, and the **3 ideas** they
pitched. The final project is now a **team deliverable, not per-student**. On
login, members see their locked team and submit one shared final.

## Decisions (locked)

| Topic | Decision |
|---|---|
| Roll → account mapping | Key on `registrations.roll_number` (`0113`). No new field. |
| Who edits/submits | **Any team member.** |
| Team model | **Locked / admin-managed** — teams come only from the import. No student create/join/leave. |
| Individual capstone | **Replaced by team.** Per-student capstone retired from the UI; tables archived (kept), not dropped. |
| Grading | **One shared team grade** by admin; all members see the same score + feedback. Faculty review-only (per RBAC). |
| Gallery visibility | **Public, always** — every team visible to all enrolled students live, **including drafts**. |
| Final captures | 3 core links (presentation, live URL, repo) + **title** + **short pitch** + **demo video URL** + **cover image URL** + **chosen idea**. |
| Cover image | **URL only** (no Storage bucket for now). |
| Lock | **Per-cohort deadline** locks editing; admin can reopen a team. |

## Reuse (don't rebuild)

- `teams` / `team_members` (`0008`) — RLS already via `is_enrolled_in()` / `has_cap('roster.*')`.
- `registrations.roll_number` (`0113`) for import resolution.
- URL validation (`githubRe`, `http(s)://`) from `lib/actions/capstone.ts`.
- Existing **Showcase** nav slot for the public gallery.

## Schema — migration `0115_team_capstone_submissions.sql`

1. **Extend `teams`** (admin-managed, read-only to students):
   - `team_number int`, `pitched_ideas jsonb not null default '[]'::jsonb`.

2. **Extend `cohorts`**: `team_submission_deadline timestamptz` (admin-set).

3. **`team_submissions`** — 1:1 with team, **member-editable content**:
   ```
   team_id          uuid primary key references teams(id) on delete cascade
   cohort_id        uuid not null references cohorts(id) on delete cascade
   title            text
   pitch            text                 -- 1–2 line description
   chosen_idea      text                 -- which pitched idea they built
   presentation_url text
   product_url      text                 -- live website / app
   repo_url         text                 -- github
   demo_video_url   text                 -- youtube / loom
   cover_image_url  text                 -- gallery card image (URL)
   status           text not null default 'draft'   -- draft | submitted
   unlocked         boolean not null default false  -- admin reopen override
   submitted_at     timestamptz
   updated_at       timestamptz not null default now()
   updated_by       uuid references profiles(id) on delete set null
   ```

4. **`team_grades`** — separate so the **member/admin split is clean** (no
   column-level RLS): `team_id` pk, `cohort_id`, `score int`, `feedback_md text`,
   `reviewed_by uuid`, `reviewed_at timestamptz`. Admin-only.

5. **RLS** (route through helpers, no role math):
   - `team_submissions` **select**: any enrolled cohort member (`is_enrolled_in`) —
     this is what makes the gallery public — **or** `has_cap('roster.read')`.
   - `team_submissions` **insert/update**: caller is a member of that team
     **and** editing is open (before `team_submission_deadline`, or `unlocked`,
     or caller has `roster.write`). Enforced in a `before` trigger so the
     deadline can't be bypassed.
   - `team_grades`: select by team members + `has_cap('roster.read')`; write by
     `has_cap('grading.write:cohort')` (admin). Faculty never write.
   - Trigger stamps `updated_at`/`updated_by`; sets `submitted_at` on first flip
     to `submitted`.

6. **Lock self-service**: drop `teams_create`; make `tm_self` **select-only**.
   Membership becomes admin-only (`tm_admin`).

Run `supabase/tests/rbac.sql` after.

## App changes (`web/`)

**Queries — `lib/queries/teams.ts`**
- `getMyTeam(cohortId)` → caller's team: members (name + roll), `pitched_ideas`,
  submission row, grade, and `editable`/`deadline` flags. `null` if unassigned.
- `listTeamGallery(cohortId)` → all teams + submissions for the **public gallery**
  (drafts included; show "in progress" state for empty ones).
- `listTeamsAdmin(cohortId)` → teams + submission status + grade for admin.

**Actions — `lib/actions/teams.ts`**
- `upsertTeamSubmission(...)` — any member; reuse URL validation; blocks when
  locked; `revalidatePath`.
- `setTeamStatus({team_id,'submitted'|'draft'})` — any member, before deadline.
- `importTeams({cohort_id, rows})` — `requireCapability('roster.write')`. Resolves
  each roll number via `registrations`, upserts team (`cohort_id,name`), sets
  `team_number`/`pitched_ideas`, replaces members. Returns per-row report with
  **unmatched roll numbers**.
- `gradeTeam(...)` — `requireCapability('grading.write:cohort')`.
- `setSubmissionDeadline(...)` / `reopenTeam(...)` — admin.
- Retire student `createTeam/joinTeam/leaveTeam` from the UI.

**Student surfaces**
- **`/capstone` → "Your Team"**: locked roster, the 3 pitched ideas, editable
  final card (title, pitch, chosen idea, 3 links, demo video, cover image),
  submit/locked/graded status, score + feedback when graded. Empty state if
  unassigned ("not on a team yet — contact faculty").
- **Showcase = public gallery**: grid of all teams' cards (cover image, title,
  pitch, links, members), live including drafts.
- Old per-student capstone page/milestones removed from nav; `/capstone` now the
  team surface. `capstone_projects` data left intact (archived).

**Admin — `app/(authed)/admin/cohorts/[cohortId]/teams/`**
- CSV import (paste) with matched/unmatched preview + confirm.
- Overview: teams, members, submission status, links, **grade** action.
- Set submission deadline; reopen a locked team.

**Nav — `lib/rbac/menus.ts`**: point Showcase → gallery; student "Capstone"/"Teams"
→ Your-Team; add admin "Teams" (cap `roster.read`/`roster.write`); drop the
individual-capstone entry.

## CSV import format

```
team_number,team_name,roll_numbers,idea_1,idea_2,idea_3
1,Neural Ninjas,"23BCE1001;23BCE1002;23BCE1003",Idea A,Idea B,Idea C
```
`roll_numbers` = `;`-separated (3–5); ideas → `pitched_ideas`.

## Test plan

- `rbac.sql`: non-member can read (gallery) but not write another team's submission;
  member writes before deadline, blocked after (unless reopened); faculty can't
  grade; admin grades.
- Vitest: `importTeams` roll resolution incl. unmatched; URL validation; deadline lock.
- Playwright: member edits + submits, sees status; gallery lists all teams live;
  unassigned student sees empty state; admin grades and reopens.

## Still worth confirming

- Exact home for the gallery (reuse **Showcase** vs new `/gallery`).
- Whether retired individual-capstone routes should redirect to `/capstone` or 404.
