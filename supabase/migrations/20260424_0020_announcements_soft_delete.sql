-- Soft-delete column for announcements. Executive faculty (and authors
-- generally) will be able to remove their own announcements without
-- hard-deleting history.

alter table public.announcements
  add column if not exists deleted_at timestamptz null;

-- Partial index to speed up "active announcements" reads.
create index if not exists announcements_active_idx
  on public.announcements (cohort_id, created_at desc)
  where deleted_at is null;

-- NOTE: this migration intentionally does NOT modify any RLS policy.
-- Plan 2 will rebuild announcements RLS wholesale with `deleted_at IS NULL`
-- baked into the select policy. Until Plan 2 lands, soft-deleted rows are
-- still visible under existing policies — acceptable because (a) no code
-- writes to `deleted_at` yet, and (b) Plan 2 lands before any UI exposes
-- soft-delete. Keeping this migration strictly additive avoids any chance
-- of weakening RLS in the interim.
