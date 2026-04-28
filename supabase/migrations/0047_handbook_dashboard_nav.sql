-- =============================================================================
-- 0047_handbook_dashboard_nav.sql
-- Add a fourth handbook category for the dashboard-navigation tab. The page
-- renders the interactive guide launcher when this tab is active rather than
-- a list of modules — but the enum stays open so we can author optional
-- supplementary modules later.
--
-- Also reorganizes existing modules:
--   - "platform-tour" and "platform_faculty" move from non_technical/technical
--     to dashboard_nav (they were the written stand-ins for the now-interactive
--     tour).
--   - "observing-grades" is dropped — it told faculty they don't grade, but
--     post-0019/0022 they have grading.write:pod and DO grade their pod.
--   - Stale duplicate ordinals get renumbered.
-- =============================================================================

alter type handbook_category add value if not exists 'dashboard_nav';

-- The new enum value can't be used in the same transaction it's added in
-- (Postgres restriction), so the data updates run in 0048.
