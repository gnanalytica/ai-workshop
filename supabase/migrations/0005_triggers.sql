-- =============================================================================
-- 0005_triggers.sql  --  updated_at maintenance, profile autocreate from auth,
-- email sync, day_faculty auto-link.
-- =============================================================================

-- ----- generic updated_at -----------------------------------------------------

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end
$$;

do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables
     where schemaname = 'public'
       and tablename in (
         'profiles','cohorts','cohort_days','registrations','day_faculty',
         'submissions','peer_reviews','lab_progress','board_posts','board_replies',
         'rubric_templates','stuck_queue'
       )
  loop
    execute format(
      'drop trigger if exists trg_%s_updated_at on public.%I;
       create trigger trg_%s_updated_at before update on public.%I
         for each row execute function set_updated_at();',
       t, t, t, t);
  end loop;
end $$;

-- ----- profile auto-create + email sync from auth.users ----------------------

create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, full_name)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    )
  on conflict (id) do update set email = excluded.email;
  return new;
end
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

create or replace function sync_profile_email()
returns trigger language plpgsql security definer set search_path = public, auth
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end
$$;

drop trigger if exists trg_on_auth_user_email_change on auth.users;
create trigger trg_on_auth_user_email_change
  after update of email on auth.users
  for each row when (new.email is distinct from old.email)
  execute function sync_profile_email();

-- ----- pod_members.cohort_id sanity check ------------------------------------

create or replace function pod_members_check_cohort()
returns trigger language plpgsql as $$
declare
  pod_cohort uuid;
begin
  select cohort_id into pod_cohort from pods where id = new.pod_id;
  if pod_cohort is null then
    raise exception 'pod % does not exist', new.pod_id;
  end if;
  new.cohort_id := pod_cohort;
  return new;
end
$$;

drop trigger if exists trg_pod_members_cohort on pod_members;
create trigger trg_pod_members_cohort
  before insert or update on pod_members
  for each row execute function pod_members_check_cohort();

-- ----- day_faculty timestamp --------------------------------------------------

drop trigger if exists trg_day_faculty_updated on day_faculty;
create trigger trg_day_faculty_updated
  before update on day_faculty
  for each row execute function set_updated_at();
