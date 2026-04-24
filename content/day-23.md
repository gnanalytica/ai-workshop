---
day: 23
date: "2026-06-02"
weekday: "Tuesday"
week: 5
topic: "Cost Estimation of AI: API costs, Tokens, Knowledge Graphs, Neo Clouds/GPUs with OpenSource Models"
faculty:
  main: "Harshith"
  support: "Sandeep"
reading_time: "11 min"
tldr: "Your capstone is a startup pitch in 7 days. Today you learn the exact rupee math: tokens per request, ₹ per 1k tokens, when a knowledge graph saves 80% of context, and when a Neo Cloud GPU at ₹40/hr beats GPT-4o at scale."
tags: ["cost", "tokens", "knowledge-graphs", "gpu", "economics"]
software: []
online_tools: []
video: "https://www.youtube.com/embed/zduSFxRajkE"
prompt_of_the_day: "Estimate the monthly API cost for a chatbot serving 10,000 Indian college students, 5 messages each per day, average 800 input + 300 output tokens, on Claude Sonnet 4.6. Show the math in rupees."
tools_hands_on:
  - { name: "OpenAI Tokenizer", url: "https://platform.openai.com/tokenizer" }
  - { name: "Anthropic pricing", url: "https://www.anthropic.com/pricing" }
  - { name: "OpenAI pricing", url: "https://openai.com/api/pricing/" }
  - { name: "RunPod pricing", url: "https://www.runpod.io/pricing" }
tools_reference:
  - { name: "Together.ai pricing", url: "https://www.together.ai/pricing" }
  - { name: "Lambda Labs", url: "https://lambdalabs.com/service/gpu-cloud" }
resources:
  - { title: "Microsoft GraphRAG paper", url: "https://arxiv.org/abs/2404.16130" }
  - { title: "Llama 3 on Together vs GPT-4 cost", url: "https://artificialanalysis.ai/" }
lab: { title: "Cost-model your capstone in a spreadsheet", url: "https://platform.openai.com/tokenizer" }
objective:
  topic: "Cost Estimation of AI: API costs, Tokens, Knowledge Graphs, Neo Cloud GPUs"
  tools: ["OpenAI Tokenizer", "Anthropic pricing", "OpenAI pricing", "RunPod / Lambda / Together"]
  end_goal: "A spreadsheet that costs your capstone at 1, 100, and 10,000 users — across closed APIs vs self-hosted open-source on a Neo Cloud GPU."
---

If you can't say what your AI feature costs per user, you don't have a product — you have a science fair project. Today is the rupee day.

## 🎯 Today's objective

**Topic.** Cost Estimation of AI: API costs, Tokens, Knowledge Graphs, Neo Cloud GPUs.

**By end of class you will have:**
1. Tokenized 5 real prompts and converted token count → ₹ for three providers.
2. Modelled your capstone at 1, 100, and 10,000 users in a spreadsheet.
3. Run one break-even calc: at what user count does a self-hosted Llama on RunPod beat the closed API?

> *Why this matters.* Demo Day investors ask one question: *"What does this cost per user?"* You should know to two decimal places.

## ⏪ Pre-class · ~20 min

### Setup (required)

- [ ] Bookmarks: OpenAI tokenizer, Anthropic pricing, OpenAI pricing, RunPod pricing.
- [ ] Open Google Sheets or Excel — you'll build a real cost model.
- [ ] Have your Day-22 agent's token count on hand.

### Primer (~10 min)

- **Watch:** "How much does GPT-4 actually cost?" — https://www.youtube.com/watch?v=zduSFxRajkE (8 min).
- **Skim:** the GraphRAG paper intro — focus on the *60-90% context reduction* claim.
- **Read:** Anthropic + OpenAI pricing pages side by side. Note input vs output asymmetry (output is 4–5× pricier).

### Bring to class

- [ ] One number: *expected daily active users* of your capstone. A guess is fine.

> 🧠 **Quick glossary.** **Token** = ~4 characters of English (less in Hindi/Tamil — ~2). **Input/output tokens** are billed separately. **Knowledge Graph (KG/GraphRAG)** = structured facts that replace stuffing the whole document. **Neo Cloud** = newer GPU clouds (RunPod, Lambda, Together, CoreWeave) that undercut AWS by 3–5×.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Tokens, fast | 10 min | Why "Bengaluru" is 3 tokens but "Bangalore" is 1 |
| API ₹ math | 10 min | Input/output split, caching discounts |
| KG/GraphRAG to cut context | 15 min | Real before/after numbers |
| Neo Clouds + open-source break-even | 15 min | Llama-3-70B on RunPod vs GPT-4o |
| Lab + share | 5 min |  |

### The cost equation, plain

```
cost_per_request = (in_tokens × in_price) + (out_tokens × out_price)
monthly_cost     = users × requests/user/day × 30 × cost_per_request
break_even       = (gpu_hourly × 720) / cost_per_request
```

### Three levers that actually move the bill

1. **Cut input tokens.** Move from "stuff the whole PDF" to a knowledge graph or RAG. 60–90% saving.
2. **Use the smaller model.** Haiku/4o-mini handles 70% of your traffic. Route the hard 30% to Sonnet/4o.
3. **Cache aggressively.** Anthropic's prompt caching is 90% off cached input tokens. System prompts are *always* cacheable.

### Indian-context numbers (April 2026, USD→INR ≈ 85)

- **Claude Sonnet 4.6** (current default): ~₹255/M input · ₹1,275/M output ($3 / $15).
- **Claude Haiku 4.5**: ~₹85/M input · ₹425/M output ($1 / $5). Hits 70% of your traffic at 5× lower cost.
- **GPT-4o-mini**: ~₹12/M input · ₹50/M output. Cheap router target.
- **RunPod A100 80GB**: ~₹60/hr community/spot · ~₹100/hr on-demand. (Lambda Labs / CoreWeave similar.)
- **Llama-3.3-70B** on Together AI: ~₹75/M combined (single-tier billing).
- **Anthropic prompt caching**: cached input read at 10% of base price (90% off). System prompts → always cache.

## 🧪 Lab: Build the cost model

1. Open your spreadsheet. Columns: `users`, `req/user/day`, `in_tok`, `out_tok`, `in_₹/M`, `out_₹/M`, `monthly_₹`.
2. Fill three rows: GPT-4o-mini, Claude Sonnet 4.6, Self-hosted Llama-3.3-70B on RunPod (₹100/hr × 720 = ₹72,000/mo amortised across requests).
3. Add a *cache hit rate* column — model 0%, 50%, 80% caching. See the cliff.
4. Compute break-even: at what *requests/month* does the GPU box win?
5. Add a 4th row: same workload but with GraphRAG cutting input tokens by 70%. Compare.

**Artifact.** Share the sheet (view-only link) on the dashboard. One row per scenario, formulas live.

> ⚠️ **Mistake to avoid.** Don't quote the lowest model price. Investors discount projections that assume 4o-mini handles a use case Sonnet barely solves.

## 📊 Live poll

**At 10,000 DAU, what wins for your capstone?** GPT-4o-mini / Claude Sonnet / Self-hosted Llama / Hybrid router / *Don't know yet.*

## 💬 Discuss

- Where in your capstone is "stuff the whole document" hiding? That's the KG opportunity.
- A Neo Cloud GPU at ₹60–100/hr — what's the operational tax (uptime, cold start, ops time) you're not pricing?
- Output tokens cost 5× input. Where in your prompt are you accidentally generating long answers?

## ❓ Quiz

Short quiz on token math, input vs output pricing, and when GraphRAG beats vanilla RAG. On your dashboard during class.

## 📝 Assignment · The ₹ slide

**Brief.** Build a one-slide "unit economics" summary for your capstone: cost per user at 100 and 10,000 users, on your chosen stack, with one sentence on what changes at scale.

**Submit.** Slide image + spreadsheet link on dashboard before Day 24.

**Rubric.** Math is correct + sourced (4) · Realistic at 10k users — accounts for caching, model routing (4) · One sentence is honest, not hand-wavy (2).

## 🔁 Prep for next class

Day 24 is multimedia: **Text2Audio, Text2Video** — HeyGen, Higgsfield, Veo3, ElevenLabs.

- [ ] Create a free trial account on **ElevenLabs** and **HeyGen**.
- [ ] Write a 30-second script in your own voice — about your capstone. We'll generate it tomorrow.
- [ ] Pick one Indian English voice you'd want to hear your script in. Note why.

## 📚 References

- [GraphRAG paper (Microsoft)](https://arxiv.org/abs/2404.16130) — when graphs beat chunks.
- [Artificial Analysis](https://artificialanalysis.ai/) — current price/perf leaderboard.
- [Anthropic prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) — the 90% discount nobody uses.
- [RunPod pricing](https://www.runpod.io/pricing) — Neo Cloud baseline.
