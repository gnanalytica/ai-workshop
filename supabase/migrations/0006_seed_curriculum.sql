-- =============================================================================
-- 0006_seed_curriculum.sql  --  Reusable function to seed a 30-day curriculum
-- skeleton (titles + capstone milestone days). Idempotent per cohort.
-- Curriculum body lives in MDX under web/content/day-XX.mdx; this only sets
-- the day records used by attendance, schedule, and assignment FKs.
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
    ['19','Frontend Foundations','none'],
    ['20','Building UIs with AI','none'],
    ['21','Milestone 4: Workspace Setup & First Deploy','spec_review'],
    ['22','Agentic AI: ReAct / LangGraph / MCP','none'],
    ['23','Cost Estimation of AI','none'],
    ['24','Text2Audio / Text2Video','none'],
    ['25','Local LLMs / Prompt Patterns / Evals / Tracing','none'],
    ['26','Final Capstone Build','none'],
    ['27','AI Ethics, Safety, Guard-rails, Red-teaming','none'],
    ['28','GEO / Leaderboards / Benchmarking','none'],
    ['29','Demo Day 1','demo_day'],
    ['30','Demo Day 2 + Cohort Closing','demo_day']
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
