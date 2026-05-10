-- 0091_milestone_numbers_and_faculty_notes.sql
--
-- Capstone tracking improvements (column-level, no new tables):
--   1. assignments.milestone_number  — buckets capstone deliverables into M1..M8
--      so the student capstone page can group cards by milestone instead of
--      showing every assignment as its own row.
--   2. submissions.faculty_notes_md  — review-only feedback faculty can write.
--      Faculty have grading.read but never grading.write; this column gives
--      them a place to leave coaching notes that is NOT a grade.
--   3. RPC set_submission_faculty_note  — SECURITY DEFINER write path so
--      faculty (with grading.read on the cohort) can update *only* this
--      column, never grade fields. Admins can also use this RPC.
--   4. Backfill milestone_number for the existing live cohort:
--      day_number 6 → 1, 11 → 2, 16 → 3, 21 → 4, 26 → 5, 29 → 6, 30 → 7.
--   5. Clear the broken due_at values on Day 6 M1 assignments
--      (they were seeded in the past and would render as stale-due).
-- =============================================================================

begin;

-- ----- 1. assignments.milestone_number ---------------------------------------

alter table assignments
  add column if not exists milestone_number int
    check (milestone_number is null or milestone_number between 1 and 8);

create index if not exists assignments_milestone_idx
  on assignments (cohort_id, milestone_number)
  where milestone_number is not null;

-- ----- 2. submissions.faculty_notes_md ---------------------------------------

alter table submissions
  add column if not exists faculty_notes_md text;

-- ----- 3. RPC: set_submission_faculty_note -----------------------------------
-- Faculty/admin write *only* faculty_notes_md on a submission. Capability
-- check uses grading.read (faculty already have this; admins inherit).

create or replace function set_submission_faculty_note(
  p_submission_id uuid,
  p_note          text
) returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_cohort uuid;
begin
  -- look up cohort via assignment
  select a.cohort_id into v_cohort
    from submissions s
    join assignments a on a.id = s.assignment_id
   where s.id = p_submission_id;

  if v_cohort is null then
    raise exception 'submission not found' using errcode = 'P0002';
  end if;

  if not has_cap('grading.read', v_cohort) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update submissions
     set faculty_notes_md = nullif(btrim(p_note), '')
   where id = p_submission_id;
end;
$$;

revoke all on function set_submission_faculty_note(uuid, text) from public;
grant execute on function set_submission_faculty_note(uuid, text) to authenticated;

-- ----- 4. Backfill milestone_number for existing cohorts ---------------------
-- Day → milestone mapping for the current curriculum. Reflections live on
-- the same day as their milestone brief, so they share the bucket.

update assignments
   set milestone_number = case day_number
     when  6 then 1
     when 11 then 2
     when 16 then 3
     when 21 then 4
     when 26 then 5
     when 29 then 6
     when 30 then 7
   end
 where day_number in (6, 11, 16, 21, 26, 29, 30)
   and milestone_number is null
   and (kind in ('capstone', 'lab', 'reflection'));

-- ----- 5. Clear stale Day 6 due dates ----------------------------------------
-- Both Day 6 M1 assignments were seeded with due_at in 2026-05-03, which is
-- already in the past for the live KBN cohort. Setting to NULL — the new
-- student UI will show a milestone-relative deadline instead of a wall date.

update assignments
   set due_at = null
 where cohort_id = 'fbd78241-7d28-434b-aa55-0659bb614be7'
   and day_number = 6
   and due_at < now();

commit;
