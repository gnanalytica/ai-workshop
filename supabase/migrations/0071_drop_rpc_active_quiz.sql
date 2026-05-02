-- =============================================================================
-- 0071_drop_rpc_active_quiz.sql
--
-- Quizzes are async homework, not live moments — the popup/timer model
-- belongs to polls. Drop the rpc_active_quiz RPC introduced in 0070; the
-- closes_at column stays in case we ever want a "due date" semantic
-- (currently always null, harmless). The admin per-question results chart
-- still uses rpc_poll_results / rpc_quiz_results, so those stay.
-- =============================================================================

drop function if exists public.rpc_active_quiz(uuid);
