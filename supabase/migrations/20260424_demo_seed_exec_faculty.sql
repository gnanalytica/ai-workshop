-- Demo seed: Executive Faculty user for partner-college cohort oversight.
-- Applied 2026-04-24 via MCP. Idempotent via fixed UUID.

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values (
  'ddddffff-0000-0000-0000-000000000001',
  'authenticated', 'authenticated',
  'dean.demo@partner-college.edu',
  '', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dr. Priya Menon (demo Exec Faculty)"}'::jsonb,
  now(), now()
)
on conflict (id) do nothing;

insert into public.profiles (id, email, full_name, staff_roles)
values (
  'ddddffff-0000-0000-0000-000000000001',
  'dean.demo@partner-college.edu',
  'Dr. Priya Menon (demo Exec Faculty)',
  '{}'::text[]
)
on conflict (id) do update set full_name = excluded.full_name;

insert into public.cohort_faculty (cohort_id, user_id, role, college_role, created_at)
values (
  '56268633-9e93-4305-af6a-1b622a833d8e',
  'ddddffff-0000-0000-0000-000000000001',
  'lead',
  'executive',
  now()
)
on conflict (cohort_id, user_id) do update set college_role = excluded.college_role;
