---
reading_time: 15 min
tldr: "Chain AI with APIs and triggers in n8n, automate a browser task you hate, and ship your first real workflow to prod."
tags: ["build", "technical"]
video: https://www.youtube.com/embed/4cQWJViybAQ
lab: {"title": "Build an n8n flow (AI + real API + trigger) and one browser-use automation", "url": "https://n8n.io"}
prompt_of_the_day: "Act as an automation designer. My boring manual task is {{task_description}}. Design an n8n flow: (1) trigger, (2) data fetch via which API, (3) AI step and prompt, (4) output destination. List each node in sequence with the exact config I'd paste."
tools_hands_on: [{"name": "n8n", "url": "https://n8n.io"}, {"name": "browser-use", "url": "https://github.com/browser-use/browser-use"}]
tools_demo: [{"name": "Firecrawl", "url": "https://firecrawl.dev"}, {"name": "Jina Reader", "url": "https://jina.ai/reader"}]
tools_reference: [{"name": "Zapier AI Actions", "url": "https://zapier.com/ai"}, {"name": "Make.com", "url": "https://make.com"}, {"name": "Playwright MCP", "url": "https://github.com/microsoft/playwright-mcp"}, {"name": "Claude computer-use", "url": "https://docs.claude.com/claude-code"}]
resources: [{"name": "n8n templates gallery", "url": "https://n8n.io/workflows/"}, {"name": "browser-use quickstart", "url": "https://docs.browser-use.com"}]
---

## Intro

Here's the under-appreciated truth about AI in 2026: the biggest ROI isn't chatbots — it's **automation**. Ninety percent of the value showing up in real offices is "AI + API + trigger" flows that replace some human clicking the same buttons every morning. Today we build one. Then we teach a browser agent to handle the tasks no API exists for.

## Read: APIs, n8n, and browser agents

**Automation is the 80% practical use case.** Ask any working professional where AI is actually saving them time this year. It's rarely "I had a deep chat with Claude". It's "every morning at 9 AM, an agent reads yesterday's support tickets, tags them by priority and topic, drafts responses for the routine ones, and posts a summary to Slack." That's not a chatbot. It's a **workflow**: trigger → data fetch → AI reasoning → action.

The pattern has three parts:

1. **Trigger.** What kicks the flow off? A schedule (every morning), a webhook (when a new form fills), a database change, a new email, a button click.
2. **Middle.** Fetch data from APIs, transform it, pass it through an AI step (summarize, classify, extract, generate).
3. **Output.** Post to Slack, write to a spreadsheet, send an email, call another API, update a database.

You compose these visually in **n8n**, **Make.com**, or **Zapier**. n8n is our pick because it's open-source, self-hostable, code-optional (you can drop down to JavaScript/Python nodes if needed), and has excellent native AI nodes (OpenAI, Anthropic, Ollama, LangChain agents).

**Why n8n wins for builders.**

- Open-source + self-host = no per-task cost at scale.
- 400+ pre-built integrations (Slack, Gmail, Notion, Airtable, Postgres, HTTP, webhook).
- Native AI Agent node — drop in a system prompt, tools, and memory.
- Free cloud tier at n8n.cloud for those who don't want to self-host.
- Visual canvas — you direct; you don't type framework boilerplate.

**A concrete flow — the capstone triage bot.** Imagine you run student support for your college club. A Google Form collects queries. You want each query auto-tagged (`academic / logistics / event / complaint`), routed to the right lead over Slack, and stored in Airtable. Manually that's 4 minutes per ticket × 40 tickets/day = 160 minutes/day gone. In n8n:

- **Node 1 — Google Form trigger.** Fires whenever a new submission lands.
- **Node 2 — AI Agent (Groq + Llama 3.3 70B).** System prompt: "Classify this query into one of [academic, logistics, event, complaint]. Return JSON with `category`, `urgency` (1-5), and a `one_line_summary`."
- **Node 3 — Switch.** Routes on `category`.
- **Node 4 — Slack node.** Posts to `#academic-leads` (or whichever channel matches).
- **Node 5 — Airtable node.** Appends the row with timestamps.

Build time: 30 minutes. Time saved: 160 minutes every single day. That's the multiplier.

**Browser agents — for when no API exists.** A huge chunk of boring work lives on websites with no API. University portals. Government forms. Old-school vendor dashboards. Linkedin. For those, you need a **browser agent** — an AI that actually sees a webpage and clicks, types, scrolls, like a human would.

- **browser-use** (github.com/browser-use/browser-use) — open-source, Python, uses Playwright under the hood. Give it a task in plain English ("log into my college portal and download this week's attendance sheet") and it figures out the clicks.
- **Claude computer-use** — Anthropic's first-party capability; Claude can literally control your screen.
- **Playwright MCP** — a more controlled, deterministic approach for repeatable flows.

Browser agents are slower and flakier than API calls (pages change, popups interrupt, CAPTCHAs happen) but they unlock the 50% of workflows that are "trapped behind a login". Rule of thumb: **API first, browser agent as last resort**.

**Web scraping for AI — Firecrawl and Jina Reader.** When you just need clean content from a public page, don't write a scraper. Two services do it brilliantly:

- **Firecrawl** — point it at a URL, get back markdown. Handles JS-rendered pages, pagination, and structured extraction. Great for ingesting docs into RAG.
- **Jina Reader** — literally prepend `https://r.jina.ai/` to any URL. Get clean markdown back. Zero config. Free tier is generous.

Both are drop-in `HTTP Request` nodes in n8n.

**Chaining it all — the real picture.** A production AI workflow often looks like this:

Webhook trigger → Firecrawl (scrape a competitor's pricing page) → AI step (extract pricing table as JSON) → Postgres write (store prices with timestamp) → Slack alert (if price changed > 10%) → schedule this whole thing daily.

None of those individual steps is AI magic. The magic is the **chain**. Small models, tight prompts, real APIs, real triggers, shipped to production.

**Cost and safety.** Two gotchas:

- **Token cost.** A flow that runs 10,000 times/day using GPT-5 Opus will destroy your budget. Use small local models (Ollama) or cheap hosted ones (Groq, Together) for high-volume nodes. Reserve big models for steps that need real reasoning.
- **Guardrails.** AI agents acting on the real world can do real damage. Start with **dry-run mode** (log the action instead of performing it), add **human-in-the-loop approval** for any destructive step, and always set **rate limits**.

**Where this fits your capstone.** Every capstone benefits from one automation flow. If your capstone is a RAG bot, the flow ingests new docs daily. If it's a research assistant, it watches arxiv and summarizes relevant papers every morning. If it's a tutoring system, it posts a daily progress digest. The flow is not the capstone — it's the layer that keeps the capstone alive in production.

## Watch: From zero to a running n8n flow in 20 minutes

Live-build of a Gmail-to-Slack AI triage agent in n8n cloud, followed by a browser-use run on a real college portal, followed by a Jina Reader + AI summarizer chain.

https://www.youtube.com/embed/4cQWJViybAQ

- n8n's AI Agent node is drop-in; plug Ollama or Groq as the brain.
- browser-use is slow but real — budget a few minutes per task.
- Jina Reader is the "just add water" scraper.
- Always build with test data first; connect real data last.

## Lab: Build one real n8n flow + one browser automation

Budget 60 minutes. Pick boring tasks you actually do.

1. Sign up for **n8n.cloud** free tier (or self-host via Docker if you prefer — docs at n8n.io). Create a new workflow.
2. Pick a trigger relevant to your capstone — Schedule (every hour), Webhook (on form submission), or Gmail (on new email matching a filter).
3. Add an HTTP Request node that calls a real public API — OpenLibrary, weather, GitHub, or Jina Reader on a page you care about.
4. Add an **AI Agent** or **OpenAI** node. Wire Groq or your Ollama endpoint as the model. Prompt: extract, classify, or summarize the data.
5. Add an output node — Slack, Google Sheets, Discord, or plain Email.
6. Execute the workflow. Watch each node turn green. Debug the red ones. Celebrate.
7. Now switch to **browser-use**. Install via the quickstart at docs.browser-use.com. Pick one task you hate — "download attendance from college portal", "scrape job listings from careers page", "check Amazon price every morning".
8. Give browser-use the task in plain English. Watch it actually operate the browser. Note what it got right and where a human still needs to help.

## Quiz

Four: What's the difference between a trigger and a webhook? When would you reach for browser-use instead of an HTTP Request? Why is "dry-run mode" the first thing you should configure? Why would you pick Groq over GPT-5 for a flow running 10k/day?

## Assignment (WEEKLY deliverable)

Ship **one working n8n flow** relevant to your capstone — a real trigger, a real API, a real AI step, a real output. Plus **one browser-use automation** of a task you personally hate doing manually. Record a 60-second Loom walking through both. Post the Loom link plus a one-paragraph write-up ("what it saves me per week") to the cohort channel. This is the Week 4 capstone checkpoint — ship it.

## Discuss: What you'll never do manually again

- Which manual task in your week is first on the chopping block?
- What went wrong in your n8n flow the first time — data shape, auth, or the AI node?
- When is browser-use genuinely useful vs. a fragile hack?
- How do you sleep at night giving an agent access to your email or Slack?
- Where does automation stop being helpful and start being creepy or unsafe?
