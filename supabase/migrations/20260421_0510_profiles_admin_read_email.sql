-- Fix admin / faculty UI: allow super-admins to read any profile row, and keep a
-- denormalized email on profiles for search + display (mirrors auth.users).

alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id;

-- Super-admins can SELECT any profile (admin-faculty, admin-student, etc.).
-- Use SECURITY DEFINER so the is_admin check does not recurse through RLS.
create or replace function public.current_profile_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid() limit 1),
    false
  );
$$;

revoke all on function public.current_profile_is_admin() from public;
grant execute on function public.current_profile_is_admin() to authenticated;

drop policy if exists profiles_admin_select on public.profiles;
create policy profiles_admin_select on public.profiles
  for select to authenticated
  using ( public.current_profile_is_admin() );
