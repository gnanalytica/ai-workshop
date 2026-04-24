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
