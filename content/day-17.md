---
reading_time: 14 min
tldr: "Running a model on your laptop makes the abstraction concrete. Ollama + Open WebUI in 15 minutes."
tags: ["ai", "llms", "hands-on", "ollama", "open-source"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Install Ollama + Open WebUI, benchmark three models", "url": "https://ollama.com/"}
resources: [{"title": "Ollama", "url": "https://ollama.com/"}, {"title": "Open WebUI docs", "url": "https://docs.openwebui.com/"}, {"title": "vLLM docs", "url": "https://docs.vllm.ai/"}, {"title": "HuggingFace model hub", "url": "https://huggingface.co/"}]
---

## Intro

Today stops being theory. You're going to download a real LLM, run it on your laptop with no API key, no credit card, no telemetry. By the end you will have a chat UI on `localhost` talking to a model that lives on your SSD. This is the single biggest capability jump in the workshop.

## Read: Running models on your own hardware

### Why run locally at all?

- **Privacy**: your prompt never leaves your machine. Essential for medical, legal, HR.
- **Cost**: zero marginal cost once the weights are downloaded.
- **Latency**: for small models on Apple Silicon, first-token latency can beat hosted APIs.
- **Learning**: you see exactly what you're running; you can swap models in seconds.
- **Offline**: flights, poor connectivity, air-gapped environments.

The tradeoff: open-weights models are a generation or two behind the frontier (GPT-5 / Claude Opus / Gemini Ultra). But for many tasks — summarization, classification, structured extraction, code completion — a 7B–14B local model is *plenty*.

### The open-weights landscape (as of 2026)

| Family | Sizes | Strengths | Notes |
|---|---|---|---|
| Meta Llama 3.x / 4 | 1B–405B, MoE variants | Broad coverage, huge ecosystem | Community license |
| Qwen 3 (Alibaba) | 0.5B–72B + MoE | Strong multilingual, strong code | Apache 2.0 on most sizes |
| Mistral / Mixtral | 7B, 8x22B, Large | Fast, efficient | Apache / research |
| Google Gemma 3 | 2B–27B | Tight sizes, multimodal | Gemma license |
| DeepSeek V3 / R1 | MoE, huge | Reasoning, math | MIT on many releases |
| Microsoft Phi-4 | 3B–14B | Small but strong reasoning | MIT |

"MoE" (mixture of experts) models have huge total parameter counts but activate only a fraction per token — cheaper inference than the raw size suggests. Treat the list as a starting map, not gospel: rankings shift every month.

### Hardware reality

- **CPU only**: works for 1B–3B quantized models. Slow but usable.
- **Apple Silicon (M1/M2/M3/M4)**: unified memory is the killer feature. An M3 Max with 64GB runs 30B-parameter 4-bit models smoothly.
- **Consumer GPU (8–16GB)**: fits 7B in 4-bit with room to spare; 14B is tight.
- **24GB GPU (3090/4090/5090)**: 14B comfortably, 30B with quantization.
- **Dual 24GB or a single 48GB**: 70B-class models in 4-bit.

Check `nvidia-smi` (Linux/Windows) or `ActivityMonitor` → memory (macOS) to see your RAM headroom.

### The tool stack

- **Ollama** — the easiest front door. Wraps `llama.cpp` with a clean CLI and REST API. `ollama pull`, `ollama run`, done.
- **llama.cpp** — the C++ engine most local tools use under the hood. Pure-CPU or GPU-accelerated.
- **vLLM** — the serious server-side inference engine. PagedAttention, high throughput, multi-GPU. Use when you need to serve dozens of concurrent users.
- **HuggingFace Transformers** — Python-native, flexible, slower than llama.cpp/vLLM for inference but unbeatable for experiments.
- **Open WebUI** — a polished ChatGPT-like frontend that talks to Ollama. Docker one-liner.
- **LM Studio** — GUI app for non-terminal users; also useful.

### Ollama in 60 seconds

```bash
# Mac / Linux
curl -fsSL https://ollama.com/install.sh | sh

ollama pull llama3.2:3b      # ~2GB, 4-bit
ollama run llama3.2:3b
>>> Hi. What are you?
```

That's it. `ollama list` shows local models; `ollama rm` deletes them. The REST API runs at `http://localhost:11434`:

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Write haiku about debugging.",
  "stream": false
}'
```

### Picking a daily driver

Your daily driver is the model you'll reach for when coding and thinking. Criteria:

1. Fits comfortably in your RAM with 30–40% headroom.
2. Runs at >15 tokens/sec (anything slower feels painful).
3. Scores well on *your* actual tasks — not leaderboards.

Build a tiny eval suite (5–10 prompts you actually care about) and re-run it every time you try a new model. Leaderboards are noisy; your own task is not.

## Watch: Ollama + Open WebUI walkthrough

Find any recent end-to-end Ollama + Open WebUI install video — Docker setup, model pulling, custom system prompts. Watch it before starting the lab so you know what "success" looks like.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace with a recent Ollama Open WebUI walkthrough -->

- Note where model weights get stored on your OS.
- Watch the part about system prompts and model files.
- See how Open WebUI handles multiple concurrent chats.

## Lab: Local LLM rig in under an hour

1. Install Ollama from `https://ollama.com/`. Verify: `ollama --version`.
2. Pull three models of different sizes:
   ```bash
   ollama pull llama3.2:3b
   ollama pull qwen3:8b        # or llama3.1:8b if qwen3 tag differs
   ollama pull mistral:7b
   ```
   If any tag is unavailable, swap for a current one from `ollama.com/library`. Note: total ~10–15GB download.
3. Run a quick sanity chat: `ollama run llama3.2:3b`, type `/bye` to exit.
4. Install Open WebUI via Docker:
   ```bash
   docker run -d -p 3000:8080 \
     --add-host=host.docker.internal:host-gateway \
     -v open-webui:/app/backend/data \
     --name open-webui --restart always \
     ghcr.io/open-webui/open-webui:main
   ```
   Open `http://localhost:3000`. Create a local admin account.
5. In the model picker, confirm all three Ollama models show up.
6. Create a benchmark file `my-evals.md` with 5 prompts of your own: one factual Q, one code task (e.g., reverse a linked list in Python), one summarization (paste a paragraph), one Hindi/Tamil/your-language question, one adversarial ("How many r's in strawberry?").
7. Run the 5 prompts through each of the three models. For each, record: response time (stopwatch or watch the UI), whether the answer was correct, and a 1–5 quality score.
8. Make a table in `local-llm-bench.md` with model × prompt = score. Add a "tokens/sec" column — Open WebUI shows this in the response metadata.
9. Pick your daily driver. Write 3–4 sentences on why.
10. Bonus: install `vLLM` in a venv and serve one model (`vllm serve Qwen/Qwen2.5-7B-Instruct`), hit the OpenAI-compatible endpoint at `http://localhost:8000/v1/chat/completions` with `curl`. Compare throughput.

Budget 60 minutes. Most of it is the model downloads.

## Quiz

Quiz covers: what Ollama actually wraps, the meaning of 4-bit quantization, when to prefer vLLM over Ollama, how context windows interact with RAM, and the rough size/RAM mapping. If you did the lab you'll ace it.

## Assignment

Commit `local-llm-bench.md` to your workshop repo with your table and your daily-driver choice. Then add a 200-word paragraph on a real use case at your college (e.g., summarizing hostel complaint threads, answering FAQ emails) where a local 7B model would be preferable to calling an API — name the constraints (cost, privacy, latency, offline) that make local the right call.

## Discuss: Trade-offs of going local

- Local 8B vs hosted frontier (GPT-5 / Claude Opus / Gemini Ultra): name three tasks where local wins and three where it loses.
- When does Ollama stop being the right tool and vLLM starts? Be concrete about concurrency numbers.
- Apple Silicon has unified memory. Why does that matter more than TFLOPS for local LLM inference?
- Open-weights licenses vary — Apache, MIT, community, Gemma. Does the license affect your architecture choices at a startup?
- If you had a $500 budget for a personal AI rig in 2026, how would you spend it?
