-- =============================================================================
-- 0027_grading_redesign.sql -- Grading is now a deliberate, batch-or-manual
-- staff action. Faculty no longer grade -- they observe for tracking.
--
--   * AI grading is triggered explicitly by trainer/admin (batch run per
--     assignment, see batchGradeAssignment server action).
--   * Manual grading remains available for trainer/admin/tech_support via
--     the same review surface.
--   * Students only see a grade once `human_reviewed_at` is set
--     (publishGrade), so no AI draft leaks before staff reviews it.
--
-- Cap changes:
--   - Drop `grading.write:pod` from faculty bundle.
--   - Add `grading.write:cohort` to tech_support (they help with grading too
--     in this workshop's model).
--
-- Schema:
--   - Drop legacy rpc_grade_submission (replaced by overrideGrade /
--     publishGrade / manualGrade server actions).
-- =============================================================================

drop function if exists rpc_grade_submission(uuid, numeric, text);

-- auth_caps is updated to drop grading.write:pod from faculty and grant
-- grading.write:cohort to tech_support. See companion SQL applied via MCP.
