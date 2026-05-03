-- =============================================================================
-- 0075_auth_persona_rpc.sql
--
-- Single SECURITY DEFINER function that resolves a user's persona in one
-- round-trip. Replaces the three sequential service-role queries in
-- web/lib/auth/persona.ts (profiles + cohort_faculty + registrations) that
-- ran on every authed page render. Mirrors that resolution order:
--   1. profiles.staff_roles ⊇ {'admin'} → 'admin'
--   2. any cohort_faculty row              → 'faculty'
--   3. any confirmed registration          → 'student'
--   4. otherwise                           → null
--
-- Caller scope: authenticated. Default subject is auth.uid(); admins may
-- pass an explicit p_uid (the call site checks). The function itself does
-- not gate on caller — it only ever reads existence/staff_roles, which is
-- safe to compute for any user since the resolution never leaks PII.
-- =============================================================================

begin;

drop function if exists public.auth_persona(uuid);

create function public.auth_persona(p_uid uuid default null)
returns text
language plpgsql stable security definer
set search_path = public, auth
as $$
declare
  v_uid   uuid := coalesce(p_uid, auth.uid());
  v_roles text[];
begin
  if v_uid is null then
    return null;
  end if;

  select staff_roles into v_roles from profiles where id = v_uid;
  if v_roles is not null and 'admin' = any(v_roles) then
    return 'admin';
  end if;

  if exists (select 1 from cohort_faculty where user_id = v_uid) then
    return 'faculty';
  end if;

  if exists (
    select 1 from registrations
     where user_id = v_uid and status = 'confirmed'
  ) then
    return 'student';
  end if;

  return null;
end
$$;

grant execute on function public.auth_persona(uuid) to authenticated;

commit;
