# Plan 1 — Pods: Migrations, RPCs, RLS

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the database substrate for faculty pods: four new tables, three RPCs, and RLS widening so faculty can read/write across their cohort.

**Architecture:** SQL migrations added under `supabase/migrations/`, applied via Supabase CLI or dashboard SQL editor. Verification is manual via SQL queries against a staging project (this repo has no automated DB tests).

**Tech Stack:** Postgres (Supabase), RLS policies, SECURITY DEFINER RPCs.

**Spec:** `docs/superpowers/specs/2026-04-21-faculty-pods-design.md` — sections "Data model", "Permissions (RLS)".

**Prereq:** Access to the staging Supabase project. The project currently has no `supabase/migrations/` directory — this plan creates it. All migrations are timestamped and applied in order.

---

## Chunk 1: New tables

### Task 1: `cohort_pods` table

**Files:**
- Create: `supabase/migrations/20260421_0100_cohort_pods.sql`

- [ ] **Step 1: Write verification query (should fail — relation does not exist)**

```sql
-- verify.sql
select count(*) from cohort_pods;
```

Run in staging SQL editor. Expected: ERROR `relation "cohort_pods" does not exist`.

- [ ] **Step 2: Write migration**

```sql
-- supabase/migrations/20260421_0100_cohort_pods.sql
create table public.cohort_pods (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  name text not null,
  mentor_note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique (cohort_id, name)
);

alter table public.cohort_pods enable row level security;
```

- [ ] **Step 3: Apply and re-verify**

Apply migration in staging. Re-run `select count(*) from cohort_pods;` → expect `0`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260421_0100_cohort_pods.sql
git commit -m "feat(pods): add cohort_pods table"
```

### Task 2: `pod_faculty` table

**Files:**
- Create: `supabase/migrations/20260421_0110_pod_faculty.sql`

- [ ] **Step 1: Verification query (fails)**

```sql
select count(*) from pod_faculty;
```

- [ ] **Step 2: Write migration**

```sql
create table public.pod_faculty (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references public.cohort_pods(id) on delete cascade,
  faculty_user_id uuid not null references auth.users(id),
  is_primary boolean not null default false,
  contact_note text,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id),
  unique (pod_id, faculty_user_id)
);

create unique index pod_faculty_one_primary
  on public.pod_faculty (pod_id) where is_primary;

alter table public.pod_faculty enable row level security;
```

- [ ] **Step 3: Verify** — `select count(*) from pod_faculty;` → `0`. Then try inserting two `is_primary=true` for same `pod_id` (using a throwaway pod) → expect unique violation.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260421_0110_pod_faculty.sql
git commit -m "feat(pods): add pod_faculty with primary-uniqueness"
```

### Task 3: `pod_members` table + cohort-sync trigger

**Files:**
- Create: `supabase/migrations/20260421_0120_pod_members.sql`

- [ ] **Step 1: Verification** — `select count(*) from pod_members;` (fails).

- [ ] **Step 2: Migration**

```sql
create table public.pod_members (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references public.cohort_pods(id) on delete cascade,
  student_user_id uuid not null references auth.users(id),
  cohort_id uuid not null references public.cohorts(id),
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id),
  unique (pod_id, student_user_id),
  unique (cohort_id, student_user_id)
);

create or replace function public.pod_members_sync_cohort()
returns trigger language plpgsql as $$
begin
  select cohort_id into new.cohort_id from public.cohort_pods where id = new.pod_id;
  if new.cohort_id is null then
    raise exception 'pod % not found', new.pod_id;
  end if;
  return new;
end $$;

create trigger pod_members_cohort_sync
  before insert or update of pod_id on public.pod_members
  for each row execute function public.pod_members_sync_cohort();

alter table public.pod_members enable row level security;
```

- [ ] **Step 3: Verify** — insert same `(cohort_id, student_user_id)` twice across different pods; expect unique violation on the second.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260421_0120_pod_members.sql
git commit -m "feat(pods): add pod_members with per-cohort uniqueness"
```

### Task 4: `pod_faculty_events` audit table

**Files:**
- Create: `supabase/migrations/20260421_0130_pod_faculty_events.sql`

- [ ] **Step 1: Verification** — `select count(*) from pod_faculty_events;` (fails).

- [ ] **Step 2: Migration**

```sql
create table public.pod_faculty_events (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references public.cohort_pods(id) on delete cascade,
  from_user_id uuid references auth.users(id),
  to_user_id uuid references auth.users(id),
  kind text not null check (kind in ('added','removed','handoff','primary_transfer')),
  note text,
  at timestamptz not null default now(),
  actor_user_id uuid references auth.users(id)
);

create index pod_faculty_events_pod_at on public.pod_faculty_events (pod_id, at desc);
alter table public.pod_faculty_events enable row level security;
```

- [ ] **Step 3: Verify** — `select count(*)` = 0. Try inserting `kind='foo'` → check constraint violation.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260421_0130_pod_faculty_events.sql
git commit -m "feat(pods): add pod_faculty_events audit table"
```

---

## Chunk 2: RPCs

### Task 5: `faculty_cohort_ids()` helper

**Files:**
- Create: `supabase/migrations/20260421_0200_rpc_faculty_cohort_ids.sql`

- [ ] **Step 1: Migration**

```sql
create or replace function public.faculty_cohort_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select cohort_id from public.cohort_faculty where user_id = auth.uid();
$$;

grant execute on function public.faculty_cohort_ids() to authenticated;
```

- [ ] **Step 2: Verify** — signed in as a known faculty (via Supabase dashboard "Impersonate user" or the app), run `select * from faculty_cohort_ids();` → returns that faculty's cohort rows.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260421_0200_rpc_faculty_cohort_ids.sql
git commit -m "feat(pods): add faculty_cohort_ids() RPC helper"
```

### Task 6: `my_pod(cohort uuid)` RPC for students

**Files:**
- Create: `supabase/migrations/20260421_0210_rpc_my_pod.sql`

- [ ] **Step 1: Migration**

```sql
create or replace function public.my_pod(p_cohort uuid)
returns table (
  pod_id uuid,
  pod_name text,
  mentor_note text,
  faculty jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  with m as (
    select pm.pod_id
    from public.pod_members pm
    where pm.student_user_id = auth.uid() and pm.cohort_id = p_cohort
    limit 1
  ),
  f as (
    select pf.pod_id,
           jsonb_agg(
             jsonb_build_object(
               'user_id', pf.faculty_user_id,
               'is_primary', pf.is_primary,
               'contact_note', pf.contact_note,
               'full_name', p.full_name,
               'college', p.college,
               'avatar_url', p.avatar_url
             )
             order by pf.is_primary desc, p.full_name
           ) as faculty
    from public.pod_faculty pf
    join public.profiles p on p.id = pf.faculty_user_id
    where pf.pod_id in (select pod_id from m)
    group by pf.pod_id
  )
  select cp.id, cp.name, cp.mentor_note, coalesce(f.faculty, '[]'::jsonb)
  from public.cohort_pods cp
  join m on m.pod_id = cp.id
  left join f on f.pod_id = cp.id;
$$;

grant execute on function public.my_pod(uuid) to authenticated;
```

Note: assumes `profiles.avatar_url` exists. If not, drop that field from the JSON; confirm with `\d profiles` in staging before applying.

- [ ] **Step 2: Verify** — as a student in a pod: `select * from my_pod('<cohort-uuid>');` → returns one row. As a student not in a pod: returns 0 rows.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260421_0210_rpc_my_pod.sql
git commit -m "feat(pods): add my_pod() RPC for students"
```

### Task 7: `rpc_pod_faculty_event` for atomic handoff/add/remove

**Files:**
- Create: `supabase/migrations/20260421_0220_rpc_pod_faculty_event.sql`

- [ ] **Step 1: Migration**

```sql
create or replace function public.rpc_pod_faculty_event(
  p_pod_id uuid,
  p_kind text,
  p_from_user_id uuid default null,
  p_to_user_id uuid default null,
  p_note text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cohort_id uuid;
  v_is_admin boolean;
  v_is_cohort_faculty boolean;
begin
  select cohort_id into v_cohort_id from public.cohort_pods where id = p_pod_id;
  if v_cohort_id is null then raise exception 'pod not found'; end if;

  select coalesce(is_admin, false) into v_is_admin from public.profiles where id = auth.uid();
  select exists(select 1 from public.cohort_faculty where user_id = auth.uid() and cohort_id = v_cohort_id)
    into v_is_cohort_faculty;

  if not (v_is_admin or v_is_cohort_faculty) then
    raise exception 'not permitted';
  end if;

  if p_to_user_id is not null and not exists(
    select 1 from public.cohort_faculty where user_id = p_to_user_id and cohort_id = v_cohort_id
  ) then
    raise exception 'target user is not faculty on this cohort';
  end if;

  if p_kind = 'added' then
    insert into public.pod_faculty (pod_id, faculty_user_id, assigned_by)
    values (p_pod_id, p_to_user_id, auth.uid())
    on conflict (pod_id, faculty_user_id) do nothing;

  elsif p_kind = 'removed' then
    delete from public.pod_faculty where pod_id = p_pod_id and faculty_user_id = p_from_user_id;

  elsif p_kind = 'primary_transfer' then
    update public.pod_faculty set is_primary = false where pod_id = p_pod_id;
    insert into public.pod_faculty (pod_id, faculty_user_id, is_primary, assigned_by)
    values (p_pod_id, p_to_user_id, true, auth.uid())
    on conflict (pod_id, faculty_user_id) do update set is_primary = true;

  elsif p_kind = 'handoff' then
    -- transfer primary to new; optionally remove old
    update public.pod_faculty set is_primary = false where pod_id = p_pod_id;
    insert into public.pod_faculty (pod_id, faculty_user_id, is_primary, assigned_by)
    values (p_pod_id, p_to_user_id, true, auth.uid())
    on conflict (pod_id, faculty_user_id) do update set is_primary = true;
    if p_from_user_id is not null and p_from_user_id <> p_to_user_id then
      delete from public.pod_faculty where pod_id = p_pod_id and faculty_user_id = p_from_user_id;
    end if;

  else
    raise exception 'unknown kind %', p_kind;
  end if;

  insert into public.pod_faculty_events (pod_id, from_user_id, to_user_id, kind, note, actor_user_id)
  values (p_pod_id, p_from_user_id, p_to_user_id, p_kind, p_note, auth.uid());
end $$;

grant execute on function public.rpc_pod_faculty_event(uuid, text, uuid, uuid, text) to authenticated;
```

- [ ] **Step 2: Verify** — create a throwaway pod with faculty A; call `rpc_pod_faculty_event(pod, 'handoff', A, B, 'test')`. Confirm `pod_faculty` now has B primary, A removed; `pod_faculty_events` has one row.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260421_0220_rpc_pod_faculty_event.sql
git commit -m "feat(pods): add rpc_pod_faculty_event for atomic mutations"
```

---

## Chunk 3: RLS policies

### Task 8: Policies on new tables

**Files:**
- Create: `supabase/migrations/20260421_0300_pods_rls.sql`

- [ ] **Step 1: Migration**

```sql
-- cohort_pods
create policy cohort_pods_admin on public.cohort_pods
  for all to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy cohort_pods_faculty_read on public.cohort_pods
  for select to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()));

-- pod_faculty
create policy pod_faculty_admin on public.pod_faculty
  for all to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy pod_faculty_read on public.pod_faculty
  for select to authenticated
  using (
    exists(
      select 1 from public.cohort_pods cp
      where cp.id = pod_faculty.pod_id
        and cp.cohort_id in (select public.faculty_cohort_ids())
    )
  );

create policy pod_faculty_self_remove on public.pod_faculty
  for delete to authenticated
  using (faculty_user_id = auth.uid());

-- pod_members
create policy pod_members_admin on public.pod_members
  for all to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy pod_members_faculty_read on public.pod_members
  for select to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()));

create policy pod_members_self_read on public.pod_members
  for select to authenticated
  using (student_user_id = auth.uid());

-- pod_faculty_events
create policy pod_faculty_events_read on public.pod_faculty_events
  for select to authenticated
  using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
    or exists(
      select 1 from public.cohort_pods cp
      where cp.id = pod_faculty_events.pod_id
        and cp.cohort_id in (select public.faculty_cohort_ids())
    )
  );
-- No INSERT/UPDATE/DELETE policy: only the SECURITY DEFINER RPC writes.
```

- [ ] **Step 2: Verify** — sign in as faculty: `select * from cohort_pods;` returns only their cohorts' pods. Sign in as unrelated authenticated user: returns 0. Admin: all rows.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260421_0300_pods_rls.sql
git commit -m "feat(pods): RLS for pod tables"
```

### Task 9: Widen RLS on existing tables

**Files:**
- Create: `supabase/migrations/20260421_0310_widen_faculty_rls.sql`

Before writing: inspect existing policies in staging:

```sql
select tablename, policyname, cmd, qual, with_check
from pg_policies
where tablename in ('profiles','submissions','peer_reviews','stuck_queue','attendance','day_progress')
order by tablename, policyname;
```

- [ ] **Step 1: Audit current policies**

For each of the above tables, note whether a faculty-cohort read/write policy already exists. The widening policy only needs to be added where missing.

- [ ] **Step 2: Write conditional migration**

```sql
-- Add faculty-cohort-scoped read/write where the table has a cohort_id column.
-- Uses faculty_cohort_ids() helper. Skip tables that already have equivalent policies.

-- Example: submissions (adapt column name if different)
create policy if not exists submissions_faculty_cohort_rw on public.submissions
  for all to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()))
  with check (cohort_id in (select public.faculty_cohort_ids()));

-- stuck_queue
create policy if not exists stuck_queue_faculty_cohort_rw on public.stuck_queue
  for all to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()))
  with check (cohort_id in (select public.faculty_cohort_ids()));

-- attendance
create policy if not exists attendance_faculty_cohort_rw on public.attendance
  for all to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()))
  with check (cohort_id in (select public.faculty_cohort_ids()));

-- day_progress (table may be named differently; e.g., day_completions)
-- Confirm name before applying.

-- profiles: faculty can SELECT profiles of students in their cohorts.
-- Assumes enrollments(user_id, cohort_id) join.
create policy if not exists profiles_faculty_cohort_read on public.profiles
  for select to authenticated
  using (
    exists(
      select 1 from public.enrollments e
      where e.user_id = profiles.id
        and e.cohort_id in (select public.faculty_cohort_ids())
    )
  );

-- peer_reviews: mirror submissions.
create policy if not exists peer_reviews_faculty_cohort_rw on public.peer_reviews
  for all to authenticated
  using (cohort_id in (select public.faculty_cohort_ids()))
  with check (cohort_id in (select public.faculty_cohort_ids()));
```

**Important:** adjust table/column names to match actual schema. Run the audit in Step 1 first and edit this migration to match.

- [ ] **Step 3: Verify** — as a faculty user, `select * from submissions` returns only their cohort's submissions; `update submissions set grade = … where id = …` on a cohort submission succeeds.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260421_0310_widen_faculty_rls.sql
git commit -m "feat(pods): widen faculty RLS across cohort-scoped tables"
```

---

## Chunk 4: Integration check

### Task 10: End-to-end DB check

- [ ] **Step 1:** In staging, create a cohort with 3 faculty and 10 enrolled students (reuse existing admin UI).

- [ ] **Step 2:** Insert rows directly:

```sql
-- as admin
insert into cohort_pods (cohort_id, name, created_by) values ('<cohort>', 'Pod A', auth.uid()) returning id;
-- use returned id
insert into pod_faculty (pod_id, faculty_user_id, is_primary, assigned_by) values ('<pod>', '<faculty-A>', true, auth.uid());
insert into pod_members (pod_id, student_user_id, assigned_by) values ('<pod>', '<student-1>', auth.uid());
```

- [ ] **Step 3:** As student 1: `select * from my_pod('<cohort>');` returns one row with faculty array.

- [ ] **Step 4:** As faculty A: call `rpc_pod_faculty_event(<pod>, 'handoff', '<faculty-A>', '<faculty-B>', 'cover')`. Verify swap + audit row.

- [ ] **Step 5:** As faculty B: `select * from pod_members;` returns the student. `update submissions set grade = …` on a cohort submission succeeds.

- [ ] **Step 6:** No commit — this is a manual verification gate. If any check fails, fix the relevant migration before proceeding to Plan 2.
