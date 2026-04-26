-- =============================================================================
-- 0025_pr4_cleanup.sql -- notifications_log.read_at for the mention inbox,
-- and drop two unused tables (day_faculty, peer_reviews) now that the
-- workshop is async-first with no day-leadership and no peer-review system.
-- =============================================================================

alter table notifications_log
  add column if not exists read_at timestamptz;

create index if not exists notifications_log_unread_idx
  on notifications_log (user_id, created_at desc)
  where read_at is null;

drop trigger if exists trg_day_faculty_updated on day_faculty;
drop table if exists day_faculty cascade;
drop table if exists peer_reviews cascade;
