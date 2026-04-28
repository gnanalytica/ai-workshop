-- =============================================================================
-- 0055_handbook_video_slots.sql
--   Add optional video micro-tutorial slots to handbook modules.
--   Columns are nullable; safe to roll back by dropping them.
-- =============================================================================

alter table faculty_pretraining_modules
  add column if not exists video_url text,
  add column if not exists video_caption text,
  add column if not exists video_thumbnail_url text;
