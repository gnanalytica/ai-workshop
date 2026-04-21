-- Keep public.profiles.email aligned with auth.users.email (admin registrations
-- table and search read from profiles.email).

alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and (p.email is distinct from u.email);

-- When auth email changes, mirror to profiles (if row exists).
create or replace function public.sync_profile_email_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_sync_profile_email on auth.users;
create trigger on_auth_user_sync_profile_email
  after insert or update of email on auth.users
  for each row
  execute function public.sync_profile_email_from_auth_user();

-- If profile row is created without email, fill from auth before insert completes.
create or replace function public.profiles_fill_email_from_auth_before_ins()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  e text;
begin
  if new.email is null or btrim(new.email) = '' then
    select u.email into e from auth.users u where u.id = new.id limit 1;
    if e is not null then
      new.email := e;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_fill_email_from_auth_before_ins on public.profiles;
create trigger profiles_fill_email_from_auth_before_ins
  before insert on public.profiles
  for each row
  execute function public.profiles_fill_email_from_auth_before_ins();
