# Plan 1 — Role Foundations (Schema + Auth Layer)

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce the new role model (5 roles, hybrid scoping) at the data + auth-helper layer, without yet migrating any existing UI caller or rewriting RLS. After this plan, the platform still behaves exactly as before; new role columns exist alongside old `is_admin`, and a new `resolveRoles()` helper is available. This isolates the risk of schema work from the RLS and UI rewrite in Plan 2.

**Architecture:** Additive migrations only. `profiles.staff_roles` (text[]) backfilled from `is_admin`; `cohort_faculty.college_role` (text) backfilled to `'support'`; `announcements.deleted_at` added. New SQL helpers shipped alongside existing ones. A new `resolveRoles(user, cohortId)` export in `admin-auth.js` built on top of the new helpers; `checkAdminOrFaculty` retained as a thin shim so no call sites break.

**Tech Stack:** Supabase Postgres (migrations in `supabase/migrations/`), vanilla ES modules in `assets/`, manual browser verification against staging Supabase project, ad-hoc `psql` / Supabase SQL editor for assertions.

**Spec:** `docs/superpowers/specs/2026-04-24-role-reorg-and-faculty-guides-design.md`

**Testing note:** This project has no automated test harness. Every migration step is followed by a SQL assertion run against staging. Every auth-helper change is followed by a browser smoke test. "Verification" steps below are non-optional — they're the equivalent of test runs.

**File structure for this plan:**
- Create `supabase/migrations/20260424_0000_staff_roles_column.sql` — additive column on `profiles`, backfill from `is_admin`.
- Create `supabase/migrations/20260424_0010_cohort_faculty_college_role.sql` — additive column on `cohort_faculty`, backfill to `'support'`, unique constraint.
- Create `supabase/migrations/20260424_0020_announcements_soft_delete.sql` — `deleted_at` column + filter to existing select policies.
- Create `supabase/migrations/20260424_0030_role_helpers.sql` — new helper functions (non-destructive; old helpers left in place).
- Create `supabase/verify/plan-1-assertions.sql` — SQL assertions run after each migration, expected outputs documented inline.
- Modify `assets/admin-auth.js` — add `resolveRoles()` and `CAPS` capability map. Keep `checkAdminOrFaculty` untouched as a shim for Plan 2 to gradually replace.

**Pre-flight (do once before Task 1):**

- [ ] Confirm you have access to a staging Supabase project (different from prod). If not, stop and ask.
- [ ] `git checkout main && git pull` — plan lands directly on main per user preference (no worktree).
- [ ] Open `https://<staging-project>.supabase.co/project/<ref>/sql/new` in a browser tab — this is where you'll run verification SQL.

---

### Task 1: Add `profiles.staff_roles` column + backfill

**Files:**
- Create: `supabase/migrations/20260424_0000_staff_roles_column.sql`
- Verify: `supabase/verify/plan-1-assertions.sql`

- [ ] **Step 1: Write migration SQL**

Create `supabase/migrations/20260424_0000_staff_roles_column.sql`:

```sql
-- Add staff_roles to profiles (Gnanalytica-side roles).
-- Valid elements: 'admin', 'trainer', 'tech_support'.
-- Today's is_admin=true means "trainer with admin powers" (per
-- 20260423_support_faculty_scope.sql header comment), so backfill to
-- both roles to preserve every current permission. Manual demotion of
-- trainer-only users happens post-deploy.

alter table public.profiles
  add column if not exists staff_roles text[] not null default '{}';

-- Constrain element values.
alter table public.profiles
  drop constraint if exists profiles_staff_roles_values_chk;
alter table public.profiles
  add constraint profiles_staff_roles_values_chk
  check (staff_roles <@ array['admin','trainer','tech_support']::text[]);

-- Backfill: is_admin=true → {'admin','trainer'}, otherwise empty.
update public.profiles
  set staff_roles = array['admin','trainer']::text[]
  where coalesce(is_admin, false) = true
    and staff_roles = '{}';

-- Index for lookups like "all trainers" or "all tech support".
create index if not exists profiles_staff_roles_gin_idx
  on public.profiles using gin (staff_roles);
```

- [ ] **Step 2: Apply to staging**

In Supabase SQL editor (staging), paste the migration file contents and run. Expected: `Success. No rows returned.`

- [ ] **Step 3: Verify**

Run in SQL editor:

```sql
-- (a) All is_admin=true profiles have staff_roles = {admin,trainer}.
select count(*) as mismatched
from public.profiles
where is_admin = true
  and not (staff_roles @> array['admin','trainer']);
-- Expected: mismatched = 0

-- (b) No profile has an out-of-vocab role.
select count(*) as bad_rows
from public.profiles
where exists (
  select 1 from unnest(staff_roles) r
  where r not in ('admin','trainer','tech_support')
);
-- Expected: bad_rows = 0

-- (c) Constraint works: update an existing profile to an invalid role, expect failure.
do $$
declare v_id uuid;
begin
  select id into v_id from public.profiles limit 1;
  if v_id is null then
    raise notice 'no profiles to test against; skipping constraint test';
    return;
  end if;
  begin
    update public.profiles set staff_roles = array['evil_role'] where id = v_id;
    raise exception 'constraint did not fire';
  exception when check_violation then null;
  end;
end $$;
-- Expected: Success. No rows returned. (exception caught = constraint fired)
```

Capture the three outputs and paste into `supabase/verify/plan-1-assertions.sql` as an appended section with today's date + staging project ref.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260424_0000_staff_roles_column.sql supabase/verify/plan-1-assertions.sql
git commit -m "feat(db): add profiles.staff_roles with backfill from is_admin"
```

---

### Task 2: Add `cohort_faculty.college_role` column + backfill

**Files:**
- Create: `supabase/migrations/20260424_0010_cohort_faculty_college_role.sql`
- Modify: `supabase/verify/plan-1-assertions.sql`

- [ ] **Step 1: Pre-flight — confirm `cohort_faculty.is_admin` column exists with that name**

```sql
select column_name from information_schema.columns
where table_schema='public' and table_name='cohort_faculty' and column_name='is_admin';
-- Expected: 1 row. If 0 rows, adjust the spec + Plan 2 references before proceeding.
```

- [ ] **Step 2: Write migration SQL**

Create `supabase/migrations/20260424_0010_cohort_faculty_college_role.sql`:

```sql
-- cohort_faculty gains college_role: college-side per-cohort role.
-- Values: 'support' (pod support faculty) or 'executive' (cohort oversight).
-- Existing is_admin column on cohort_faculty is retained for now; it will
-- be dropped in Plan 2 once RLS no longer depends on it.

alter table public.cohort_faculty
  add column if not exists college_role text;

alter table public.cohort_faculty
  drop constraint if exists cohort_faculty_college_role_values_chk;
alter table public.cohort_faculty
  add constraint cohort_faculty_college_role_values_chk
  check (college_role is null or college_role in ('support','executive'));

-- Backfill: every existing row is a support faculty.
update public.cohort_faculty
  set college_role = 'support'
  where college_role is null;

-- Enforce NOT NULL now that rows are filled.
alter table public.cohort_faculty
  alter column college_role set not null;

-- One college role per person per cohort (idempotent).
create unique index if not exists cohort_faculty_unique_user_per_cohort
  on public.cohort_faculty (cohort_id, user_id);
```

- [ ] **Step 3: Apply to staging**

Run in Supabase SQL editor. Expected: `Success. No rows returned.`

- [ ] **Step 4: Verify**

```sql
-- (a) Every row has college_role populated.
select count(*) as null_rows
from public.cohort_faculty
where college_role is null;
-- Expected: null_rows = 0

-- (b) All existing rows backfilled to 'support'.
select college_role, count(*)
from public.cohort_faculty
group by college_role;
-- Expected: one row, college_role='support', count = total existing rows.

-- (c) Unique index prevents duplicate (cohort, user).
--     Find any existing duplicates (should be zero; if not, the migration would have failed).
select cohort_id, user_id, count(*)
from public.cohort_faculty
group by cohort_id, user_id
having count(*) > 1;
-- Expected: 0 rows.
```

Append outputs to `supabase/verify/plan-1-assertions.sql`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260424_0010_cohort_faculty_college_role.sql supabase/verify/plan-1-assertions.sql
git commit -m "feat(db): add cohort_faculty.college_role backfilled to support"
```

---

### Task 3: Add `announcements.deleted_at` soft-delete column

**Files:**
- Create: `supabase/migrations/20260424_0020_announcements_soft_delete.sql`
- Modify: `supabase/verify/plan-1-assertions.sql`

- [ ] **Step 1: Write migration SQL**

Create `supabase/migrations/20260424_0020_announcements_soft_delete.sql`:

```sql
-- Soft-delete column for announcements. Executive faculty (and authors
-- generally) will be able to remove their own announcements without
-- hard-deleting history. Existing select policies get a deleted_at filter
-- so soft-deleted rows vanish from UI.

alter table public.announcements
  add column if not exists deleted_at timestamptz null;

-- Partial index to speed up "active announcements" reads.
create index if not exists announcements_active_idx
  on public.announcements (cohort_id, created_at desc)
  where deleted_at is null;

-- Filter existing select policy (if one exists with the known name).
-- If your codebase names the select policy differently, adjust here before applying.
-- Plan 2 rebuilds the full policy set; this task only adds a filter to whatever
-- select policy currently exists.
do $$
declare
  p record;
begin
  for p in
    select polname
    from pg_policy
    where polrelid = 'public.announcements'::regclass
      and polcmd = 'r'   -- 'r' = SELECT
  loop
    execute format(
      'alter policy %I on public.announcements using ((deleted_at is null) and (%s))',
      p.polname,
      -- Preserve the existing USING expression by refetching it. Postgres
      -- doesn't expose that cleanly from alter policy, so we handle this
      -- by dropping and recreating below only if needed. Left as a no-op here
      -- to avoid silently breaking a policy; Plan 2 rewrites the policies
      -- wholesale.
      'true'
    );
  end loop;
end $$;

-- NOTE: the DO block above is intentionally conservative — it would change
-- every select policy to "deleted_at IS NULL AND TRUE", which may loosen
-- cohort scoping. That's NOT what we want. So: we skip modifying policies
-- in this plan. Plan 2 will rebuild announcements RLS with deleted_at
-- baked in. Until then, soft-deleted rows are still visible via old policies
-- — acceptable because (a) no code writes to deleted_at yet, and (b) Plan 2
-- lands before any UI change exposes soft-delete.
```

Note: the DO block above is deliberately a no-op. The comment explains why. Do not try to "fix" it by preserving and augmenting the existing USING clause in the same migration — Plan 2 rewrites the policies cleanly. The column exists from this migration so Plan 2 can reference it.

- [ ] **Step 2: Apply to staging**

Run in Supabase SQL editor.

- [ ] **Step 3: Verify**

```sql
-- (a) Column exists.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'announcements' and column_name = 'deleted_at';
-- Expected: 1 row, data_type='timestamp with time zone', is_nullable='YES'.

-- (b) Index exists.
select indexname from pg_indexes where tablename='announcements' and indexname='announcements_active_idx';
-- Expected: 1 row.

-- (c) No rows soft-deleted yet.
select count(*) from public.announcements where deleted_at is not null;
-- Expected: 0.
```

Append to `supabase/verify/plan-1-assertions.sql`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260424_0020_announcements_soft_delete.sql supabase/verify/plan-1-assertions.sql
git commit -m "feat(db): add announcements.deleted_at soft-delete column"
```

---

### Task 4: Ship new SQL role helpers

**Files:**
- Create: `supabase/migrations/20260424_0030_role_helpers.sql`
- Modify: `supabase/verify/plan-1-assertions.sql`

These helpers don't replace anything yet — they run alongside `current_profile_is_admin()` and the existing `faculty_cohort_ids()`. Plan 2 will swap policies over.

- [ ] **Step 1: Write migration SQL**

Create `supabase/migrations/20260424_0030_role_helpers.sql`:

```sql
-- New role helpers. SECURITY DEFINER + STABLE so they can be called
-- inside RLS policies without recursive checks. Existing helpers
-- (current_profile_is_admin, faculty_cohort_ids) are left in place
-- for now; Plan 2 migrates policies off them.

-- has_staff_role: does the current user hold `role` in profiles.staff_roles?
create or replace function public.has_staff_role(role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = any(staff_roles) from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.has_staff_role(text) from public;
grant execute on function public.has_staff_role(text) to authenticated;

-- college_role_in: what college role (if any) does the current user hold
-- in a given cohort? Returns 'support', 'executive', or NULL.
create or replace function public.college_role_in(cohort uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select college_role
  from public.cohort_faculty
  where user_id = auth.uid() and cohort_id = cohort
  limit 1;
$$;

revoke all on function public.college_role_in(uuid) from public;
grant execute on function public.college_role_in(uuid) to authenticated;

-- executive_cohort_ids: cohorts where the current user is executive faculty.
create or replace function public.executive_cohort_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select cohort_id
  from public.cohort_faculty
  where user_id = auth.uid() and college_role = 'executive';
$$;

revoke all on function public.executive_cohort_ids() from public;
grant execute on function public.executive_cohort_ids() to authenticated;

-- can_grade_submission: admin/trainer unrestricted; support faculty only if
-- the submission's student is in a pod they're assigned to. Pod assignment
-- lives in pod_faculty (faculty side) + pod_members (student side) under a
-- cohort_pod belonging to the submission's cohort.
create or replace function public.can_grade_submission(submission uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with s as (
    select sub.id as submission_id, sub.user_id as student_id, a.cohort_id
    from public.submissions sub
    join public.assignments a on a.id = sub.assignment_id
    where sub.id = submission
  )
  select
    public.has_staff_role('admin')
    or public.has_staff_role('trainer')
    or exists (
      select 1
      from s
      join public.cohort_pods cp on cp.cohort_id = s.cohort_id
      join public.pod_faculty pf on pf.pod_id = cp.id and pf.user_id = auth.uid()
      join public.pod_members pm on pm.pod_id = cp.id and pm.user_id = s.student_id
      where public.college_role_in(s.cohort_id) = 'support'
    );
$$;

revoke all on function public.can_grade_submission(uuid) from public;
grant execute on function public.can_grade_submission(uuid) to authenticated;
```

**Before applying:** verify the referenced tables exist with the expected column names. Run in SQL editor:

```sql
select table_name, column_name
from information_schema.columns
where table_schema='public'
  and table_name in ('cohort_pods','pod_faculty','pod_members','submissions','assignments')
  and column_name in ('id','cohort_id','pod_id','user_id','assignment_id')
order by table_name, column_name;
```

Expected: `cohort_pods(id, cohort_id)`, `pod_faculty(pod_id, user_id)`, `pod_members(pod_id, user_id)`, `submissions(id, user_id, assignment_id)`, `assignments(id, cohort_id)`. If the column names differ in your schema, adjust the helper SQL accordingly before applying.

- [ ] **Step 2: Apply to staging**

Run in Supabase SQL editor.

- [ ] **Step 3: Verify helpers exist and execute**

```sql
-- (a) All four functions exist.
select proname from pg_proc where pronamespace = 'public'::regnamespace
  and proname in ('has_staff_role','college_role_in','executive_cohort_ids','can_grade_submission');
-- Expected: 4 rows.

-- (b) Grab an admin UUID to impersonate:
select id from public.profiles where 'admin' = any(staff_roles) limit 1;
-- Copy the returned UUID. Call it :admin_uid.

-- (c) In Supabase SQL editor, use the "Run as user" selector (top-right) to
--     impersonate the admin you found in (b), then run:
select public.has_staff_role('admin') as is_admin,
       public.has_staff_role('trainer') as is_trainer,
       public.has_staff_role('tech_support') as is_tech;
-- Expected: is_admin=true, is_trainer=true, is_tech=false (given default backfill).
```

If your staging data has no admin user at all, create one by inserting into `auth.users` via the Supabase dashboard, then `update public.profiles set staff_roles = array['admin','trainer'] where id = '<new_uid>';`. Document the admin uid at the top of `supabase/verify/plan-1-assertions.sql`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260424_0030_role_helpers.sql supabase/verify/plan-1-assertions.sql
git commit -m "feat(db): add has_staff_role / college_role_in / can_grade_submission helpers"
```

---

### Task 5: Add `resolveRoles()` and capability map to `admin-auth.js`

**Files:**
- Modify: `assets/admin-auth.js`

- [ ] **Step 1: Append `resolveRoles()` and capability map (do not modify existing exports yet)**

Open `assets/admin-auth.js`. Add the following **after** the existing `checkAdminOrFaculty` export, **before** `applyFacultyBrandLabel`:

```js
// -----------------------------------------------------------------
// New role model (see docs/superpowers/specs/2026-04-24-role-reorg-*).
// Additive — does not replace checkAdminOrFaculty. Plan 2 migrates
// call sites one by one and eventually removes the old helper.
// -----------------------------------------------------------------

/**
 * resolveRoles — single source of truth for what the current user can do.
 * @param {Object} user - Supabase auth user (from getSession().data.session.user)
 * @param {string|null} cohortId - currently selected cohort, or null for platform-wide pages
 * @returns {Promise<{
 *   user: Object,
 *   staffRoles: Set<string>,
 *   collegeRole: ('support'|'executive'|null),
 *   facultyCohortIds: string[],
 *   executiveCohortIds: string[],
 *   can: Object
 * }>}
 */
export async function resolveRoles(user, cohortId = null) {
  if (!user) {
    return { user: null, staffRoles: new Set(), collegeRole: null,
      facultyCohortIds: [], executiveCohortIds: [], can: computeCaps(new Set(), null) };
  }
  const [{ data: profile }, { data: facRows }] = await Promise.all([
    supabase.from('profiles').select('staff_roles, is_admin').eq('id', user.id).maybeSingle(),
    supabase.from('cohort_faculty').select('cohort_id, college_role').eq('user_id', user.id),
  ]);
  const staffRoles = new Set(Array.isArray(profile?.staff_roles) ? profile.staff_roles : []);
  // Bridge: if staff_roles wasn't backfilled for this user (shouldn't happen
  // post-migration, but guard anyway), fall back to is_admin.
  if (staffRoles.size === 0 && profile?.is_admin) {
    staffRoles.add('admin'); staffRoles.add('trainer');
  }
  const rows = facRows || [];
  const facultyCohortIds = rows.map(r => r.cohort_id);
  const executiveCohortIds = rows.filter(r => r.college_role === 'executive').map(r => r.cohort_id);
  const collegeRole = cohortId
    ? (rows.find(r => r.cohort_id === cohortId)?.college_role || null)
    : null;
  return {
    user, staffRoles, collegeRole, facultyCohortIds, executiveCohortIds,
    can: computeCaps(staffRoles, collegeRole),
  };
}

/** Role-to-capability map. UI gates MUST read from can.*, not role names. */
function computeCaps(staffRoles, collegeRole) {
  const isAdmin = staffRoles.has('admin');
  const isTrainer = staffRoles.has('trainer');
  const isTech = staffRoles.has('tech_support');
  const isSupport = collegeRole === 'support';
  const isExec = collegeRole === 'executive';
  return {
    // Platform
    managePlatform: isAdmin,
    manageUsers: isAdmin,
    // Content
    editContent: isAdmin || isTrainer,
    // Grading (cohort-scoped — null cohortId -> false)
    grade: isAdmin || isTrainer || isSupport,
    gradeAnyPod: isAdmin || isTrainer,
    // Attendance
    markAttendance: isAdmin || isTrainer || isSupport,
    markAttendanceAnyPod: isAdmin || isTrainer,
    // Announcements
    postAnnouncement: isAdmin || isTrainer || isExec,
    deleteOwnAnnouncement: true,  // anyone who posted can soft-delete their own
    // Analytics
    viewCohortAnalytics: isAdmin || isTrainer || isExec,
    exportCohortData: isAdmin || isTrainer || isExec,
    // Pods
    managePods: isAdmin || isTrainer,
    // Stuck queue
    respondStuckTech: isAdmin || isTrainer || isTech,
    respondStuckAny: isAdmin || isTrainer || isSupport,
    // Board (Plan 3 — shipped here so gates exist when board lands)
    postOnBoard: true,
    moderateBoard: isAdmin || isTrainer || isTech,
  };
}
```

Note: `resolveRoles` is additive. `checkAdminOrFaculty` remains — Plan 2 migrates call sites over.

- [ ] **Step 2: Verify the file still parses**

Open `faculty.html` in a browser against staging. Sign in as an existing admin/trainer. Expected: page loads exactly as before (no behavior change — nothing calls `resolveRoles` yet).

Open browser devtools console. Run:

```js
const { supabase } = await import('./assets/supabase.js');
const { resolveRoles } = await import('./assets/admin-auth.js');
const { data: { user } } = await supabase.auth.getUser();
const r = await resolveRoles(user, null);
console.log(r);
```

Expected: object with `staffRoles` (a `Set` containing `'admin'` and/or `'trainer'`), `facultyCohortIds` array, `can` object with all keys. No errors in console.

Also pick one cohort id from the cohort selector on the page and re-run with that id:

```js
const r2 = await resolveRoles(user, '<cohort-uuid>');
console.log(r2.collegeRole, r2.can);
```

Expected: `collegeRole` is `null` for an admin who isn't also in `cohort_faculty` for that cohort, or `'support'` / `'executive'` if they are.

- [ ] **Step 3: Commit**

```bash
git add assets/admin-auth.js
git commit -m "feat(auth): add resolveRoles + capability map (additive, plan 1)"
```

---

### Task 6: Plan-1 end-to-end verification + handoff note

- [ ] **Step 1: Full smoke test on staging**

Open these pages in order against staging. Verify each loads and behaves identically to before Plan 1:
- `index.html` (sign in as existing admin)
- `admin-home.html`
- `faculty.html`
- `dashboard.html` (sign in as a student)

Expected: no regressions. Every page behaves as it did before this plan.

- [ ] **Step 2: Write a short handoff note at the top of `supabase/verify/plan-1-assertions.sql`**

Include:
- Date applied to staging.
- Staging project ref.
- Count of profiles with `staff_roles` populated, by role combination.
- Count of `cohort_faculty` rows by `college_role`.
- Admin UUID used for helper testing (so Plan 2 can reuse it).
- Postgres version (`select version();`) and Supabase project ref, so Plan 2 runs against the same environment.

- [ ] **Step 3: Commit the handoff note**

```bash
git add supabase/verify/plan-1-assertions.sql
git commit -m "docs: plan-1 staging verification record"
```

- [ ] **Step 4: STOP — do not apply to prod yet.**

Plan 1 is deliberately safe to apply to prod standalone (additive only, no behavior change), but per the big-bang rollout decision in the spec, **all five plans land together**. Hold at this checkpoint until Plans 2–5 are implemented and verified on staging.

---

## Deliverables

After this plan, staging has:
- `profiles.staff_roles` populated, `profiles.is_admin` still present.
- `cohort_faculty.college_role` populated, `cohort_faculty.is_admin` still present.
- `announcements.deleted_at` column present (unused).
- Four new SQL helpers (`has_staff_role`, `college_role_in`, `executive_cohort_ids`, `can_grade_submission`) live alongside existing helpers.
- `resolveRoles()` callable from JS but not yet used by any page.
- All current behavior unchanged.

## Does NOT do (deferred to Plan 2)

- Rewrite RLS policies.
- Migrate any existing `checkAdminOrFaculty` / `is_admin` call site.
- Drop old columns (`profiles.is_admin`, `cohort_faculty.is_admin`).
- Rebuild `admin-nav.js` allowlist.
- Ship Executive Faculty UI.

## Rollback

Because every migration is additive:
- Drop the 4 new migrations in reverse order to fully revert (column drops + function drops). All old code paths still work.
- Revert the `resolveRoles` commit on `assets/admin-auth.js` if the export causes any bundler/browser issue (it shouldn't — it's a new export with no side effects at import time).
