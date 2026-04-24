-- Demo seed: 18 additional board Q&A posts covering realistic 30-day AI workshop topics.
-- Applied 2026-04-24 via MCP. All IDs fixed so re-running is a no-op.
-- Authors mix the trainer (sandeep@gnanalytica.com), support faculty (sandeep97pvn
-- and faculty01-04), and a student (sandeeppvn@gmail.com), so the board looks
-- populated by the cohort rather than by one person.

-- Coverage by tag:
--   concept  : tokens, non-determinism, temperature vs top_p, system vs few-shot,
--              RAG debug, chunking strategy, embeddings model choice, LangGraph
--              node vs tool, tool-loop termination, MCP vs function-calling.
--   tech     : OpenAI key on lab, .env in git, RAG debug, tool-loop, embeddings.
--   setup    : API key env, Anthropic billing, secret handling, Ollama on 8GB.
--   platform : Anthropic billing, submission grade state, resubmission, pretraining deck.
--   lab      : OpenAI key on lab, 8GB Ollama.
--   general  : pair programming, pretraining deck.

-- Two canonical trainer-authored explainers (tokens, non-determinism) marked as
-- accepted answers to show the "accepted" badge on the board UI.

insert into public.board_posts (id, author_id, cohort_id, title, body_md, tags, status, created_at) values

('cccc1111-0000-0000-0000-000000000010', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', null,
 'What exactly is a "token" — does one word = one token?',
 E'Day 2 mentioned tokens a lot but I''m fuzzy on it. Are tokens just words? Sometimes I see the same prompt reported as different token counts in different tools.',
 array['concept']::text[], 'answered', now() - interval '14 days'),

('cccc1111-0000-0000-0000-000000000011', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', null,
 'Why does the same prompt give different answers each time?',
 E'I asked Claude the same factual question three times in a row and got three slightly different phrasings. Is the model broken, or is this expected?',
 array['concept']::text[], 'answered', now() - interval '13 days'),

('cccc1111-0000-0000-0000-000000000012', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', null,
 'Temperature vs top_p — when do I tune which?',
 E'Both of them seem to control "creativity". What''s the practical rule of thumb for picking one over the other?',
 array['concept']::text[], 'open', now() - interval '12 days'),

('cccc1111-0000-0000-0000-000000000013', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', '56268633-9e93-4305-af6a-1b622a833d8e',
 'System prompt vs few-shot examples — same thing or different?',
 E'On Day 4 we did both. To me they look like just different places to put instructions. Am I missing something?',
 array['concept']::text[], 'answered', now() - interval '11 days'),

('cccc1111-0000-0000-0000-000000000014', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', null,
 'OpenAI key works on my laptop but not on the lab machine',
 E'Set OPENAI_API_KEY in the shell, works at home. On the college lab it errors "Incorrect API key provided". Did I mess up the export, or is there a firewall issue?',
 array['tech','setup','lab']::text[], 'answered', now() - interval '10 days'),

('cccc1111-0000-0000-0000-000000000015', '216936bd-e143-4658-b674-9f8626b2fb03', '56268633-9e93-4305-af6a-1b622a833d8e',
 'Anthropic API — do we need a paid account to use claude-haiku-4-5?',
 E'One of my pod students tried a free Anthropic account and got a 403. Do they need to add billing even for small requests?',
 array['setup','platform']::text[], 'answered', now() - interval '9 days'),

('cccc1111-0000-0000-0000-000000000016', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', null,
 'How do I hide my API key when pushing to GitHub?',
 E'I accidentally committed my `.env` file and GitHub sent me a "secret exposed" email. Already rotated the key. What''s the correct `.gitignore` + structure for the next time?',
 array['setup','tech']::text[], 'answered', now() - interval '8 days'),

('cccc1111-0000-0000-0000-000000000017', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', null,
 'RAG returned the wrong chunk — how do I debug retrieval quality?',
 E'My retriever keeps surfacing an unrelated paragraph for questions about pricing. The pricing page IS in the index. Where do I start debugging — embedding model, chunk size, top-k?',
 array['concept','tech']::text[], 'answered', now() - interval '7 days'),

('cccc1111-0000-0000-0000-000000000018', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', null,
 'Chunking strategy — fixed size, sentence, or semantic?',
 E'Day 11 had us pick one. I went with 500-char fixed size and it felt arbitrary. Is there a heuristic based on document type?',
 array['concept']::text[], 'open', now() - interval '6 days'),

('cccc1111-0000-0000-0000-000000000019', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', null,
 'Can I use Ollama embeddings in production or only for the workshop?',
 E'nomic-embed-text is what we use locally. For my capstone I want to ship something real. Is it good enough or should I switch to OpenAI text-embedding-3-small?',
 array['concept','tech']::text[], 'answered', now() - interval '5 days'),

('cccc1111-0000-0000-0000-000000000020', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', null,
 'LangGraph — what''s the difference between a node and a tool?',
 E'Both seem to "do a thing" and then return. I can''t intuit when to make something a node vs a tool bound to a ReAct agent.',
 array['concept']::text[], 'answered', now() - interval '4 days'),

('cccc1111-0000-0000-0000-000000000021', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', '56268633-9e93-4305-af6a-1b622a833d8e',
 'Tool loop never terminates — agent keeps calling search',
 E'My ReAct-style agent calls the search tool 20 times in a row. There''s a max_iterations but is the right fix that, or a better system prompt?',
 array['tech','concept']::text[], 'answered', now() - interval '3 days'),

('cccc1111-0000-0000-0000-000000000022', '98bcbc23-a049-4182-bc76-8f1dcd3de8d6', '56268633-9e93-4305-af6a-1b622a833d8e',
 'Function-calling vs MCP — do students need to learn both?',
 E'Curriculum touches both. Wondering if we should pick one to go deep on for the capstone or treat them as different hats.',
 array['concept']::text[], 'open', now() - interval '2 days'),

('cccc1111-0000-0000-0000-000000000023', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', '56268633-9e93-4305-af6a-1b622a833d8e',
 'My submission shows "not graded" but my pod faculty told me it''s good',
 E'Faculty reviewed verbally and said "looks great" but the dashboard says not graded. Do they need to click a button in admin-student?',
 array['platform']::text[], 'answered', now() - interval '40 hours'),

('cccc1111-0000-0000-0000-000000000024', '015a3f8e-7c7a-4d46-98f3-db40c45e3746', '56268633-9e93-4305-af6a-1b622a833d8e',
 'Can I resubmit an assignment after it was graded?',
 E'I got feedback I want to act on. Does the platform overwrite the grade, or does it start a new attempt?',
 array['platform']::text[], 'answered', now() - interval '28 hours'),

('cccc1111-0000-0000-0000-000000000025', 'bc122299-55f3-4ca3-bea7-39b7b24d5055', '56268633-9e93-4305-af6a-1b622a833d8e',
 'Three of our lab machines have 8GB RAM — can they run Ollama?',
 E'Facing OOM on the smallest Ollama model during the Day 7 lab. Is there a smaller variant, or do those students pair-up with higher-spec machines?',
 array['lab','setup']::text[], 'answered', now() - interval '20 hours'),

('cccc1111-0000-0000-0000-000000000026', '3025591a-a8c0-440d-98b8-222624995544', '56268633-9e93-4305-af6a-1b622a833d8e',
 'Best pair-programming pattern for our pod of 11?',
 E'Odd number, hard to pair. Rotation or triads? Curious what Pod Alpha and Bravo did.',
 array['general']::text[], 'open', now() - interval '16 hours'),

('cccc1111-0000-0000-0000-000000000027', '98bcbc23-a049-4182-bc76-8f1dcd3de8d6', null,
 'Where does the cohort''s pre-training deck live?',
 E'For support faculty doing the 1h pre-training — is the slides URL per-cohort or is there a master deck somewhere?',
 array['general','platform']::text[], 'answered', now() - interval '8 hours')

on conflict (id) do nothing;


insert into public.board_replies (id, post_id, author_id, body_md, is_accepted_answer, created_at) values
('dddd2222-0000-0000-0000-000000000010', 'cccc1111-0000-0000-0000-000000000010', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'Tokens are subword pieces, not whole words. "hello" is usually 1 token, "tokenization" might split into 2–3. Different tokenizers (OpenAI, Anthropic, Llama) disagree by ~15% on the same text, which is why counts differ. Rule of thumb: 1 token ≈ 4 English characters, 1 word ≈ 1.3 tokens.', true, now() - interval '13 days 22 hours'),
('dddd2222-0000-0000-0000-000000000011', 'cccc1111-0000-0000-0000-000000000011', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'Expected. Temperature > 0 means the model samples from a probability distribution over next tokens, so output varies run-to-run. Set `temperature=0` for deterministic factual answers. Still not bit-exact due to batching + hardware, but close enough for lab work.', true, now() - interval '12 days 18 hours'),
('dddd2222-0000-0000-0000-000000000012', 'cccc1111-0000-0000-0000-000000000012', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'Tune one, not both. Defaults: temperature=1.0, top_p=1.0. For factual or code: temperature=0 (top_p doesn''t matter). For brainstorming or creative writing: temperature=0.7-0.9. top_p is rarely worth touching unless you know exactly why — it caps the sampling pool to the top-p probability mass.', false, now() - interval '11 days 20 hours'),
('dddd2222-0000-0000-0000-000000000013', 'cccc1111-0000-0000-0000-000000000013', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'Different mechanism. System prompt is a single instruction at the top of the conversation — best for *role, tone, constraints*. Few-shot is *examples of input→output* in the user/assistant channel — best for *format and pattern matching*. Use system for "you are a terse code reviewer", use few-shot when showing 3 examples teaches the shape better than describing it.', true, now() - interval '10 days 18 hours'),
('dddd2222-0000-0000-0000-000000000014', 'cccc1111-0000-0000-0000-000000000014', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'Two likely causes: (1) your lab shell doesn''t persist env vars between terminal sessions — put the export in your `~/.bashrc` or `~/.zshrc`, or use a `.env` + python-dotenv; (2) the lab proxy strips `Authorization` headers on some networks. Test with `curl -v https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"` — if it hangs or 401s, it''s the network.', true, now() - interval '9 days 20 hours'),
('dddd2222-0000-0000-0000-000000000015', 'cccc1111-0000-0000-0000-000000000015', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'Anthropic requires a billing method on the account before the API accepts any request, even tiny ones. There''s no free tier like OpenAI''s $5 grant. For workshop use, either (a) I share a Gnanalytica-provisioned key via the cohort handbook, or (b) students add a card and we cap at $5 usage. Ping me on Slack to get a shared key.', true, now() - interval '8 days 18 hours'),
('dddd2222-0000-0000-0000-000000000016', 'cccc1111-0000-0000-0000-000000000016', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'Good that you rotated immediately. Canonical setup:\n\n1. Add `.env` (and variants: `.env.*`) to `.gitignore` BEFORE creating the file.\n2. Commit a `.env.example` with *keys only, no values*, so teammates know what''s expected.\n3. Load with `python-dotenv` in Python or `dotenv/config` in Node.\n4. Enable GitHub secret scanning + push protection on every repo (Settings → Code security).\n\nFor key that leaked: rotate, search the full git history for traces (`git log -p -S OPENAI_API_KEY`), and rewrite history with `git-filter-repo` if needed. Better: treat the old key as burned and move on.', true, now() - interval '7 days 20 hours'),
('dddd2222-0000-0000-0000-000000000017', 'cccc1111-0000-0000-0000-000000000017', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'Debug retrieval in this order:\n\n1. **Print the query and the top-5 chunks returned.** If the right chunk is in the top-5 but not top-1, the retriever is fine — your generator ignores context. If the right chunk isn''t even top-5, keep going.\n2. **Embed the query and the expected chunk manually, compute cosine.** If similarity is < 0.4, your embedding model can''t see the semantic link — try a different one, or expand the chunk with context.\n3. **Check chunk size.** Too small = missing context, too big = diluted signal. For Q&A on docs, 500–1000 chars with 100 char overlap is a solid default.\n4. **Hybrid search** (BM25 + dense) often fixes this exact "keyword-y query, dense retriever wandered" case.', true, now() - interval '6 days 20 hours'),
('dddd2222-0000-0000-0000-000000000018', 'cccc1111-0000-0000-0000-000000000018', '98bcbc23-a049-4182-bc76-8f1dcd3de8d6', E'Rough heuristic by doc type:\n- Prose (articles, docs): sentence or paragraph-level, 500–800 chars.\n- Code: function- or class-level; don''t split mid-function.\n- Structured (FAQs, tables): one chunk per row / entry.\n- Transcripts: speaker turn or 30-second window.\n\nSemantic chunking (group by similarity) is trendy but rarely beats a good domain-aware split. Ship fixed-size first, then only switch if retrieval eval scores are bad.', false, now() - interval '5 days 12 hours'),
('dddd2222-0000-0000-0000-000000000019', 'cccc1111-0000-0000-0000-000000000019', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'For the capstone: `nomic-embed-text` is genuinely good — it beats OpenAI''s ada-002 on MTEB and is comparable to text-embedding-3-small at a fraction of the cost (zero, if self-hosted). Use it if your ops story can run Ollama in prod. If your deploy is serverless, OpenAI''s `text-embedding-3-small` is cheaper than running a GPU for embeddings. Don''t mix embedding models between index time and query time — you''ll silently tank retrieval.', true, now() - interval '4 days 10 hours'),
('dddd2222-0000-0000-0000-000000000020', 'cccc1111-0000-0000-0000-000000000020', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'A **node** is a step in *your* control flow — you decide when it runs, by wiring edges. A **tool** is a capability you expose *to the LLM* — the LLM decides when to call it. \n\n- Use a node for deterministic steps: parse input, load data, format output, call an API whose use is non-negotiable.\n- Use a tool for optional capabilities: "the agent can search the web *if it judges it helpful*".\n\nSame function can be wrapped both ways depending on who''s in the driver''s seat.', true, now() - interval '3 days 20 hours'),
('dddd2222-0000-0000-0000-000000000021', 'cccc1111-0000-0000-0000-000000000021', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'max_iterations is the guardrail but not the fix. Common causes in order of frequency:\n\n1. **Tool description doesn''t tell the model when to STOP.** Add "Call this at most twice per conversation. If results are unsatisfying, answer with what you have." to the tool docstring.\n2. **Tool returns empty/garbage → model thinks "maybe next call will work".** Fix: return a clear "no results" string, not `[]`.\n3. **System prompt doesn''t give an escape hatch.** Add "If the tools aren''t helping, answer from your own knowledge and say so."\n\nKeep max_iterations=5 as the belt AND do the above for the suspenders.', true, now() - interval '2 days 18 hours'),
('dddd2222-0000-0000-0000-000000000023', 'cccc1111-0000-0000-0000-000000000023', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'Yes — verbal review doesn''t update the system. Your pod faculty needs to open `day.html`, scroll to the Submissions panel, click your row, set a rubric score (or a simple 1–5), and save. The dashboard reflects it within seconds. If they''re unsure of the rubric, they can flag to me and I''ll moderate.', true, now() - interval '30 hours'),
('dddd2222-0000-0000-0000-000000000024', 'cccc1111-0000-0000-0000-000000000024', '98bcbc23-a049-4182-bc76-8f1dcd3de8d6', E'Resubmission overwrites the previous submission row — there''s only one "current" submission per (student, assignment). The grade clears when you resubmit and your faculty re-grades on the new content. We keep a history in `submissions_history` (trainer-only view), so nothing is lost. Go ahead — re-submission is encouraged.', true, now() - interval '22 hours'),
('dddd2222-0000-0000-0000-000000000025', 'cccc1111-0000-0000-0000-000000000025', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'`llama3.2:1b` fits in 2–3 GB RAM and is usable for the Day 7 lab (summary quality drops but concepts land). Alternatively, pair those students with 16GB machines for Ollama-heavy days and have them run prompt-only labs on their own machine. Don''t run `3b` on 8GB — you''ll thrash.', true, now() - interval '14 hours'),
('dddd2222-0000-0000-0000-000000000027', 'cccc1111-0000-0000-0000-000000000027', 'e714a59e-2e5d-4636-bd96-1b7756d7e37e', E'Per-cohort. Open your cohort in `admin-faculty.html` → "Pre-training materials" card. Slides URL, recording URL, session datetime, and notes live there. The handbook (`faculty-guide.html`) reads those fields into the Live-session artifacts section at the bottom.', true, now() - interval '6 hours')
on conflict (id) do nothing;


insert into public.board_votes (user_id, post_id, reply_id) values
('98bcbc23-a049-4182-bc76-8f1dcd3de8d6', null, 'dddd2222-0000-0000-0000-000000000010'),
('b28f44e6-0313-4da6-864c-c3987ce94278', null, 'dddd2222-0000-0000-0000-000000000010'),
('b28f44e6-0313-4da6-864c-c3987ce94278', 'cccc1111-0000-0000-0000-000000000012', null),
('015a3f8e-7c7a-4d46-98f3-db40c45e3746', null, 'dddd2222-0000-0000-0000-000000000013'),
('216936bd-e143-4658-b674-9f8626b2fb03', null, 'dddd2222-0000-0000-0000-000000000013'),
('98bcbc23-a049-4182-bc76-8f1dcd3de8d6', null, 'dddd2222-0000-0000-0000-000000000014'),
('015a3f8e-7c7a-4d46-98f3-db40c45e3746', null, 'dddd2222-0000-0000-0000-000000000016'),
('bc122299-55f3-4ca3-bea7-39b7b24d5055', null, 'dddd2222-0000-0000-0000-000000000016'),
('015a3f8e-7c7a-4d46-98f3-db40c45e3746', null, 'dddd2222-0000-0000-0000-000000000017'),
('98bcbc23-a049-4182-bc76-8f1dcd3de8d6', null, 'dddd2222-0000-0000-0000-000000000017'),
('3025591a-a8c0-440d-98b8-222624995544', null, 'dddd2222-0000-0000-0000-000000000017'),
('98bcbc23-a049-4182-bc76-8f1dcd3de8d6', 'cccc1111-0000-0000-0000-000000000019', null),
('015a3f8e-7c7a-4d46-98f3-db40c45e3746', null, 'dddd2222-0000-0000-0000-000000000020'),
('bc122299-55f3-4ca3-bea7-39b7b24d5055', null, 'dddd2222-0000-0000-0000-000000000020'),
('015a3f8e-7c7a-4d46-98f3-db40c45e3746', null, 'dddd2222-0000-0000-0000-000000000021'),
('98bcbc23-a049-4182-bc76-8f1dcd3de8d6', null, 'dddd2222-0000-0000-0000-000000000021'),
('b28f44e6-0313-4da6-864c-c3987ce94278', null, 'dddd2222-0000-0000-0000-000000000021'),
('bc122299-55f3-4ca3-bea7-39b7b24d5055', null, 'dddd2222-0000-0000-0000-000000000025'),
('3025591a-a8c0-440d-98b8-222624995544', null, 'dddd2222-0000-0000-0000-000000000025')
on conflict do nothing;
