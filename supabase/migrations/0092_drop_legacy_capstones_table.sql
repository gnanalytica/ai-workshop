-- 0092_drop_legacy_capstones_table.sql
--
-- Drop the legacy `capstones` table and its `capstone_phase` enum.
--
-- Context: the original schema (0008) introduced a `capstones` table with a
-- `phase` enum (idea/spec/mid/demo/shipped). Migration 0060 replaced it
-- with `capstone_projects` (status enum: exploring/locked/building/shipped)
-- and the app moved over — except for two now-dead surfaces:
--   - /admin/cohorts/[id]/milestones page (just deleted; now redirects)
--   - /showcase page (just migrated to capstone_projects status='shipped')
--
-- The live `capstones` table is empty (0 rows). Dropping it cleans up the
-- schema and removes the source of "two places, same data" confusion.
--
-- Idempotent: uses `drop table if exists` + `drop type if exists`.
-- =============================================================================

begin;

drop table if exists capstones cascade;
drop type  if exists capstone_phase;

commit;
