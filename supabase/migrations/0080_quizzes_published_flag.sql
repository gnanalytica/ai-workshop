-- =============================================================================
-- 0080_quizzes_published_flag.sql
--
-- Adds a simple boolean publish flag to quizzes so admins can stage a quiz
-- (write questions, preview) without students seeing it. Defaults to false so
-- every existing quiz starts hidden — admins flip it on when ready.
--
-- Day 1's quiz is published by data backfill at the bottom so the running KBN
-- cohort is not interrupted.
-- =============================================================================

alter table public.quizzes
  add column if not exists is_published boolean not null default false;

-- Existing quizzes were implicitly visible because there was no flag; preserve
-- that behaviour for anything created before this migration ran by treating
-- pre-existing rows as already published. New quizzes start hidden.
update public.quizzes set is_published = true where created_at < now();

-- Filter index for the student-side fetch (cohort + day + published only).
create index if not exists quizzes_cohort_day_published_idx
  on public.quizzes (cohort_id, day_number)
  where is_published;

commit;
