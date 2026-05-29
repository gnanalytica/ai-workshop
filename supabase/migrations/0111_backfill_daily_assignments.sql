-- Backfill one assignment row per teaching day for every cohort.
--
-- Why: LessonDayView only renders the AssignmentBlock (the submit form with the
-- text box + "Add link" fields) for days that have a row in `assignments`
-- (LessonDayView.tsx: `interactive.assignments.length > 0`). The day-XX.mdx
-- content tells students to "Submit → Day N → links", but the MDX is just
-- prose — it never creates an input. Without a row, students see the
-- instruction and no box. Only a handful of days had rows (demo-cohort seed +
-- the kbn day-13 deck + milestones), so most days had nowhere to submit.
--
-- This inserts a single assignment per (cohort, day) using `cohort_days` as the
-- source of valid pairs (the assignments FK references cohort_days), titled
-- after each day's Assignment heading. body_md is left NULL on purpose — the
-- lesson MDX rendered directly above the form already carries the full brief.
--
-- Idempotent + non-destructive: the NOT EXISTS guard skips any (cohort, day)
-- that already has an assignment, so milestone rows, the kbn-only day-13 deck,
-- and the demo-cohort seed are all left exactly as they are, and the migration
-- is safe to re-run. Day 11 is intentionally omitted (recap day, no submission).

-- weight/auto_grade mirror the per-kind backfill in 0060: capstones are
-- graded heavier and are admin-only manual review (auto_grade=false — the AI
-- grader refuses these), reflections are submission-credit-only (weight 0),
-- labs take the default weight of 1.
insert into assignments (cohort_id, day_number, kind, title, weight, auto_grade)
select cd.cohort_id,
       cd.day_number,
       t.kind::assignment_kind,
       t.title,
       case t.kind when 'capstone' then 3 when 'reflection' then 0 else 1 end,
       case when t.kind = 'capstone' then false else true end
from cohort_days cd
join (
  values
    (1,  'reflection', 'Day-0 baseline reflection'),
    (2,  'lab',        'Tokens in your stack'),
    (3,  'lab',        'The CREATE rewrite'),
    (4,  'lab',        'Pick your stack'),
    (5,  'lab',        'Research paper presentation'),
    (6,  'capstone',   'Capstone Milestone 1 — full submission'),
    (7,  'lab',        'The 280-character problem statement'),
    (8,  'lab',        'Refined problem statement'),
    (9,  'lab',        'Analysis and Action'),
    (10, 'lab',        'Analysis and Action (Part 2)'),
    (12, 'lab',        'Three capstone images'),
    (13, 'lab',        'Presentation deck + scripts'),
    (14, 'lab',        'n8n workflow'),
    (15, 'lab',        'Recognise an agent in the wild'),
    (16, 'lab',        'Vibe-built micro-tool'),
    (17, 'lab',        'Public repo, real API'),
    (18, 'lab',        'The ₹ slide'),
    (19, 'capstone',   'Capstone Milestone 2 — prototype, deck & demo'),
    (20, 'lab',        'Deploy + OpenCode diff'),
    (21, 'lab',        'RAG over your own corpus'),
    (22, 'lab',        'Embed one chart live'),
    (23, 'lab',        'Chat panel + 7-question eval'),
    (24, 'capstone',   'Capstone Milestone 3 submission'),
    (25, 'lab',        '2-feed system + one GEO ship'),
    (26, 'lab',        'Context that earns its tokens'),
    (27, 'lab',        'The shareable reel'),
    (28, 'lab',        'One-page risk note'),
    (29, 'reflection', 'Demo reflection'),
    (30, 'reflection', 'Final portfolio + reflection')
) as t(day_number, kind, title) on t.day_number = cd.day_number
where not exists (
  select 1 from assignments a
  where a.cohort_id = cd.cohort_id
    and a.day_number = cd.day_number
);
