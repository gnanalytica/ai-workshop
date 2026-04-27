-- Drop Docker from lab handbook; n8n via cloud only. Idempotent if 0039 already had no Docker.
update faculty_pretraining_modules
set
  body_md = $hb$
*Aligned with the 30-day workshop days in this product. For cohort-pinned versions, follow your program email.*

This module is the **Setup & tools** area of the faculty Handbook. Use it to prep **lab images** and to coach **install order** (core stack first, then per-week `pip` bundles in a fresh venv when days call for it).

## Core stack (install before Week 1 hands-on labs)

- **Browser:** Chrome (or current Chromium) — needed for the app, AI Studio, and most cloud tools.
- **Node.js 20+ LTS** — curriculum references `node -v` from Day 17 onward; deployment days use `npx` / Next (e.g. `npx create-next-app`). Install from [nodejs.org](https://nodejs.org/); verify `node -v` and `npm -v`.
- **Python 3.10+** (many days use **3.11+** for capstone weeks — match your handout). Verify `python3 --version` / `python --version` on Windows.
- **Git 2.40+** — Day 17+; verify `git --version`, then `git config --global user.name` / `user.email` for first commits.
- **Editor / agents:** **Antigravity** (primary for vibe-coding week) and optional **Cursor**; **VS Code** is fine for generic edits.

## Python: virtualenv and `pip` (used heavily mid–late workshop)

- Create an isolated environment before installing science stacks:
  - `python3 -m venv .venv` then **activate** (OS-specific: `source .venv/bin/activate` on macOS/Linux; `.venv\Scripts\activate` on Windows).
- **Days reference bundle installs** (examples from curriculum): `transformers`, `tokenizers`; **Hugging Face Hub**; **LangChain** + **Chroma** + **sentence-transformers** + **pypdf**; **Ollama**-adjacent `pip` for evals; **LangGraph** / **Chainlit** / **CrewAI**; **promptfoo** / guardrails; **openevals** + **langsmith** — students should use **a fresh venv per major lab** when days say so, to avoid dependency clashes.
- **Do not** commit `.env` or API keys; see **API keys** below.

## Node ecosystem

- **`npm` and `npx`** — used for scaffolds (e.g. Next.js) and local tooling. After Node install, confirm `npx` runs without global installs where the day script expects it.
- **Package managers:** curriculum assumes **npm**; if you standardize on **pnpm** or **yarn**, document one choice for the cohort.

## HTTP & APIs (Day 17)

- **Postman** (desktop or web) — useful for the “public API + JSON” exercise; not always required if you teach browser DevTools only, but it’s the named tool in the day sheet.

## Cloud accounts (no installer — block class if missing)

Students hit these across **Days 3–4, 5, 8, 13, 17–22, 25–26, 29** (and capstone). Ensure accounts exist **before** the relevant week:

- **Hugging Face** (account + read token) — model hubs.
- **Vercel** (GitHub-linked) + **Supabase** (region near your cohort) — **Days 18, 20, 21** and beyond for live URLs and DB.
- **OpenAI / Anthropic / Google AI** (as your labs require) — API keys in **`.env` / `.env.local`**, mirrored in Vercel envs for deploys; never commit secrets.
- **LangSmith** (and tracing env vars) when you run **Day 25**-style eval labs.
- **n8n:** use **[n8n.cloud](https://n8n.io/cloud/)** (no local Docker in this program).
- Other named **SaaS signups** in early days: e.g. **Perplexity**, **NotebookLM**, **Figma/Canva**, **Otter/Fireflies/Read.AI**, **Excalidraw/Miro** — web accounts, not system packages.

## Local models: Ollama

- **Ollama** — **Days 4** (optional), **25** (local Llama), **RAG** stacks that compare local vs API. After install: `ollama pull` the **exact** model name from the day sheet; confirm `ollama run` for smoke tests.

## Design, visuals, and thinking tools (not compilers — but pre-class)

- **Figma / Canva** (Day 8), **Excalidraw / Miro** (Days 9–10), **Obsidian** (Day 10 — local vault). These are **not** the same as Python/Node; list them in “pre-class open-in-browser / install” checklists for those weeks.

## Optional GPU (Days 11–12)

- **ComfyUI** or **AUTOMATIC1111** for local diffusion — only for students with capable GPUs; others use hosted SD. Don’t block the whole cohort on this install.

## API keys, `.env`, and deployment hygiene

- One **`.env` / `.env.local`** pattern for local dev; **Vercel → Environment Variables** for production. Curriculum stresses: **anon** Supabase key in frontends, **never** `service_role` in client bundles.
- **OpenAI, Anthropic, Groq, Gemini** keys appear in late-week agent labs — use `.env` and rotation practices your institution allows.

## Quick lab-health checklist (faculty / IT)

- [ ] Core: Chrome, **Node 20+**, **Python 3.10+**, **Git** on PATH; Antigravity primary, Cursor optional.
- [ ] `python3 -m venv` + activate works; `pip install` works inside venv.
- [ ] `npx` can run (e.g. `npx create-next-app` with network allowed).
- [ ] Postman or agreed alternative for API day.
- [ ] Vercel + Supabase accounts creatable; GitHub connected.
- [ ] **Ollama** only if you teach local-model days.

## Relationship to the rest of the playbook

- **Navigation, pods, help desk, community** → **Handbook → Your role & workflow** (*Using the workspace…*).
- **Per-day `pip install …` lines** in MDX are authoritative for **that** lab; this page is the **shared baseline** so those commands have somewhere to run.
$hb$
where slug = 'lab_environment';
