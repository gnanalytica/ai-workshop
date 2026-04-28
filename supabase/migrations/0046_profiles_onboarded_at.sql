-- =============================================================================
-- 0046_profiles_onboarded_at.sql
-- Track whether a user has finished the first-login tour. NULL = not yet seen,
-- timestamp = completed (or skipped). The UI checks this on every authed page
-- load to decide whether to mount the tour overlay.
-- =============================================================================

alter table profiles
  add column if not exists onboarded_at timestamptz null;
