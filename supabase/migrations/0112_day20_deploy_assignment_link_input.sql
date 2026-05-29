-- 0112_day20_deploy_assignment_link_input.sql
--
-- Day 20 ("Deployment with Vercel and Supabase", web/content/day-20.mdx) tells
-- students in its post-class Assignment section to submit four links — live URL,
-- GitHub repo, a redeploy recording, and an OpenCode diff screenshot.
--
-- That submit form (AssignmentBlock — the text box + "+ Add link" URL fields) is
-- only rendered when an `assignments` row exists for the (cohort, day) pair
-- (LessonDayView.tsx: `interactive.assignments.length > 0`). The MDX prose alone
-- never creates an input. If the Day 20 row is missing for a cohort, students
-- read "paste 4 links" but have nowhere to paste them.
--
-- This guarantees the Day 20 row exists for every cohort so the URL input shows.
-- It matches the row 0111_backfill_daily_assignments.sql defines for day 20
-- exactly (kind=lab, title 'Deploy + OpenCode diff', weight 1, auto_grade true),
-- and `body_md` is left NULL on purpose — the lesson MDX rendered directly above
-- the form already carries the full brief + rubric (the repo convention).
--
-- Fully non-destructive + idempotent: the NOT EXISTS guard skips any cohort that
-- already has a Day 20 assignment, so no existing row, submission, grade, or link
-- is ever touched, and the migration is safe to re-run. cohort_days is the source
-- of valid (cohort, day) pairs (the assignments FK references it).

begin;

insert into assignments (cohort_id, day_number, kind, title, weight, auto_grade)
select cd.cohort_id,
       cd.day_number,
       'lab'::assignment_kind,
       'Deploy + OpenCode diff',
       1,
       true
from cohort_days cd
where cd.day_number = 20
  and not exists (
    select 1 from assignments a
    where a.cohort_id = cd.cohort_id
      and a.day_number = 20
  );

commit;
