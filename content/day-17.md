---
reading_time: 15 min
tldr: "Run an LLM on your own laptop, compare three prompt styles on a 10-row eval set, and trace everything in Langfuse."
tags: ["build", "technical"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Install Ollama + run a 1-3B model + log 10 evals in Langfuse", "url": "https://ollama.com/download"}
prompt_of_the_day: "Act as a prompt engineer. My task is {{task_description}}. Generate three prompt variants: (A) zero-shot, (B) chain-of-thought with self-critique, (C) few-shot with 3 examples. Output each as a clearly labelled code block so I can paste them into Langfuse."
tools_hands_on: [{"name": "Ollama", "url": "https://ollama.com"}, {"name": "Open WebUI", "url": "https://openwebui.com"}, {"name": "Langfuse", "url": "https://langfuse.com"}]
tools_demo: [{"name": "Groq (free Llama 3.3 70B @ 750 tok/s)", "url": "https://groq.com"}, {"name": "Hugging Face model cards", "url": "https://huggingface.co"}]
tools_reference: [{"name": "LM Studio", "url": "https://lmstudio.ai"}, {"name": "WebLLM (in-browser)", "url": "https://webllm.mlc.ai"}, {"name": "Together AI", "url": "https://together.ai"}, {"name": "Fireworks AI", "url": "https://fireworks.ai"}, {"name": "LangSmith", "url": "https://smith.langchain.com"}]
resources: [{"name": "Qwen 2.5 1.5B", "url": "https://ollama.com/library/qwen2.5"}, {"name": "Gemma 2 2B", "url": "https://ollama.com/library/gemma2"}, {"name": "Phi-3 mini 3.8B", "url": "https://ollama.com/library/phi3"}]
---

## Intro

Yesterday you learned the rails. Today you drive. We put a real LLM on your laptop — yes, even a 4GB college laptop — and layer prompting patterns that bigger models can't brute-force their way past. Then we do something 90% of builders skip: we measure. Evals turn "sounds good" into "provably better".

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

**Cloud fallback — your free GPU.** When local is too slow for the demo, cloud inference APIs give you 70B-class models at ridiculous speeds. **Groq** serves Llama 3.3 70B at ~750 tokens/sec on a free tier. **Together AI** and **Fireworks AI** offer wide model catalogues with per-token billing. The workflow: prototype locally with Ollama, switch the endpoint URL to Groq when you need more brain, and your app code barely changes.

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

## Watch: Ollama in 10 minutes

Live walkthrough installing Ollama, pulling a small model, wiring up Open WebUI, and making the first local chat call. Then we switch to Groq for a side-by-side speed comparison.

https://www.youtube.com/embed/VIDEO_ID <!-- TODO: replace video -->

- Ollama listens on `http://localhost:11434` — the number matters.
- Open WebUI gives you a ChatGPT-style interface on top of Ollama.
- Groq's free tier is faster than any local setup you'll build today.
- Local is private; cloud is fast. Use both.

## Lab: Install Ollama + 3-way prompt showdown in Langfuse

Budget 45–60 minutes.

1. Install **Ollama** from ollama.com. Launch it; it runs as a background service.
2. Pick your model based on RAM (see the table above). Pull it — the command you'll run from your terminal (read this, don't panic):

```bash
ollama pull qwen2.5:1.5b   # or gemma2:2b, phi3:mini
ollama run qwen2.5:1.5b "Explain RAG in 2 sentences."
```

3. Install **Open WebUI** (follow the one-click Docker or desktop path at openwebui.com). Open `http://localhost:3000`. Select your local model in the dropdown. Say hi.
4. Go to **langfuse.com**, sign up free, create a project. Grab your public + secret keys.
5. Pick a task for your capstone. Write **three prompt variants** using the prompt-of-the-day scaffold: zero-shot, CoT + self-critique, few-shot with 3 examples.
6. Build a 10-row eval set in a Google Sheet: columns `input`, `expected`. Keep inputs short and realistic (real student queries, real PDFs).
7. Run each variant across all 10 rows — either via Open WebUI manually (tedious but educational) or via Langfuse's prompt management UI. Log every run.
8. Score each output 1 (pass) or 0 (fail). Compute a win rate per variant. Take a screenshot of the Langfuse trace view. Crown a winner.

## Quiz

Four quick ones: Why is `Q4_K_M` the most common quantization? What does chain-of-thought actually add to a prompt — tokens, structure, or both? If Groq is faster and free, why bother with local Ollama? What's the minimum number of rows that makes an eval meaningful for you, honestly?

## Assignment

Build a **10-row eval set** on a task tied to your capstone. Run **three prompt styles** (zero-shot, CoT + critique, few-shot). Pick the winning prompt and save it in Langfuse's prompt library with a version tag. Post the win rate of each variant to the cohort channel and call out anything surprising.

## Discuss: When small wins and when big wins

- Which task surprised you with how well a small local model handled it?
- Did CoT help or just add latency? When was few-shot worth the token cost?
- Share one eval row that broke all three prompts — what does that tell you?
- Would you deploy a 2B local model to real users, or always route to Groq/Claude?
- What's the smallest eval set you'd trust to ship a prompt change to production?
