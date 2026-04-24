---
day: 28
date: "2026-06-09"
weekday: "Tuesday"
week: 6
topic: "GEO (Generative Engine Optimization), leaderboards, benchmarking, keeping up with AI"
faculty:
  main: "Jayasaagar"
  support: "TBD"
reading_time: "10 min"
tldr: "SEO is half-dead. Now your product has to show up inside ChatGPT, Perplexity, and Gemini answers. Today: how models pick what to cite, which leaderboards actually matter, and a 2-feed system to never feel left behind again."
tags: ["geo", "benchmarks", "leaderboards", "career"]
software: []
online_tools: ["LMArena", "Hugging Face Leaderboards", "Perplexity", "Artificial Analysis"]
video: "https://www.youtube.com/embed/3-2Lw5qQjho"
prompt_of_the_day: "You are a GEO strategist. My product is <one-line>. List the top-10 generative-search queries an Indian buyer would type, and for each, the one piece of content I must publish so the model cites me."
tools_hands_on:
  - { name: "LMArena", url: "https://lmarena.ai/" }
  - { name: "Hugging Face Open LLM Leaderboard", url: "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard" }
  - { name: "Artificial Analysis", url: "https://artificialanalysis.ai/" }
  - { name: "Perplexity", url: "https://www.perplexity.ai/" }
tools_reference:
  - { name: "Princeton — GEO paper", url: "https://arxiv.org/abs/2311.09735" }
  - { name: "SWE-bench leaderboard", url: "https://www.swebench.com/" }
resources:
  - { title: "Ahrefs — GEO guide", url: "https://ahrefs.com/blog/generative-engine-optimization/" }
  - { title: "Latent Space podcast", url: "https://www.latent.space/" }
  - { title: "Simon Willison's blog", url: "https://simonwillison.net/" }
  - { title: "The Batch (DeepLearning.AI)", url: "https://www.deeplearning.ai/the-batch/" }
lab: { title: "GEO audit your capstone + benchmark drill", url: "https://lmarena.ai/" }
objective:
  topic: "Get your product cited by generative engines, and build a sustainable AI-news habit"
  tools: ["Perplexity", "LMArena", "HF Leaderboards"]
  end_goal: "A 5-query GEO audit of your capstone and a 2-feed personal information diet you'll stick with after the cohort."
---

After Demo Day, the question stops being "did I learn AI?" and becomes "how do I stay relevant in an industry that ships a new SOTA model every Tuesday?" Today is the operating system for that.

## 🎯 Today's objective

**Topic.** GEO, leaderboards, benchmarking, and keeping up with AI without burning out.

**By end of class you will have:**
1. Done a 5-query GEO audit on your capstone — which chatbots cite you and which don't.
2. Read three leaderboards (LMArena, HF, Artificial Analysis) and named when each one is actually useful.
3. Picked **one daily** + **one weekly** AI-news source to follow for the next 6 months.

> *Why this matters.* In 2026, the URL bar is moving from Google to ChatGPT. If your product, name, or repo isn't in the model's training or web index, you're invisible.

## ⏪ Pre-class · ~25 min

### Setup

- [ ] Free Perplexity account.
- [ ] LMArena and HF Leaderboard tabs open.

### Primer

- **Watch:** "How LLMs pick what to cite" — https://www.youtube.com/watch?v=3-2Lw5qQjho
- **Skim:** Princeton's GEO paper — abstract and Section 3 only.

### Bring to class

- [ ] The three answers you saved yesterday from ChatGPT / Claude / Perplexity for *"best [your category] in India 2026"*.
- [ ] One AI news source you currently follow. *"My friend's WhatsApp forwards"* counts.

> 🧠 **Quick glossary.** **GEO** = Generative Engine Optimization, optimising for citations inside AI answers. **Leaderboard** = ranked benchmark scoreboard. **Elo** = pairwise rating used by LMArena. **Benchmark** = fixed eval (MMLU, GPQA, SWE-bench). **Eval contamination** = benchmark leaked into training data.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Why SEO → GEO | 10 min | The traffic cliff |
| What gets cited: 6 levers | 15 min | Authority, structure, freshness, schema, citations, brand mentions |
| Leaderboard tour | 15 min | LMArena vs HF vs Artificial Analysis |
| GEO audit lab | 15 min | Audit your capstone live |
| 2-feed system | 5 min | One daily, one weekly, nothing else |

### 6 GEO levers (from highest to lowest impact, 2026 data)

1. **Citations from authoritative sites** — being mentioned in Wikipedia, GitHub READMEs, top-rated blogs.
2. **Clean, scannable structure** — H2 headings, lists, FAQs. LLMs love structure.
3. **Schema + JSON-LD** — `Product`, `FAQPage`, `HowTo`.
4. **Brand mention frequency** — does your name co-occur with the category enough?
5. **Freshness signals** — `lastmod`, `<time datetime>`, dated content.
6. **Direct answers** — one-sentence answers near the top of each page.

### Leaderboards — when each lies

- **LMArena** — best for "which model feels nicer to humans," skewed toward chatty answers.
- **HF Open LLM Leaderboard** — academic benchmarks; risk of **contamination**.
- **Artificial Analysis** — speed + price + quality combined; best for **picking a model for your product**.
- **SWE-bench / GPQA** — only trust for the specific skill they measure.

## 🧪 Lab: GEO audit + benchmark drill

1. Open Perplexity. Run 5 queries: *"best [your category] in India"*, *"open-source [your category]"*, *"[your project name]"*, *"alternative to [biggest competitor]"*, *"how to [job-to-be-done]"*.
2. For each, log: cited sources (top 3), is your project there (Y/N), what would beat the cited source.
3. On LMArena, pick three models you've never tried. Vote in 5 blind battles. Note your gut ranking vs the public Elo.
4. On Artificial Analysis, find the cheapest model that beats GPT-4-class on quality. Save it for your post-cohort builds.

**Artifact.** `geo-audit.md` in your capstone repo with the 5 queries, citations, and 3 concrete actions ranked by effort × impact.

> ⚠️ **Don't optimise for one engine.** ChatGPT, Perplexity, and Gemini index differently. Aim for structural wins that help all three.

## 📊 Live poll

**Where does your capstone show up today?** Cited by 1+ engine / mentioned but not cited / not found / haven't checked. Used to drive the next 10-min discussion.

## 💬 Discuss

- Did the leaderboard ranking match your gut after blind voting? Where did it diverge?
- One Indian-context query where Western leaderboards completely fail. (Hindi tasks? Code-mixed? Tier-2 city queries?)
- Which of the 6 GEO levers is highest leverage for *your* capstone — and why?
- Burnout-honest: how many AI newsletters can you actually read per week?

## ❓ Quiz

Short class quiz on GEO levers, LMArena vs HF, and contamination. Open from your dashboard.

## 📝 Assignment · 2-feed system + one GEO ship

**Brief.** Pick **one daily** source (Simon Willison, The Batch, X list) and **one weekly** (Latent Space, Ahead of AI, Stratechery). Unsubscribe from the rest publicly in the cohort channel. Then ship one GEO improvement to your capstone repo (README rewrite, FAQ section, or schema tag).

**Submit.** Dashboard → Day 28 → 2 source URLs + 1 commit link.

**Rubric.** Realistic feed picks (3) · One actually-shipped GEO change (4) · Honest unsubscribe note (3).

## 🔁 Prep for next class

Day 29 is **Demo Day 1.** First half of the cohort presents 5-min demos to a live panel.

- [ ] Final dress rehearsal with your pod (45 min, today).
- [ ] Confirm your slot, internet backup, screen-share setup.
- [ ] Bring one water bottle and one printed backup of your slide deck.

## 📚 References

- [Princeton — GEO paper](https://arxiv.org/abs/2311.09735) — the original framing.
- [Simon Willison's blog](https://simonwillison.net/) — daily, calm, technical.
- [The Batch — DeepLearning.AI](https://www.deeplearning.ai/the-batch/) — weekly, Andrew Ng curated.
- [LMArena](https://lmarena.ai/) — the only ranking that's hard to game.
- [Artificial Analysis](https://artificialanalysis.ai/) — picking models for production.
