-- =============================================================================
-- 0083_drop_lesson_section_progress.sql
--
-- Drop the lesson_section_progress table. Per-section "mark complete" tracking
-- was removed from the lesson reader UI; day completion is now gated solely on
-- day_feedback submission. Migration 0082 added the table; nothing else in the
-- app reads or writes it anymore.
-- =============================================================================

drop policy if exists lsp_self_read   on public.lesson_section_progress;
drop policy if exists lsp_self_insert on public.lesson_section_progress;

drop index if exists public.lesson_section_progress_user_day_idx;

drop table if exists public.lesson_section_progress;
