-- =============================================================================
-- 0042_profiles_email_lowercase.sql
-- profiles.email is citext (case-insensitive comparison) but the on-insert
-- trigger from 0005 stored auth.users.email verbatim, so display strings drift
-- ("Jane@Example.com" vs "jane@example.com"). Comparison still works because
-- of citext, but the inconsistent casing is annoying in admin tooling. Fix:
--   1. Lowercase on insert/update via the existing trigger.
--   2. Backfill existing rows.
-- =============================================================================

create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, full_name)
    values (
      new.id,
      lower(new.email),
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    )
  on conflict (id) do update set email = lower(excluded.email);
  return new;
end
$$;

-- Backfill: any rows that aren't already lowercase get fixed in place. citext
-- equality means duplicates can't slip in here.
update public.profiles set email = lower(email) where email <> lower(email);
