---
reading_time: 16 min
tldr: "Push your capstone live, compute what it costs per user, design for trust, and make AI engines cite you."
tags: ["build", "ship", "agentic"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Deploy + trust-UX audit + llms.txt", "url": "https://vercel.com/docs"}
prompt_of_the_day: "Audit the trust stack of {{product_url}}. For each of: streaming, uncertainty indicators, citations, stop button, undo, and error recovery — tell me what is present, what is missing, and what one change would most increase user trust."
tools_hands_on: [{"name": "Vercel", "url": "https://vercel.com"}, {"name": "Supabase", "url": "https://supabase.com"}, {"name": "Figma", "url": "https://figma.com"}]
tools_demo: [{"name": "Neon", "url": "https://neon.tech"}, {"name": "Cloudflare Workers", "url": "https://workers.cloudflare.com"}, {"name": "Schema.org validator", "url": "https://validator.schema.org"}]
tools_reference: [{"name": "Fly.io", "url": "https://fly.io"}, {"name": "Render", "url": "https://render.com"}, {"name": "Cloudflare Pages", "url": "https://pages.cloudflare.com"}, {"name": "GitHub Pages", "url": "https://pages.github.com"}, {"name": "Netlify", "url": "https://netlify.com"}, {"name": "Deno Deploy", "url": "https://deno.com/deploy"}, {"name": "Turso", "url": "https://turso.tech"}, {"name": "Modal", "url": "https://modal.com"}, {"name": "Replicate", "url": "https://replicate.com"}, {"name": "AWS Bedrock", "url": "https://aws.amazon.com/bedrock"}, {"name": "GCP Vertex AI", "url": "https://cloud.google.com/vertex-ai"}, {"name": "Azure AI Foundry", "url": "https://azure.microsoft.com/products/ai-foundry"}, {"name": "Ola Krutrim Cloud", "url": "https://olakrutrim.com"}]
resources: [{"name": "llms.txt standard", "url": "https://llmstxt.org"}, {"name": "Schema.org", "url": "https://schema.org"}]
---

## Intro

Yesterday you built a v0 on your laptop. Today it goes on the internet. A capstone that only runs on localhost is a demo of your patience, not your product. By the end of today you will have a live URL, a token-cost worksheet that tells you how much 10, 100, and 1000 users will cost you per month, a trust-audited UI, and an llms.txt file so the AI search engines of 2026 can cite you correctly.

## Read: Shipping, cost math, trust UX, and getting cited by AI

### Free-tier survival and cold starts

Every hosting platform has a free tier. None of them is free the way you think. They are free as long as your usage stays in the sweet spot: low traffic, short-lived requests, small bundles. Cross a line — cold starts on a big Python image, a long-running LLM stream, a DB connection that never releases — and the platform either charges you or kills your request with a 502.

Rules of survival:

- **Keep bundles small.** Every MB adds to cold start. Strip dev dependencies, tree-shake, lazy-load model clients.
- **Stream LLM responses.** A 30-second non-streamed response looks like a timeout. A 30-second stream looks like thinking.
- **Pool DB connections.** Serverless platforms open a new connection every invocation. Use a pooler (Supabase's pgbouncer, Neon's pooled endpoint) or you will run out of slots at 100 concurrent users.
- **Cache the cacheable.** Static prompts, embeddings for frequent queries, system-prompt prefixes — cache them at the edge.

Cold starts matter because of the perception gap: if your first request takes 4 seconds and every later request takes 200ms, users judge you on the 4. Warm the function on deploy, or pay for the "always-on" tier on the routes that matter most.

### Vendor lock-in — the real cost you do not see

The cheapest way to ship a v0 is to grab the most magical platform: Vercel + its AI SDK, Supabase + its auth, Cloudflare + Workers AI, or bolt.new's stack. That magic has a price you pay later. Vendor lock-in shows up when you try to move and discover your auth assumes Supabase JWT shape, your queue is a Vercel Cron, your file storage is an R2 bucket, and your model calls use a proprietary router.

You cannot fully avoid lock-in — and you shouldn't, at v0. But you can **quarantine it**. Wrap the vendor SDKs in your own thin interfaces: `db.query()`, `auth.currentUser()`, `llm.complete()`. When the day comes to swap a vendor, you change one file, not fifty.

### Token-cost math per user

This is the number most junior AI builders never compute, and it eats startups alive. The math is simple; do it today.

For every core interaction a user has with your product, estimate:

- **Input tokens**: system prompt + retrieved context + user message. Count generously.
- **Output tokens**: what the model returns.
- **Model price**: input $/M tokens and output $/M tokens. Look it up on the provider page.
- **Interactions per user per month**: your best guess.

`cost_per_user = interactions × (input_tokens × input_price + output_tokens × output_price)`

A chat app with a 2000-token system prompt, 500 tokens of user message, 600 tokens of response, running on a mid-tier model at $3 input / $15 output per million tokens, used 20 times a month, costs you roughly $0.20 per user per month. That is survivable. Make the system prompt 10,000 tokens because "more context is better" and you just multiplied your burn by 5 without making the product better.

Do the math for 10, 100, and 1000 users. The first number tells you if a demo week is free. The second tells you when your free provider credits run out. The third tells you what your pricing page has to say.

### UX for AI — the trust stack

AI products have a distinct UX surface area because the model is non-deterministic. Users tolerate weirdness only if the UI tells them what is happening. The **trust stack**:

1. **Streaming.** Show tokens as they arrive. Silence feels like a bug.
2. **Uncertainty indicators.** If the model is not confident, say so — "I'm not sure, but…" prefixes or a confidence bar.
3. **Citations.** Every factual claim should link to its source. Unsourced claims corrode trust permanently.
4. **Stop button.** Always. If the user wants to abort a runaway generation, they should be one click away.
5. **Undo.** Every AI-destructive action (delete, overwrite, commit) must be reversible for at least one minute.
6. **Error recovery.** When the model fails, say what failed and offer one next step — "Retry", "Try a smaller model", "Report this."

Audit your capstone against those six today. Missing two of them is normal for a v0; missing five is a reason users will churn on day one.

### GEO — Generative Engine Optimization

Google shaped the last 20 years of web UX through SEO. The next decade is shaped by AI search — ChatGPT, Perplexity, Claude, Gemini, every LLM that answers questions with citations. GEO is the craft of getting cited.

Three moves that work today:

- **Publish an `llms.txt`.** A single markdown file at `yourdomain.com/llms.txt` that tells LLMs what your site is about, the most important pages, and how to reference you. The spec is at llmstxt.org.
- **Add Schema.org markup.** JSON-LD blocks that describe your product, FAQs, authors, and articles. LLMs read structured data preferentially because it is trustworthy.
- **Write for extraction.** Short paragraphs, clear headings, one claim per sentence. If a human can skim your page in 30 seconds and summarize it, a model can too.

GEO is not SEO with new hats. It rewards clarity and structure over keyword density. Put a table of contents on every long page. Answer the obvious question in the first paragraph. Link to primary sources, not your own blog.

## Watch: From localhost to live URL in under 20 minutes

<!-- TODO: replace video -->

## Lab: Ship it, cost it, trust it, publish llms.txt

1. Connect your capstone repo to Vercel. Push. Take the production URL.
2. If you have a DB, provision a Supabase project and point the app at the pooled connection string. Set env vars in Vercel.
3. Build the **token-cost worksheet**. A spreadsheet with columns: interaction name, input tokens, output tokens, model, price in, price out, cost per interaction, cost per user per month at 10, 100, 1000 users.
4. Do a **trust-UX audit** of your live product in Figma or on paper. For each of the six trust-stack elements, mark present / partial / missing and note one change.
5. Create `public/llms.txt` following llmstxt.org. Include project summary, three important URLs, and author. Deploy. Verify at `yoursite.com/llms.txt`.

## Quiz

1. Why do cold starts hurt perceived performance more than steady-state latency?
2. What does "quarantining vendor lock-in" look like in code?
3. Write the formula for cost per user per month.
4. Name four of the six elements of the AI trust stack.
5. What does an `llms.txt` file do?

## Assignment

**Daily:** Submit (a) your live capstone URL, (b) your token-cost worksheet at 10/100/1000 users, and (c) the URL of your published `llms.txt`. Bonus: add Schema.org JSON-LD to your landing page and paste the Schema.org validator result.

## Discuss: The cost surprise

Share the number that shocked you in your token-cost worksheet. Was it the system prompt size? The output length? The model choice? Post your before-and-after: one change you could make that drops cost per user by 40% without hurting quality.
