-- =============================================================================
-- supabase/seed/cohort.sql  --  Staging seed for development.
-- One cohort, 50 students, 5 pods, 6 faculty (1 admin, 1 trainer, 1 tech_support,
-- 2 support faculty, 1 executive). Idempotent.
--
-- Run AFTER 0001…0007 migrations against a Supabase project. In CI, run via
-- `supabase db reset --debug && psql -f supabase/seed/cohort.sql`.
-- =============================================================================

begin;

-- ----- helpers ---------------------------------------------------------------
do $$ declare _v text; begin _v := 'no-op'; end $$;

-- ----- auth.users + profiles --------------------------------------------------
-- Real auth.users rows can only be created via the auth API. For local seed
-- we insert directly into auth.users (bypassing auth flows). Skip if not
-- writable (managed Supabase env).
do $$
declare
  pw text := 'seed-pw';
  ids uuid[];
  i int;
begin
  if not exists (select 1 from auth.users where email = 'admin@seed.local') then
    insert into auth.users (id, email, raw_user_meta_data) values
      ('00000000-0000-0000-0000-000000000001','admin@seed.local','{"full_name":"Admin Seed"}'),
      ('00000000-0000-0000-0000-000000000002','trainer@seed.local','{"full_name":"Trainer Seed"}'),
      ('00000000-0000-0000-0000-000000000003','tech@seed.local','{"full_name":"Tech Support Seed"}'),
      ('00000000-0000-0000-0000-000000000004','support1@seed.local','{"full_name":"Support 1"}'),
      ('00000000-0000-0000-0000-000000000005','support2@seed.local','{"full_name":"Support 2"}'),
      ('00000000-0000-0000-0000-000000000006','exec@seed.local','{"full_name":"Exec Seed"}');
    for i in 1..50 loop
      insert into auth.users (id, email, raw_user_meta_data)
        values (gen_random_uuid(),
          'student' || lpad(i::text, 2, '0') || '@seed.local',
          jsonb_build_object('full_name', 'Student ' || lpad(i::text, 2, '0')));
    end loop;
  end if;
end $$;

update profiles set staff_roles = '{admin}'        where email = 'admin@seed.local';
update profiles set staff_roles = '{trainer}'      where email = 'trainer@seed.local';
update profiles set staff_roles = '{tech_support}' where email = 'tech@seed.local';

-- ----- cohort + curriculum ----------------------------------------------------
insert into cohorts (id, slug, name, starts_on, ends_on, status)
  values ('11111111-1111-1111-1111-111111111111', 'seed-cohort-1',
          'Seed Cohort 1', current_date, current_date + 35, 'live')
on conflict (slug) do update set status = 'live';

select seed_curriculum_for('11111111-1111-1111-1111-111111111111');

-- unlock first 5 days
update cohort_days set is_unlocked = true
 where cohort_id = '11111111-1111-1111-1111-111111111111'
   and day_number <= 5;

-- ----- registrations ----------------------------------------------------------
insert into registrations (user_id, cohort_id, status)
  select id, '11111111-1111-1111-1111-111111111111', 'confirmed'
    from profiles where email like 'student%@seed.local'
on conflict do nothing;

-- ----- faculty + pods ---------------------------------------------------------
insert into cohort_faculty (user_id, cohort_id, college_role)
  select id, '11111111-1111-1111-1111-111111111111', 'support'
    from profiles where email in ('support1@seed.local','support2@seed.local')
on conflict do nothing;

insert into cohort_faculty (user_id, cohort_id, college_role)
  select id, '11111111-1111-1111-1111-111111111111', 'executive'
    from profiles where email = 'exec@seed.local'
on conflict do nothing;

-- 5 pods, distribute students round-robin
insert into pods (id, cohort_id, name)
  select gen_random_uuid(), '11111111-1111-1111-1111-111111111111', name
    from (values ('Pod Alpha'),('Pod Bravo'),('Pod Charlie'),('Pod Delta'),('Pod Echo')) v(name)
on conflict do nothing;

-- one pod per faculty per cohort (support1 → Alpha, support2 → Bravo)
insert into pod_faculty (pod_id, faculty_user_id)
  select p.id, prof.id
    from pods p
    cross join profiles prof
    where p.cohort_id = '11111111-1111-1111-1111-111111111111'
      and (
        (p.name = 'Pod Alpha' and prof.email = 'support1@seed.local')
        or (p.name = 'Pod Bravo' and prof.email = 'support2@seed.local')
      )
on conflict do nothing;

-- distribute students round-robin to pods
do $$
declare
  pod_ids uuid[];
  student_ids uuid[];
  i int;
begin
  select array_agg(id order by name) into pod_ids
    from pods where cohort_id = '11111111-1111-1111-1111-111111111111';
  select array_agg(p.id order by p.email) into student_ids
    from profiles p where p.email like 'student%@seed.local';
  for i in 1..coalesce(array_length(student_ids, 1), 0) loop
    insert into pod_members (pod_id, student_user_id, cohort_id)
      values (pod_ids[((i - 1) % array_length(pod_ids, 1)) + 1],
              student_ids[i],
              '11111111-1111-1111-1111-111111111111')
    on conflict do nothing;
  end loop;
end $$;

-- ----- a couple of announcements + a help desk queue entry -----------------------
insert into announcements (cohort_id, title, body_md, audience)
  values
    ('11111111-1111-1111-1111-111111111111', 'Welcome!',
     'We start tomorrow at 7pm IST. Complete the day-1 prep on your dashboard.', 'all'),
    ('11111111-1111-1111-1111-111111111111', 'Pod assignments are live',
     'Check your dashboard for your pod and primary mentor.', 'students')
on conflict do nothing;

insert into help_desk_queue (user_id, cohort_id, kind, status, message)
  select p.id, '11111111-1111-1111-1111-111111111111', 'content', 'open',
         'Confused on the day-2 LLM exercise — getting auth errors.'
    from profiles p where p.email = 'student01@seed.local'
on conflict do nothing;

commit;
