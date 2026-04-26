-- =============================================================================
-- 0012_invites.sql  --  Invite-code-gated sign-up.
-- Admins issue codes for students (per cohort), faculty (per cohort + role),
-- and staff (admin/trainer/tech_support). Sign-up redeems codes via SECURITY
-- DEFINER RPCs callable by anon (so they fire before the user has a session).
-- =============================================================================

create type invite_kind as enum ('student', 'faculty', 'staff');

create table invites (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  kind            invite_kind not null,
  cohort_id       uuid references cohorts (id) on delete cascade,
  college_role    college_role,
  staff_role      text,
  max_uses        int  not null default 1 check (max_uses > 0),
  redeemed_count  int  not null default 0,
  expires_at      timestamptz,
  note            text,
  created_by      uuid references profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  constraint invites_staff_role_valid check (
    staff_role is null or staff_role in ('admin','trainer','tech_support')
  ),
  constraint invites_shape check (
    (kind = 'student' and cohort_id is not null and college_role is null  and staff_role is null)
 or (kind = 'faculty' and cohort_id is not null and college_role is not null and staff_role is null)
 or (kind = 'staff'   and cohort_id is null     and college_role is null  and staff_role is not null)
  )
);

create index invites_kind_idx   on invites (kind, cohort_id);
create index invites_active_idx on invites (code) where redeemed_count < max_uses;

alter table invites enable row level security;

drop policy if exists invites_admin_all on invites;
create policy invites_admin_all on invites
  for all using (has_staff_role('admin'))
  with check  (has_staff_role('admin'));

-- ----- validate (read-only, callable by anon) --------------------------------

create or replace function rpc_validate_invite(p_code text)
returns table(
  id           uuid,
  kind         invite_kind,
  cohort_id    uuid,
  cohort_name  text,
  college_role college_role,
  staff_role   text
)
language plpgsql stable security definer set search_path = public, auth
as $$
declare
  v invites;
begin
  select * into v from invites where code = p_code;
  if v.id is null then
    raise exception 'invite not found' using errcode = 'P0001';
  end if;
  if v.expires_at is not null and v.expires_at < now() then
    raise exception 'invite expired' using errcode = 'P0001';
  end if;
  if v.redeemed_count >= v.max_uses then
    raise exception 'invite already redeemed' using errcode = 'P0001';
  end if;

  return query
    select v.id, v.kind, v.cohort_id,
           (select c.name from cohorts c where c.id = v.cohort_id),
           v.college_role, v.staff_role;
end
$$;

-- ----- atomic helper: bump redemption counter (raises if exhausted) ----------

create or replace function _bump_invite(p_code text)
returns invites
language plpgsql security definer set search_path = public, auth
as $$
declare
  v invites;
begin
  update invites
     set redeemed_count = redeemed_count + 1
   where code = p_code
     and redeemed_count < max_uses
     and (expires_at is null or expires_at > now())
  returning * into v;

  if v.id is null then
    raise exception 'invite invalid or already redeemed' using errcode = 'P0001';
  end if;
  return v;
end
$$;

-- ----- redemption: student ---------------------------------------------------

create or replace function rpc_redeem_student_invite(p_code text, p_user uuid)
returns registrations
language plpgsql security definer set search_path = public, auth
as $$
declare
  v invites;
  r registrations;
begin
  v := _bump_invite(p_code);
  if v.kind <> 'student' then
    raise exception 'wrong invite kind for student';
  end if;

  insert into registrations(user_id, cohort_id, status, source)
    values (p_user, v.cohort_id, 'confirmed', 'invite')
  on conflict (user_id, cohort_id)
    do update set status = 'confirmed', source = coalesce(registrations.source, 'invite'),
                  updated_at = now()
  returning * into r;

  return r;
end
$$;

-- ----- redemption: faculty ---------------------------------------------------

create or replace function rpc_redeem_faculty_invite(p_code text, p_user uuid)
returns cohort_faculty
language plpgsql security definer set search_path = public, auth
as $$
declare
  v invites;
  f cohort_faculty;
begin
  v := _bump_invite(p_code);
  if v.kind <> 'faculty' then
    raise exception 'wrong invite kind for faculty';
  end if;

  insert into cohort_faculty(user_id, cohort_id, college_role)
    values (p_user, v.cohort_id, v.college_role)
  on conflict (user_id, cohort_id)
    do update set college_role = excluded.college_role
  returning * into f;

  return f;
end
$$;

-- ----- redemption: staff -----------------------------------------------------

create or replace function rpc_redeem_staff_invite(p_code text, p_user uuid)
returns profiles
language plpgsql security definer set search_path = public, auth
as $$
declare
  v invites;
  p profiles;
begin
  v := _bump_invite(p_code);
  if v.kind <> 'staff' then
    raise exception 'wrong invite kind for staff';
  end if;

  update profiles
     set staff_roles = (
       select array_agg(distinct r)
         from unnest(coalesce(staff_roles, '{}')::text[] || array[v.staff_role]) r
     ),
         updated_at = now()
   where id = p_user
  returning * into p;

  if p.id is null then
    raise exception 'profile not found for user %', p_user;
  end if;

  return p;
end
$$;

-- ----- grants ----------------------------------------------------------------

grant execute on function rpc_validate_invite(text)              to anon, authenticated;
grant execute on function rpc_redeem_student_invite(text, uuid)  to anon, authenticated;
grant execute on function rpc_redeem_faculty_invite(text, uuid)  to anon, authenticated;
grant execute on function rpc_redeem_staff_invite(text, uuid)    to anon, authenticated;
-- _bump_invite is a private helper; do not grant.
revoke execute on function _bump_invite(text) from public, anon, authenticated;
