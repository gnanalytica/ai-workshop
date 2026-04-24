-- Add a title column to cohort_days so the digest + admin pages can read the day's
-- topic from the DB instead of hard-coded constants. Seed from CSV for cohort-01.

alter table public.cohort_days add column if not exists title text;

-- Seed for cohort-01 (the May 2026 cohort)
update public.cohort_days cd
set title = s.t
from (values
  (1,  'What AI is and is not, plus everyday AI'),
  (2,  'Inside an LLM: tokens, weights, attention, memory'),
  (3,  'Prompting Guide: CREATE, few-shot, chain-of-thought, structured output'),
  (4,  'Open Source Models and Indian Stack'),
  (5,  'Grounded research with AI: Fast vs Thinking vs Deep Research'),
  (6,  'Capstone M1: Prompt game, ideathon, brainstorm, research'),
  (7,  'Problem statements: Heilmeier, 5 Whys, How Might We'),
  (8,  'Design thinking as a disciplined five-stage loop'),
  (9,  'User interviews, The Mom Test, JTBD'),
  (10, 'Systems thinking, leverage points, causal loops, SCQA, MindMaps'),
  (11, 'Capstone M2: Idea Lock, features and automations with AI'),
  (12, 'Text2Image: Stable Diffusion, ChatGPT Images, Nano Banana, Firefly'),
  (13, 'Workflow + browser automation: n8n, Zapier, Firecrawl'),
  (14, 'Making presentations with AI: Gamma, Kimi, Canva'),
  (15, 'Vibe coding (with Plan mode): Antigravity, Cursor'),
  (16, 'Capstone M3: Presentation, pitch, prototype, mini demo'),
  (17, 'Git, GitHub, localhost, APIs'),
  (18, 'Deployment with Vercel and Supabase'),
  (19, 'Context engineering: Embeddings & RAG'),
  (20, 'Context engineering: CLAUDE.md, AGENTS.md, rules and skills'),
  (21, 'Capstone M4: Workspace setup and first deploy'),
  (22, 'Agentic AI: ReAct, tool use, LangGraph, MCP, multi-agent'),
  (23, 'Cost estimation: API costs, tokens, knowledge graphs, Neo Cloud GPUs'),
  (24, 'Text2Audio, Text2Video: HeyGen, Higgsfield, Veo3, ElevenLabs'),
  (25, 'Local LLMs, prompt patterns, eval habits, tracing'),
  (26, 'Capstone M5: Add agentic frameworks and a chatbot to your project'),
  (27, 'AI ethics, safety, guardrails, red-teaming'),
  (28, 'GEO, leaderboards, benchmarking, keeping up with AI'),
  (29, 'Demo Day 1'),
  (30, 'Demo Day 2')
) as s(d, t)
where cd.day_number = s.d
  and (cd.title is null or cd.title = '');
