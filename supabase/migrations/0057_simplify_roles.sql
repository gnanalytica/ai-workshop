-- =============================================================================
-- 0057_simplify_roles.sql
-- Collapse the role model to two roles:
--   * Staff: a single `admin` (drops `trainer`, `tech_support`).
--   * Faculty: a single per-cohort role (drops `support` / `executive`).
-- Faculty become review-only on grading: admins are the only persona that can
-- write grades. The `support.tech_only` capability is retired (admins triage
-- tech tickets; faculty triage their own pod, regardless of ticket kind).
-- =============================================================================

-- ---------- 0. Drop dependent objects so we can mutate the column ------------

drop policy if exists hdq_triage on help_desk_queue;
drop function if exists public.help_desk_ticket_triagable(uuid, uuid);
drop function if exists public.rpc_claim_help_desk_ticket(uuid);
drop function if exists public.rpc_validate_invite(text);
drop function if exists public.rpc_redeem_faculty_invite(text, uuid);
drop function if exists public.college_role_in(uuid);
drop trigger  if exists trg_ensure_demo_cohort_faculty on cohort_faculty;
drop function if exists public.ensure_demo_cohort_faculty();
drop index    if exists cohort_faculty_cohort_idx;

-- ---------- 1. Data cleanup --------------------------------------------------

-- Remove the demo executive seed (no longer needed; only one faculty role).
-- faculty_pod_notes.author_id is NOT NULL with no cascade, so clear dependent
-- rows authored by this user first.
delete from faculty_pod_notes
 where author_id in (select id from profiles where email = 'exec@seed.local');
delete from cohort_faculty
 where user_id in (select id from profiles where email = 'exec@seed.local');
delete from pod_faculty
 where faculty_user_id in (select id from profiles where email = 'exec@seed.local');
delete from profiles where email = 'exec@seed.local';

-- Promote any user with legacy staff roles to plain `admin`, then strip
-- the legacy values. Idempotent.
update profiles
   set staff_roles = array(
     select distinct unnest(staff_roles || array['admin'])
   )
 where staff_roles && array['trainer','tech_support']::text[];

update profiles
   set staff_roles = array(
     select x from unnest(staff_roles) x where x not in ('trainer','tech_support')
   )
 where staff_roles && array['trainer','tech_support']::text[];

-- ---------- 2. Drop college_role from invites + cohort_faculty ---------------

alter table invites
  drop constraint if exists invites_kind_shape;

alter table invites drop column if exists college_role;

alter table cohort_faculty drop column if exists college_role;

drop type if exists college_role;

-- ---------- 3. Recreate the invites shape constraint without college_role ----

alter table invites
  add constraint invites_kind_shape
  check (
       (kind = 'student' and cohort_id is not null and staff_role is null)
    or (kind = 'faculty' and cohort_id is not null and staff_role is null)
    or (kind = 'staff'   and cohort_id is null     and staff_role is not null)
  );

-- ---------- 4. Recreate the index on cohort_faculty --------------------------

create index cohort_faculty_cohort_idx on cohort_faculty (cohort_id);

-- ---------- 5. Rewrite auth_caps: admin + faculty only -----------------------
-- Faculty get grading.read but no longer grading.write:pod. Admins are the
-- only persona that writes grades.

create or replace function public.auth_caps(p_cohort uuid default null)
returns text[]
language plpgsql stable security definer
set search_path = public, auth
as $$
declare
  caps       text[] := array[]::text[];
  is_admin   boolean := has_staff_role('admin');
  is_faculty boolean;
  enrolled   boolean;
begin
  if auth.uid() is null then
    return caps;
  end if;

  if is_admin then
    caps := caps || array[
      'content.read','content.write',
      'schedule.read','schedule.write',
      'roster.read','roster.write',
      'pods.write','faculty.write',
      'grading.read','grading.write:cohort',
      'analytics.read:cohort','analytics.read:program',
      'moderation.write',
      'support.triage','support.escalate',
      'orgs.write'
    ];
  end if;

  if p_cohort is not null then
    if is_admin then
      caps := caps || array['community.read','community.write'];
    end if;

    is_faculty := exists (
      select 1 from cohort_faculty
       where cohort_id = p_cohort and user_id = auth.uid()
    );

    if is_faculty then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
        'grading.read',
        'support.triage','support.escalate',
        'moderation.write',
        'community.read','community.write'
      ];
    end if;

    enrolled := is_enrolled_in(p_cohort);
    if enrolled then
      caps := caps || array[
        'content.read','schedule.read',
        'self.read','self.write',
        'community.read','community.write',
        'attendance.self'
      ];
    end if;
  else
    is_faculty := exists (
      select 1 from cohort_faculty where user_id = auth.uid()
    );

    if is_faculty then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
        'grading.read',
        'support.triage','support.escalate',
        'moderation.write',
        'community.read','community.write'
      ];
    end if;

    enrolled := exists (
      select 1 from registrations
       where user_id = auth.uid() and status = 'confirmed'
    );

    if enrolled then
      caps := caps || array[
        'content.read','schedule.read',
        'self.read','self.write',
        'community.read','community.write',
        'attendance.self'
      ];
    end if;
  end if;

  return (select array_agg(distinct c) from unnest(caps) c);
end
$$;

-- ---------- 6. Rewrite can_grade: admin only ---------------------------------

create or replace function public.can_grade(p_submission uuid)
returns boolean
language sql stable security definer
set search_path = public, auth
as $$
  select has_staff_role('admin')
$$;

-- ---------- 7. Help-desk triage: admin or pod faculty ------------------------

create or replace function public.help_desk_ticket_triagable(p_cohort uuid, p_ticket_user_id uuid)
returns boolean
language sql stable security invoker
set search_path = public
as $$
  select
    has_staff_role('admin')
    or exists (
      select 1
      from pod_members pm
      join pod_faculty pf on pf.pod_id = pm.pod_id and pf.faculty_user_id = auth.uid()
      join pods p on p.id = pm.pod_id and p.cohort_id = p_cohort
      where pm.student_user_id = p_ticket_user_id
    );
$$;

revoke all on function public.help_desk_ticket_triagable(uuid, uuid) from public;
grant execute on function public.help_desk_ticket_triagable(uuid, uuid) to authenticated;

create policy hdq_triage on help_desk_queue
  for all to authenticated
  using (
    has_cap('support.triage', cohort_id)
    and public.help_desk_ticket_triagable(cohort_id, user_id)
  )
  with check (
    has_cap('support.triage', cohort_id)
    and public.help_desk_ticket_triagable(cohort_id, user_id)
  );

create or replace function public.rpc_claim_help_desk_ticket(p_id uuid)
returns help_desk_queue
language plpgsql security definer
set search_path = public, auth
as $$
declare
  row       help_desk_queue;
  v_cohort  uuid;
  v_student uuid;
begin
  select cohort_id, user_id into v_cohort, v_student
    from help_desk_queue where id = p_id;
  if v_cohort is null then raise exception 'not found'; end if;

  if not has_cap('support.triage', v_cohort) then
    raise exception 'permission denied: support.triage';
  end if;

  if not (
    has_staff_role('admin')
    or exists (
      select 1
      from pod_members pm
      join pod_faculty pf on pf.pod_id = pm.pod_id and pf.faculty_user_id = auth.uid()
      join pods p on p.id = pm.pod_id and p.cohort_id = v_cohort
      where pm.student_user_id = v_student
    )
  ) then
    raise exception 'permission denied: triage limited to your pods (or admin)';
  end if;

  update help_desk_queue
     set claimed_by = auth.uid(), status = 'helping', updated_at = now()
   where id = p_id and status = 'open'
  returning * into row;

  return row;
end
$$;

revoke all on function public.rpc_claim_help_desk_ticket(uuid) from public;
grant execute on function public.rpc_claim_help_desk_ticket(uuid) to authenticated;

-- ---------- 8. Recreate invite RPCs without college_role ---------------------

create or replace function public.rpc_validate_invite(p_code text)
returns table(
  id          uuid,
  kind        invite_kind,
  cohort_id   uuid,
  cohort_name text,
  staff_role  text
)
language plpgsql stable security definer
set search_path = public, auth
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
           v.staff_role;
end
$$;

revoke all on function public.rpc_validate_invite(text) from public;
grant execute on function public.rpc_validate_invite(text) to anon, authenticated;

create or replace function public.rpc_redeem_faculty_invite(p_code text, p_user uuid)
returns cohort_faculty
language plpgsql security definer
set search_path = public, auth
as $$
declare
  v invites;
  f cohort_faculty;
begin
  v := _bump_invite(p_code);
  if v.kind <> 'faculty' then
    raise exception 'wrong invite kind for faculty';
  end if;

  insert into cohort_faculty(user_id, cohort_id)
    values (p_user, v.cohort_id)
  on conflict (user_id, cohort_id) do nothing
  returning * into f;

  if f.user_id is null then
    select * into f from cohort_faculty
     where user_id = p_user and cohort_id = v.cohort_id;
  end if;

  return f;
end
$$;

revoke all on function public.rpc_redeem_faculty_invite(text, uuid) from public;
grant execute on function public.rpc_redeem_faculty_invite(text, uuid) to authenticated;

-- ---------- 9. Recreate the demo-cohort auto-join trigger --------------------
-- New shape: only admin is staff now, so the staff filter simplifies.

create or replace function public.ensure_demo_cohort_faculty()
returns trigger language plpgsql security definer
set search_path = public, auth
as $$
declare
  is_staff boolean;
begin
  if new.cohort_id = '99999999-9999-9999-9999-999999999999'::uuid then
    return new;
  end if;
  select coalesce(staff_roles && array['admin']::text[], false)
    into is_staff
    from profiles where id = new.user_id;
  if not is_staff then
    insert into cohort_faculty (user_id, cohort_id)
      values (new.user_id, '99999999-9999-9999-9999-999999999999'::uuid)
    on conflict (user_id, cohort_id) do nothing;
  end if;
  return new;
end
$$;

create trigger trg_ensure_demo_cohort_faculty
  after insert on cohort_faculty
  for each row execute function public.ensure_demo_cohort_faculty();
