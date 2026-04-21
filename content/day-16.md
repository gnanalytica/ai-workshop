---
reading_time: 15 min
tldr: "Git, GitHub, localhost, and APIs — the four rails every AI builder rides on, explored without writing a single line of code."
tags: ["build", "technical"]
video: https://www.youtube.com/embed/hwP7WQkmECE
lab: {"title": "Fork a repo + hit 3 public APIs with Hoppscotch", "url": "https://hoppscotch.io"}
prompt_of_the_day: "You are my OSS mentor. I want to contribute to {{repo_url}}. Read its README and CONTRIBUTING.md, list 3 good-first-issues I could realistically tackle, and explain each issue in plain English with the files I'd need to change."
tools_hands_on: [{"name": "GitHub", "url": "https://github.com"}, {"name": "Hoppscotch", "url": "https://hoppscotch.io"}]
tools_demo: [{"name": "Browser DevTools (Network tab)", "url": "https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/What_are_browser_developer_tools"}, {"name": "GitHub good-first-issue search", "url": "https://github.com/search?q=label%3Agood-first-issue&type=issues"}]
tools_reference: [{"name": "Git official docs", "url": "https://git-scm.com"}, {"name": "MDN Web Docs", "url": "https://developer.mozilla.org"}, {"name": "Open Source Guides", "url": "https://opensource.guide"}, {"name": "JSONPlaceholder", "url": "https://jsonplaceholder.typicode.com"}, {"name": "HTTPBin", "url": "https://httpbin.org"}]
resources: [{"name": "GitHub Skills (free interactive)", "url": "https://skills.github.com"}, {"name": "OpenLibrary API", "url": "https://openlibrary.org/developers/api"}, {"name": "Open-Meteo free weather API", "url": "https://open-meteo.com"}]
objective:
  topic: "The four rails — Git, GitHub, localhost, APIs — read and clicked, no code written"
  tools: ["GitHub", "Hoppscotch"]
  end_goal: "Fork an AI repo, read one merged PR's diff in plain English, hit 3 public APIs (and trigger a 429 + 500 on purpose) in Hoppscotch, and open one draft issue on a repo you care about."
---

## 🎯 Today's objective

**Topic.** Welcome to Week 4. Until now you've been a power user of AI. This week you become a builder — but still without writing code yourself. Today we learn the four rails every software project runs on: **Git, GitHub, localhost, and APIs**.

**Tools you'll use.** GitHub (fork, read issues + PRs), Hoppscotch (API calls in the browser — no install).

**End goal.** By the end of today you will have:
1. Forked an AI repo you actually use and read one merged PR's diff in plain English.
2. Made 3 real HTTP calls in Hoppscotch (OpenLibrary, GitHub, Open-Meteo) + triggered a 429 and 500 on httpbin.org on purpose.
3. Opened one draft issue on a repo you care about — a question, a typo fix, or a feature idea.

> *Why this matters:* By Friday you'll be running local LLMs and chaining APIs. Today's vocabulary is the one that stops tutorials from feeling like hieroglyphics.

---

## ⏪ Pre-class · ~20 min

**Revision / context.** Friday (Day 15) you locked Capstone Milestone 2 — a 1-page spec with a NOT-list, 3–6 grey-box wireframes, a measurable 14-day success metric, and a public "Witness me" post with 2 cohort acknowledgements. That spec is no longer a draft; it's the contract. Week 4 builds only against it. Today's four rails are the infrastructure your build will sit on — every API your spec's "what it does" implies, every repo you'll fork for scaffolding, every `localhost:port` you'll run during dev. Open your locked spec PDF in one tab today; when you hit Hoppscotch, ask yourself: which of these APIs could power a line from my spec?

Come in with an account, a curiosity, and a browser tab already open — don't lose the first 15 minutes to signup flows.

### Setup (10 min)
- [ ] Create a free GitHub account at https://github.com using your college email (skip if you already have one). Add a profile photo so you look human to maintainers.
- [ ] Open https://hoppscotch.io in a tab and click once on **GET** to confirm it loads — no install, no signup needed.
- [ ] (Optional) Install the GitHub CLI from https://cli.github.com if you're on a laptop you own; skip on shared/college machines.

### Primer (7 min)
- [ ] Watch Fireship's "Git in 100 Seconds" on YouTube — search the title, any upload works.
- [ ] Skim the first section of the Open Source Guides at https://opensource.guide to see what "contributing" actually looks like.

### Bring to class (3 min)
- [ ] One GitHub repo URL you're curious about (an AI tool you've used — Ollama, LangChain, n8n, anything). Paste it in the cohort channel before class starts.
- [ ] One question about Git, GitHub, or APIs you've always been afraid to ask.

> 🧠 **Quick glossary for today**
> - **Git** = a time machine for files; tracks every change as a commit.
> - **Branch** = a parallel universe of your code where you experiment safely.
> - **PR / Pull Request** = "please merge my branch" — a proposal with a diff attached.
> - **Localhost** = your own laptop acting as a server (`127.0.0.1`).
> - **Port** = a numbered door on localhost (3000, 8080, 11434…).
> - **REST API** = a URL contract; send JSON, get JSON, using verbs like GET/POST.
> - **JSON** = key-value data in curly braces; how 99% of APIs speak.

---

## 🎥 During class · 60 min live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min | Why every AI builder needs Git, GitHub, localhost, APIs |
| Mini-lecture | 20 min | The four rails — commits, forks, ports, status codes |
| Live lab | 20 min | Fork Ollama + hit 3 public APIs in Hoppscotch together |
| Q&A + discussion | 15 min | Which rail felt most foreign? Share weird status codes |

### In-class moments (minute-by-minute)

- **00:05 — Cold-open demo**: instructor types `curl https://api.github.com/users/torvalds` in a terminal, asks the room "what just happened, and who did the work?"
- **00:15 — Think-pair-share**: in 90 seconds with your neighbour, define *branch* vs *fork* in your own words — no Googling.
- **00:25 — Live poll**: raise a hand if you've ever seen `localhost:3000` before today; instructor reads the room and adjusts depth.
- **00:40 — Breakout**: in pairs, open any merged PR on the Ollama repo and describe the diff out loud in plain English for 3 minutes.
- **00:55 — Status-code lightning round**: instructor shouts a status code (401, 429, 500), class shouts back who's to blame.

### Read: The four rails — Git, GitHub, localhost, APIs

Every AI project you will ever touch sits on top of four ideas. If you understand these four, the rest of the stack becomes readable. If you don't, every tutorial feels like hieroglyphics.

**1. Git — the time machine for files.** Git is a tool that tracks every change you make to a folder. Think of it as infinite Ctrl+Z, but across a whole project and across a whole team. The unit of change is a **commit** — a snapshot with a message like "fixed login bug". Commits live on **branches** — parallel universes of your code. You make a `feature/rag-bot` branch, experiment freely, and if it works you **merge** it back to the `main` branch. If it breaks, you throw the branch away. Your main branch stays clean.

The magic word is **diff**. A diff is the difference between two versions — lines added in green, lines removed in red. Every code review on Earth is just humans reading diffs. When you tell an AI "fix this bug", what it actually does is produce a diff. Learning to read diffs is the single most valuable skill for directing AI.

Key commands you should recognize (read this, don't type it):

```bash
git clone https://github.com/user/repo.git   # download a repo
git branch feature/my-change                 # create a branch
git add .                                    # stage your changes
git commit -m "add RAG endpoint"             # snapshot them
git push                                     # upload to GitHub
git pull                                     # download latest
```

**2. GitHub — the social network for code.** GitHub is where Git repositories live in the cloud. Every AI tool you've used this month — LangChain, Ollama, n8n, browser-use — lives on GitHub. Four things happen there:

- **Issues** — bug reports and feature requests. Scan these to understand what a project actually does and where it hurts.
- **Pull Requests (PRs)** — "hey maintainer, please merge my branch". A PR is a proposal with a diff attached.
- **Forks** — your personal copy of someone else's repo. Forking is free and creates no obligation. Fork first, experiment later.
- **Stars** — bookmarks. Star counts are noisy but useful as a proxy for popularity.

To contribute to open source, the loop is: fork → branch → change → PR → review → merge. You don't have to be a senior engineer. Every big repo has a `good-first-issue` label. Search `label:good-first-issue language:python stars:>1000` and you'll find hundreds.

**3. Localhost — your computer as a server.** When a program on your laptop serves a website or API, it lives at `localhost` (also written `127.0.0.1`). A **port** is a numbered door — port 3000, 8080, 11434. Ollama runs on `localhost:11434`. Open WebUI on `localhost:3000`. n8n on `localhost:5678`. When a tutorial says "open http://localhost:3000", it means "your laptop is running something; talk to it on door 3000".

One subtle distinction: `127.0.0.1` means "only my laptop can reach this". `0.0.0.0` means "anyone on my Wi-Fi can reach this". Most AI tools default to 127.0.0.1 for safety. If you're demoing to a classmate on the same network, you switch to 0.0.0.0 — at your own risk.

**4. APIs — how programs talk.** An **API** (Application Programming Interface) is a contract. "Send me this JSON on this URL, I'll send back that JSON." That's it. Ninety-nine percent of AI work is calling APIs.

APIs speak **HTTP**. The verbs are:

- `GET` — read something. (`GET /users/sandeep` → returns Sandeep's profile.)
- `POST` — create or submit something. (`POST /chat` → "here's my message, reply please.")
- `PUT` / `PATCH` — update.
- `DELETE` — remove.

Responses come back with **status codes**: 200 (OK), 201 (created), 400 (you sent bad data), 401 (you're not logged in), 404 (not found), 429 (too many requests — slow down), 500 (the server crashed, not your fault). When something breaks, read the status code first. It tells you who to blame.

Payloads are almost always **JSON** — key-value pairs in curly braces. `{"name": "Sandeep", "city": "Bengaluru"}`. AI responses, weather data, OpenAI chat completions — all JSON.

**Why this matters for you.** When Claude tells you "call the OpenAI API with these headers", you will now know what that sentence means. When Ollama fails and says "connection refused on port 11434", you know it means the Ollama server isn't running. When you fork a repo to add a feature, you know the ritual. You've stopped being a tourist.

### Watch: Reading a repo without coding

Video walkthrough on how to scan a GitHub repo in 10 minutes — README first, then the `examples/` folder, then open issues, then recent PRs — so you can understand an AI project without reading its source code.

https://www.youtube.com/embed/hwP7WQkmECE

- Always start at the README — 80% of "how do I use this" lives there.
- `CONTRIBUTING.md` tells you the PR process.
- Sort issues by "good first issue" to find entry points.
- The `examples/` or `cookbook/` folder is gold.

### Lab: Fork one repo + hit three APIs in Hoppscotch

Spend 30–45 minutes. No code — clicks and reads only.

1. Go to **github.com** and sign in. Search for `ollama` (by that name). Click the top repo. Click **Star**. Click **Fork** (top right). You now own a copy.
2. On your fork, open the **Issues** tab. Filter by `label:good-first-issue`. Open two or three. Read them like short stories — title, description, comments.
3. Open any merged PR from the last week on the original repo. Click the **Files changed** tab. Stare at the diff. Ask Claude: "explain this diff in plain English".
4. Now APIs. Open **hoppscotch.io** (no install needed). You get a Postman-like interface in your browser.
5. First call: `GET https://openlibrary.org/search.json?q=hitchhiker` — hit **Send**. Read the JSON. Notice `docs[0].title`.
6. Second call: `GET https://api.github.com/users/torvalds` — see Linus Torvalds' public profile. Note the `followers` field and the 200 status.
7. Third call: `GET https://api.open-meteo.com/v1/forecast?latitude=12.97&longitude=77.59&current_weather=true` — Bengaluru's live weather. No API key needed.
8. Bonus: `GET https://httpbin.org/status/429` — deliberately trigger a 429. Notice the status code. Try `/status/500`.

> ⚠️ **If you get stuck**
> - *Hoppscotch shows a CORS error or "network error"* → switch the Hoppscotch interceptor to "Browser extension" or "Proxy" in the bottom-right dropdown; the direct browser fetch is blocked by some APIs.
> - *GitHub Fork button is greyed out* → you're probably on your own repo or not signed in; confirm the avatar top-right and pick a different upstream repo.
> - *`api.github.com` returns a 403 with "rate limit exceeded"* → unauthenticated GitHub API allows only 60 requests/hour per IP; slow down or add a personal access token as a Bearer header.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Which part of today's four rails felt most foreign? Git, GitHub, localhost, or APIs? | Names the rail, points to a specific sub-concept (e.g. "diffs" inside Git), and connects it to a tutorial that stopped making sense in the past. |
| Share a good-first-issue from any repo you found interesting and pitch why. | Links the issue, names the repo's purpose in one line, and identifies the exact files the fix would touch. |
| Have you ever seen a 500 error in the wild? What was the context? | Recounts the situation, the user impact, and who was actually to blame (server vs client) — uses the status-code vocabulary from today. |
| Does `fork → branch → PR` feel like a social ritual or an engineering one? Maybe both? | Takes a side, gives one piece of evidence for each aspect (the code review is engineering; the maintainer politeness is social). |
| What's one API from today's lab you could imagine chaining into your capstone? | Picks one API, describes the input/output JSON shape, and names the downstream node (LLM, Slack, sheet) that would consume it. |

---

## 📝 Post-class · ~2 hour focused block

Turn today's clicks into a repo presence the cohort can actually see.

### 1. Immediate action: finish the lab + repo presence (~35 min)

- [ ] Complete all 3 Hoppscotch API calls from the lab (OpenLibrary, GitHub, Open-Meteo) and screenshot one 200 response.
- [ ] Trigger a 429 and a 500 on https://httpbin.org intentionally so your brain remembers what they feel like.
- [ ] Fork one AI repo you actually use; star two others. Paste the fork URL in the cohort channel.
- [ ] Open the `good-first-issue` filter at https://github.com/search?q=label%3Agood-first-issue&type=issues and bookmark 2 issues you could realistically tackle this month.
- [ ] Try GitHub Skills at https://skills.github.com — the "Introduction to GitHub" course takes ~10 minutes and teaches PRs by doing.

### 2. Reflect (~10 min)

*Which rail (Git / GitHub / localhost / APIs) felt most foreign, and why?* In one line, post it — honesty helps the cohort. A strong reflection connects the foreign feeling to a specific tutorial or error message from your past that suddenly makes sense.

### 3. Quiz (~15 min)

Four questions on the dashboard to cement today: What's the difference between a branch and a fork? What does status code 401 tell you versus 404? Why does Ollama use port 11434 specifically on localhost? What's the smallest unit of change in Git — and why do humans obsess over it?

### 4. Submit the assignment (~5 min)

Fork any AI repo you genuinely use (Ollama, LangChain, n8n, LlamaIndex — your pick). Star three OSS AI projects you want to understand better. Open one **draft** issue on a repo you care about — a question, a typo fix, or a feature idea. Don't stress about polish; drafts are meant to be rough. Paste your three links into the cohort channel.

### 5. Deepen (optional, ~30 min)

- **Extra watch**: Any short "reading a diff" walkthrough on YouTube — the diff-reading muscle pays compound interest in Weeks 4–5.
- **Extra read**: [Open Source Guides](https://opensource.guide) — the "How to Contribute" section, cover to cover.
- **Try**: Open your locked Day-15 spec alongside the Hoppscotch tab — sketch the 2 external APIs your "what it does" list implies (LLM provider, data source, notification channel) and test one of them with a GET call.

### 6. Prep for Day 17 (~30-40 min — important)

**Tomorrow you drive on these rails.** Day 17 is local + cloud LLMs — Ollama on `localhost:11434` (instructor demo), Groq + HuggingFace Chat in your browser for speed, and **Langfuse** for tracing. You'll write three prompt variants (zero-shot, CoT + self-critique, few-shot) for a real capstone task, run them against a 10-row eval set, and post three win-rate numbers. This is where vibes-driven prompting becomes data-driven.

- [ ] **Skim ahead**: the Groq homepage (notice the "1000+ tokens/sec" claim) and try one prompt on any listed model at https://huggingface.co/chat/. Feel how fast cloud inference is.
- [ ] **Think**: pick **one task from your capstone** you suspect a small model could handle (summarise, classify, extract) and jot **2 example inputs**. That task becomes tomorrow's 10-row eval set.
- [ ] **Set up**: sign up for Groq free tier (https://console.groq.com), Google AI Studio (https://aistudio.google.com), HuggingFace (https://huggingface.co), and Langfuse free tier (https://langfuse.com). Create + copy your Groq API key. Optional: if your laptop has ≥8 GB RAM and you're curious, install Ollama (https://ollama.com/download) and `ollama pull qwen2.5:1.5b`.

---

## 📚 Extra / additional references

Optional deep-dives. Pick what interests you; skip what doesn't.

### Short watches

- [Reading a repo without coding](https://www.youtube.com/embed/hwP7WQkmECE) — rewatch at 1.5x once you've forked something.
- Fireship — "Git in 100 Seconds" on YouTube.

### Reading

- [Git official docs](https://git-scm.com)
- [MDN Web Docs (HTTP, status codes)](https://developer.mozilla.org)
- [Browser DevTools explainer](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/What_are_browser_developer_tools)
- [Open Source Guides](https://opensource.guide)

### Play

- [GitHub](https://github.com) — the social network for code.
- [Hoppscotch](https://hoppscotch.io) — API calls in the browser.
- [JSONPlaceholder](https://jsonplaceholder.typicode.com), [HTTPBin](https://httpbin.org), [OpenLibrary API](https://openlibrary.org/developers/api), [Open-Meteo](https://open-meteo.com) — free public APIs to explore.

### If you're hungry for a rabbit hole

- [GitHub Skills (free interactive)](https://skills.github.com) — learn PRs by doing.
- [GitHub good-first-issue search](https://github.com/search?q=label%3Agood-first-issue&type=issues) — your first PR is here.
