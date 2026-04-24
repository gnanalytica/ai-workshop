-- Demo seed: board posts/replies/votes, checklist progress for two support faculty,
-- and cohort pre-training artifacts. Applied 2026-04-24 via MCP.
-- All keys fixed so the seed is idempotent.

insert into public.board_posts (id, author_id, cohort_id, title, body_md, tags, status, created_at)
values
  ('cccc1111-0000-0000-0000-000000000001', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', null,
   'Ollama pull times out behind college proxy',
   E'Trying `ollama pull llama3.2:3b` on the lab machines and it times out after ~40%. Does anyone know if there is a mirror we can use, or a timeout flag?',
   array['tech','setup','lab']::text[], 'open', now() - interval '3 days'),
  ('cccc1111-0000-0000-0000-000000000002', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', '56268633-9e93-4305-af6a-1b622a833d8e',
   'Confused about when to use peer_reviews vs submissions',
   E'For the Day 14 capstone pitch — are peer reviews stored in peer_reviews or do we just comment on the submission row? The handbook mentions both.',
   array['concept','platform']::text[], 'answered', now() - interval '2 days'),
  ('cccc1111-0000-0000-0000-000000000003', '98bcbc23-a049-4182-bc76-8f1dcd3de8d6', null,
   'Python venv activation in VS Code on lab Windows machines',
   E'Some of my pod students can''t get venv activate to run — PowerShell execution policy is blocking it. What is the blessed fix for a lab we don''t have full admin on?',
   array['tech','setup']::text[], 'answered', now() - interval '36 hours'),
  ('cccc1111-0000-0000-0000-000000000004', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', null,
   'How do I give rubric feedback efficiently for 40+ subs?',
   E'Looking for a workflow tip. Opening each student''s submission one at a time is slow.',
   array['general','platform']::text[], 'open', now() - interval '1 day'),
  ('cccc1111-0000-0000-0000-000000000005', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', '56268633-9e93-4305-af6a-1b622a833d8e',
   'LangGraph install errors with pip on macOS 14',
   E'pip install langgraph fails with a build error. Pasting the full trace. Has anyone seen this on macOS 14 + Python 3.11?',
   array['tech','setup']::text[], 'open', now() - interval '4 hours'),
  ('cccc1111-0000-0000-0000-000000000006', '98bcbc23-a049-4182-bc76-8f1dcd3de8d6', '56268633-9e93-4305-af6a-1b622a833d8e',
   'Pod Alpha retro — what worked in Week 1',
   E'Quick notes from our pod retro so other support faculty can borrow ideas: pair rotation on day 3, morning checklist, standup at 9:05 sharp.',
   array['general']::text[], 'open', now() - interval '12 hours')
on conflict (id) do nothing;

insert into public.board_replies (id, post_id, author_id, body_md, is_accepted_answer, created_at)
values
  ('dddd2222-0000-0000-0000-000000000001', 'cccc1111-0000-0000-0000-000000000001',
   'e714a59e-2e5d-4636-bd96-1b7756d7e37e',
   E'Set OLLAMA_HOST on a laptop with good bandwidth, have students pull from that host. Or pre-download the model file and distribute.',
   false, now() - interval '2 days 18 hours'),
  ('dddd2222-0000-0000-0000-000000000002', 'cccc1111-0000-0000-0000-000000000002',
   'e714a59e-2e5d-4636-bd96-1b7756d7e37e',
   E'Good question. Peer reviews live in peer_reviews rows (one per reviewer-reviewee pair). Submission comments are for instructor feedback. You never mix.',
   true, now() - interval '1 day 20 hours'),
  ('dddd2222-0000-0000-0000-000000000003', 'cccc1111-0000-0000-0000-000000000003',
   'e714a59e-2e5d-4636-bd96-1b7756d7e37e',
   E'On a non-admin Windows lab: py -m venv .venv then call .venv\\Scripts\\python.exe directly. Skip activation entirely — no execution-policy drama.',
   true, now() - interval '24 hours'),
  ('dddd2222-0000-0000-0000-000000000004', 'cccc1111-0000-0000-0000-000000000003',
   '98bcbc23-a049-4182-bc76-8f1dcd3de8d6',
   E'Confirmed this works on our lab. Thanks Sandeep!',
   false, now() - interval '22 hours'),
  ('dddd2222-0000-0000-0000-000000000005', 'cccc1111-0000-0000-0000-000000000006',
   '015a3f8e-7c7a-4d46-98f3-db40c45e3746',
   E'Stealing the 9:05 standup idea, thank you!',
   false, now() - interval '8 hours'),
  ('dddd2222-0000-0000-0000-000000000006', 'cccc1111-0000-0000-0000-000000000004',
   '98bcbc23-a049-4182-bc76-8f1dcd3de8d6',
   E'Keyboard tip: open the admin-student drawer for one student, use arrow keys to move through pod submissions without reopening. Cuts grading time roughly in half.',
   false, now() - interval '3 hours')
on conflict (id) do nothing;

insert into public.board_votes (user_id, post_id, reply_id)
values
  ('e714a59e-2e5d-4636-bd96-1b7756d7e37e', 'cccc1111-0000-0000-0000-000000000001', null),
  ('98bcbc23-a049-4182-bc76-8f1dcd3de8d6', 'cccc1111-0000-0000-0000-000000000001', null),
  ('015a3f8e-7c7a-4d46-98f3-db40c45e3746', null, 'dddd2222-0000-0000-0000-000000000002'),
  ('015a3f8e-7c7a-4d46-98f3-db40c45e3746', null, 'dddd2222-0000-0000-0000-000000000003'),
  ('98bcbc23-a049-4182-bc76-8f1dcd3de8d6', 'cccc1111-0000-0000-0000-000000000004', null)
on conflict do nothing;

insert into public.faculty_pretraining_progress (user_id, cohort_id, progress, signoff)
values
  ('98bcbc23-a049-4182-bc76-8f1dcd3de8d6',
   '56268633-9e93-4305-af6a-1b622a833d8e',
   jsonb_build_object('checklist', jsonb_build_object(
     'read_handbook',     to_char(now() - interval '5 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
     'attended_live',     to_char(now() - interval '4 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
     'know_pod',          to_char(now() - interval '4 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
     'verified_labs',     to_char(now() - interval '3 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
     'setup_dryrun',      to_char(now() - interval '3 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
     'know_attendance',   to_char(now() - interval '2 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
     'know_grading',      to_char(now() - interval '2 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
     'know_triage',       to_char(now() - interval '1 day',  'YYYY-MM-DD"T"HH24:MI:SS"Z"')
   )),
   false),
  ('b28f44e6-0313-4da6-864c-c3987ce94278',
   '56268633-9e93-4305-af6a-1b622a833d8e',
   jsonb_build_object('checklist', jsonb_build_object(
     'read_handbook',     to_char(now() - interval '2 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
     'attended_live',     to_char(now() - interval '2 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
     'know_pod',          to_char(now() - interval '1 day',  'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
     'know_triage',       to_char(now() - interval '12 hours','YYYY-MM-DD"T"HH24:MI:SS"Z"')
   )),
   false)
on conflict (user_id, cohort_id) do update set progress = excluded.progress, updated_at = now();

update public.cohorts
  set pretraining_slides_url = 'https://docs.google.com/presentation/d/demo-pretraining-slides/edit',
      pretraining_recording_url = 'https://example.com/pretraining-recording.mp4',
      pretraining_session_at = now() + interval '3 days',
      pretraining_notes = 'Dial-in link and agenda will be emailed 24h before. Bring a laptop with the lab image ready; we will do a live dry-run of Day 3 together.'
where id = '56268633-9e93-4305-af6a-1b622a833d8e';
