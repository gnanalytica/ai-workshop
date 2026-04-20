---
reading_time: 15 min
tldr: "Run an LLM on your own laptop, compare three prompt styles on a 10-row eval set, and trace everything in Langfuse."
tags: ["build", "technical"]
video: https://www.youtube.com/embed/rIRkxZSn-A8
lab: {"title": "Install Ollama + run a 1-3B model + log 10 evals in Langfuse", "url": "https://ollama.com/download"}
prompt_of_the_day: "Act as a prompt engineer. My task is {{task_description}}. Generate three prompt variants: (A) zero-shot, (B) chain-of-thought with self-critique, (C) few-shot with 3 examples. Output each as a clearly labelled code block so I can paste them into Langfuse."
tools_hands_on: [{"name": "Ollama", "url": "https://ollama.com"}, {"name": "Open WebUI", "url": "https://openwebui.com"}, {"name": "Langfuse", "url": "https://langfuse.com"}]
tools_demo: [{"name": "Groq (free Llama 3.3 70B @ 750 tok/s)", "url": "https://groq.com"}, {"name": "Hugging Face model cards", "url": "https://huggingface.co"}, {"name": "OpenRouter", "url": "https://openrouter.ai"}]
tools_reference: [{"name": "LM Studio", "url": "https://lmstudio.ai"}, {"name": "WebLLM (in-browser)", "url": "https://webllm.mlc.ai"}, {"name": "Together AI", "url": "https://together.ai"}, {"name": "Fireworks AI", "url": "https://fireworks.ai"}, {"name": "LangSmith", "url": "https://smith.langchain.com"}]
resources: [{"name": "Qwen 2.5 1.5B", "url": "https://ollama.com/library/qwen2.5"}, {"name": "Gemma 2 2B", "url": "https://ollama.com/library/gemma2"}, {"name": "Phi-3 mini 3.8B", "url": "https://ollama.com/library/phi3"}]
---

## Intro

Yesterday you learned the rails. Today you drive. We put a real LLM on your laptop — yes, even a 4GB college laptop — and layer prompting patterns that bigger models can't brute-force their way past. Then we do something 90% of builders skip: we measure. Evals turn "sounds good" into "provably better".

> 🧠 **Quick glossary for today**
> - **Quantization** = compressing model weights to 4 or 8 bits so they fit on your laptop.
> - **GGUF** = the packaged single-file format for quantized models (used by Ollama, llama.cpp).
> - **Evals** = a repeatable test of a prompt against a fixed dataset, scored automatically.
> - **LangSmith / Langfuse** = platforms that log + score every LLM call you make.
> - **CoT** = Chain-of-Thought; telling the model to "think step by step" before answering.
> - **Structured JSON** = forcing the model to return valid JSON matching a schema instead of free text.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min | Why run an LLM locally when Groq is free? |
| Mini-lecture | 20 min | Quantization, prompt patterns (CoT, self-critique, few-shot, JSON), what an eval actually is |
| Live lab | 20 min | Instructor demos Ollama locally; you hit Groq + HF Chat + log traces in Langfuse |
| Q&A + discussion | 15 min | When did small beat big? Which prompt pattern moved the number most? |

**Before class** (~10 min): check your laptop RAM and skim the model-size table so you know which GGUF to pull.
**After class** (~30 min tonight): finish the 10-row eval set for your capstone task, run all three prompt variants, and post win rates to the cohort channel.

### In-class moments (minute-by-minute)

- **00:05 — Cold-open bet**: instructor runs the same prompt on Qwen 1.5B and Groq Llama 3.3 70B side by side; class votes which answer is "better" before the reveal.
- **00:15 — Think-pair-share**: in 90 seconds, tell your neighbour which task from your capstone would be "shockingly fine" on a 2B local model.
- **00:30 — Live poll**: RAM check — 4GB / 8GB / 16GB+ — instructor recommends a model per hand raised.
- **00:40 — Breakout**: in trios, rewrite one zero-shot prompt into a CoT + self-critique variant in 4 minutes; share the sharpest rewrite with the room.
- **00:55 — Win-rate reveal**: instructor shows a real Langfuse dashboard with three prompt variants; class predicts the winner before the numbers drop.

## Before class · ~20 min pre-work

**No local install needed.** Most laptops can't handle 3B+ models anyway — instructor will demo Ollama live. You'll use free cloud inference (Groq + HuggingFace Chat) which is actually *faster* than local on most laptops.

### Setup (10 min — web only, no downloads)
- [ ] Sign up for **Groq** free tier at https://console.groq.com — your free, instant GPU (Llama 3.3 70B at 750 tok/sec).
- [ ] Sign in to **Google AI Studio** at https://aistudio.google.com (your Google account works) — free Gemini 2.5 Pro + Flash in a web playground.
- [ ] Sign up for **HuggingFace** at https://huggingface.co — HuggingFace Chat + model leaderboards.
- [ ] Sign up for **Langfuse** free tier at https://langfuse.com (Google sign-in, 30 seconds).
- [ ] *Optional, only if your laptop has ≥ 8 GB RAM and you're curious*: download Ollama from https://ollama.com/download and pull one small model (`ollama pull qwen2.5:1.5b`). Not required — skip without guilt.

### Primer (5 min)
- [ ] Open https://huggingface.co/chat/ and try one prompt on any listed model. Feel how fast it is.
- [ ] Skim the Groq homepage — notice the "1000+ tokens/sec" claim. That's the cloud advantage.

### Bring to class
- [ ] One task from your capstone you suspect a small model could handle (summarize, classify, extract). Jot 2 example inputs.
- [ ] Your Groq API key (console.groq.com → API Keys — create one, copy it for class).

## Read: Local LLMs, prompting patterns, and evals

Let's unpack three ideas that make you dangerous: quantization (so models fit on your laptop), prompt patterns (so small models punch above their weight), and evals (so you know which prompt actually works).

**Quantization in one paragraph.** A neural network is a pile of numbers called weights. Full-precision weights are 16 or 32 bits each. A 7B-parameter model at full precision needs 14GB of RAM. Most of us don't have that. **Quantization** compresses each weight into 4 or 8 bits, shrinking the model 2–4x with only a small quality hit. The file format you'll see everywhere is **GGUF** — a single packaged file containing a quantized model plus its tokenizer. The naming pattern `Q4_K_M` means "4-bit quantization, medium quality variant". Rule of thumb: `Q4_K_M` for most laptops, `Q8_0` if you have RAM to spare, `Q2` only if you're desperate.

**Which model should you pull?** Match the model to your RAM.

| Laptop RAM | Pick | Approx size |
|------------|------|-------------|
| 4 GB | Qwen 2.5 1.5B Q4 | ~1 GB |
| 6 GB | Gemma 2 2B Q4 | ~1.6 GB |
| 8 GB+ | Phi-3 mini 3.8B Q4 | ~2.3 GB |
| 16 GB | Llama 3.1 8B Q4 | ~4.7 GB |

These small models (SLMs) won't replace GPT-5 or Claude, but for summarization, classification, structured extraction, and routing, they're shockingly competent — and **free, offline, private**.

**Cloud fallback — your free GPU.** When local is too slow for the demo, cloud inference APIs give you 70B-class models at ridiculous speeds. **Groq** serves Llama 3.3 70B at ~750 tokens/sec on a free tier. **Together AI** and **Fireworks AI** offer wide model catalogues with per-token billing. **OpenRouter** (https://openrouter.ai) is the cheat code when you want to A/B many models without juggling keys — one API key routes to 100+ models (OpenAI, Anthropic, Mistral, Llama, DeepSeek, Qwen) behind a single OpenAI-compatible endpoint, with a free tier on several models. Perfect for today's eval work. The workflow: prototype locally with Ollama, switch the endpoint URL to Groq or OpenRouter when you need more brain, and your app code barely changes.

**Prompting patterns that actually move numbers.** Prompting is not magic words — it's a set of reusable patterns. Four that you should internalize today:

1. **Chain-of-Thought (CoT).** Ask the model to think step by step before answering. `"Explain your reasoning step-by-step, then on the final line write FINAL: <answer>."` This single trick can swing accuracy 10–30% on reasoning tasks. Small models benefit most.

2. **Self-critique.** Ask the model to answer, then critique its own answer, then revise. `"Step 1: draft. Step 2: list three weaknesses of your draft. Step 3: produce an improved final version."` Great for writing tasks and long-form outputs.

3. **Structured JSON output.** Never parse free text if you can help it. `"Return ONLY valid JSON matching this schema: {\"intent\": string, \"confidence\": 0-1, \"entities\": string[]}."` Ollama and most cloud APIs now have a `format: json` flag — use it.

4. **Few-shot.** Show 2–5 worked examples before asking your real question. The examples teach tone, format, and edge cases faster than any instructions can. Budget a few hundred tokens; the payoff is huge.

**Evals — the habit that separates builders from tinkerers.** An **eval** is a repeatable test of an LLM prompt against a fixed dataset with an automatic or human-judged score. The minimum viable eval:

- A table of 10 rows. Each row has an `input` and an `expected` (or an `accept_if` rule).
- Run your prompt across all 10 rows. Collect outputs.
- Score each output (exact match, contains, LLM-as-judge, or a regex).
- Tally the pass rate.

That's it. The magic is the **repeatability** — the next time you tweak your prompt, you rerun the same 10 rows and get a new number. If the number went up, ship it. If it went down, revert. You just graduated from vibes-driven development to data-driven development.

**Langfuse** is our free, open-source eval + tracing platform. Every LLM call gets logged with inputs, outputs, latency, and tokens. You can tag outputs, group them into "sessions", and run dataset-based evals. It plays nicely with Ollama, OpenAI-compatible APIs, LangChain, and LlamaIndex. Alternatives: **LangSmith** (by LangChain, slicker UI but paid) or rolling your own Google Sheet (works fine for 10 rows).

**Tokens and context windows.** One final vocabulary drop. A **token** is roughly 3/4 of an English word. A **context window** is how many tokens a model can "see" at once. Qwen 2.5 handles 32k tokens. Llama 3.3 handles 128k. Gemini 2.5 handles 1M. When a model "forgets" what you said, you've blown the context window — not because the model is dumb, but because you exceeded its RAM.

## Watch: Ollama in 10 minutes (instructor demo)

Live walkthrough by the instructor — installing Ollama, pulling a small model, wiring up Open WebUI, making the first local chat call. You don't install it yourself. Then we switch to Groq on *your* laptop for a side-by-side speed comparison so you see both worlds.

https://www.youtube.com/embed/rIRkxZSn-A8

- Ollama listens on `http://localhost:11434` — the number matters.
- Open WebUI gives you a ChatGPT-style interface on top of Ollama.
- Groq's free tier is faster than any local setup you'll build today.
- Local is private; cloud is fast. Use both.

## Lab: Cloud-first 3-way prompt showdown in Langfuse

Everyone runs models in the browser — no local installs. Instructor demos Ollama on their machine so you see what "local" means, then we move to where your work actually happens: cloud inference.

Budget 45–60 minutes.

1. **Watch the instructor** pull `qwen2.5:1.5b` in Ollama and chat with it in Open WebUI. ~3 minutes. This is the "why local exists" tour — privacy, offline, zero cost.
2. In your browser, open **Groq Console** (`console.groq.com`). Go to Playground. Pick `llama-3.3-70b-versatile`. Paste: *"Explain RAG in 2 sentences."* Feel the speed.
3. Open **Google AI Studio** (`aistudio.google.com`). Pick Gemini 2.5 Flash. Paste the same prompt. Compare the formatting + reasoning style.
4. Open a third tab: **HuggingFace Chat** (`huggingface.co/chat/`). Pick Qwen 2.5 or Gemma. Paste the same prompt. Three answers, three models — notice the personality differences.
4. Go to **Langfuse** (langfuse.com). Create a project. Grab your public + secret keys. (No code needed today — we log via the web console or Playground trace view.)
5. Pick **one task from your capstone** you jotted in Before-class. Example: "Summarise a student's lab reflection into 3 bullets."
6. Write **three prompt variants** using the prompt-of-the-day scaffold:
   - V1: zero-shot ("Summarise this in 3 bullets: …")
   - V2: CoT + self-critique ("Think step by step. Draft. Critique. Revise. …")
   - V3: few-shot with 3 worked examples baked in.
7. Build a **10-row eval set** in a Google Sheet: columns `input`, `expected`. Real inputs — capstone data, not synthetic.
8. Run each variant against all 10 rows in the Groq Playground (or HuggingFace Chat). Score each output 1 (pass) or 0 (fail). Compute a win rate per variant.
9. Screenshot the winning prompt + the Langfuse trace. Crown a winner.

> ⚠️ **If you get stuck**
> - *Groq rate-limited* → wait 30s and retry, or switch the model dropdown to a smaller option (Llama 3.1 8B) — free tier has per-model quotas.
> - *HuggingFace Chat says "loading model"* → model is cold-starting; give it 20s or pick another from the dropdown (they're all free).
> - *Langfuse traces empty* → the web-only flow uses Playground screenshots; to actually log traces you need an API call from code (that's Day 23 material) — for today, screenshots are fine.
> - *Small local model eager to try anyway (≥8 GB laptop)*: download Ollama at home tonight, `ollama pull qwen2.5:1.5b`, run the same prompts, compare — it's an after-class stretch, not a requirement.

## After class · ~30-45 min post-work

Ship the 10-row eval tonight while the lab is still fresh — this is the habit that separates tinkerers from builders.

### Finish the eval (25 min)
- [ ] Build the 10-row eval Google Sheet for your capstone task (`input`, `expected` columns). Real examples, not synthetic.
- [ ] Run all three prompt variants (zero-shot, CoT+critique, few-shot) via Groq Playground.
- [ ] Score each output 1/0 and compute win rates per variant.

### Explore (10-15 min)
- [ ] Try the **same winning prompt** on a different Groq model (Mixtral, Llama 3.1 8B) — does model matter as much as prompt did? Often no — surprising takeaway.
- [ ] Open **HuggingFace Chat** and test the same prompt on Qwen 2.5 vs DeepSeek — rate the Indian-language versions if relevant.

### Stretch (optional, only if you have a capable laptop)
- [ ] Install Ollama at home, pull `qwen2.5:1.5b`, run the same prompt offline. Compare quality + speed vs Groq. File the one-line verdict.

### Share (5 min)
- [ ] Post to the cohort channel: the task, the win rates (three numbers), and one surprise. Screenshot the winning prompt + output.

## Quiz

Four quick ones: Why is `Q4_K_M` the most common quantization? What does chain-of-thought actually add to a prompt — tokens, structure, or both? If Groq is faster and free, why bother with local Ollama? What's the minimum number of rows that makes an eval meaningful for you, honestly?

## Assignment

Build a **10-row eval set** on a task tied to your capstone. Run **three prompt styles** (zero-shot, CoT + critique, few-shot). Pick the winning prompt and save it in Langfuse's prompt library with a version tag. Post the win rate of each variant to the cohort channel and call out anything surprising.

## Discuss: When small wins and when big wins

| Prompt | What a strong answer sounds like |
|---|---|
| Which task surprised you with how well a small local model handled it? | Names the task, the exact model + quantization, and one quality dimension (latency, format, tone) where it matched a frontier model. |
| Did CoT help or just add latency? When was few-shot worth the token cost? | Cites a measured delta from the eval (e.g. "+20% on classification, +3s latency"), not a vibe. |
| Share one eval row that broke all three prompts — what does that tell you? | Describes the row, proposes a hypothesis (ambiguity, domain jargon, long input), and suggests which prompt pattern might close the gap. |
| Would you deploy a 2B local model to real users, or always route to Groq/Claude? | Takes a position, acknowledges the latency / privacy / cost trade-off, and names a specific user-facing task boundary. |
| What's the smallest eval set you'd trust to ship a prompt change to production? | Gives a number with a reason (variance, coverage of edge cases) and mentions when you'd augment with LLM-as-judge or human review. |

## References

### Local inference
- Ollama — https://ollama.com
- LM Studio — https://lmstudio.ai
- WebLLM (in-browser) — https://webllm.mlc.ai
- Open WebUI — https://openwebui.com

### Cloud inference (free / cheap tiers)
- Groq (Llama 3.3 70B @ 750 tok/s) — https://groq.com
- Together AI — https://together.ai
- Fireworks AI — https://fireworks.ai
- OpenRouter — https://openrouter.ai (one key, 100+ models, great for eval sweeps)

### Models pulled today
- Qwen 2.5 1.5B — https://ollama.com/library/qwen2.5
- Gemma 2 2B — https://ollama.com/library/gemma2
- Phi-3 mini 3.8B — https://ollama.com/library/phi3

### Evals + tracing
- Langfuse — https://langfuse.com
- LangSmith — https://smith.langchain.com

### Model quality references
- Hugging Face model cards — https://huggingface.co
