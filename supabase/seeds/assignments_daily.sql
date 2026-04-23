-- Pass/fail artifact acknowledgments for non-milestone days.
-- Milestone days (5, 10, 15, 20, 21, 25, 30) already have their own assignments and are skipped.
-- Each row is a "faculty confirms seen" gate: zero points, empty rubric_items, no due_at.
-- Descriptions include **Peer or self-review** (1 line) + **Stretch (optional)** to raise artifact quality without new rubric rows.
begin;

insert into public.assignments (cohort_id, day_number, title, description, rubric, submission_type, points, rubric_items)
values
  ('56268633-9e93-4305-af6a-1b622a833d8e', 1, 'Submit your 150-word AI reflection',
    'Write a 150-word one-paragraph reflection titled "Day 1 — What surprised me about AI today." No AI assistance — this is your honest Day-0 baseline we''ll compare against on Day 30. Submit as a Google Doc, Notion page, or .txt / .md file link. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add one sentence naming a fact you would still verify manually before trusting any model.',
    'Pass/fail: artifact exists, hits ~150 words, no AI-assist traces.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 2, 'Submit your tokenizer notebook + 150 words',
    'Extend today''s tokenizer notebook with three new strings (a WhatsApp group name, a mother-tongue lyric, a code snippet) and write a 150-word reflection titled "Three things that surprised me about how LLMs see text." Submit both as one link (PDF export or Notion). **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Tokenize one extra phrase in a third language you speak and note token count vs English.',
    'Pass/fail: notebook shows the three added strings and reflection hits ~150 words.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 3, 'Submit your 5-task Tool Audit',
    'Extend the in-class tool audit to 5 real tasks from your life, pick a primary and backup tool for each, and close with a one-paragraph declaration of your personal AI stack for the next 30 days. Export as PDF and drop the link. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add a sixth ''wildcard'' task with an anti-pattern (tool you should NOT use) and why.',
    'Pass/fail: 5 tasks, primary + backup per task, closing stack paragraph present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 4, 'Submit your 10-template Prompt Library',
    'Ship 10 reusable prompt templates — one each for study, resume, LinkedIn, code explanation, email, brainstorming, summarisation, translation, devil''s advocate, and a wildcard. Every template uses {{placeholder}} variables and visibly applies at least 3 CREATE letters. Submit as a PDF or Notion link. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add an 11th template for ''failure analysis / postmortem'' with CREATE + placeholders.',
    'Pass/fail: 10 templates present with placeholders and CREATE tagging.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 6, 'Submit your Jarvis Project + 3-model screenshots',
    'Finish your Claude Project ("Jarvis") with resume, transcript, and 5 capstone ideas uploaded, then run the same planning prompt through ChatGPT, Claude, and Gemini. Post a screenshot of the Project sidebar plus three captioned chatbot screenshots to the cohort channel and drop the link. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Paste one additional prompt comparison: same task with Memory ON vs OFF in one tool.',
    'Pass/fail: Jarvis sidebar visible, three screenshots with one-line captions each.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 7, 'Submit your research brief + NotebookLM audio',
    'Lock a 1-page `brief-<topic>.md` with at least 5 inline citations, generate a NotebookLM Audio Overview link, and add one "I almost quoted this…" sentence naming a claim you had to rewrite after clicking the source. Post all three to the cohort channel and share the link. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add a sixth citation that contradicts a headline claim from a general chatbot answer.',
    'Pass/fail: brief has 5+ citations, audio link present, "almost quoted" line included.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 8, 'Submit your capstone poster + 10-second video',
    'Ship a print-ready 2:3 capstone poster PNG (Nano Banana / Firefly, composited in Canva or Ideogram as needed), a 10-second MP4 from Kling / Runway / Pika, and a one-line tagline under 10 words. Post with `#day08-showcase` and share the link. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Export a second poster variant (different style) and note which feels more on-brand.',
    'Pass/fail: poster PNG, 10-second MP4, and sub-10-word tagline all present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 9, 'Submit your 5-slide deck + avatar intro',
    'Lock a 5-slide Gamma deck (one idea per slide, ≤6 words per bullet) as a PDF, record a 30-second AI-avatar or ElevenLabs-voiced MP4 intro, and add a one-line self-review naming your weakest slide and why. Post to the cohort with `#day09-pitch` and share the link. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Record a 15-second B-roll cut that could replace your weakest slide visually.',
    'Pass/fail: deck PDF, 30-sec MP4, and self-review line all present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 11, 'Submit your sticky-note problem + HMW reframe',
    'Finish the three Heilmeier drafts (v1 long-form, v2 150-word, v3 sticky note), run 5 Whys on the core pain, and convert v3 into a single "How Might We …" question. Post the sticky photo, HMW line, and root cause to the cohort channel — no commentary. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add a one-line ''anti-HMW'' — the framing you rejected and why.',
    'Pass/fail: sticky photo, HMW question, and 5-Whys root cause all present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 12, 'Submit your 5-column design-thinking board + POV',
    'Finish mapping all five columns (Empathize, Define, Ideate, Prototype, Test) on your FigJam board, write a POV statement in the `[user] needs [verb-based need] because [surprising insight]` format, and post a board screenshot plus your POV plain-text and the stinging Claude critique you plan to close before Day 14. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add three ''bad ideas'' from ideate that you explicitly will NOT pursue.',
    'Pass/fail: 5-column board screenshot, POV statement, and critique-gap plan present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 13, 'Submit your user-interview package',
    'Run one real candidate-user interview (second happens before Day 15), get recorded consent, and transcribe via Otter. Submit the Otter transcript(s) plus a short write-up naming 3 surprising insights that contradicted something you believed on Day 11. This rolls into the Day 15 milestone. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Pull one verbatim quote from the transcript that surprised you and tag it Mom-Test clean/leading.',
    'Pass/fail: at least one transcript + 3 contradicting-insight write-up present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 14, 'Submit your causal-loop diagram + 60-sec pitch',
    'Lock your Excalidraw causal-loop diagram (leverage point circled in red, polarity on every arrow), a 60-second SCQA pitch under 150 words naming one specific user, and a 2-minute voice memo of you delivering the pitch out loud — no reading. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add a second leverage point hypothesis on the CLD (dashed) and say how you would test it.',
    'Pass/fail: CLD screenshot, SCQA pitch text, and 2-minute voice memo all present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 16, 'Submit your fork, stars, and draft issue',
    'Fork one AI repo you actually use (Ollama, LangChain, n8n, LlamaIndex — your pick), star three OSS AI projects you want to understand better, and open one *draft* issue on a repo you care about (question, typo fix, or feature idea). Drop the three links in the cohort channel. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Comment on one issue you starred with a constructive sentence (not just a thumbs-up reaction).',
    'Pass/fail: fork URL, 3 star URLs, and 1 draft-issue URL all posted.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 17, 'Submit your 3-prompt eval win rates',
    'Build a 10-row eval sheet for a real capstone task (`input`, `expected`), run zero-shot, CoT+critique, and few-shot variants via Groq Playground, score each 1/0, and compute win rates. Post the task, three win-rate numbers, one surprise, and a screenshot of the winning prompt + output. Save the winner in Langfuse with a version tag. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add a 4th prompt variant (e.g., structured JSON output) and its win rate vs the top two.',
    'Pass/fail: three win-rate numbers, winning-prompt screenshot, and Langfuse save all present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 18, 'Submit your RAG bot + 5 Q&A pairs',
    'Ship a RAG bot over your own corpus via NotebookLM, LlamaIndex+Chroma, or pgvector on Neon. Run all 5 pre-class questions and paste question → retrieved chunks → answer for each. Tune one knob (chunk size, top-K, or embedder) and record the before/after delta. Post the bot link + Q&A + delta to the cohort channel. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Log a ''retrieval miss'' example: question where the wrong chunk won — paste chunk titles only.',
    'Pass/fail: bot link, 5 Q&A pairs, and one-knob before/after delta all present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 19, 'Submit your CLAUDE.md + AGENTS.md + slash commands',
    'Tighten CLAUDE.md to 150–250 lines of testable rules, write a vendor-neutral AGENTS.md, and create `.claude/commands/review.md`, `plan.md`, and `explain.md`. Commit everything. Post a screenshot of your repo root showing all four files plus one example task where CLAUDE.md made the AI noticeably smarter on the first try. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add a ''non-goal'' section to CLAUDE.md listing what the AI must never do in this repo.',
    'Pass/fail: repo screenshot shows CLAUDE.md + AGENTS.md + 3 slash commands, plus example task.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 22, 'Submit your live URL + cost worksheet + llms.txt',
    'Ship your capstone to Vercel production with Supabase wired via env vars, build the token-cost worksheet at 10 / 100 / 1000 users, and publish `public/llms.txt` per llmstxt.org. Submit the live URL, the cost worksheet, and the llms.txt URL. Bonus: Schema.org JSON-LD validator result. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Publish a one-paragraph ''incident runbook'' for when the API is down (user-facing copy).',
    'Pass/fail: live URL loads, cost worksheet present, and llms.txt verifies at /llms.txt.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 23, 'Submit your 3-tool LangGraph agent + traces',
    'Finish a 3-tool LangGraph agent (`web_search`, `calculator`, `write_file`) with a ReAct loop, export one successful trace and one failed trace, and apply a single loop-fix (step counter, verification tool, or error-passback). Submit the repo, both traces, and a one-paragraph writeup of the loop-fix. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add a third trace after your loop-fix showing the same task succeeding.',
    'Pass/fail: repo link, two traces, and loop-fix paragraph all present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 24, 'Submit your 2-agent workflow + traces + diagram',
    'Ship a 2-agent workflow in Claude Agent SDK or OpenAI Swarm with a typed handoff payload. Run three test cases with tracing on, export the traces, and draw a handoff diagram (boxes for agents, arrows labelled with payload contents) in the repo README. Submit the repo, three traces, diagram, and a paragraph on why you split the roles the way you did. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Document one handoff failure mode you almost hit and the guardrail you added.',
    'Pass/fail: repo, 3 traces, handoff diagram, and role-split paragraph all present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 26, 'Submit your capstone safety audit',
    'Run Garak''s `promptinject` and `dan` probes end-to-end against your capstone, hand-craft 5 injection payloads targeting your actual use case, and ship a safety audit naming 3 failure modes, 3 concrete fixes with deploy ETAs before Day 30, and one "known unsupported use case" line added to your README. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Record a 30-second screen capture of a blocked injection attempt in the UI.',
    'Pass/fail: 3 failure modes, 3 fixes with pre-Day-30 ETAs, and README unsupported-use-case line all present.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 27, 'Submit your 1-page model card',
    'Ship a 1-page model card for your capstone: chosen model + version, why (benchmark + private eval), fallback + switching criteria, cost per 1k tokens, and expected monthly spend. Run your 5 real prompts against primary and fallback on LM Arena side-by-side and paste two diffs. Wire the fallback into the code, not just the doc. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Add a ''kill switch'' criterion: when you downgrade to fallback automatically (metric).',
    'Pass/fail: card covers model / why / fallback / cost, fallback wired in code.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 28, 'Submit your AI Signal Pipeline doc',
    'Finalise your AI Signal Pipeline: 5 sources — 1 newsletter, 1 podcast, 1 YouTube, 1 X list, 1 paper feed — with channel, frequency, and *why* for each. Subscribe to all 5, create a recurring Friday 30-min "AI signal" calendar event, star the one source you''ll never miss, and post the doc in the cohort channel. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** For each source, note expected weekly time cost (realistic, not aspirational).',
    'Pass/fail: 5 sources with channel + frequency + why, recurring calendar event confirmed.', 'link', 0, '[]'::jsonb),

  ('56268633-9e93-4305-af6a-1b622a833d8e', 29, 'Submit your final rehearsal video + showcase page',
    'Apply the 3 line-level fixes from peer + instructor feedback, re-record the final 3-minute rehearsal Loom, toggle your showcase.html entry live with opt-in ON (URL, screenshot, one-line tagline), and pre-record fallback clips for any demo step > 3s. Submit the showcase URL, the rehearsal video, and hook / story / ask as three paragraphs. **Peer or self-review:** One line in cohort chat or DM — what changed after a 2-minute peer skim, or your main gap if solo. **Stretch (optional):** Upload a 10-second vertical cut of your hook for Stories — optional channel test.',
    'Pass/fail: showcase page live, rehearsal video posted, hook/story/ask paragraphs present.', 'link', 0, '[]'::jsonb)
;

commit;
