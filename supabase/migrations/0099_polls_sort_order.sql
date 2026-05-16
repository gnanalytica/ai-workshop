-- =============================================================================
-- 0099_polls_sort_order.sql
--
-- Add an optional sort_order column to polls so admins can pin a deliberate
-- launch sequence in the Drafts tab. Default ordering (when null) still falls
-- back to id so existing data behaves unchanged.
-- =============================================================================

alter table polls
  add column if not exists sort_order int;

-- Helps the drafts query sort by sort_order without a seq scan once populated.
create index if not exists polls_cohort_day_sort_idx
  on polls (cohort_id, day_number, sort_order);
