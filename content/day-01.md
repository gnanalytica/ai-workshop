---
reading_time: 12 min
tags: ["theory", "foundations", "discussion"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Try: Ask an LLM to misunderstand you", "url": "https://chat.openai.com"}
resources: [{"title": "3Blue1Brown — How LLMs work", "url": "https://www.3blue1brown.com/topics/neural-networks"}, {"title": "Karpathy's Intro to LLMs (YouTube)", "url": "https://www.youtube.com/watch?v=zjkBMFhNj_g"}, {"title": "Hugging Face — Open LLM Leaderboard", "url": "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard"}]
---

<!-- TODO: replace video with a real YouTube embed URL -->

# What AI actually is (and isn't)

> "Any sufficiently advanced technology is indistinguishable from magic." — Arthur C. Clarke
>
> It's our job this month to make the magic stop feeling like magic.

Welcome to Day 01. Before we write a single prompt, install a model, or hand-wave at "agents", we need a shared mental model of what AI *is* — and, just as importantly, what it *isn't*. This matters because everything we build over the next 29 days sits on top of the assumptions we make today.

## The nesting-dolls view of AI

When people say "AI" in 2026, they almost always mean one specific thing: a large language model responding to a prompt. But AI is a much older, messier field. Think of it as nesting dolls:

- **AI** — the broad goal of machines doing things that seemed to require human intelligence.
- **Machine learning (ML)** — programs that learn patterns from data instead of being explicitly coded.
- **Deep learning (DL)** — ML using neural networks with many layers; the thing that started working spectacularly around 2012.
- **Transformers** — a specific neural architecture from 2017 that scales shockingly well with data and compute.
- **LLMs** — transformers trained on internet-scale text. GPT, Claude, Llama, Mistral, Qwen.
- **Agents** — systems that use LLMs as a reasoning engine to *take actions* in the world — call tools, browse, write code, talk to APIs.

Each layer is a subset of the one above it. When someone says "AI will do X", ask them *which doll* they mean. The answer is almost always narrower than the marketing suggests.

## What an LLM actually does

Here is the uncomfortable truth: an LLM is a very, very expensive next-token predictor. Given some text, it produces a probability distribution over what token should come next. That's it.

```python
# Pseudocode of the whole thing
while not done:
    next_token = model.predict_next(context)
    context = context + next_token
```

Everything you see — reasoning, code generation, emotional tone, refusals, "thinking step by step" — is an **emergent behavior** of scaling that simple loop up to trillions of parameters trained on trillions of tokens. It turns out the shortcut to predicting the next word, at sufficient scale, is to build an approximate model of the world the words describe. That's the shocking finding of the last five years.

This framing will save you a lot of confusion later:

1. LLMs don't "know" things — they have statistical associations.
2. They don't "reason" the way you do — they produce text that looks like reasoning.
3. They don't have memory between conversations — you give it to them via context.
4. They hallucinate not because they're broken, but because fluent-sounding text is exactly what they're optimized to produce.

## Where we actually are in 2026

Let's separate the signal from the hype:

- **What works today**: drafting, summarizing, translating, coding, brainstorming, classification, extracting structure from messy text, voice, basic agentic workflows with tight guardrails.
- **What sort of works**: multi-step autonomous agents, reliable tool use, long-horizon planning, factual accuracy without retrieval.
- **What doesn't work yet**: true autonomy on open-ended tasks, continual learning from experience, anything that requires certainty.

If a demo impressed you on Twitter, the follow-up question is always: *how brittle is it?* The gap between a cherry-picked demo and a production system that works for the 1000th user is where most of our actual engineering work lives.

## Open-source vs closed: the landscape matters

We'll use open-source tools whenever we can in this workshop — Llama, Mistral, Qwen, DeepSeek, Ollama, Hugging Face, vLLM, LangGraph. Two reasons:

- **You learn more.** Running a model yourself teaches you what it costs, what it can't do, and where the seams are.
- **You stay portable.** APIs change, pricing changes, TOS changes. Your understanding of the underlying tech doesn't.

That doesn't mean we won't touch the frontier models — we will. But we want you to *choose* them, not *need* them.

## Discussion prompts (bring answers to session)

Before our first live session, spend 15 minutes with these. There are no right answers — we'll discuss in the cohort:

1. Pick a product you used this week that claims to be "AI-powered". Which doll of the nesting-doll diagram does it actually use? Be specific.
2. Describe a task you *thought* an LLM could do but it failed at. What do you think went wrong — a limit of the model, a prompt issue, or a mismatch between what you asked and what the model is optimized for?
3. If you had to explain the difference between "AI" and "machine learning" to a grandparent in two sentences, what would you say?

## Recap

- AI is a nesting doll: ML → DL → transformers → LLMs → agents.
- LLMs are next-token predictors whose "intelligence" is emergent from scale.
- 2026 is a real inflection point, but most of the magic is narrower than it looks.
- We default to open tooling so you learn the *why*, not just the *how*.

See you in the first live session. Come with your Day 01 lab attempt and at least one thing that surprised you.
