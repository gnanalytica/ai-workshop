-- Restructure **Lab environment & tooling** to split online (browser-only) tools
-- from locally-installed software, and add tools named across the 30-day curriculum
-- that were previously missing (Firecrawl/Zapier, Gamma/Kimi, Bolt/Emergent/Codex,
-- ElevenLabs/HeyGen/Higgsfield/Veo, Galileo, LMArena, Artificial Analysis,
-- pgvector, MCP, Streamlit, Llama Guard, NeMo Guardrails, Adobe Firefly, etc.).
update faculty_pretraining_modules
set
  body_md = $hb$
*Aligned with the 30-day workshop days in this product. For cohort-pinned versions, follow your program email.*

This module is the **Setup & tools** area of the faculty Handbook. It is split into two halves:

1. **Online tools** — browser-only, just need an account. Most of the workshop lives here.
2. **Local install** — software that must be on the student machine (or the lab image).

If you only have time to pre-flight one thing per week, pre-flight the **online accounts** — those are what block class on the day.

---

# Part 1 — Online tools (no install, just sign-in)

These need a working browser, a college Google account where possible, and (sometimes) email verification ahead of class. Group signups by week so students don't burn class time on captchas.

## Chat & reasoning models (Days 1, 3, 5, 6, 7)

- **ChatGPT** — https://chat.openai.com/
- **Claude** — https://claude.ai/
- **Gemini** — https://gemini.google.com/
- **Grok** — https://grok.com/  *(was missing from prior handbook — Day 1 needs it)*
- **OpenAI Playground** — https://platform.openai.com/playground
- **Google AI Studio** — https://aistudio.google.com/

## Research, grounding, and notebooks (Day 5, Day 6 capstone start)

- **Perplexity** — https://www.perplexity.ai/
- **NotebookLM** — https://notebooklm.google.com/
- **ChatGPT Deep Research / Gemini Deep Research** — same login as the parent product.

## Tokenizer & model exploration (Days 2, 4)

- **TikTokenizer** — https://tiktokenizer.vercel.app/
- **Hugging Face Hub** — https://huggingface.co/  (account + read token; needed Days 2, 4, 19, 27)
- **Sarvam Playground** — https://www.sarvam.ai/
- **Open LLM Leaderboard** — https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard

## Meeting capture (Day 9)

- **OtterAI** — https://otter.ai/
- **Fireflies** — https://fireflies.ai/
- **Read.AI** — https://www.read.ai/  *(any one is enough)*

## Visual thinking & design (Days 8, 10)

- **Figma** — https://www.figma.com/
- **Canva** — https://www.canva.com/
- **Excalidraw** — https://excalidraw.com/  (no signup required)
- **Miro / FigJam** — https://miro.com/  /  https://figma.com/figjam/
- **DrawIO** — https://app.diagrams.net/

## Image generation (Day 12)

- **ChatGPT Images** — via https://chat.openai.com/
- **Nano Banana (Gemini image)** — via https://gemini.google.com/
- **Stable Diffusion (HF Space)** — https://huggingface.co/spaces/stabilityai/stable-diffusion
- **Adobe Firefly** — https://firefly.adobe.com/
- *(Day 11–12 GPU-heavy options like ComfyUI / AUTOMATIC1111 are local; see Part 2.)*

## Automation (Day 13)

- **n8n.cloud** — https://n8n.io/cloud/  *(no local Docker in this program)*
- **Zapier** — https://zapier.com/
- **Firecrawl** — https://www.firecrawl.dev/  *(was missing — Day 13 lab uses it for crawling)*
- **Google Sheets** — https://sheets.google.com/  (used as the destination in many automations)

## Presentations & docs (Days 14, 16)

- **Gamma** — https://gamma.app/  *(was missing — primary tool for Day 14 / Milestone 3 deck)*
- **Kimi AI** — https://kimi.com/  *(was missing — Day 14 alt for long-doc → slides)*
- **Canva Magic Design** — https://www.canva.com/magic-design/

## Cloud vibe-coding & agent IDEs (Days 15, 18, 20)

These are **browser-based** alternatives to the local IDEs in Part 2. Useful for students whose laptops can't run a heavy editor.

- **Bolt** — https://bolt.new/  *(Day 15 — was missing)*
- **Emergent** — https://emergent.sh/  *(Day 15 — was missing)*
- **Codex (ChatGPT)** — https://chatgpt.com/codex  *(Day 18 — was missing)*
- **v0** (optional) — https://v0.dev/

## Deployment & backend (Days 18, 20, 21)

- **Vercel** — https://vercel.com/  (link to GitHub)
- **Supabase** — https://supabase.com/  (region near your cohort)
- **GitHub** — https://github.com/  *(account creation called out explicitly — Day 17 trip-up*)
- **OpenWeather API** — https://openweathermap.org/api  (free key; Day 17 lab)

## RAG, vectors, evals (Days 19, 25, 27, 28)

- **Pinecone** — https://www.pinecone.io/  *(Day 19 hosted vector DB — was missing)*
- **pgvector** (Supabase extension) — enable from Supabase dashboard; no install.
- **LangSmith** — https://smith.langchain.com/  (tracing + eval runs)
- **Galileo** — https://www.galileo.ai/  *(Day 25 — was missing)*
- **LMArena** — https://lmarena.ai/  *(Day 28 — was missing)*
- **Artificial Analysis** — https://artificialanalysis.ai/  *(Day 28 — was missing)*
- **SWE-bench leaderboard** — https://www.swebench.com/  (Day 28)

## Video, voice, and avatars (Day 24)

*(This entire day was missing from the previous handbook.)*

- **ElevenLabs** — https://elevenlabs.io/  (voice cloning; email verification can be slow — pre-create accounts the week before)
- **HeyGen** — https://www.heygen.com/  (talking-head avatars; free tier is limited per new signup)
- **Higgsfield** — https://higgsfield.ai/
- **Google Veo 3** — https://deepmind.google/models/veo/  (regional gating possible)

## Pricing & cost reference (Day 23)

Bookmarks only — no signup needed unless you actually want to rent compute:

- **OpenAI Tokenizer** — https://platform.openai.com/tokenizer
- **Anthropic pricing** — https://www.anthropic.com/pricing
- **OpenAI pricing** — https://openai.com/api/pricing/
- **RunPod** — https://www.runpod.io/pricing
- **Together.ai** — https://www.together.ai/pricing
- **Lambda Labs** — https://lambdalabs.com/service/gpu-cloud

## API keys faculty should expect students to generate

By late workshop, students will have: **OpenAI**, **Anthropic**, **Google AI**, **Groq**, **Hugging Face**, **Pinecone**, **LangSmith**, **Firecrawl**, **ElevenLabs**, **Supabase (anon + URL)**. All go in `.env` / `.env.local` and are mirrored into Vercel env vars for production. **Never** commit secrets; **never** ship `service_role` to the client.

---

# Part 2 — Local install (must be on the student machine or lab image)

Install these in order. Anything past the **Core stack** is only needed when the relevant week starts.

## Core stack — install before Week 1 hands-on labs

- **Browser:** Chrome (or current Chromium) — needed for the app, AI Studio, and most cloud tools above.
- **Node.js 20+ LTS** — https://nodejs.org/  → verify `node -v` and `npm -v`. Bundled with **`npm`** and **`npx`**; both are required (Days 17+; deployment days use `npx create-next-app`).
  - **`pnpm`** (optional, faster) — `npm i -g pnpm` then `pnpm -v`. The cohort handouts default to `npm`, but pnpm is fine if students prefer it; pick one and stick with it for the cohort.
- **Python 3.10+** (some capstone days use **3.11+** — match your handout)
  - macOS/Linux verify: `python3 --version` and `pip3 --version`.
  - Windows verify: `py -3.11 --version` (or `python --version` if PATH is set); `pip --version`.
- **Git 2.40+** — https://git-scm.com/  → verify `git --version`, then set `git config --global user.name` / `user.email` before first commit.
- **VS Code** — https://code.visualstudio.com/  (general editor for any day).

## Vibe-coding & agent IDEs (Days 15, 18, 20–22, 26)

- **Antigravity** — https://antigravity.google/  *(primary for the vibe-coding week)*
- **Cursor** (optional) — https://cursor.com/
- **OpenCode** (optional) — https://opencode.ai/  *(Day 18 alt)*

## Python: virtualenv + per-week `pip` bundles

Always create a fresh venv per major lab to avoid dependency clashes:

```
python3 -m venv .venv
source .venv/bin/activate   # macOS/Linux
.venv\Scripts\activate      # Windows
```

Bundles named in the curriculum (install when the day calls for them):

- **Day 2 / 4 — Hugging Face starter** — `pip install transformers tokenizers huggingface_hub`. After install, run `huggingface-cli login` and paste the **read token** from the student's HF account (Part 1). Required for Day 4 (`sarvam-1`, Mistral, Qwen) and for any gated model later, including **Llama Guard 3** on Day 27.
- **Day 19 (RAG)** — `langchain`, `chromadb`, `sentence-transformers`, `pypdf`, optional `pinecone-client`
- **Day 22 / 26 (agents)** — `langgraph`, `crewai`, `langchain`, plus an MCP client where the day specifies *(see MCP note below)*
- **Day 26 (UI on top of agent)** — `chainlit` and/or `streamlit`  *(Streamlit was missing from prior handbook)*
- **Day 25 (evals)** — `openevals`, `langsmith`, `promptfoo` (CLI), optional `galileo` SDK
- **Day 27 (safety)** — `guardrails-ai`, `nemoguardrails`  *(NeMo Guardrails was missing)*; **Llama Guard 3** weights are pulled from Hugging Face when used

## HTTP & APIs (Day 17)

- **Postman** (desktop or web) — https://www.postman.com/  *(or browser DevTools if you teach without it)*
- **GitHub CLI** (optional) — https://cli.github.com/

## Local model runners (Days 4 optional, 25, 27)

- **Ollama** — https://ollama.com/  → after install, `ollama pull <model>` for the exact name on the day sheet, then `ollama run` to smoke-test.
- **LM Studio** (optional, Windows-friendly alternative) — https://lmstudio.ai/

## Local note vault (Day 10)

- **Obsidian** — https://obsidian.md/  (local app; bring an empty vault called `workshop`).

## Optional GPU / local diffusion (Days 11–12)

- **ComfyUI** — https://github.com/comfyanonymous/ComfyUI
- **AUTOMATIC1111** — https://github.com/AUTOMATIC1111/stable-diffusion-webui

Only for students with capable GPUs; everyone else stays on the hosted image tools listed in Part 1. Don't block the cohort on this install.

## Model Context Protocol (Day 22)

- **MCP** — https://modelcontextprotocol.io/  — students will run **MCP servers** locally (often via `npx` or `uv`) and connect them to Claude / Cursor / Antigravity. Faculty should know:
  - it's a **protocol**, not one tool;
  - servers are usually one-line installs;
  - the IDE config (Claude Desktop, Cursor) is where they get registered.

---

# Quick lab-health checklist (faculty / IT)

- [ ] **Online — Week 1:** Chrome opens the app and stays signed in; ChatGPT / Claude / Gemini / Grok / HF accounts created.
- [ ] **Online — Week 2:** Otter/Fireflies/Read.AI, Figma, Canva, Excalidraw, Miro, Obsidian (download).
- [ ] **Online — Week 3:** GitHub, Vercel, Supabase, n8n.cloud, Firecrawl, Zapier, Gamma, Kimi, Bolt, Emergent.
- [ ] **Online — Week 4:** ElevenLabs, HeyGen, Higgsfield, LangSmith, Galileo, LMArena, Artificial Analysis, Pinecone (if RAG-cloud).
- [ ] **Local — core:** Node 20+ (with `npm` + `npx`; `pnpm` if standardizing on it), Python 3.10+, Git on PATH; `python3 -m venv` + activate works; `pip install` works inside venv; `npx create-next-app` runs with network allowed; `huggingface-cli login` accepts the student's HF read token.
- [ ] **Local — IDE:** Antigravity primary, Cursor optional, VS Code present.
- [ ] **Local — Ollama** only if you teach local-model days (25, 27).

## Relationship to the rest of the playbook

- **Navigation, pods, help desk, community** → **Handbook → Your role & workflow** (*Using the workspace…*).
- **Per-day `pip install …` lines** in MDX are authoritative for **that** lab; this page is the **shared baseline** so those commands have somewhere to run.
$hb$
where slug = 'lab_environment';
