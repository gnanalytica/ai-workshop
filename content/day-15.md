---
reading_time: 14 min
tldr: "AI isn't magic or sentient — it's a very good next-token predictor. Knowing that changes how you use it."
tags: ["ai", "llms", "theory"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Chatbot triangulation: same prompt, three models", "url": "https://chat.openai.com/"}
resources: [{"title": "Karpathy — Intro to LLMs (1hr)", "url": "https://www.youtube.com/watch?v=zjkBMFhNj_g"}, {"title": "3Blue1Brown — Neural networks", "url": "https://www.3blue1brown.com/topics/neural-networks"}, {"title": "Anthropic Transformer Circuits", "url": "https://transformer-circuits.pub/"}]
---

## Intro

You've spent two weeks shipping real software. Now we pop the hood on the thing everyone keeps calling "AI." This week is the technical core of the workshop — by Sunday you'll have run a model on your own laptop, built a semantic search, and wired up RAG. Today we cut through the marketing and define what today's "AI" actually is.

## Read: What we mean by "AI" in 2026

The word "AI" has been used for five different things in five different decades. Before you can reason about LLMs, you need to know which bucket they belong in.

### A very short tour

- **Symbolic AI (1960s–80s)** — hand-coded rules and logic. Expert systems. Failed at perception.
- **Classical ML (1990s–2010s)** — learn a function from data. Spam filters, SVMs, random forests. Great for tabular problems, still in production everywhere.
- **Deep learning (2012–2017)** — neural networks with lots of layers. ImageNet moment. Speech, vision, translation.
- **Transformers and LLMs (2017–)** — the "attention" paper lit the fuse. GPT-2, GPT-3, ChatGPT, Llama, Claude, Gemini. What most people now call "AI."
- **Multimodal / open-weights era (2023–2026)** — text + images + audio + video in one model. Llama 3/4, Qwen 3, Gemma 3, DeepSeek V3, Mistral large, etc., shipped with downloadable weights.

When your PM says "let's add AI," they almost always mean "call an LLM." That framing matters: you are buying (or renting) a **very large statistical text predictor**, not a reasoning engine.

### What an LLM actually does

> An LLM takes a sequence of tokens and outputs a probability distribution over the next token. That's it. Everything else — chat, code, translation — is emergent behavior layered on top of that one trick.

Concretely, given "The capital of France is", the model outputs a distribution where `Paris` gets ~0.92 probability, `the` ~0.02, `a` ~0.01, and a long tail of junk. A **sampler** picks one token, appends it, and the whole thing runs again. Tomorrow we'll look inside that forward pass.

### What it is NOT

- **Not a database.** It has no reliable recall. It will confidently cite papers that don't exist.
- **Not reasoning like a human.** It's pattern-matching at enormous scale. "Chain-of-thought" is the model producing more tokens so its final answer has more context to condition on — useful, not magic.
- **Not deterministic by default.** Same prompt + temperature > 0 = different outputs. Set `temperature=0` for reproducibility (and even then, batching and hardware can cause drift).
- **Not sentient.** Don't let sci-fi framing contaminate your engineering judgment.

### Hallucination is a feature, not a bug

LLMs are trained to always output *something plausible*. They have no internal "I don't know" signal unless explicitly trained for it. When facts run out, they interpolate — that's hallucination. Your job as an engineer is to design systems that either (a) ground the model in real data (RAG, tools) or (b) make it cheap to verify output.

| Capability | LLMs are good at | LLMs are bad at |
|---|---|---|
| Language | Summarizing, rephrasing, translating | Counting words/characters exactly |
| Code | Boilerplate, common patterns, refactors | Novel algorithms, subtle concurrency |
| Math | Simple arithmetic, algebra with hints | Multi-step numeric reasoning without tools |
| Facts | Widely-known stable facts | Niche, recent, or private knowledge |
| Logic | Simple deduction | Long chains with no feedback signal |

### A worked example: the "which is bigger" trap

Ask a 2024-era 7B model: "Which is bigger, 9.11 or 9.9?" and it will often say 9.11. Why? Tokenization plus the statistical prior that version numbers like `9.11` follow `9.9`. It's not that the model "can't do decimals" — it's that the representation and the training distribution conspire against it. Modern flagship models fixed this specific failure, but the class of failure is permanent: whenever token boundaries hide structure (numbers, code indentation, URLs, Unicode), expect weird errors.

## Watch: Karpathy's 1-hour intro to LLMs

Andrej Karpathy's talk is the single best 60 minutes you can spend building intuition. He walks through what the weights are, what training does, and where agents are headed. Watch it end-to-end — take notes.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video with Karpathy Intro to LLMs, actual ID zjkBMFhNj_g -->

- Watch for his "two files" mental model (parameters + run.c).
- Note how he frames pre-training vs fine-tuning vs RLHF.
- Pay attention to the hallucination discussion around the 30-minute mark.

## Lab: Triangulate three models on one prompt

You'll take one task and run it through three different chat interfaces, then diff the answers. Goal: feel the difference between models in your hands, not just read about it.

1. Pick a task with a verifiable answer. Suggested: "Write a Python function that returns the nth Fibonacci number using matrix exponentiation, with a docstring and a test." Or: "Summarize the Wikipedia page on the Chola dynasty in five bullet points, cite one specific year, and list two sources."
2. Open three chat UIs in three tabs: ChatGPT (any free model), Claude (free tier), and Google Gemini. Log in.
3. Paste the exact same prompt into all three. Do not edit between models.
4. Copy each response into a single markdown file `day15-triangulation.md` under headings `## ChatGPT`, `## Claude`, `## Gemini`.
5. Install Ollama from `https://ollama.com/`. Run `ollama pull llama3.2:3b` then `ollama run llama3.2:3b`. Paste the same prompt.
6. Add a `## Local Llama 3.2 3B` section with its output.
7. For the code task: actually run each solution. Does it work? Any off-by-one? Any hallucinated imports?
8. For the facts task: open Wikipedia. Check every citation and year against the real source.
9. Write a `## Diff` section: where did they agree, where did they diverge, and where did at least one model hallucinate? Be specific — quote the hallucinated claim.
10. Commit the file to your workshop repo.

Budget 45 minutes. The point isn't the answer — it's training your eye to spot confident nonsense.

## Quiz

Short quiz today. Expect questions on the difference between classical ML and LLMs, why hallucination is structural, what tokenization has to do with arithmetic errors, and the "next-token prediction" framing. You've read enough to answer all of them if you actually read.

## Assignment

Write a one-page memo titled `what-is-ai-really.md` in your workshop repo. Structure: (1) in your own words, define an LLM in two sentences; (2) describe one specific hallucination you caught in today's lab with an exact quote; (3) name one task at your college (registration, hostel allocation, grading appeals) where an LLM would be useful and one where it would be dangerous, with reasoning. No fluff, no ChatGPT writing it for you — we can tell.

## Discuss: Where the hype breaks down

- "AGI is two years away." What specific capability would make you believe that claim? What evidence would falsify it?
- If LLMs are just next-token predictors, why are they so useful? What's the shortest honest answer you can give a skeptical parent?
- Your college wants to deploy a chatbot that answers student admin questions. Before committing, what are the three sharpest questions you'd ask the vendor?
- Is there a task where a 2015-era SVM beats a 2026 LLM? (Yes — find one and argue for it.)
- Open-weights vs closed models: does it matter for your career which camp wins?
