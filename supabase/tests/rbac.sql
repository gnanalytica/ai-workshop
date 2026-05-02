-- =============================================================================
-- supabase/tests/rbac.sql  --  Spec for capability-driven RLS.
-- Run AFTER seed/cohort.sql against a fresh database.
-- Spoofs auth.uid() via current_setting('request.jwt.claim.sub').
-- Each test prints PASS/FAIL.
-- =============================================================================

\set ON_ERROR_STOP on
\set QUIET on

create or replace function _expect(label text, actual boolean, expected boolean)
returns void language plpgsql as $$
begin
  if actual is not distinct from expected then
    raise notice 'PASS: %', label;
  else
    raise warning 'FAIL: % (expected %, got %)', label, expected, actual;
  end if;
end $$;

create or replace function _set_uid(p_email text) returns void language plpgsql as $$
declare
  uid uuid;
begin
  select id into uid from profiles where email = p_email;
  perform set_config('request.jwt.claim.sub', uid::text, false);
end $$;

\echo '--- admin caps include grading + analytics:program ---'
select _set_uid('admin@seed.local');
select _expect('admin has analytics.read:program', has_cap('analytics.read:program'), true);
select _expect('admin has grading.write:cohort', has_cap('grading.write:cohort', '11111111-1111-1111-1111-111111111111'), true);
select _expect('admin has orgs.write', has_cap('orgs.write'), true);

-- Migration 0057 collapsed trainer / tech_support staff roles into admin and
-- dropped the support / executive college_role split, so the only personas
-- under test now are admin (above), faculty (below), and student. Faculty
-- are review-only on submissions: they get grading.read but never
-- grading.write — admins are the only writers. support1 + exec resolve to
-- the same capability set; assert against both to catch any drift.
\echo '--- faculty (unified): grading.read, pods.write, community + moderation ---'
select _set_uid('support1@seed.local');
select _expect('support has grading.read',          has_cap('grading.read','11111111-1111-1111-1111-111111111111'), true);
select _expect('support lacks grading.write:pod',   has_cap('grading.write:pod','11111111-1111-1111-1111-111111111111'), false);
select _expect('support lacks grading.write:cohort',has_cap('grading.write:cohort','11111111-1111-1111-1111-111111111111'), false);
select _expect('support has pods.write in cohort',  has_cap('pods.write','11111111-1111-1111-1111-111111111111'), true);
select _expect('support has pods.write globally',   has_cap('pods.write'), true);
select _expect('support has community.write',       has_cap('community.write','11111111-1111-1111-1111-111111111111'), true);
select _expect('support has moderation.write',      has_cap('moderation.write','11111111-1111-1111-1111-111111111111'), true);
select _expect('support lacks analytics.read:cohort', has_cap('analytics.read:cohort','11111111-1111-1111-1111-111111111111'), false);

select _set_uid('exec@seed.local');
select _expect('exec has grading.read',                has_cap('grading.read','11111111-1111-1111-1111-111111111111'), true);
select _expect('exec lacks grading.write:pod',         has_cap('grading.write:pod','11111111-1111-1111-1111-111111111111'), false);
select _expect('exec lacks grading.write:cohort',      has_cap('grading.write:cohort','11111111-1111-1111-1111-111111111111'), false);
select _expect('exec has pods.write in cohort',        has_cap('pods.write','11111111-1111-1111-1111-111111111111'), true);
select _expect('exec lacks analytics.read:cohort',     has_cap('analytics.read:cohort','11111111-1111-1111-1111-111111111111'), false);

\echo '--- student: self + content read + community, no grading ---'
select _set_uid('student01@seed.local');
select _expect('student has content.read',     has_cap('content.read','11111111-1111-1111-1111-111111111111'), true);
select _expect('student has community.write',  has_cap('community.write','11111111-1111-1111-1111-111111111111'), true);
select _expect('student lacks grading.read',   has_cap('grading.read','11111111-1111-1111-1111-111111111111'), false);
select _expect('student has attendance.self',  has_cap('attendance.self','11111111-1111-1111-1111-111111111111'), true);
select _expect('student lacks pods.write',     has_cap('pods.write','11111111-1111-1111-1111-111111111111'), false);

drop function _expect(text, boolean, boolean);
drop function _set_uid(text);
