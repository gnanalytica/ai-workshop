# Role Reorganization + Faculty Guides — Design

**Date:** 2026-04-24
**Status:** Draft, pending spec review
**Rollout:** Big-bang (single staging cutover → prod), no feature flag

## Context

Today the platform has a two-role model: `profiles.is_admin` (treated as "trainer with full admin powers") and `cohort_faculty` rows with or without an `is_admin` flag ("support faculty"). This conflates Admin and Trainer, has no place for internal Tech Support staff, and has no distinction between a college's operational partner (Executive Faculty) and its pod-level support (Support Faculty). Grading, attendance, and content responsibilities are all trainer-only, which doesn't scale and doesn't match how sessions actually run.

This redesign introduces five explicit roles, reassigns responsibilities across them, adds a platform-wide community Q&A board, and replaces the 7-day pre-training LMS with a simpler handbook + public setup guide.

## Roles

**Hybrid model — Gnanalytica roles are global; college roles are per-cohort.**

| Role | Org | Scope | Data location |
|---|---|---|---|
| Admin | Gnanalytica | Global, multi-role | `profiles.staff_roles` contains `'admin'` |
| Trainer | Gnanalytica | Global, multi-role | `profiles.staff_roles` contains `'trainer'` |
| Tech Support | Gnanalytica | Global, multi-role | `profiles.staff_roles` contains `'tech_support'` |
| Support Faculty | College | Per-cohort, single role | `cohort_faculty.college_role = 'support'` |
| Executive Faculty | College | Per-cohort, single role | `cohort_faculty.college_role = 'executive'` |

- **Gnanalytica staff can hold multiple roles at once** (e.g., Trainer + Tech Support). Permissions = union.
- **College staff hold exactly one role per cohort.** Same person can be Support Faculty in cohort A and Executive Faculty in cohort B.
- A Gnanalytica staff member can additionally be assigned a college role in a specific cohort (permissions still union).

## Responsibility matrix

| Action | Admin | Trainer | Tech Support | Support Faculty | Executive Faculty |
|---|---|---|---|---|---|
| Platform config, user mgmt | ✅ | — | — | — | — |
| Edit content (`cohort_days`, runbooks) | ✅ | ✅ | — | — | — |
| Grade assignments | ✅ | ✅ (any pod, override) | — | ✅ (own pod) | — |
| View quiz results (quizzes auto-graded, no manual grading) | ✅ | ✅ | — | ✅ (own pod) | ✅ (read, own cohort) |
| Mark attendance | ✅ | ✅ | — | ✅ (own pod) | — |
| Post cohort announcements | ✅ | ✅ | — | — | ✅ (own cohort) |
| Soft-delete own announcement | ✅ | ✅ | — | — | ✅ (own only) |
| View cohort analytics + export | ✅ | ✅ | — | Pod only | ✅ (read, own cohort) |
| Manage pods | ✅ | ✅ | — | — | — |
| Respond to stuck queue | ✅ | ✅ | ✅ (tech-tagged only) | ✅ (own pod) | — |
| Post / reply on community board | ✅ | ✅ | ✅ | ✅ | ✅ |
| Moderate community board | ✅ | ✅ | ✅ | — | — |

**Deliberate non-ownership flagged for review:** day-to-day *progress monitoring* (who's falling behind) is visible to everyone but owned by no one. This is an explicit choice; revisit if students slip through.

## Escalation lanes

```
Student
  │
  ▼
Support Faculty (pod)
  │
  ├── tech / environment issue ──▶ Tech Support
  ├── content / concept question ─▶ Trainer
  └── platform / account / grade  ─▶ Trainer
```

- Executive Faculty is NOT in the escalation chain.
- Community board is a **supplement**, not the primary escalation channel. In-session blockers go through the chain above. Non-urgent and post-session questions go to the board.
- Tech Support converts recurring stuck-queue tickets into board posts ("Convert to board post" button in `admin-stuck.html`) so the FAQ compounds.

## Schema changes

### `profiles`
```sql
alter table profiles add column staff_roles text[] not null default '{}';
-- constraint: each element in {'admin','trainer','tech_support'}
-- backfill: is_admin=true → staff_roles = ARRAY['admin','trainer']
--   (today's is_admin means "trainer with admin powers" — confirmed from
--    20260423_support_faculty_scope.sql header comment)
-- is_admin column retained this migration; dropped one cohort cycle later.
```

After backfill, trainers-without-admin are manually demoted by removing `'admin'` from their `staff_roles`.

### `cohort_faculty`
```sql
alter table cohort_faculty add column college_role text
  check (college_role in ('support','executive'));
-- backfill: all existing rows → 'support' (Executive Faculty didn't exist)
-- NOTE: cohort_faculty has no is_admin column in prod (verified 2026-04-24);
-- it has a legacy `role text` column with values {faculty, ta, lead}.
-- That column is orthogonal and stays. Plan 2 migrates app code to
-- college_role; `role` can be retired in a later cleanup.
-- unique (cohort_id, user_id) stays (one college role per person per cohort)
```

### `announcements`
```sql
alter table announcements add column deleted_at timestamptz null;
-- soft delete for Exec Faculty (and everyone) on own posts
```

### `board_posts`
```sql
create table board_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id),
  cohort_id uuid null references cohorts(id),  -- null = platform-wide (default)
  title text not null check (char_length(title) between 3 and 140),
  body_md text not null,
  tags text[] not null default '{}',  -- controlled vocab: tech, concept, setup, platform, lab
  status text not null default 'open' check (status in ('open','answered','closed')),
  pinned_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);
```

### `board_replies`
```sql
create table board_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references board_posts(id) on delete cascade,
  author_id uuid not null references profiles(id),
  body_md text not null,
  is_accepted_answer bool not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);
```

### `board_votes`
```sql
create table board_votes (
  user_id uuid not null references profiles(id),
  post_id uuid null references board_posts(id) on delete cascade,
  reply_id uuid null references board_replies(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((post_id is null) <> (reply_id is null)),  -- exactly one of the two
  unique (user_id, post_id),
  unique (user_id, reply_id)
);
-- +1 only in v1, no downvotes
```

### `faculty_guide_progress`
```sql
create table faculty_guide_progress (
  user_id uuid not null references profiles(id),
  cohort_id uuid not null references cohorts(id),
  item_key text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, cohort_id, item_key)
);
```

## RLS rebuild

**Supersedes** `20260423_support_faculty_scope.sql` entirely.

**New SQL helpers (SECURITY DEFINER, STABLE):**
- `has_staff_role(role text) returns bool` — checks `role = ANY(profiles.staff_roles)` for `auth.uid()`.
- `college_role_in(cohort uuid) returns text` — returns `'support'`, `'executive'`, or null for `auth.uid()` in that cohort.
- `faculty_cohort_ids() returns uuid[]` — rebuilt: cohorts where user has any `college_role` OR any staff role that implies cohort access (trainer/admin). Preserves the helper name used elsewhere.
- `executive_cohort_ids() returns uuid[]` — cohorts where user has `college_role = 'executive'`.
- `can_grade_submission(submission_id uuid) returns bool` — true if admin/trainer in that cohort, OR support faculty assigned to the pod containing the submission's student.

**Policy changes (high-level, per table):**
- `submissions` — add `update` for support faculty via `can_grade_submission`.
- `attendance` — add `insert/update` for support faculty where student is in their pod.
- `announcements` — add `insert` for executive faculty in their cohort; `update` (soft delete) on own rows only.
- `cohort_days`, `rubric_templates`, content tables — unchanged (trainer/admin only).
- `stuck_queue` — add `update/insert-response` for tech_support on rows where `tags @> ARRAY['tech']`; support faculty on rows where student is in their pod.
- `board_posts` / `board_replies` — `select` all non-deleted to authenticated; `insert` for any authenticated; `update` author within 15 min OR moderator any time; `delete` via `deleted_at` for author (any time) OR moderator.
- `board_votes` — insert for any authenticated, one per (user, target) pair.
- Exec Faculty read — `select` on `submissions`, `attendance`, `lab_progress`, `registrations` filtered through `executive_cohort_ids()`.

## Auth layer (`assets/admin-auth.js`)

Replace `checkAdminOrFaculty(user)` with `resolveRoles(user, cohortId)` returning:

```js
{
  user,
  staff: Set<'admin'|'trainer'|'tech_support'>,
  college: 'support' | 'executive' | null,  // null if user has no college role in this cohort
  facultyCohortIds: uuid[],
  executiveCohortIds: uuid[],
  can: {
    grade, markAttendance, editContent,
    postAnnouncement, deleteOwnAnnouncement,
    viewCohortAnalytics, exportCohortData,
    managePods, manageUsers, editPlatformConfig,
    respondStuckTech, respondStuckAny,
    moderateBoard
  }
}
```

All UI gates read `can.*`, not role names. Role-to-capability mapping lives in one place in `admin-auth.js`.

**`cohortId` may be null** (e.g., platform-wide pages like `board.html` or the admin home before a cohort is selected). When null, `college` is always null and cohort-scoped `can.*` flags (grade, markAttendance, postAnnouncement) are false; Gnanalytica `staff_roles` still determine admin/trainer/tech_support capabilities.

**`can_grade_submission(submission_id)` contract:** returns true if the caller has `'admin'` OR `'trainer'` in `staff_roles` (regardless of pod assignment), OR has `college_role='support'` in the submission's cohort AND is assigned to the pod containing the submission's student. Trainer/admin grading is never pod-gated.

## UI changes

### `assets/admin-nav.js`
Replace `SUPPORT_FACULTY_PAGES` with a per-role allowlist map:

```js
const NAV_ALLOWLIST = {
  admin: [/* all */],
  trainer: [/* all except platform config */],
  tech_support: ['admin-stuck','admin-board-mod','setup-guide-edit','admin-content (readonly)'],
  support: ['faculty (stream/people/insights/guide)','day.html grading for own pod','admin-attendance (own pod)'],
  executive: ['admin-analytics (read)','admin-announcements (own cohort)','admin-student (read)']
};
```

User's visible nav = union of allowlists for all their active roles in the selected cohort.

### New pages

- **`faculty-guide.html`** — authenticated, Support Faculty or higher. Sections: role, day-of-session flow, triage flowchart (inline SVG), debugging recipes (collapsibles for Ollama/Python/VS Code/Supabase/git/magic-link), grading walkthrough, escalation contacts (dynamic per cohort), per-cohort live-session artifacts (read-only), 10-item persisted pre-session checklist.
- **`board.html`** — authenticated, all roles. List view with tag filter, search (`ilike`), "my posts," sort by recent/unanswered. Detail view with replies, accepted-answer mark, upvote.
- **`setup-guide.html`** — **public, no auth.** Sections: prereqs, system requirements, per-tool install playbook (Chrome/VS Code/Node/Python/Git/Ollama/optional Docker) with Win/macOS/Linux tabs, download→install→verify→common errors→screenshot per tool, verification-script stub (deferred to v2; v1 uses documented manual checks), escalation, lab-day morning checklist. Top banner: "Last verified for cohort X on YYYY-MM-DD."

### Retired pages

- `faculty-pretraining.html` — **deleted** (replaced by `faculty-guide.html`).

### Modified pages

- `admin-faculty.html` — add "Pre-training materials" card per cohort (edit slides URL, recording URL, session datetime). Add "Support Faculty checklist completion" table (% per person, for trainer monitoring).
- `admin-stuck.html` — add "Convert to board post" button (Tech Support / Admin / Trainer).
- `day.html` — grading UI visible to Support Faculty for their pod's students, in addition to Trainer/Admin.
- `faculty.html` — sidebar now driven by `NAV_ALLOWLIST` union; Guide tab links to `faculty-guide.html`.
- All files currently reading `profiles.is_admin` or calling `checkAdminOrFaculty` — migrated to `resolveRoles` + `can.*`. Enumerate in implementation plan.

## Migrations retired / superseded

- `20260423_support_faculty_scope.sql` — superseded entirely by the new RLS rebuild.
- `20260421_2310_faculty_pretraining_lms.sql` tables — **destructive drop** (modules, quizzes, practical, evaluation, certificate tables). **Requires confirmation: no real data has been captured in these tables yet.** If data exists, migrate to `faculty_guide_progress` or archive before drop.
- `20260421_2355_faculty_pretraining_indexes.sql` — dropped with the tables.

## Rollout (big-bang)

1. Branch + staging Supabase project.
2. Apply all migrations in filename order against staging.
3. Run full E2E rehearsal: admin, trainer, tech-support, support-faculty, exec-faculty user journeys.
4. Verify current active cohorts still behave correctly (grading, attendance, content read).
5. Schedule prod cutover for a no-session window (evening between cohort days, or a weekend).
6. Apply migrations in prod. Smoke-test each role.
7. Post-deploy: trainers manually demote non-admin trainers (remove `'admin'` from `staff_roles`) and populate Executive Faculty rows.
8. Follow-up migration one cycle later: drop `profiles.is_admin` and `cohort_faculty.is_admin`.

**Rollback strategy:** keep `profiles.is_admin` populated during the first migration cycle so the old RLS policies could be restored from git if needed. Full rollback is only practical before step 8.

**Note on intermediate state between step 6 (migration applied) and step 7 (manual demotion):** all backfilled users temporarily hold both `'admin'` and `'trainer'` in `staff_roles`. For users who should be trainer-only, this grants a short-lived admin permission window — acceptable because admin capabilities today are a superset of trainer capabilities (no regression for anyone), and the window is closed as soon as the trainer completes step 7.

**Testing surface (smoke-test checklist per role after step 6):**
- Admin: create cohort, edit content, grade any submission, manage pods, moderate board.
- Trainer (admin removed): same as admin EXCEPT platform config / user management pages are gated.
- Tech Support: see stuck queue tech-tagged items, respond to board, cannot see grading UI or content editor.
- Support Faculty: sees only own pod on attendance + grading + stuck queue; can post/reply on board; cannot moderate.
- Executive Faculty: read-only cohort analytics + student list; can post+soft-delete own announcements; cannot grade, cannot see other cohorts.

## Out of scope (YAGNI for v1)

- Board downvotes, reactions, @mentions, email notifications, rich media uploads, reputation/badges.
- Progress-tracking LMS for Support Faculty (replaced by flat handbook).
- Per-lab-machine verification tracking database.
- Real-time notifications.
- Cross-role impersonation / debugging tools for admins.

## Open items to confirm before implementation

1. **Backfill assumption:** today's `profiles.is_admin=true` all map to `{'admin','trainer'}`. Spot-check: are there any `is_admin=true` users who should actually be trainer-only from day one? If yes, list them for manual post-backfill demotion.
2. **Pre-training LMS data:** confirm `faculty_pretraining_*` tables are empty or contain only test data, so the destructive drop is safe.
3. **Community board moderation scope:** Tech Support moderation privileges — fine for them to delete posts outside their tag area, or restrict to `tech/setup` tagged posts only? Current spec allows any.
4. **Support Faculty pre-session checklist items** — the 10-item list is a starting point; final wording is a content task during implementation.
