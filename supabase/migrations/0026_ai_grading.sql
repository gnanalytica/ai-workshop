-- =============================================================================
-- 0026_ai_grading.sql -- AI is the primary grader. New columns capture the
-- AI's verdict alongside (optional) human override fields.
--
-- Workflow: student submits -> server action calls Claude -> writes ai_score /
-- ai_feedback_md / ai_strengths / ai_weaknesses, sets ai_graded_at + status =
-- 'graded'. Faculty can later edit submissions.score + feedback_md as a manual
-- override; human_reviewed_at records when that happened.
-- =============================================================================

alter table submissions
  add column if not exists ai_graded boolean not null default false,
  add column if not exists ai_score numeric,
  add column if not exists ai_feedback_md text,
  add column if not exists ai_strengths text[] not null default '{}',
  add column if not exists ai_weaknesses text[] not null default '{}',
  add column if not exists ai_graded_at timestamptz,
  add column if not exists human_reviewed_at timestamptz,
  add column if not exists human_reviewer_id uuid references profiles(id) on delete set null;

create index if not exists submissions_ai_graded_idx
  on submissions (ai_graded) where ai_graded;
