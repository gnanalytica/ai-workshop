-- =============================================================================
-- 0049_demo_cohort.sql
-- Sandbox demo cohort. A single cohort flagged is_demo=true that every faculty
-- (and admin) is automatically a member of. Faculty can use it to learn the
-- platform without affecting any real student. Writes to the demo cohort are
-- real RLS-protected writes, scoped to the demo cohort_id.
--
--   - Schema: cohorts.is_demo + a unique index so we never have more than one.
--   - Seed: deterministic UUIDs (idempotent re-application).
--   - Auto-join: trigger + one-time backfill so any existing/future faculty
--     can drop straight into the sandbox. Admins/staff are intentionally
--     excluded — the role-invariant trigger from 0015 forbids it; admins
--     reach the sandbox via the cookie + their global caps.
-- =============================================================================

alter table cohorts add column if not exists is_demo boolean not null default false;

create unique index if not exists cohorts_one_demo_idx
  on cohorts ((true)) where is_demo;

insert into cohorts (id, slug, name, starts_on, ends_on, status, is_demo)
values (
  '99999999-9999-9999-9999-999999999999'::uuid,
  'demo-sandbox',
  'Sandbox Cohort (DEMO)',
  current_date - 13,    -- today renders as "Day 14 of 30"
  current_date + 16,
  'live',
  true
)
on conflict (id) do update
  set name      = excluded.name,
      status    = excluded.status,
      is_demo   = true,
      starts_on = excluded.starts_on,
      ends_on   = excluded.ends_on;

select seed_curriculum_for('99999999-9999-9999-9999-999999999999'::uuid);

update cohort_days
   set is_unlocked = true
 where cohort_id = '99999999-9999-9999-9999-999999999999'::uuid
   and day_number <= 14;

-- ---------- Demo students ----------------------------------------------------
do $demo_users$
declare
  rec record;
begin
  for rec in
    select * from (values
      ('99999999-0000-0000-0000-000000000001'::uuid, 'demo-student-01@demo.local', 'Aanya Krishnan'),
      ('99999999-0000-0000-0000-000000000002'::uuid, 'demo-student-02@demo.local', 'Rohan Mehta'),
      ('99999999-0000-0000-0000-000000000003'::uuid, 'demo-student-03@demo.local', 'Priya Sharma'),
      ('99999999-0000-0000-0000-000000000004'::uuid, 'demo-student-04@demo.local', 'Liam Walsh'),
      ('99999999-0000-0000-0000-000000000005'::uuid, 'demo-student-05@demo.local', 'Zoya Iqbal'),
      ('99999999-0000-0000-0000-000000000006'::uuid, 'demo-student-06@demo.local', 'Vikram Patel'),
      ('99999999-0000-0000-0000-000000000007'::uuid, 'demo-student-07@demo.local', 'Sara Johansson'),
      ('99999999-0000-0000-0000-000000000008'::uuid, 'demo-student-08@demo.local', 'Diego Alvarez'),
      ('99999999-0000-0000-0000-000000000009'::uuid, 'demo-student-09@demo.local', 'Mei Lin Tan'),
      ('99999999-0000-0000-0000-000000000010'::uuid, 'demo-student-10@demo.local', 'Kabir Singh')
    ) as v(id, email, full_name)
  loop
    if not exists (select 1 from auth.users where id = rec.id) then
      insert into auth.users (id, email, raw_user_meta_data)
        values (rec.id, rec.email, jsonb_build_object('full_name', rec.full_name));
    end if;
    update public.profiles set full_name = rec.full_name where id = rec.id;
  end loop;
end
$demo_users$;

-- ---------- Registrations + pods + members -----------------------------------
insert into registrations (user_id, cohort_id, status, source)
  select id, '99999999-9999-9999-9999-999999999999'::uuid, 'confirmed', 'demo'
    from public.profiles
   where email like 'demo-student-%@demo.local'
on conflict (user_id, cohort_id) do update set status = 'confirmed';

insert into pods (id, cohort_id, name)
values
  ('99999998-0000-0000-0000-000000000001'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'Pod Aurora'),
  ('99999998-0000-0000-0000-000000000002'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'Pod Borealis')
on conflict (id) do update set name = excluded.name;

do $demo_pods$
declare
  uid uuid;
  i int;
begin
  for i in 1..10 loop
    uid := ('99999999-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid;
    insert into pod_members (pod_id, student_user_id, cohort_id)
    values (
      case when i <= 5
           then '99999998-0000-0000-0000-000000000001'::uuid
           else '99999998-0000-0000-0000-000000000002'::uuid end,
      uid,
      '99999999-9999-9999-9999-999999999999'::uuid
    )
    on conflict (cohort_id, student_user_id) do nothing;
  end loop;
end
$demo_pods$;

-- ---------- Faculty auto-join ------------------------------------------------
-- Every existing non-staff faculty user (any cohort) becomes a member of the
-- demo cohort_faculty so the sandbox is reachable.
insert into cohort_faculty (user_id, cohort_id, college_role)
  select distinct cf.user_id,
         '99999999-9999-9999-9999-999999999999'::uuid,
         'support'::college_role
    from cohort_faculty cf
    join profiles p on p.id = cf.user_id
   where cf.cohort_id <> '99999999-9999-9999-9999-999999999999'::uuid
     and not (p.staff_roles && array['admin','trainer','tech_support']::text[])
on conflict (user_id, cohort_id) do nothing;

-- Trigger: when a non-staff user is added to any cohort_faculty (other than
-- the demo cohort), ensure they're also in the demo cohort. Skips staff to
-- respect the role-invariant from 0015.
create or replace function ensure_demo_cohort_faculty()
returns trigger language plpgsql security definer set search_path = public, auth
as $$
declare
  is_staff boolean;
begin
  if new.cohort_id = '99999999-9999-9999-9999-999999999999'::uuid then
    return new;
  end if;
  select coalesce(staff_roles && array['admin','trainer','tech_support']::text[], false)
    into is_staff
    from profiles where id = new.user_id;
  if not is_staff then
    insert into cohort_faculty (user_id, cohort_id, college_role)
      values (new.user_id, '99999999-9999-9999-9999-999999999999'::uuid, 'support'::college_role)
    on conflict (user_id, cohort_id) do nothing;
  end if;
  return new;
end
$$;

drop trigger if exists trg_ensure_demo_cohort_faculty on cohort_faculty;
create trigger trg_ensure_demo_cohort_faculty
  after insert on cohort_faculty
  for each row execute function ensure_demo_cohort_faculty();
