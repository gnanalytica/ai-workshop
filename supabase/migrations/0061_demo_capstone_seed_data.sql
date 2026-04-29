-- =============================================================================
-- 0061_demo_capstone_seed_data.sql
-- Seed capstone_projects rows for the demo cohort so the admin fleet view
-- and student /capstone page have realistic content.
-- =============================================================================

insert into capstone_projects
  (cohort_id, user_id, title, problem_statement, target_user, repo_url, demo_url, status)
values
  ('99999999-9999-9999-9999-999999999999', '99999999-0000-0000-0000-000000000001',
   'StudyLoop',
   'Students re-explain concepts to a tutor AI that adapts difficulty in real time. Reduces the gap between "I think I get it" and "I actually do."',
   'Final-year undergrads cramming for placement interviews.',
   'https://github.com/aanyak/studyloop',
   'https://studyloop.demo',
   'building'),

  ('99999999-9999-9999-9999-999999999999', '99999999-0000-0000-0000-000000000002',
   'PantryPal',
   'Suggests recipes from ingredients you already own using a vision model on your fridge.',
   'Working professionals who hate weeknight grocery decisions.',
   'https://github.com/rohanm/pantrypal',
   null,
   'building'),

  ('99999999-9999-9999-9999-999999999999', '99999999-0000-0000-0000-000000000003',
   'CommuteCoach',
   'Uses route + traffic signals to recommend the best mode of transport per trip, learning your priorities (cost vs time vs comfort).',
   'Bangalore commuters with a mix of car/metro/auto options.',
   'https://github.com/priyasharma/commutecoach',
   null,
   'locked'),

  ('99999999-9999-9999-9999-999999999999', '99999999-0000-0000-0000-000000000004',
   'GigBuddy',
   'AI agent for freelancers that drafts proposals, tracks deadlines, and chases overdue invoices.',
   'Solo freelance designers and developers.',
   'https://github.com/liamw/gigbuddy',
   'https://gigbuddy.demo',
   'shipped'),

  ('99999999-9999-9999-9999-999999999999', '99999999-0000-0000-0000-000000000005',
   null,
   'Still exploring — interested in mental-health journaling vs. small-business invoicing.',
   null,
   null,
   null,
   'exploring'),

  ('99999999-9999-9999-9999-999999999999', '99999999-0000-0000-0000-000000000006',
   'CropCast',
   'Hyperlocal weather + soil moisture for small farmers, delivered as a daily WhatsApp brief.',
   'Smallholder farmers in semi-arid Karnataka.',
   'https://github.com/vikrampatel/cropcast',
   null,
   'building'),

  ('99999999-9999-9999-9999-999999999999', '99999999-0000-0000-0000-000000000007',
   'ResumeReviewerAI',
   'Reviews resumes against a target role JD; explains gaps in plain language and suggests rewrites.',
   'Career switchers applying to their first PM/data role.',
   'https://github.com/sarajohansson/resume-reviewer-ai',
   null,
   'locked')
on conflict (cohort_id, user_id) do nothing;
