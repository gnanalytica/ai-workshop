-- =============================================================================
-- 0043_security_definer_views_and_trigger_grants.sql
-- Close two pre-existing security advisor findings:
--   1. v_pod_summary and v_student_score were SECURITY DEFINER views (the
--      default), which bypass RLS on the underlying tables. Switching to
--      security_invoker means the view honors the caller's RLS — correct
--      posture for these views since they read RLS-protected base tables.
--   2. handle_new_auth_user is a SECURITY DEFINER function attached to the
--      auth.users insert trigger. It was granted to anon / authenticated by
--      default, exposing it via PostgREST RPC. The trigger fires under the
--      postgres role regardless of these grants, so revoking is safe.
-- =============================================================================

alter view public.v_pod_summary  set (security_invoker = true);
alter view public.v_student_score set (security_invoker = true);

revoke execute on function public.handle_new_auth_user() from anon, authenticated, public;
