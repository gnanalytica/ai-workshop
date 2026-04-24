-- Add staff_roles to profiles (Gnanalytica-side roles).
-- Valid elements: 'admin', 'trainer', 'tech_support'.
-- Today's is_admin=true means "trainer with admin powers" (per
-- 20260423_support_faculty_scope.sql header comment), so backfill to
-- both roles to preserve every current permission. Manual demotion of
-- trainer-only users happens post-deploy.

alter table public.profiles
  add column if not exists staff_roles text[] not null default '{}';

-- Constrain element values.
alter table public.profiles
  drop constraint if exists profiles_staff_roles_values_chk;
alter table public.profiles
  add constraint profiles_staff_roles_values_chk
  check (staff_roles <@ array['admin','trainer','tech_support']::text[]);

-- Backfill: is_admin=true → {'admin','trainer'}, otherwise empty.
update public.profiles
  set staff_roles = array['admin','trainer']::text[]
  where coalesce(is_admin, false) = true
    and staff_roles = '{}';

-- Index for lookups like "all trainers" or "all tech support".
create index if not exists profiles_staff_roles_gin_idx
  on public.profiles using gin (staff_roles);
