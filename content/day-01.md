---
reading_time: 18 min
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

Welcome to Day 01. Before we write a single prompt, install a model, or hand-wave at "agents", we need a shared mental model of what AI *is* — and, just as importantly, what it *isn't*. Everything we build over the next 29 days sits on the assumptions we make today.

## Intro {#intro}

Today is the only day of the workshop with no code. That's on purpose.

If you skip the conceptual foundation, the rest of the month will feel like a grab-bag of tricks: prompts that "work" for reasons you can't articulate, agents that fail in ways you can't debug, evaluations that measure things you don't care about. The mental model you build today is what turns those tricks into engineering.

By the end of this module you should be able to:

- Place any "AI" product in the nesting-doll hierarchy without hand-waving.
- Describe, in one paragraph, what an LLM literally does at inference time.
- Tell the difference between a cherry-picked demo and a system that actually works.
- Defend a position on open-source vs closed models that isn't just vibes.

Work through the modules in order. Each one ends with a "Mark section complete" button — click it when you've actually done the reading, not when you've scrolled past.

## Read: The nesting-dolls view of AI

When people say "AI" in 2026, they almost always mean one specific thing: a large language model responding to a prompt. But AI is a much older, messier field. Think of it as a set of nesting dolls — each inside the previous:

- **AI** — the broad goal of machines doing things that seemed to require human intelligence. This term has been around since 1956 and has survived three "AI winters".
- **Machine learning (ML)** — programs that learn patterns from data instead of being explicitly coded. Spam filters, recommender systems, and credit scoring models are almost all classical ML.
- **Deep learning (DL)** — ML using neural networks with many layers. This is the subset that started working spectacularly around 2012 with ImageNet.
- **Transformers** — a specific neural architecture from the 2017 paper *Attention Is All You Need*. It scales shockingly well with data and compute — a property nobody fully understood at the time.
- **LLMs** — transformers trained on internet-scale text. GPT, Claude, Llama, Mistral, Qwen, DeepSeek.
- **Agents** — systems that use LLMs as a reasoning engine to *take actions* in the world: call tools, browse, write code, talk to APIs, control other agents.

Each layer is a strict subset of the one above it. An LLM is a transformer is a deep-learning system is a machine-learning system is AI. The reverse doesn't hold: a decision tree is ML but not deep learning.

> When someone pitches you an "AI feature", ask which doll they mean. The answer is almost always narrower than the marketing suggests — and that's not a bad thing. Narrower tools are easier to evaluate.

### Why this matters in practice

If your product actually needs a logistic regression and a CSV, don't reach for a 70B-parameter model. If your problem is genuinely open-ended natural language, don't try to force it into a rules engine. Matching the doll to the problem is most of the job.

Classical ML still wins when:

1. You have structured tabular data.
2. You need fast, cheap, deterministic predictions.
3. You need to defend the decision to a regulator.

LLMs win when:

1. The input is unstructured language, code, or images.
2. You'd rather describe the task than collect 10k labelled examples.
3. Fluent generation is part of the deliverable.

## Watch: What an LLM actually does

Watch this short walkthrough before the live session. It's the clearest 20 minutes on transformer internals that exists on the public internet — and we'll assume you've seen it.

<!-- TODO: swap in the real Karpathy intro URL -->
https://www.youtube.com/watch?v=zjkBMFhNj_g

Key ideas to take away from the video:

- Tokens are not words. They're sub-word units chosen by a trained tokenizer. `"unforgettable"` might be three tokens; `" the"` is one.
- Training is self-supervised: the model is shown a sequence and asked to predict the next token. That's the whole loss function.
- Inference is a loop: sample a token from the probability distribution, append it to the context, repeat. Temperature controls how "adventurous" the sampler is.

Here's the entire inference algorithm in pseudocode — memorize this shape, it'll come up every day:

```python
# The whole show, stripped of engineering
context = tokenize(prompt)
while not stop_condition(context):
    logits = model(context)              # shape: [vocab_size]
    probs  = softmax(logits / temperature)
    next_token = sample(probs, top_p=0.9)
    context.append(next_token)
return detokenize(context)
```

Everything you experience as "intelligence" — multi-step reasoning, code synthesis, emotional tone, refusals, chain-of-thought — is an **emergent behavior** of running that loop with trillions of parameters and trillions of training tokens. It turns out that the shortcut to predicting the next word, at sufficient scale, is to build an implicit model of the world the words describe. Nobody predicted this in 2015.

## Read: Where we actually are in 2026

Let's separate signal from hype. Grouped by maturity:

**What works reliably today**

- Drafting, summarizing, translating, rewriting.
- Code generation, refactoring, and review for common languages.
- Extracting structure from messy text (PDFs → JSON, emails → tickets).
- Classification and sentiment, often zero-shot.
- Voice interfaces that feel natural within a narrow task.
- Agentic workflows with tight guardrails and a human in the loop.

**What sort of works**

- Multi-step autonomous agents on constrained domains (coding, browsing).
- Tool use when the tools are well-documented and the task is < 15 steps.
- Retrieval-augmented generation, when the retrieval is actually good.
- Long-context reasoning — possible, but the first and last 10% of the context gets most of the attention.

**What doesn't work yet**

- True autonomy on open-ended tasks with no human review.
- Continual learning from experience between sessions.
- Strict factual accuracy without retrieval.
- Anything where being wrong is catastrophic and unmeasurable.

> Rule of thumb: if a Twitter demo impressed you, the follow-up question is always *how brittle is it?* The gap between a cherry-picked demo and a system that works for the 1000th user is where 90% of real engineering lives.

This framing will save you from two failure modes: over-promising to a stakeholder, and under-building because you assumed it was impossible.

## Read: Open-source vs closed — why we default to open

We'll use open-weight tools whenever we can in this workshop — Llama, Mistral, Qwen, DeepSeek, Ollama, Hugging Face, vLLM, LangGraph. Two reasons:

1. **You learn more.** Running a model yourself teaches you what it costs, what it can't do, and where the seams are. API abstractions hide exactly the things an engineer needs to see.
2. **You stay portable.** APIs change, pricing changes, TOS changes, rate limits change. Your understanding of the underlying tech doesn't.

That doesn't mean we ignore frontier closed models — we'll use Claude and GPT too. But we want you to *choose* them for a reason, not *need* them out of habit.

A quick vocabulary cleanup, because people conflate these constantly:

| Term | What it means |
| --- | --- |
| Open weights | The model file is downloadable. You can run it yourself. |
| Open source | Weights + training code + data pipeline (rare in practice). |
| Open license | The license actually permits commercial use. Llama's license has limits; Mistral's Apache-2.0 doesn't. |
| API model | You can only call it over HTTPS. GPT-5, Claude 4.7, Gemini. |

"Open source" and "open weights" are not synonyms. When we say a model is "open", we'll always specify which.

## Lab: Break a model on purpose

Today's lab is intentionally non-technical. Open your favorite chat model and try to get it to:

1. Confidently state a fact that is provably wrong.
2. Refuse something harmless because of overzealous safety training.
3. Contradict itself within a single conversation.

Keep the transcripts. We'll use them in the next session as a starting point for talking about evaluation.

The "Open lab" button in the sidebar points to ChatGPT, but you can use any model you have access to — Claude, Gemini, a local Llama, anything. What matters is that you *see the seams* with your own eyes before we try to engineer around them.

## Quiz

A four-question quiz lives below. It checks you actually read the module — not a gotcha. You need 70% to pass. You can retake as many times as you want; only your best attempt is shown on the dashboard.

If you miss a question, the explanation will reveal which module to re-read.

## Assignment

Write a 200-word note answering **one** of the discussion prompts below, and submit it as a link (Google Doc, Notion, gist — your choice) or paste the text directly. This is graded for *engagement*, not correctness — we want to see that you've thought about it.

Due before the first live session.

## Discuss: Prompts for the live session

Bring answers to at least one of these. There are no right answers — we'll workshop them together:

1. **Pick a product you used this week that claims to be "AI-powered".** Which doll of the nesting-doll diagram does it actually use? Be specific — "it probably uses an LLM" is not specific. What would be the cheapest non-AI way to deliver 80% of the same value?
2. **Describe a task you *thought* an LLM could do but it failed at.** Was it a limit of the model, a prompt issue, or a mismatch between what you asked and what the model is optimized to produce? How would you test your theory?
3. **Two-sentence grandparent test.** If you had to explain the difference between "AI" and "machine learning" to a grandparent in two sentences, what would you say? Post your version in the cohort channel and critique three others.
4. **Open vs closed, on your own stack.** For the product you work on, what would change if frontier closed APIs became 10× more expensive tomorrow? What would change if a 70B open model became runnable on a $2/hour GPU?

### Recap

- AI is a nesting doll: ML → DL → transformers → LLMs → agents.
- LLMs are next-token predictors whose "intelligence" is emergent from scale.
- 2026 is a real inflection point, but most of the magic is narrower than it looks.
- We default to open tooling so you learn the *why*, not just the *how*.

See you in the first live session. Come with your Day 01 lab transcripts and at least one thing that surprised you.
