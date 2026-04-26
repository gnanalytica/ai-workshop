-- =============================================================================
-- 0016_security_hardening.sql
--   - Flip the four reporting views to security_invoker so they honor the
--     caller's RLS instead of running as their owner.
--   - Pin search_path on three legacy functions to prevent search_path hijack.
-- =============================================================================

alter view public.v_cohort_summary  set (security_invoker = on);
alter view public.v_pod_summary     set (security_invoker = on);
alter view public.v_student_progress set (security_invoker = on);
alter view public.v_stuck_open      set (security_invoker = on);

alter function public.current_user_id()        set search_path = public;
alter function public.set_updated_at()         set search_path = public;
alter function public.pod_members_check_cohort() set search_path = public;
