-- =============================================================================
-- 0015_role_invariants.sql -- Enforce business rules:
--   1. A student can have at most one CONFIRMED registration (one cohort only).
--   2. Admins are global: a user with staff_roles ⊇ {'admin'} cannot also hold
--      a registration or a cohort_faculty assignment, and vice versa.
-- =============================================================================

-- ----- (1) student: single confirmed cohort ---------------------------------

drop index if exists registrations_one_confirmed_per_user;
create unique index registrations_one_confirmed_per_user
  on registrations (user_id)
  where status = 'confirmed';

-- ----- (2) admin exclusivity -------------------------------------------------

-- Block insert/update on registrations when the user is an admin.
create or replace function _block_admin_registration()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if exists (
    select 1 from profiles
     where id = new.user_id
       and staff_roles && array['admin']::text[]
  ) then
    raise exception 'admins cannot be registered as students'
      using errcode = 'P0001';
  end if;
  return new;
end
$$;

drop trigger if exists trg_block_admin_registration on registrations;
create trigger trg_block_admin_registration
  before insert or update of user_id, status on registrations
  for each row execute function _block_admin_registration();

-- Block insert/update on cohort_faculty when the user is an admin.
create or replace function _block_admin_faculty()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if exists (
    select 1 from profiles
     where id = new.user_id
       and staff_roles && array['admin']::text[]
  ) then
    raise exception 'admins cannot also be faculty'
      using errcode = 'P0001';
  end if;
  return new;
end
$$;

drop trigger if exists trg_block_admin_faculty on cohort_faculty;
create trigger trg_block_admin_faculty
  before insert or update of user_id on cohort_faculty
  for each row execute function _block_admin_faculty();

-- Block adding 'admin' to staff_roles when the user already has a registration
-- or cohort_faculty assignment (the inverse direction).
create or replace function _block_admin_promotion_for_assigned()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  becoming_admin boolean;
begin
  becoming_admin :=
    coalesce(new.staff_roles && array['admin']::text[], false)
    and not coalesce(old.staff_roles && array['admin']::text[], false);

  if becoming_admin then
    if exists (select 1 from registrations where user_id = new.id) then
      raise exception 'cannot promote to admin: user has an existing registration'
        using errcode = 'P0001';
    end if;
    if exists (select 1 from cohort_faculty where user_id = new.id) then
      raise exception 'cannot promote to admin: user has a faculty assignment'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists trg_block_admin_promotion on profiles;
create trigger trg_block_admin_promotion
  before update of staff_roles on profiles
  for each row execute function _block_admin_promotion_for_assigned();
