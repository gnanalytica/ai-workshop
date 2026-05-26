-- =============================================================================
-- 0110_resync_curriculum_day19_30.sql
--
-- Resync cohort_days titles + capstone_kind for days 19–30 to match the
-- AI Workshop Curriculum Planner (Sheet3). Days 1–18 are intentionally
-- left as-is per stakeholder direction.
--
-- Source of truth:
-- https://docs.google.com/spreadsheets/d/1naSHXS6j2qzDACvrc1d6X8hNnEh5JWrW3Wjbj8I2uEg
--
-- This migration:
--   1) Replaces seed_curriculum_for so future cohorts get Sheet3 titles for 19–30.
--   2) Backfills existing cohort_days rows for days 19–30 across all cohorts.
-- =============================================================================

create or replace function seed_curriculum_for(p_cohort uuid)
returns void language plpgsql security definer set search_path = public, auth
as $$
declare
  curriculum constant text[][] := array[
    ['1','What AI is and is not','none'],
    ['2','Inside an LLM (tokens / weights / attention)','none'],
    ['3','Prompting Guide: CREATE / few-shot / CoT','none'],
    ['4','Open Source Models & Indian Stack','none'],
    ['5','Grounded Research (Fast / Thinking / Deep)','none'],
    ['6','Capstone M1 — Idea/Research','spec_review'],
    ['7','Heilmeier / 5 Whys / HMW','none'],
    ['8','Design Thinking 5-stage Loop','none'],
    ['9','User Interviews / Mom Test / JTBD','none'],
    ['10','Spec & Wireframes Review','spec_review'],
    ['11','Capstone M2 — Idea Lock + Features','mid_review'],
    ['12','Text2Image (Stable Diffusion / Firefly)','none'],
    ['13','Workflow & Browser Automation (n8n)','none'],
    ['14','AI Presentations (Gamma / Kimi / Canva)','none'],
    ['15','Mid Capstone Review','mid_review'],
    ['16','Capstone M3 — Pitch + Mini Demo','demo_day'],
    ['17','Git / GitHub / localhost / APIs','none'],
    ['18','Deployment: Vercel + Supabase','none'],
    -- Days 19–30: resynced to Sheet3.
    ['19','Capstone Milestone 2: Presentation, Pitch, Prototype + Mini Demo','mid_review'],
    ['20','Deployment with Vercel and Supabase (OpenCode)','none'],
    ['21','Context Engineering: Embeddings & RAG, prompt vs retrieve vs fine-tune','none'],
    ['22','Data Visualization','none'],
    ['23','Adding a Chatbot to your application: Streaming, Guardrails, User & System Prompts','none'],
    ['24','Capstone Milestone 3: Workspace Setup and First Deploy','spec_review'],
    ['25','GEO, AEO, Leaderboards, Benchmarking, Keeping up with AI','none'],
    ['26','Context Engineering: CLAUDE.MD, AGENTS.MD Rules and Skills','none'],
    ['27','Text2Audio, Text2Video','none'],
    ['28','AI Ethics, Safety, Guardrails, Red-teaming','none'],
    ['29','Demo Day 1 — Final Capstone Project','demo_day'],
    ['30','Demo Day 2 — Final Capstone Project','demo_day']
  ];
  i int;
begin
  for i in 1..array_length(curriculum, 1) loop
    insert into cohort_days (cohort_id, day_number, title, capstone_kind)
      values (
        p_cohort,
        curriculum[i][1]::int,
        curriculum[i][2],
        curriculum[i][3]::day_capstone_kind
      )
    on conflict (cohort_id, day_number) do update
      set title = excluded.title,
          capstone_kind = excluded.capstone_kind,
          updated_at = now();
  end loop;
end
$$;

grant execute on function seed_curriculum_for(uuid) to authenticated;

-- Backfill existing cohort_days rows for days 19–30 on every cohort.
update cohort_days set
  title = 'Capstone Milestone 2: Presentation, Pitch, Prototype + Mini Demo',
  capstone_kind = 'mid_review',
  updated_at = now()
where day_number = 19;

update cohort_days set
  title = 'Deployment with Vercel and Supabase (OpenCode)',
  capstone_kind = 'none',
  updated_at = now()
where day_number = 20;

update cohort_days set
  title = 'Context Engineering: Embeddings & RAG, prompt vs retrieve vs fine-tune',
  capstone_kind = 'none',
  updated_at = now()
where day_number = 21;

update cohort_days set
  title = 'Data Visualization',
  capstone_kind = 'none',
  updated_at = now()
where day_number = 22;

update cohort_days set
  title = 'Adding a Chatbot to your application: Streaming, Guardrails, User & System Prompts',
  capstone_kind = 'none',
  updated_at = now()
where day_number = 23;

update cohort_days set
  title = 'Capstone Milestone 3: Workspace Setup and First Deploy',
  capstone_kind = 'spec_review',
  updated_at = now()
where day_number = 24;

update cohort_days set
  title = 'GEO, AEO, Leaderboards, Benchmarking, Keeping up with AI',
  capstone_kind = 'none',
  updated_at = now()
where day_number = 25;

update cohort_days set
  title = 'Context Engineering: CLAUDE.MD, AGENTS.MD Rules and Skills',
  capstone_kind = 'none',
  updated_at = now()
where day_number = 26;

update cohort_days set
  title = 'Text2Audio, Text2Video',
  capstone_kind = 'none',
  updated_at = now()
where day_number = 27;

update cohort_days set
  title = 'AI Ethics, Safety, Guardrails, Red-teaming',
  capstone_kind = 'none',
  updated_at = now()
where day_number = 28;

update cohort_days set
  title = 'Demo Day 1 — Final Capstone Project',
  capstone_kind = 'demo_day',
  updated_at = now()
where day_number = 29;

update cohort_days set
  title = 'Demo Day 2 — Final Capstone Project',
  capstone_kind = 'demo_day',
  updated_at = now()
where day_number = 30;
