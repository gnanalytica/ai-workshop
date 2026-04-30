# Migrations

Numbered `NNNN_description.sql`, applied in order. Each file is a single
transaction; all-or-nothing.

**Cutover, ordering, and rollback procedures live in `RUNBOOK.md` §
Day-2 ops → Deploying Schema Changes.** Read that before applying anything to
a non-local environment.

**RBAC spec** lives at `supabase/tests/rbac.sql` — re-run it after touching
helpers or policies (`psql "$DB_URL" -f supabase/tests/rbac.sql`, look for
`WARNING FAIL`).

**Scaffolding new migrations** — invoke `/new-migration` (skill in
`.claude/skills/new-migration/`). It encodes the conventions: re-runnable DDL
(`drop policy if exists` before `create policy`, `if not exists` everywhere),
RLS enabled on every public table, `security_invoker = on` on every view, and
the type-swap recipe for altering enums whose columns are referenced by views
or policies.
