-- =============================================================================
-- 0100_group_project_submissions.sql
--
-- Group-project assignments: a flag on `assignments` and a nullable `group_name`
-- on `submissions`. Day 11 (Intelligent Data projects) is the first user — each
-- student still submits individually, but enters a group name so faculty can
-- collate per-group when reviewing.
-- =============================================================================

alter table assignments
  add column if not exists is_group_project boolean not null default false;

alter table submissions
  add column if not exists group_name text;
