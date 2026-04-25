-- =============================================================================
-- 0007_views.sql  --  Reporting views for dashboards. RLS-aware (since they
-- query base tables, the underlying policies still apply).
-- =============================================================================

-- Cohort-wide health summary, for admin/exec faculty dashboards.
create or replace view v_cohort_summary as
select
  c.id as cohort_id,
  c.name,
  c.starts_on,
  c.ends_on,
  c.status,
  (select count(*) from registrations r where r.cohort_id = c.id and r.status = 'confirmed') as confirmed_students,
  (select count(*) from registrations r where r.cohort_id = c.id and r.status = 'pending') as pending_students,
  (select count(*) from cohort_faculty f where f.cohort_id = c.id) as faculty_count,
  (select count(*) from pods p where p.cohort_id = c.id) as pod_count
from cohorts c;

-- Per-pod summary used in faculty/my-pod and admin/pods.
create or replace view v_pod_summary as
select
  p.id as pod_id,
  p.cohort_id,
  p.name,
  (select count(*) from pod_members m where m.pod_id = p.id) as member_count,
  (select count(*) from pod_faculty f where f.pod_id = p.id) as faculty_count,
  (select faculty_user_id from pod_faculty f where f.pod_id = p.id and is_primary limit 1) as primary_faculty_id
from pods p;

-- Per-student progress snapshot.
create or replace view v_student_progress as
select
  r.cohort_id,
  r.user_id,
  prof.full_name,
  prof.email,
  (select count(*) from lab_progress lp where lp.user_id = r.user_id and lp.cohort_id = r.cohort_id and lp.status = 'done') as labs_done,
  (select count(*) from submissions s
     join assignments a on a.id = s.assignment_id
    where s.user_id = r.user_id and a.cohort_id = r.cohort_id and s.status = 'graded') as graded_subs,
  (select count(*) from attendance a
    where a.user_id = r.user_id and a.cohort_id = r.cohort_id and a.status = 'present') as days_present
from registrations r
join profiles prof on prof.id = r.user_id
where r.status = 'confirmed';

-- Today's stuck queue, faculty-friendly.
create or replace view v_stuck_open as
select
  s.id, s.cohort_id, s.kind, s.status, s.message, s.created_at,
  prof.full_name as student_name,
  prof.email     as student_email,
  claimer.full_name as claimed_by_name
from stuck_queue s
join profiles prof on prof.id = s.user_id
left join profiles claimer on claimer.id = s.claimed_by
where s.status in ('open','helping');
