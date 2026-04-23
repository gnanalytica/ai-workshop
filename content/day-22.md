---
reading_time: 16 min
tldr: "Push your capstone live, compute what it costs per user, design for trust, and make AI engines cite you."
tags: ["build", "ship", "agentic"]
video: https://www.youtube.com/embed/wgmCjrMFoyc
lab: {"title": "Deploy + trust-UX audit + llms.txt", "url": "https://vercel.com/docs"}
prompt_of_the_day: "Audit the trust stack of {{product_url}}. For each of: streaming, uncertainty indicators, citations, stop button, undo, and error recovery — tell me what is present, what is missing, and what one change would most increase user trust."
tools_hands_on: [{"name": "Vercel", "url": "https://vercel.com"}, {"name": "Supabase", "url": "https://supabase.com"}, {"name": "Figma", "url": "https://figma.com"}]
tools_demo: [{"name": "Neon", "url": "https://neon.tech"}, {"name": "Cloudflare Workers", "url": "https://workers.cloudflare.com"}, {"name": "Schema.org validator", "url": "https://validator.schema.org"}]
tools_reference: [{"name": "Fly.io", "url": "https://fly.io"}, {"name": "Render", "url": "https://render.com"}, {"name": "Cloudflare Pages", "url": "https://pages.cloudflare.com"}, {"name": "GitHub Pages", "url": "https://pages.github.com"}, {"name": "Netlify", "url": "https://netlify.com"}, {"name": "Deno Deploy", "url": "https://deno.com/deploy"}, {"name": "Turso", "url": "https://turso.tech"}, {"name": "Modal", "url": "https://modal.com"}, {"name": "Replicate", "url": "https://replicate.com"}, {"name": "AWS Bedrock", "url": "https://aws.amazon.com/bedrock"}, {"name": "GCP Vertex AI", "url": "https://cloud.google.com/vertex-ai"}, {"name": "Azure AI Foundry", "url": "https://azure.microsoft.com/products/ai-foundry"}, {"name": "Ola Krutrim Cloud", "url": "https://olakrutrim.com"}]
resources: [{"name": "llms.txt standard", "url": "https://llmstxt.org"}, {"name": "Schema.org", "url": "https://schema.org"}]
objective:
  topic: "Ship v0 live — deploy, cost-per-user math, trust UX, and GEO via llms.txt"
  tools: ["Vercel", "Supabase", "Figma"]
  end_goal: "Submit a live capstone URL, a token-cost worksheet at 10/100/1000 users, a six-element trust-stack audit, and a verified llms.txt at your domain root."
---

## 🎯 Today's objective

**Topic.** From localhost to the public internet — deploy your v0, know what it costs, design it so users trust it, and publish metadata AI search engines can cite.

**Tools you'll use.** Vercel (deploy), Supabase (pooled Postgres + auth), Figma (trust-UX audit sketch).

**End goal.** By the end of today you will have:
1. A live capstone URL on Vercel, DB-connected via Supabase's pooled endpoint.
2. A token-cost worksheet at 10 / 100 / 1000 users.
3. A six-element trust-stack audit (present / partial / missing + one change each).
4. A verified `yoursite.com/llms.txt` and Schema.org JSON-LD on the landing page.

> *Why this matters:* A capstone that only runs on localhost is a demo of your patience, not your product. Today it goes live, you know the unit economics, and the AI search engines of 2026 can cite you correctly.

---

## ⏪ Pre-class · ~20 min

**Revision / context.** Yesterday (Day 21) was Capstone Milestone 3 — you vibe-coded a v0 that runs locally, with a director's commentary and a 90-second recording. Today we take that exact v0 and put it on the public internet. Your Day 21 repo and CLAUDE.md are the inputs to today's deploy.

### Quick glossary

- **Cold start** — the first-request latency penalty on serverless platforms; what users judge you on.
- **Cost-per-user** — interactions × (input_tokens × input_price + output_tokens × output_price), monthly.
- **GEO (Generative Engine Optimization)** — the craft of getting cited by ChatGPT, Perplexity, Claude, Gemini.
- **llms.txt** — a single markdown file at your domain root that tells LLMs what your site is about.
- **Schema.org** — JSON-LD structured markup that LLMs read preferentially because it's trustworthy.
- **Trust UX** — the six-part stack: streaming, uncertainty, citations, stop, undo, error recovery.

### Setup
- [ ] Sign up for [Vercel](https://vercel.com) free tier and link your GitHub.
- [ ] Confirm your [Supabase](https://supabase.com) account is live (you already have one) and spin up an empty project if you don't.
- [ ] Push your Day 21 v0 code to GitHub — Vercel deploys from there.
- [ ] Open the pricing pages for whichever models you use (Claude, OpenAI, Gemini) in tabs.

### Primer (~5 min)
- **Read**: [llmstxt.org](https://llmstxt.org) — the one-page spec.
- **Watch** (optional): any "deploy to Vercel" 5-minute walkthrough for your stack.

### Bring to class
- [ ] Your v0 repo on GitHub, ready to import into Vercel.
- [ ] A blank spreadsheet (Google Sheets / Numbers) for the token-cost worksheet.
- [ ] A rough guess at how many interactions per user per month your product expects.

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Localhost is not a product — today it goes live |
| Mini-lecture | 20 min | Cold starts, vendor lock-in, cost-per-user math, trust stack, GEO |
| Live lab     | 20 min | Deploy to Vercel, compute cost-per-user, audit trust stack, publish llms.txt |
| Q&A + discussion | 15 min | The cost number that shocked you |

### In-class checkpoints

- **Cold-open**: show of hands — who has a live URL right now? Who's been "deploying tomorrow" for two weeks?
- **Think-pair-share**: in 90 seconds, tell your partner your worst guess at cost-per-user at 1000 users; partner pushes on one assumption.
- **Live poll**: drop your system-prompt token count in chat. We'll rank top-3 and bottom-3.
- **Trust-stack audit breakout**: pair up, open each other's products, each person names two of the six elements that are missing or weak.
- **GEO challenge**: read one teammate's draft llms.txt aloud; does it describe the site in under 20 seconds?

### Read: Shipping, cost math, trust UX, and getting cited by AI

#### Free-tier survival and cold starts

Every hosting platform has a free tier. None of them is free the way you think. They are free as long as your usage stays in the sweet spot: low traffic, short-lived requests, small bundles. Cross a line — cold starts on a big Python image, a long-running LLM stream, a DB connection that never releases — and the platform either charges you or kills your request with a 502.

Rules of survival:

- **Keep bundles small.** Every MB adds to cold start. Strip dev dependencies, tree-shake, lazy-load model clients.
- **Stream LLM responses.** A 30-second non-streamed response looks like a timeout. A 30-second stream looks like thinking.
- **Pool DB connections.** Serverless platforms open a new connection every invocation. Use a pooler (Supabase's pgbouncer, Neon's pooled endpoint) or you will run out of slots at 100 concurrent users.
- **Cache the cacheable.** Static prompts, embeddings for frequent queries, system-prompt prefixes — cache them at the edge.

Cold starts matter because of the perception gap: if your first request takes 4 seconds and every later request takes 200ms, users judge you on the 4. Warm the function on deploy, or pay for the "always-on" tier on the routes that matter most.

#### Vendor lock-in — the real cost you do not see

The cheapest way to ship a v0 is to grab the most magical platform: Vercel + its AI SDK, Supabase + its auth, Cloudflare + Workers AI, or bolt.new's stack. That magic has a price you pay later. Vendor lock-in shows up when you try to move and discover your auth assumes Supabase JWT shape, your queue is a Vercel Cron, your file storage is an R2 bucket, and your model calls use a proprietary router.

You cannot fully avoid lock-in — and you shouldn't, at v0. But you can **quarantine it**. Wrap the vendor SDKs in your own thin interfaces: `db.query()`, `auth.currentUser()`, `llm.complete()`. When the day comes to swap a vendor, you change one file, not fifty.

#### Token-cost math per user

This is the number most junior AI builders never compute, and it eats startups alive. The math is simple; do it today.

For every core interaction a user has with your product, estimate:

- **Input tokens**: system prompt + retrieved context + user message. Count generously.
- **Output tokens**: what the model returns.
- **Model price**: input $/M tokens and output $/M tokens. Look it up on the provider page.
- **Interactions per user per month**: your best guess.

`cost_per_user = interactions × (input_tokens × input_price + output_tokens × output_price)`

A chat app with a 2000-token system prompt, 500 tokens of user message, 600 tokens of response, running on a mid-tier model at $3 input / $15 output per million tokens, used 20 times a month, costs you roughly $0.20 per user per month. That is survivable. Make the system prompt 10,000 tokens because "more context is better" and you just multiplied your burn by 5 without making the product better.

Do the math for 10, 100, and 1000 users. The first number tells you if a demo week is free. The second tells you when your free provider credits run out. The third tells you what your pricing page has to say.

#### UX for AI — the trust stack

AI products have a distinct UX surface area because the model is non-deterministic. Users tolerate weirdness only if the UI tells them what is happening. The **trust stack**:

1. **Streaming.** Show tokens as they arrive. Silence feels like a bug.
2. **Uncertainty indicators.** If the model is not confident, say so — "I'm not sure, but…" prefixes or a confidence bar.
3. **Citations.** Every factual claim should link to its source. Unsourced claims corrode trust permanently.
4. **Stop button.** Always. If the user wants to abort a runaway generation, they should be one click away.
5. **Undo.** Every AI-destructive action (delete, overwrite, commit) must be reversible for at least one minute.
6. **Error recovery.** When the model fails, say what failed and offer one next step — "Retry", "Try a smaller model", "Report this."

Audit your capstone against those six today. Missing two of them is normal for a v0; missing five is a reason users will churn on day one.

#### GEO — Generative Engine Optimization

Google shaped the last 20 years of web UX through SEO. The next decade is shaped by AI search — ChatGPT, Perplexity, Claude, Gemini, every LLM that answers questions with citations. GEO is the craft of getting cited.

Three moves that work today:

- **Publish an `llms.txt`.** A single markdown file at `yourdomain.com/llms.txt` that tells LLMs what your site is about, the most important pages, and how to reference you. The spec is at llmstxt.org.
- **Add Schema.org markup.** JSON-LD blocks that describe your product, FAQs, authors, and articles. LLMs read structured data preferentially because it is trustworthy.
- **Write for extraction.** Short paragraphs, clear headings, one claim per sentence. If a human can skim your page in 30 seconds and summarize it, a model can too.

GEO is not SEO with new hats. It rewards clarity and structure over keyword density. Put a table of contents on every long page. Answer the obvious question in the first paragraph. Link to primary sources, not your own blog.

### Watch: From localhost to live URL in under 20 minutes

https://www.youtube.com/embed/wgmCjrMFoyc

### Lab: Ship it, cost it, trust it, publish llms.txt

1. Connect your capstone repo to Vercel. Push. Take the production URL.
2. If you have a DB, provision a Supabase project and point the app at the pooled connection string. Set env vars in Vercel.
3. Build the **token-cost worksheet**. A spreadsheet with columns: interaction name, input tokens, output tokens, model, price in, price out, cost per interaction, cost per user per month at 10, 100, 1000 users.
4. Do a **trust-UX audit** of your live product in Figma or on paper. For each of the six trust-stack elements, mark present / partial / missing and note one change.
5. Create `public/llms.txt` following llmstxt.org. Include project summary, three important URLs, and author. Deploy. Verify at `yoursite.com/llms.txt`.

> ⚠️ **If you get stuck**
> - *Vercel build fails with "Module not found" even though it runs locally* → check filename casing (macOS is case-insensitive, Linux is not) and confirm the import path matches the file exactly.
> - *Serverless function times out on the first LLM call* → switch the route to a streaming response and raise `maxDuration` in the route config; non-streamed LLM calls routinely exceed the 10s default.
> - *Supabase connection errors under light load ("too many connections")* → you're using the direct connection string. Swap to the pooled (pgbouncer) endpoint from the Supabase dashboard and redeploy.

### Live discussion prompts — The cost surprise

| Prompt | What a strong answer sounds like |
|---|---|
| Share the number that shocked you in your token-cost worksheet. | Names the dollar figure at 100 or 1000 users and the single line-item driving it (e.g., "$48/user/mo — the 8k-token system prompt on every call"). |
| Was it the system prompt, output length, model choice, or interaction count? | Diagnoses the dominant cost term with arithmetic, not vibes. Shows at least one multiplication ("2k in × 20 calls × $3/M = $0.12"). |
| What change drops cost-per-user by 40% without hurting quality, and how would you verify the quality didn't drop? | Proposes a concrete lever (prompt caching, smaller model for cheap turns, retrieval instead of stuffing) and names an eval — even a 10-example side-by-side — to prove quality held. |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action (~70 min)
1. Connect your repo to [Vercel](https://vercel.com), ship to production, capture the live URL.
2. Wire [Supabase](https://supabase.com) (pooled pgbouncer endpoint) via env vars and redeploy.
3. Build the token-cost worksheet at 10 / 100 / 1000 users using `interactions × (in_tokens × in_price + out_tokens × out_price)`.
4. Publish `public/llms.txt` per [llmstxt.org](https://llmstxt.org) and verify at `yoursite.com/llms.txt`.
5. Run the trust-stack audit (six elements) and file present / partial / missing with one-change notes.

### 2. Reflect (~5 min)
Which of the six trust-stack elements is cheapest to add this week, and which will most change how users feel about your product?

### 3. Quiz (~15 min)
1. Why do cold starts hurt perceived performance more than steady-state latency?
2. What does "quarantining vendor lock-in" look like in code?
3. Write the formula for cost per user per month.
4. Name four of the six elements of the AI trust stack.
5. What does an `llms.txt` file do?

### 4. Submit the assignment (~5 min)
**Daily:** Submit (a) your live capstone URL, (b) your token-cost worksheet at 10/100/1000 users, and (c) the URL of your published `llms.txt`. Bonus: add Schema.org JSON-LD to your landing page and paste the Schema.org validator result.

### 5. Deepen (optional ~30 min)
- **Extra video**: a Schema.org JSON-LD walkthrough for your framework.
- **Extra read**: [Schema.org](https://schema.org) Product + FAQ types.
- **Try**: validate your JSON-LD in the [Schema.org validator](https://validator.schema.org) and paste the result in your submission.

### 6. Prep for Day 23 (~30 min — important)

**Tomorrow you stop one-shot prompting and start building agents.** Day 23: a 3-tool LangGraph agent in a ReAct loop, plus your first MCP server wired into Cursor or Claude Desktop.

- [ ] **Confirm Python 3.11+** is available (`python --version`). If not, prep a Google Colab or Replit notebook and note the URL.
- [ ] **Install LangGraph** in a fresh venv: `pip install langgraph langchain-anthropic`.
- [ ] **Have a Claude or OpenAI API key** ready in an env var.
- [ ] **Install [Claude Desktop](https://claude.ai) or [Cursor](https://cursor.com)** for the MCP half of the lab.
- [ ] **Read** the one-page [MCP intro](https://modelcontextprotocol.io).
- [ ] **Write down** three candidate tools you'd want your capstone agent to use.

---

## 📚 Extra / additional references

### Pre-class primers
- [llmstxt.org](https://llmstxt.org) — the spec in one page.
- [Schema.org](https://schema.org)

### Covered during class
- [Vercel](https://vercel.com) — primary deploy target today.
- [Supabase](https://supabase.com) — Postgres + auth + pooled connections.
- [Figma](https://figma.com) — for the trust-UX audit sketch.
- [Schema.org validator](https://validator.schema.org)

### Deep dives (post-class)
- [Neon](https://neon.tech) — serverless Postgres with pooled endpoints.
- [Cloudflare Workers](https://workers.cloudflare.com) — edge alternative.
- [Fly.io](https://fly.io), [Render](https://render.com), [Netlify](https://netlify.com), [Cloudflare Pages](https://pages.cloudflare.com), [Deno Deploy](https://deno.com/deploy) — deploy alternatives.
- [Modal](https://modal.com), [Replicate](https://replicate.com) — GPU / inference.
- [AWS Bedrock](https://aws.amazon.com/bedrock), [GCP Vertex AI](https://cloud.google.com/vertex-ai), [Azure AI Foundry](https://azure.microsoft.com/products/ai-foundry), [Ola Krutrim Cloud](https://olakrutrim.com) — hyperscaler model hosting.
- [Turso](https://turso.tech) — edge SQLite.

### Other videos worth watching
- A "deploy Next.js + streaming LLM to Vercel" walkthrough for your stack.
