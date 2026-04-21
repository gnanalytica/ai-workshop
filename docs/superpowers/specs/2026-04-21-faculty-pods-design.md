# Faculty pods, mentor assignment, and faculty experience

**Status:** Draft
**Date:** 2026-04-21
**Author:** sandeep@gnanalytica.com

## Problem

Today, `admin-faculty.html` lets admins attach faculty to a whole cohort (`cohort_faculty`), but there is no way to say *which faculty mentors which students*. Faculty also have no dedicated landing experience: on sign-in they fall into the admin surface and must navigate generic pages. We need:

1. A way for admins to group students within a cohort and attach faculty to those groups (pods).
2. A faculty-first home page that surfaces today's teaching context, the faculty's own students, the wider cohort, and a handbook.
3. Analytics that compare pods and faculty so cohort leads can see how mentorship is distributed.
4. A lightweight reveal so students know who their mentor is.

Pods are decoupled from capstone **teams** (`/admin-teams.html`). A student's teammates may have a different mentor than they do.

## Goals

- Admins can create pods inside a cohort, attach one or more faculty, and assign students manually or via CSV, with bulk operations.
- Every enrolled student in a cohort can be in at most one pod for that cohort.
- Faculty have a scoped landing page with Today / My pod / Whole cohort / Analytics / Handbook tabs.
- Faculty can drill down into any student in their cohort (read + write), not just their own pod.
- Faculty can hand off a pod to another faculty, with an audit trail.
- Students see their mentor on their dashboard.

## Non-goals (v1)

- Auto-balancing students across pods.
- Push or in-app notifications beyond what the existing email infrastructure already does.
- Student-to-pod *self-selection*; assignment is admin-driven.

## Data model

Two new tables plus one audit table. No changes to `cohort_faculty`; pods layer on top.

### `cohort_pods`

| column | type | notes |
|---|---|---|
| `id` | uuid pk | |
| `cohort_id` | uuid fk → `cohorts(id)` on delete cascade | |
| `name` | text not null | e.g., "Pod A — Priya's group" |
| `mentor_note` | text | free text shown to students on their dashboard |
| `created_at` | timestamptz default now() | |
| `created_by` | uuid fk → `auth.users(id)` | |

Unique index on `(cohort_id, name)`.

### `pod_faculty`

| column | type | notes |
|---|---|---|
| `id` | uuid pk | |
| `pod_id` | uuid fk → `cohort_pods(id)` on delete cascade | |
| `faculty_user_id` | uuid fk → `auth.users(id)` | must also exist in `cohort_faculty` for the pod's cohort (checked by app + trigger) |
| `is_primary` | boolean not null default false | |
| `contact_note` | text | optional per-faculty "how to reach me" |
| `assigned_at` | timestamptz default now() | |
| `assigned_by` | uuid fk → `auth.users(id)` | |

- Unique `(pod_id, faculty_user_id)`.
- Partial unique index `(pod_id) WHERE is_primary` — exactly one primary per pod.
- App enforces: a pod must always have ≥1 faculty and exactly one primary.

### `pod_members`

| column | type | notes |
|---|---|---|
| `id` | uuid pk | |
| `pod_id` | uuid fk → `cohort_pods(id)` on delete cascade | |
| `student_user_id` | uuid fk → `auth.users(id)` | |
| `cohort_id` | uuid fk → `cohorts(id)` | generated/derived; kept denormalised for the uniqueness constraint below |
| `assigned_at`, `assigned_by` | | |

- Unique `(pod_id, student_user_id)`.
- Unique `(cohort_id, student_user_id)` — a student belongs to at most one pod per cohort.
- Trigger keeps `cohort_id` in sync with the parent pod's cohort.

### `pod_faculty_events`

Audit log for handoffs, adds, removals. Drives the Analytics "handoffs in/out" metric.

| column | type | notes |
|---|---|---|
| `id` | uuid pk | |
| `pod_id` | uuid fk | |
| `from_user_id` | uuid nullable | null for `added` |
| `to_user_id` | uuid nullable | null for `removed` |
| `kind` | text check in (`'added'`, `'removed'`, `'handoff'`, `'primary_transfer'`) | |
| `note` | text | |
| `at` | timestamptz default now() | |
| `actor_user_id` | uuid | who performed it |

Inserts are via an `rpc_pod_faculty_event(...)` SECURITY DEFINER function that also performs the corresponding mutation on `pod_faculty`.

### RPC helpers

- `faculty_cohort_ids()` — returns the set of cohorts the caller is faculty in. Used by RLS policies to stay concise.
- `my_pod(cohort uuid)` — for students; returns their pod row plus faculty profiles (name, avatar, college) joined.
- `rpc_pod_faculty_event(...)` — performs handoff / add / remove atomically and writes the audit row.

## Permissions (RLS)

All policies below assume the existing `profiles.is_admin` and `cohort_faculty` tables.

### `cohort_pods`

- Admin: full.
- Faculty: `SELECT` where `cohort_id` is in `faculty_cohort_ids()`.
- Students: `SELECT` via `my_pod()` RPC only (no direct table access).

### `pod_faculty`

- Admin: full.
- Faculty: `SELECT` where the pod's cohort is in `faculty_cohort_ids()`.
- Faculty: `INSERT` / `DELETE` on rows where `faculty_user_id = auth.uid()` — allows self-removal during handoff; all other adds go through admin UI.

### `pod_members`

- Admin: full.
- Faculty: `SELECT` where cohort is in `faculty_cohort_ids()`.
- Student: `SELECT` their own row only.

### `pod_faculty_events`

- Admin + faculty in cohort: `SELECT`.
- `INSERT` only via RPC.

### Existing tables — widening for faculty drill-down

Faculty can read and write (grade, comment, reply to stuck) on **any student in their cohort** (per Q7-A). During implementation, audit these tables' policies and widen where needed:

- `profiles`
- `submissions` (SELECT + UPDATE for grading)
- `peer_reviews`
- `stuck_queue` (SELECT + UPDATE for replies)
- `attendance`
- `day_progress` / equivalent

The widening predicate is uniformly:

```sql
EXISTS (
  SELECT 1 FROM cohort_faculty cf
  WHERE cf.user_id = auth.uid()
    AND cf.cohort_id = <row's cohort_id>
)
```

## Admin UI

### New page: `admin-pods.html`

Linked from admin nav and cross-linked from `admin-faculty.html` ("Manage pods →").

Layout:

- **Cohort selector** (top).
- **Unassigned students** panel (left): list of enrolled students in that cohort not in any pod. Search box. Multi-select via checkboxes, shift-click range, Select all / Select none.
- **Pods** panel (right): cards, one per pod. Each card:
  - Editable name.
  - Faculty chip list (add/remove multiple). One chip bears a star indicating primary; clicking another chip's star transfers primary.
  - Member count.
  - List of members with a `×` to unassign and multi-select for bulk move/unassign.
  - "Handoff…" button (see below).
  - "Clear pod" (unassigns all members, keeps pod + faculty).
  - "Delete pod" (soft — unassigns members back to Unassigned; prompts confirm).
- **"+ New pod"** button: name + initial primary faculty (picker restricted to that cohort's `cohort_faculty`).
- **Bulk assign:** after selecting students in Unassigned, "Assign selected to…" dropdown of pods.
- **Bulk move / unassign:** within a pod card, same pattern.
- **CSV import:** button at top. Upload `student_email,pod_name`. Pods auto-created if missing (no faculty attached — must be filled in UI before the pod is usable). Rows that can't match are shown in a preview diff; admin confirms before commit.

### Faculty removal guardrail

On `admin-faculty.html`, removing a faculty from `cohort_faculty` while they still own pods is blocked with a clear error listing the pods. Admin must reassign pods first (via handoff or by editing the pod's faculty chip list).

## Faculty experience

### Landing: `faculty.html`

Admin-auth redirects: if user is faculty **and not** admin, route post-sign-in to `faculty.html`. If they are both, default to admin home as today but expose a "Faculty view" switcher.

Top strip: cohort selector (shown only if the faculty is on more than one cohort), name + role chip, theme toggle, sign out.

Tabs:

#### Tab 1 — Today *(default)*

- Header: today's day number, day title, session time, Meet link (from `schedule`).
- **Pre-class checklist** (static, distilled from RUNBOOK for faculty voice): review at-risk in my pod, skim today's content, queue polls.
- **During-class checklist**: monitor stuck queue (live badge of my pod's open items), launch polls, run breakouts.
- **After-class checklist**: respond to stuck items, grade pending submissions, post recap in pod notes.
- **Live signals** block: today's submissions from my pod, open stuck items from my pod, attendance snapshot (present / absent / unmarked for today).

#### Tab 2 — My pod

- If the faculty has multiple pods, render each as a collapsible section.
- Per-student row: name · progress bar (% of cohort days completed) · chips for (submissions graded / pending, attendance count, open stuck, peer reviews given+received) · last-active · at-risk badge.
- Row click → detail drawer (right slide-in): day-by-day progress grid, submission history with inline grading (reuse `admin-content.html` rubric widget), stuck-queue thread, peer-review activity.
- "Request handoff" button at the pod level: opens the handoff dialog (see below).

#### Tab 3 — Whole cohort

- Flat sortable table of all cohort students, same columns as My pod. My-pod rows tagged.
- Full drill-down drawer on any student (same widget).
- Read and write capabilities (grade / comment / reply to stuck) identical to My pod — no pod-scoping on writes.

#### Tab 4 — Analytics

Two sub-views, toggle pill:

- **Pods**: bar charts per metric with pods on the x-axis, the viewing faculty's pod(s) highlighted. Metrics: avg % days complete, avg submissions graded on time, attendance rate, stuck-queue median resolution time, at-risk count.
- **Faculty**: bar charts per metric with faculty on the x-axis. Metrics: students mentored, avg progress of their students, submissions graded (count + median turnaround), stuck-queue responses (count + median response time), handoffs in / out (from `pod_faculty_events`).

Visible to all cohort faculty (and admins). No individual-student analytics here.

#### Tab 5 — Handbook

Static collapsible sections, faculty voice:

- What you can track and where.
- Expectations during and after class.
- Grading rubric summary.
- Escalation path to admin.
- FAQ.

### Handoff dialog

On a pod card (both on admin-pods and on the faculty's My pod tab):

- **Handoff…** opens a modal.
- Fields: new primary faculty (dropdown of cohort faculty who aren't already the primary of this pod), optional note, checkbox "remove me from this pod after handoff" (for faculty-initiated only).
- On submit, calls `rpc_pod_faculty_event(kind: 'handoff', …)` which:
  - Adds the new primary (if not already on the pod).
  - Flips `is_primary` atomically.
  - Optionally removes the old primary.
  - Writes `pod_faculty_events` rows for each change.
- Existing email infra is reused to notify admin + incoming faculty (best effort, no new channel in v1).

### Student-facing: `dashboard.html` "Your mentor" card

- New card shown only when the student has a `pod_members` row for the active cohort.
- Shows primary faculty avatar, name, college/title, the pod's `mentor_note`, and any co-faculty as smaller chips.
- Data fetched via `my_pod()` RPC.

## Shared components

- Faculty nav reuses the existing admin-nav component, rebranded via the already-existing `applyFacultyBrandLabel` helper.
- Student detail drawer is extracted from wherever it currently lives (likely inline in admin pages) into `assets/student-drawer.js` so both admin and faculty views render it identically.
- A small `assets/pods.js` module centralises RPC calls, CSV parsing for import, and the handoff dialog.

## Error handling

- CSV import: preview shows unmatched emails, duplicate pod names, students already in another pod in this cohort — admin can drop those rows before committing.
- Delete pod with members: confirm modal, members return to Unassigned.
- Remove primary faculty with no replacement: blocked with "Pods must have a primary faculty — transfer first."
- Handoff to someone not in `cohort_faculty`: blocked at the RPC layer.

## Testing plan

Manual, against a staging cohort:

1. Create a cohort with 3 faculty and 20 enrolled students.
2. Create 3 pods; bulk-assign students; verify uniqueness (student can't be added twice).
3. CSV import into a 4th pod; verify preview diff flags duplicates and unknowns.
4. Sign in as a faculty: confirm redirect to `faculty.html`, Today tab data is correct, My pod lists only their students, Whole cohort shows all with tags, Analytics renders for both views.
5. As faculty, drill into a non-pod student and grade a submission; confirm it persists and the admin view reflects it.
6. Initiate a handoff; confirm audit row, `is_primary` swap, and the Analytics "handoffs in/out" metric ticks.
7. Try to remove a faculty from `cohort_faculty` while they own a pod — expect error.
8. Sign in as a student: confirm the "Your mentor" card shows correct primary + co-faculty.
9. Negative: sign in as a student who isn't in a pod — card is hidden.
10. Negative: sign in as a faculty who isn't on any cohort — existing `NO_COHORT_MSG` shows.

## Rollout

- Ship behind no flag; it's additive. Existing `cohort_faculty` flow keeps working.
- Migration order: create tables → add RPCs → widen existing RLS policies → deploy frontend pages.
- No data backfill needed; pods start empty.

## Open items resolved during brainstorming

- Pods are separate from teams.
- Manual assignment, with bulk ops and CSV.
- Multi-faculty per pod, one primary.
- Faculty drill-down is full-write on any cohort student.
- Landing page is Today + Handbook context; pod/cohort/analytics are tabs.
- Student-facing pod reveal is included.
- Faculty-level individual analytics is included.
