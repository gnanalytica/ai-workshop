---
name: new-migration
description: Scaffold a new Supabase migration file in supabase/migrations/ with the correct numbering and the conventions this repo enforces (RLS, security_invoker views, drop-policy-if-exists, type-swap dependency drops). Use when the user asks for "a new migration" or types /new-migration.
---

# New migration

Create a new file at `supabase/migrations/NNNN_<description>.sql` where:

1. **NNNN** is the next sequential 4-digit number (1 + the highest existing
   number under `supabase/migrations/`). Discover it with:
   ```bash
   ls supabase/migrations/ | grep -oE '^[0-9]{4}' | sort -n | tail -1
   ```

2. **`<description>`** is a short snake_case slug the user provided. If they
   didn't, ask once.

## File template

Start with the header from `template.sql` next to this skill, then fill in the
sections that apply. **Delete sections that don't apply** — don't ship empty
boilerplate.

## Repo rules (non-negotiable)

These are the gotchas this repo has hit before. Encode every one:

- **Re-runnability.** Use `create table if not exists`, `add column if not
  exists`, `drop policy if exists` before every `create policy`, `drop trigger
  if exists` before `create trigger`.
- **RLS.** Every new table in `public` must:
  ```sql
  alter table <name> enable row level security;
  ```
  Then add policies that route through `has_cap()` / `is_enrolled_in()` /
  `can_grade()` — never hand-rolled role math.
- **Views.** Every new view must be `security_invoker = on`:
  ```sql
  create view <name> with (security_invoker = on) as ...
  ```
  When using `create or replace view`, follow with
  `alter view <name> set (security_invoker = on);`.
- **Grants.** Every new table needs an explicit grant to `authenticated`:
  ```sql
  grant select, insert, update on <name> to authenticated;
  ```
  Match the verbs to actual access — don't blanket-grant.
- **Triggers.** Use the existing `set_updated_at()` helper for
  `updated_at timestamptz`. Pattern:
  ```sql
  drop trigger if exists trg_<table>_updated on <table>;
  create trigger trg_<table>_updated
    before update on <table>
    for each row execute function set_updated_at();
  ```

## Type-swap recipe (critical)

If the migration alters an enum that any view, rule, or policy depends on,
Postgres will refuse the alter with `cannot alter type of a column used by a
view or rule` / `policy ... depends on column`.

The recipe: **drop dependents → swap type → recreate dependents**, all in the
same migration. Concrete pattern:

```sql
-- 1. Drop dependent views.
drop view if exists v_student_score;
drop view if exists v_student_progress;

-- 2. Drop dependent policies.
drop policy if exists subs_self_update on submissions;

-- 3. Drop column default before alter (enums can't coerce a default mid-swap).
alter table submissions alter column status drop default;

-- 4. Rename old type aside, create new, alter column, drop old.
alter type submission_status rename to submission_status_old;
create type submission_status as enum ('draft', 'submitted', 'graded');
alter table submissions
  alter column status type submission_status using status::text::submission_status;
alter table submissions alter column status set default 'draft';
drop type submission_status_old;

-- 5. Recreate policies (with the new type).
create policy subs_self_update on submissions ...;

-- 6. Recreate views (with security_invoker = on).
create view v_student_progress with (security_invoker = on) as ...;
```

To find what depends on a column before writing the migration:
```sql
select distinct dv.relname as view_name
  from pg_depend d
  join pg_rewrite r on r.oid = d.objid
  join pg_class dv on dv.oid = r.ev_class
  join pg_class src on src.oid = d.refobjid
  join pg_attribute a on a.attrelid = d.refobjid and a.attnum = d.refobjsubid
 where src.relname = '<table>' and a.attname = '<column>';
```

## After writing the migration

1. Suggest the user apply it. Two paths:
   - **Production-style** (preferred):
     `psql "$DB_URL" -f supabase/migrations/NNNN_<name>.sql`
   - **Via Supabase MCP**:
     `mcp__plugin_supabase_supabase__apply_migration` with the file content
     and `name = "<description>"` (snake_case, no number prefix).
2. Run the RBAC spec to catch policy regressions:
   `psql "$DB_URL" -f supabase/tests/rbac.sql` — look for `WARNING FAIL` lines.
3. After applying, run `mcp__plugin_supabase_supabase__get_advisors` with
   `type=security` to catch missed `security_invoker`, search_path issues, etc.
4. Suggest dispatching the `rls-reviewer` subagent for a structured pre-merge
   review of the migration.

## What NOT to do

- Do not edit a migration that's already been applied to any environment.
  Make a new migration that supersedes it instead.
- Do not use `apply_migration` to iterate locally — it writes a history entry
  every call. Use `execute_sql` to iterate, then write the final SQL into a
  migration file once it works.
- Do not embed dynamic UUIDs / timestamps into seed migrations — use stable
  UUIDs (the `99999999-...` family is reserved for the demo cohort).
