-- Add graded_at so we can measure grading turnaround.
-- Backfill existing graded rows with their last-updated timestamp where available,
-- otherwise leave null (turnaround will simply exclude them).

alter table public.submissions
  add column if not exists graded_at timestamptz;

-- Best-effort backfill: if the row is already 'graded', use submitted_at as a
-- lower bound so it appears in historical turnaround stats. Only for rows
-- where graded_at is null.
update public.submissions
set graded_at = submitted_at
where status = 'graded' and graded_at is null and submitted_at is not null;
