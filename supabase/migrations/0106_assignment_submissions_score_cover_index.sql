-- Performance fix for v_student_score / v_pod_score_summary
--
-- These views were hitting the 8-second PostgREST statement timeout under
-- normal cohort load (causing intermittent 5xx on dashboard + leaderboard
-- + pulse). EXPLAIN ANALYZE showed the slowest step was a Seq Scan on
-- assignment_submissions reading (user_id, assignment_id, score, ai_score)
-- for the submission_score aggregate.
--
-- A covering index converts that into an Index Only Scan. Measured impact
-- on v_student_score for the live cohort:
--   Before: 26,659 ms (planner picked seq scan, heap-fetch heavy)
--   After ANALYZE + VACUUM: ~4,500 ms
--   After this index: ~159 ms
-- v_pod_score_summary dropped from ~7,900 ms to ~39 ms via the same path.

create index if not exists assignment_submissions_score_cover_idx
  on public.assignment_submissions (user_id, assignment_id)
  include (score, ai_score);
