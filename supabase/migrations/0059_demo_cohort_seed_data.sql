-- =============================================================================
-- 0059_demo_cohort_seed_data.sql
-- Idempotent rich seed data for the Demo Cohort (99999999-…). Lets any
-- non-admin preview every workflow against realistic content without
-- polluting real cohorts. Re-runnable: every insert uses on conflict do
-- nothing, never overwrites existing rows.
--
-- IDs use a stable structured prefix:
--   99999999-…          — demo cohort + students (existing)
--   99999998-…          — demo pods (existing)
--   99999997-…          — demo faculty (new, this migration)
--   99999996-…          — demo content (assignments, posts, tickets, etc.)
-- =============================================================================

-- ---------- 1. Demo faculty accounts ----------------------------------------

insert into auth.users (id, email, raw_user_meta_data)
values
  ('99999997-0000-0000-0000-000000000001', 'demo-faculty-01@demo.local',
   '{"full_name":"Dr. Aarav Demo"}'::jsonb),
  ('99999997-0000-0000-0000-000000000002', 'demo-faculty-02@demo.local',
   '{"full_name":"Prof. Meera Demo"}'::jsonb)
on conflict (id) do nothing;

insert into profiles (id, email, full_name)
values
  ('99999997-0000-0000-0000-000000000001', 'demo-faculty-01@demo.local', 'Dr. Aarav Demo'),
  ('99999997-0000-0000-0000-000000000002', 'demo-faculty-02@demo.local', 'Prof. Meera Demo')
on conflict (id) do nothing;

-- Cohort assignment (the ensure_demo_cohort_faculty trigger short-circuits
-- for the demo cohort, so this won't recurse).
insert into cohort_faculty (user_id, cohort_id)
values
  ('99999997-0000-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999'),
  ('99999997-0000-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999')
on conflict do nothing;

-- One demo faculty primary on each pod.
insert into pod_faculty (pod_id, faculty_user_id, cohort_id)
values
  ('99999998-0000-0000-0000-000000000001', '99999997-0000-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999'),
  ('99999998-0000-0000-0000-000000000002', '99999997-0000-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999')
on conflict do nothing;

-- ---------- 2. Assignments (6, days 1/3/5/7/9/11) ----------------------------

insert into assignments (id, cohort_id, day_number, kind, title, body_md, due_at)
values
  ('99999996-0001-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999', 1, 'lab',
   'Day 1 · What AI is (and is not)',
   '200-word reflection: how is generative AI different from traditional software?',
   now() - interval '20 days'),
  ('99999996-0001-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999', 3, 'lab',
   'Day 3 · Prompting Practice',
   'Use the CREATE framework to write 3 prompts for different tasks.',
   now() - interval '14 days'),
  ('99999996-0001-0000-0000-000000000003', '99999999-9999-9999-9999-999999999999', 5, 'reflection',
   'Day 5 · Grounded Research',
   'Pick a real problem; list 3 fast-search queries and 1 deep-research prompt.',
   now() - interval '8 days'),
  ('99999996-0001-0000-0000-000000000004', '99999999-9999-9999-9999-999999999999', 7, 'lab',
   'Day 7 · Heilmeier Worksheet',
   'Apply the Heilmeier catechism to your capstone idea.',
   now() - interval '2 days'),
  ('99999996-0001-0000-0000-000000000005', '99999999-9999-9999-9999-999999999999', 9, 'lab',
   'Day 9 · User interview notes',
   'Run one Mom-Test interview and submit your raw notes.',
   now() + interval '4 days'),
  ('99999996-0001-0000-0000-000000000006', '99999999-9999-9999-9999-999999999999', 11, 'capstone',
   'Day 11 · Capstone M2',
   'Idea lock + feature shortlist (1-pager).',
   now() + interval '10 days')
on conflict (id) do nothing;

-- ---------- 3. Submissions (varied states across 10 students) ---------------
-- A1 (day 1): all 10 graded — drives the "graded" view in admin/faculty review.
-- A2 (day 3): 8 submitted, ungraded — drives the "needs grading" queue.
-- A3 (day 5): 6 submitted, 2 draft — mix view.
-- A4 (day 7): 4 submitted, 1 draft — early movers.
-- A5 (day 9): 2 submitted (early) — almost-empty queue.
-- A6 (day 11): 0 — future, no submissions.

-- A1 graded (10 rows)
insert into submissions (id, assignment_id, user_id, body, status, score, graded_at, graded_by, feedback_md)
select
  ('99999996-1000-0001-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999996-0001-0000-0000-000000000001',
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  'Reflection draft — student #' || n,
  'graded'::submission_status,
  3 + ((n * 7) % 3),
  now() - interval '18 days',
  '00000000-0000-0000-0000-000000000001',
  case (n % 3)
    when 0 then 'Strong opening; tighten the thesis.'
    when 1 then 'Clear examples — push for more depth on one.'
    else        'Solid reflection; cite a specific source next time.'
  end
from generate_series(1, 10) n
on conflict (assignment_id, user_id) do nothing;

-- A2 submitted (8 rows, students 1-8)
insert into submissions (id, assignment_id, user_id, body, status)
select
  ('99999996-1000-0002-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999996-0001-0000-0000-000000000002',
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  'Three CREATE prompts — student #' || n,
  'submitted'::submission_status
from generate_series(1, 8) n
on conflict (assignment_id, user_id) do nothing;

-- A3 mix: 6 submitted (1-6) + 2 draft (7-8)
insert into submissions (id, assignment_id, user_id, body, status)
select
  ('99999996-1000-0003-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999996-0001-0000-0000-000000000003',
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  case when n <= 6 then 'Research plan — submitted #' || n
       else 'Research plan — draft #' || n end,
  case when n <= 6 then 'submitted'::submission_status
       else 'draft'::submission_status end
from generate_series(1, 8) n
on conflict (assignment_id, user_id) do nothing;

-- A4 mix: 4 submitted (1-4) + 1 draft (5)
insert into submissions (id, assignment_id, user_id, body, status)
select
  ('99999996-1000-0004-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999996-0001-0000-0000-000000000004',
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  case when n <= 4 then 'Heilmeier worksheet — submitted #' || n
       else 'Heilmeier worksheet — draft #' || n end,
  case when n <= 4 then 'submitted'::submission_status
       else 'draft'::submission_status end
from generate_series(1, 5) n
on conflict (assignment_id, user_id) do nothing;

-- A5 early submissions (2 rows)
insert into submissions (id, assignment_id, user_id, body, status)
select
  ('99999996-1000-0005-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999996-0001-0000-0000-000000000005',
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  'Interview notes — student #' || n,
  'submitted'::submission_status
from generate_series(1, 2) n
on conflict (assignment_id, user_id) do nothing;

-- ---------- 4. Quizzes + attempts -------------------------------------------

insert into quizzes (id, cohort_id, day_number, title, version)
values
  ('99999996-0002-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999', 2,
   'LLM Basics — Tokens, Weights, Attention', 1),
  ('99999996-0002-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999', 8,
   'Design Thinking 5-stage Quick Check', 1)
on conflict (id) do nothing;

-- Quiz 1: 8 attempts (students 1-8), varied scores 60-100
insert into quiz_attempts (id, quiz_id, user_id, score, answers, completed_at)
select
  ('99999996-2000-0001-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999996-0002-0000-0000-000000000001',
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  60 + ((n * 13) % 41),
  jsonb_build_object('q1', 'a', 'q2', 'b', 'q3', 'c'),
  now() - interval '17 days'
from generate_series(1, 8) n
on conflict (quiz_id, user_id) do nothing;

-- Quiz 2: 4 attempts (students 1-4)
insert into quiz_attempts (id, quiz_id, user_id, score, answers, completed_at)
select
  ('99999996-2000-0002-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999996-0002-0000-0000-000000000002',
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  70 + ((n * 11) % 25),
  jsonb_build_object('q1', 'b', 'q2', 'd'),
  now() - interval '5 days'
from generate_series(1, 4) n
on conflict (quiz_id, user_id) do nothing;

-- ---------- 5. Polls + votes -------------------------------------------------

insert into polls (id, cohort_id, day_number, question, options, opened_at, created_by)
values
  ('99999996-0003-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999', 4,
   'Did Open-Source Models meet your expectations today?',
   '["agree","neutral","disagree"]'::jsonb,
   now() - interval '12 days',
   '00000000-0000-0000-0000-000000000001'),
  ('99999996-0003-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999', 10,
   'Which interview style felt most useful?',
   '["mom_test","jtbd","open_ended"]'::jsonb,
   now() - interval '3 days',
   '00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- Poll 1: 9 votes spread across 3 options
insert into poll_votes (poll_id, user_id, choice, voted_at)
select
  '99999996-0003-0000-0000-000000000001',
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  (array['agree','neutral','disagree'])[((n - 1) % 3) + 1],
  now() - interval '11 days'
from generate_series(1, 9) n
on conflict do nothing;

-- Poll 2: 6 votes
insert into poll_votes (poll_id, user_id, choice, voted_at)
select
  '99999996-0003-0000-0000-000000000002',
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  (array['mom_test','jtbd','open_ended'])[((n - 1) % 3) + 1],
  now() - interval '2 days'
from generate_series(1, 6) n
on conflict do nothing;

-- ---------- 6. Announcements (3) --------------------------------------------

insert into announcements (id, cohort_id, title, body_md, audience, created_by, pinned_at)
values
  ('99999996-0004-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999',
   'Welcome to the Demo Cohort',
   'This cohort is a sandbox — every screen is wired, every workflow works. Click around freely.',
   'all'::announcement_audience,
   '00000000-0000-0000-0000-000000000001', now() - interval '21 days'),
  ('99999996-0004-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999',
   'Day 5 spec review · what to bring',
   'Bring your one-pager, a wireframe, and three risks. We review in pods.',
   'students'::announcement_audience,
   '00000000-0000-0000-0000-000000000001', null),
  ('99999996-0004-0000-0000-000000000003', '99999999-9999-9999-9999-999999999999',
   'Faculty huddle — Friday 4pm',
   'Quick sync on grading rubric calibration. Optional but recommended.',
   'faculty'::announcement_audience,
   '00000000-0000-0000-0000-000000000001', null)
on conflict (id) do nothing;

-- ---------- 7. Community posts + replies + votes ----------------------------

insert into community_posts (id, cohort_id, author_id, title, body_md, tags, is_canonical, pinned_at)
values
  ('99999996-0005-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999',
   '99999999-0000-0000-0000-000000000001',
   'Resource thread · prompt engineering',
   'Dropping the best links I found this week. Add yours below.',
   array['resources','prompting'], true, now() - interval '15 days'),
  ('99999996-0005-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999',
   '99999999-0000-0000-0000-000000000003',
   'Stuck on day-3 CREATE prompts',
   'My prompts keep returning generic outputs. Anyone else hitting this?',
   array['help','day-3'], false, null),
  ('99999996-0005-0000-0000-000000000003', '99999999-9999-9999-9999-999999999999',
   '99999997-0000-0000-0000-000000000001',
   'Office hours · Tuesdays 6pm',
   'Drop-in for any blockers. I''ll be in the cohort meet link.',
   array['announcement','office-hours'], false, null),
  ('99999996-0005-0000-0000-000000000004', '99999999-9999-9999-9999-999999999999',
   '99999999-0000-0000-0000-000000000005',
   'Cool finding · Mistral local model',
   'Got Mistral 7B running on a 16GB Mac. Notes inside.',
   array['discovery','local-llm'], false, null)
on conflict (id) do nothing;

-- 2 replies per post
insert into community_replies (id, post_id, author_id, body_md, is_accepted)
values
  ('99999996-0006-0001-0000-000000000001',
   '99999996-0005-0000-0000-000000000001',
   '99999999-0000-0000-0000-000000000002',
   'Adding the Lilian Weng "Prompt Engineering" post — gold.', false),
  ('99999996-0006-0001-0000-000000000002',
   '99999996-0005-0000-0000-000000000001',
   '99999997-0000-0000-0000-000000000001',
   'Pinning this. Great list.', false),
  ('99999996-0006-0002-0000-000000000001',
   '99999996-0005-0000-0000-000000000002',
   '99999997-0000-0000-0000-000000000002',
   'Try giving more context up-front and an example output. Few-shot helps a lot.', true),
  ('99999996-0006-0002-0000-000000000002',
   '99999996-0005-0000-0000-000000000002',
   '99999999-0000-0000-0000-000000000004',
   'Same here yesterday — tightening the role prompt fixed it.', false),
  ('99999996-0006-0003-0000-000000000001',
   '99999996-0005-0000-0000-000000000003',
   '99999999-0000-0000-0000-000000000006',
   'Will be there!', false),
  ('99999996-0006-0003-0000-000000000002',
   '99999996-0005-0000-0000-000000000003',
   '99999999-0000-0000-0000-000000000007',
   'Can we record it for folks in different time zones?', false),
  ('99999996-0006-0004-0000-000000000001',
   '99999996-0005-0000-0000-000000000004',
   '99999999-0000-0000-0000-000000000008',
   'Saving this. Did you try Q4 quantization for memory?', false),
  ('99999996-0006-0004-0000-000000000002',
   '99999996-0005-0000-0000-000000000004',
   '99999997-0000-0000-0000-000000000001',
   'Nice write-up — would love a screen recording.', false)
on conflict (id) do nothing;

-- Votes (~5 per post): each row asserts user_id + post_id + reply_id triple unique
-- Post-level upvotes from students 2..6 on post 1; mix on others.
insert into community_votes (user_id, post_id, reply_id, value, voted_at)
select
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999996-0005-0000-0000-000000000001'::uuid,
  null::uuid,
  1::smallint,
  now() - interval '14 days'
from generate_series(2, 6) n
on conflict do nothing;

insert into community_votes (user_id, post_id, reply_id, value, voted_at)
select
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999996-0005-0000-0000-000000000002'::uuid,
  null::uuid,
  1::smallint,
  now() - interval '13 days'
from generate_series(1, 5) n
where n <> 3 -- author can't upvote their own
on conflict do nothing;

insert into community_votes (user_id, post_id, reply_id, value, voted_at)
select
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999996-0005-0000-0000-000000000004'::uuid,
  null::uuid,
  1::smallint,
  now() - interval '11 days'
from generate_series(1, 4) n
where n <> 5
on conflict do nothing;

-- ---------- 8. Help-desk queue (5 tickets, mixed states) --------------------

insert into help_desk_queue
  (id, user_id, cohort_id, kind, status, message, claimed_by,
   resolution, escalated_at, escalated_by, escalation_note, created_at)
values
  ('99999996-0007-0000-0000-000000000001',
   '99999999-0000-0000-0000-000000000001',
   '99999999-9999-9999-9999-999999999999',
   'content'::help_desk_kind, 'open'::help_desk_status,
   'Day-3 prompt examples seem off — outputs are always generic.',
   null, null, null, null, null, now() - interval '4 hours'),

  ('99999996-0007-0000-0000-000000000002',
   '99999999-0000-0000-0000-000000000002',
   '99999999-9999-9999-9999-999999999999',
   'tech'::help_desk_kind, 'helping'::help_desk_status,
   'Lab notebook crashes on the embedding step.',
   '99999997-0000-0000-0000-000000000001',
   null, null, null, null, now() - interval '1 day'),

  ('99999996-0007-0000-0000-000000000003',
   '99999999-0000-0000-0000-000000000003',
   '99999999-9999-9999-9999-999999999999',
   'content'::help_desk_kind, 'resolved'::help_desk_status,
   'How do I export my Heilmeier worksheet?',
   '99999997-0000-0000-0000-000000000001',
   'Use the "Export PDF" button at the bottom of the assignment view.',
   null, null, null, now() - interval '3 days'),

  ('99999996-0007-0000-0000-000000000004',
   '99999999-0000-0000-0000-000000000004',
   '99999999-9999-9999-9999-999999999999',
   'tech'::help_desk_kind, 'open'::help_desk_status,
   'Submission upload failing repeatedly with 500.',
   null, null, now() - interval '2 hours',
   '99999997-0000-0000-0000-000000000002',
   'Pod faculty couldn''t reproduce — likely platform issue, please investigate.',
   now() - interval '6 hours'),

  ('99999996-0007-0000-0000-000000000005',
   '99999999-0000-0000-0000-000000000005',
   '99999999-9999-9999-9999-999999999999',
   'team'::help_desk_kind, 'open'::help_desk_status,
   'Pod partner hasn''t responded in 3 days. Re-pair?',
   null, null, null, null, null, now() - interval '8 hours')
on conflict (id) do nothing;

-- ---------- 9. Attendance (days 1-5, 10 students) ----------------------------
-- Mostly present, a few absent/late/excused for variety.
insert into attendance (cohort_id, day_number, user_id, status, marked_by, marked_at)
select
  '99999999-9999-9999-9999-999999999999',
  d,
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  case
    when (s + d) % 11 = 0 then 'absent'::attendance_status
    when (s + d) % 7  = 0 then 'late'::attendance_status
    when (s + d) % 13 = 0 then 'excused'::attendance_status
    else 'present'::attendance_status
  end,
  '99999997-0000-0000-0000-000000000001',
  now() - (interval '1 day' * (20 - d))
from generate_series(1, 10) s
cross join generate_series(1, 5) d
on conflict do nothing;

-- ---------- 10. Lab progress (scattered) ------------------------------------
insert into lab_progress (user_id, cohort_id, day_number, lab_id, status, updated_at)
select
  ('99999999-0000-0000-0000-' || lpad(\1::text, 12, '0'))::uuid,
  '99999999-9999-9999-9999-999999999999',
  d,
  'day-' || d || '-lab-1',
  case
    when (s + d) % 4 = 0 then 'not_started'::lab_status
    when (s + d) % 3 = 0 then 'in_progress'::lab_status
    else                      'done'::lab_status
  end,
  now() - (interval '1 day' * (15 - d))
from generate_series(1, 10) s
cross join generate_series(1, 5) d
on conflict do nothing;

-- ---------- 11. Faculty pod notes (3) ---------------------------------------
insert into faculty_pod_notes (id, cohort_id, student_id, author_id, body_md, needs_followup)
values
  ('99999996-000a-0000-0000-000000000001',
   '99999999-9999-9999-9999-999999999999',
   '99999999-0000-0000-0000-000000000003',
   '99999997-0000-0000-0000-000000000001',
   'Strong on theory, struggles to articulate user problems. Pair with a customer-facing role next sprint.',
   false),
  ('99999996-000a-0000-0000-000000000002',
   '99999999-9999-9999-9999-999999999999',
   '99999999-0000-0000-0000-000000000005',
   '99999997-0000-0000-0000-000000000002',
   'Self-driven; built local Mistral demo unprompted. Worth featuring in the showcase.',
   false),
  ('99999996-000a-0000-0000-000000000003',
   '99999999-9999-9999-9999-999999999999',
   '99999999-0000-0000-0000-000000000007',
   '99999997-0000-0000-0000-000000000001',
   'Quiet in pod sessions; check engagement next week.',
   true)
on conflict (id) do nothing;

-- ---------- 12. Kudos (4) ---------------------------------------------------
insert into kudos (id, cohort_id, from_user_id, to_user_id, day_number, note, created_at)
values
  ('99999996-000b-0000-0000-000000000001',
   '99999999-9999-9999-9999-999999999999',
   '99999999-0000-0000-0000-000000000002',
   '99999999-0000-0000-0000-000000000005',
   3,
   'Helped me debug my prompt for an hour. Legend.',
   now() - interval '13 days'),
  ('99999996-000b-0000-0000-000000000002',
   '99999999-9999-9999-9999-999999999999',
   '99999999-0000-0000-0000-000000000004',
   '99999999-0000-0000-0000-000000000001',
   1,
   'Resource thread is gold — saved me hours.',
   now() - interval '14 days'),
  ('99999996-000b-0000-0000-000000000003',
   '99999999-9999-9999-9999-999999999999',
   '99999999-0000-0000-0000-000000000006',
   '99999999-0000-0000-0000-000000000003',
   3,
   'Asked the question I was afraid to ask. Thanks!',
   now() - interval '12 days'),
  ('99999996-000b-0000-0000-000000000004',
   '99999999-9999-9999-9999-999999999999',
   '99999999-0000-0000-0000-000000000008',
   '99999999-0000-0000-0000-000000000005',
   null,
   'Shared the local-LLM setup — saved me a weekend.',
   now() - interval '10 days')
on conflict (id) do nothing;
