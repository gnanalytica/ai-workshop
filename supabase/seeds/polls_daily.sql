-- Hero in-class poll per day for 30-day AI workshop.
-- Cohort: 56268633-9e93-4305-af6a-1b622a833d8e
-- Each row is the single most load-bearing "Live poll" drawn from
-- that day's `In-class checkpoints` list (formerly minute-by-minute).
-- Where the day's markdown did not list a named "Live poll", we synthesized
-- a poll from the day's key decision point (see commit message for details).

begin;

insert into public.polls (cohort_id, day_number, title, question, kind, options, is_open, created_by)
values
  -- Day 1: explicit live poll at 00:30
  ('56268633-9e93-4305-af6a-1b622a833d8e', 1,
   'Day 1 — Which model felt most human?',
   'After trying the same prompt in three chatbots, which one felt most like talking to a person?',
   'single',
   '["ChatGPT","Claude","Gemini","They all felt the same"]'::jsonb,
   false, null),

  -- Day 2: synthesized from the 00:45 temperature demo decision point
  ('56268633-9e93-4305-af6a-1b622a833d8e', 2,
   'Day 2 — Which temperature will go off the rails first?',
   'Same prompt run at four temperatures — which one breaks first?',
   'single',
   '["0.0","0.5","1.0","1.5"]'::jsonb,
   false, null),

  -- Day 3: explicit live vote at 00:30
  ('56268633-9e93-4305-af6a-1b622a833d8e', 3,
   'Day 3 — Three research tools, one prompt: who won?',
   'Same research prompt on ChatGPT, Perplexity, and Sarvam — which output wins?',
   'single',
   '["ChatGPT","Perplexity","Sarvam","Tie / too close to call"]'::jsonb,
   false, null),

  -- Day 4: explicit live poll at 00:30
  ('56268633-9e93-4305-af6a-1b622a833d8e', 4,
   'Day 4 — JSON output: cheating or grown-up?',
   'Is asking an LLM for JSON output cheating, or just how adults use LLMs?',
   'single',
   '["Cheating","Just how adults use LLMs","Depends on the task","Not sure yet"]'::jsonb,
   false, null),

  -- Day 5: synthesized from 00:05 fist-of-5 check-in
  ('56268633-9e93-4305-af6a-1b622a833d8e', 5,
   'Day 5 — How different does AI feel vs Day 1?',
   'Fist-of-5: how different does AI feel to you today compared to Day 1?',
   'single',
   '["1 — same as Day 1","2","3","4","5 — completely different"]'::jsonb,
   false, null),

  -- Day 6: explicit live poll at 00:30
  ('56268633-9e93-4305-af6a-1b622a833d8e', 6,
   'Day 6 — What is your current default model?',
   'When you open a blank chat, which model do you reach for first today?',
   'single',
   '["ChatGPT","Claude","Gemini","Perplexity","Something else"]'::jsonb,
   false, null),

  -- Day 7: synthesized from 00:05 search-habit vote
  ('56268633-9e93-4305-af6a-1b622a833d8e', 7,
   'Day 7 — How often did you click past Google page 1 last month?',
   'In the last month, how many times did you actually click past page 1 of Google?',
   'single',
   '["Zero","Once","A few times","More than I can count"]'::jsonb,
   false, null),

  -- Day 8: synthesized from 00:30 live-generation vote
  ('56268633-9e93-4305-af6a-1b622a833d8e', 8,
   'Day 8 — Nano Banana vs Firefly: whose image wins?',
   'Same prompt, two image models side by side — which output wins?',
   'single',
   '["Nano Banana","Firefly","Tie","Neither — prompt needs work"]'::jsonb,
   false, null),

  -- Day 9: synthesized from 00:45 uncanny-valley avatar debate
  ('56268633-9e93-4305-af6a-1b622a833d8e', 9,
   'Day 9 — HeyGen avatar: ship it to LinkedIn?',
   'Watching a classmate''s HeyGen avatar pitch — ship it to LinkedIn, or dial it back?',
   'single',
   '["Ship it","Dial it back","Ship it only with a disclosure","Not sure yet"]'::jsonb,
   false, null),

  -- Day 10: synthesized from 00:05 conviction fist-of-5
  ('56268633-9e93-4305-af6a-1b622a833d8e', 10,
   'Day 10 — Conviction in your top capstone idea?',
   'Fist-of-5: how convinced are you in your current top capstone idea right now?',
   'single',
   '["1 — shaky","2","3","4","5 — locked in"]'::jsonb,
   false, null),

  -- Day 11: explicit live poll at 00:30
  ('56268633-9e93-4305-af6a-1b622a833d8e', 11,
   'Day 11 — Mood or statement?',
   'After hearing four anonymised capstone statements — is this one a real statement, or just a mood?',
   'single',
   '["Statement","Mood","Somewhere in between","Can''t tell yet"]'::jsonb,
   false, null),

  -- Day 12: synthesized from 00:45 converge debate
  ('56268633-9e93-4305-af6a-1b622a833d8e', 12,
   'Day 12 — Insight or restated premise?',
   'The two POV statements you just heard — which one actually names a surprising insight?',
   'single',
   '["POV A names a real insight","POV B names a real insight","Both just restate the premise","Too close to call"]'::jsonb,
   false, null),

  -- Day 13: synthesized from 00:05 cold-open "leading vs clean"
  ('56268633-9e93-4305-af6a-1b622a833d8e', 13,
   'Day 13 — Leading or clean interview question?',
   'Instructor just read a question aloud — is it leading, or clean?',
   'single',
   '["Leading","Clean","Borderline","Depends on delivery"]'::jsonb,
   false, null),

  -- Day 14: explicit polarity poll at 00:30
  ('56268633-9e93-4305-af6a-1b622a833d8e', 14,
   'Day 14 — Polarity: anxiety and inbox-checking?',
   'For the variable pair the instructor just named, what is the polarity of the link?',
   'single',
   '["Positive (+)","Negative (-)","Depends on context","Not a real causal link"]'::jsonb,
   false, null),

  -- Day 15: synthesized from 00:10 ruthless-cut moment
  ('56268633-9e93-4305-af6a-1b622a833d8e', 15,
   'Day 15 — Is your spec small enough to lock today?',
   'Look at your "will build" list right now — is it already small enough to ship by Day 30?',
   'single',
   '["Yes, locking it","No, needs cuts","Not sure","Still rewriting"]'::jsonb,
   false, null),

  -- Day 16: explicit live poll at 00:25
  ('56268633-9e93-4305-af6a-1b622a833d8e', 16,
   'Day 16 — Have you seen localhost:3000 before today?',
   'Be honest: had you ever seen `localhost:3000` before walking into today''s session?',
   'single',
   '["Yes, many times","Once or twice","Only in screenshots","Never"]'::jsonb,
   false, null),

  -- Day 17: explicit RAM-check live poll at 00:30
  ('56268633-9e93-4305-af6a-1b622a833d8e', 17,
   'Day 17 — How much RAM does your laptop have?',
   'RAM check so the instructor can recommend a local model for you.',
   'single',
   '["4 GB","8 GB","16 GB+","Not sure"]'::jsonb,
   false, null),

  -- Day 18: synthesized from 00:45 RAG-flavor breakout
  ('56268633-9e93-4305-af6a-1b622a833d8e', 18,
   'Day 18 — Which RAG flavor for your capstone?',
   'For your capstone corpus, which retrieval strategy makes the most sense?',
   'single',
   '["Plain RAG","Hierarchical chunks","GraphRAG","Not sure yet"]'::jsonb,
   false, null),

  -- Day 19: synthesized from 00:55 rule-of-the-day vote
  ('56268633-9e93-4305-af6a-1b622a833d8e', 19,
   'Day 19 — Highest-leverage CLAUDE.md rule?',
   'Which single rule is the highest-leverage line to pin to the top of your CLAUDE.md?',
   'single',
   '["A ''Common Pitfalls'' list","Hard style / format rules","Commands & test entrypoints","Domain glossary","Architecture & file map"]'::jsonb,
   false, null),

  -- Day 20: synthesized from 00:55 dry-run human-in-loop choice
  ('56268633-9e93-4305-af6a-1b622a833d8e', 20,
   'Day 20 — Which node gets human-in-the-loop first?',
   'In your automation flow, which node would you wrap in human approval before anything else?',
   'single',
   '["The AI / LLM node","The send / publish node","The data-write node","The trigger itself","None — I''d let it run"]'::jsonb,
   false, null),

  -- Day 21: explicit live poll at 00:30
  ('56268633-9e93-4305-af6a-1b622a833d8e', 21,
   'Day 21 — Tight leash or long leash?',
   'For your next change in Cursor/Claude Code, do you want a tight leash or a long leash?',
   'single',
   '["Tight leash (T)","Long leash (L)","Depends on the change","Not sure yet"]'::jsonb,
   false, null),

  -- Day 22: explicit live poll at 00:30
  ('56268633-9e93-4305-af6a-1b622a833d8e', 22,
   'Day 22 — How fat is your system prompt?',
   'Drop your current system-prompt token count — which bucket are you in?',
   'single',
   '["Under 200 tokens","200–500","500–1500","1500–3000","3000+"]'::jsonb,
   false, null),

  -- Day 23: explicit live poll at 00:30 (trace-reading A/B/C)
  ('56268633-9e93-4305-af6a-1b622a833d8e', 23,
   'Day 23 — Where would you cut the agent trace?',
   'Reading the instructor''s agent trace — where would you cut context first?',
   'single',
   '["Cut A — early tool outputs","Cut B — intermediate reasoning","Cut C — stale system/preamble","Don''t cut, summarize instead"]'::jsonb,
   false, null),

  -- Day 24: explicit live poll at 00:30
  ('56268633-9e93-4305-af6a-1b622a833d8e', 24,
   'Day 24 — Supervisor, swarm, or hierarchical?',
   'Which multi-agent topology fits your capstone best?',
   'single',
   '["Supervisor (S)","Swarm (W)","Hierarchical (H)","Still single-agent"]'::jsonb,
   false, null),

  -- Day 25: synthesized — demo day critique labelling
  ('56268633-9e93-4305-af6a-1b622a833d8e', 25,
   'Day 25 — Label the critique you just heard',
   'Panelist just gave a piece of feedback on the live demo — what kind was it?',
   'single',
   '["Signal — change the product","Taste — personal preference","Confused — the demo didn''t land","Not sure"]'::jsonb,
   false, null),

  -- Day 26: explicit live poll at 00:25
  ('56268633-9e93-4305-af6a-1b622a833d8e', 26,
   'Day 26 — How many safety patterns does your capstone have?',
   'Stop button, citations, rate-limit, I/O filter, opt-out — how many of the five does your capstone ship with today?',
   'single',
   '["0","1","2","3","4 or 5"]'::jsonb,
   false, null),

  -- Day 27: synthesized from 00:05 blurred-leaderboard guess
  ('56268633-9e93-4305-af6a-1b622a833d8e', 27,
   'Day 27 — Which blurred model is actually better for coding?',
   'Two leaderboard charts, model names blurred — which one would you pick for your coding capstone?',
   'single',
   '["Model A","Model B","Too close to call","Need more info (cost/latency)"]'::jsonb,
   false, null),

  -- Day 28: synthesized from 00:25 five-source pick
  ('56268633-9e93-4305-af6a-1b622a833d8e', 28,
   'Day 28 — Which source will you actually never miss?',
   'Of your 5 chosen sources, which single one will you truly never skip on your Friday slot?',
   'single',
   '["Newsletter","Podcast","YouTube channel","X / Twitter list","Paper feed"]'::jsonb,
   false, null),

  -- Day 29: synthesized — go/no-go gate for tomorrow
  ('56268633-9e93-4305-af6a-1b622a833d8e', 29,
   'Day 29 — Are you go for tomorrow''s showcase?',
   'After your 4-minute dry-run and feedback — are you go, or no-go for showcase day?',
   'single',
   '["Go — shipping as is","Go — with one tiny polish","No-go — hook still doesn''t land","No-go — URL/opt-in not ready"]'::jsonb,
   false, null),

  -- Day 30: synthesized — showcase-day audience choice
  ('56268633-9e93-4305-af6a-1b622a833d8e', 30,
   'Day 30 — Audience pick: which capstone will you try tonight?',
   'Of all the capstones you just watched, which one are you actually going to open tonight?',
   'single',
   '["Most useful to me","Most creative","Most surprising","Most well-built","Haven''t decided yet"]'::jsonb,
   false, null)
;

commit;
