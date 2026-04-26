-- =============================================================================
-- 0014_grant_supabase_roles.sql  --  Restore Supabase role grants on public.
-- Migrations applied via the migration tool create tables owned by postgres
-- without granting to the application roles (anon, authenticated, service_role).
-- RLS policies are in place, but without the underlying GRANT every query —
-- even from service_role — fails with "permission denied for table".
-- =============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables    in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

-- Future objects inherit the same grants.
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
