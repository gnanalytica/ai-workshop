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
---

## Intro

Welcome to Week 4. Until now you've been a power user of AI. This week you become a builder — but still without writing code yourself. Today we learn the four rails every software project runs on: **Git, GitHub, localhost, and APIs**. You will click, fork, read, and poke. No typing code. By the end you will be able to read a repo like you read a book, and talk to any API on the internet.

> 🧠 **Quick glossary for today**
> - **Git** = a time machine for files; tracks every change as a commit.
> - **Branch** = a parallel universe of your code where you experiment safely.
> - **PR / Pull Request** = "please merge my branch" — a proposal with a diff attached.
> - **Localhost** = your own laptop acting as a server (`127.0.0.1`).
> - **Port** = a numbered door on localhost (3000, 8080, 11434…).
> - **REST API** = a URL contract; send JSON, get JSON, using verbs like GET/POST.
> - **JSON** = key-value data in curly braces; how 99% of APIs speak.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min | Why every AI builder needs Git, GitHub, localhost, APIs |
| Mini-lecture | 20 min | The four rails — commits, forks, ports, status codes |
| Live lab | 20 min | Fork Ollama + hit 3 public APIs in Hoppscotch together |
| Q&A + discussion | 15 min | Which rail felt most foreign? Share weird status codes |

**Before class** (~10 min): create a GitHub account with your college email and skim a README of any repo you're curious about.
**After class** (~30 min tonight): finish the Hoppscotch API calls, open one draft issue on a repo you care about, and paste your 3 links in the cohort channel.

### In-class moments (minute-by-minute)

- **00:05 — Cold-open demo**: instructor types `curl https://api.github.com/users/torvalds` in a terminal, asks the room "what just happened, and who did the work?"
- **00:15 — Think-pair-share**: in 90 seconds with your neighbour, define *branch* vs *fork* in your own words — no Googling.
- **00:25 — Live poll**: raise a hand if you've ever seen `localhost:3000` before today; instructor reads the room and adjusts depth.
- **00:40 — Breakout**: in pairs, open any merged PR on the Ollama repo and describe the diff out loud in plain English for 3 minutes.
- **00:55 — Status-code lightning round**: instructor shouts a status code (401, 429, 500), class shouts back who's to blame.

## Read: The four rails — Git, GitHub, localhost, APIs

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

## Watch: Reading a repo without coding

Video walkthrough on how to scan a GitHub repo in 10 minutes — README first, then the `examples/` folder, then open issues, then recent PRs — so you can understand an AI project without reading its source code.

https://www.youtube.com/embed/hwP7WQkmECE

- Always start at the README — 80% of "how do I use this" lives there.
- `CONTRIBUTING.md` tells you the PR process.
- Sort issues by "good first issue" to find entry points.
- The `examples/` or `cookbook/` folder is gold.

## Lab: Fork one repo + hit three APIs in Hoppscotch

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

## Quiz

Four questions to cement today: What's the difference between a branch and a fork? What does status code 401 tell you versus 404? Why does Ollama use port 11434 specifically on localhost? What's the smallest unit of change in Git — and why do humans obsess over it?

## Assignment

Fork any AI repo you genuinely use (Ollama, LangChain, n8n, LlamaIndex — your pick). Star three OSS AI projects you want to understand better. Open one **draft** issue on a repo you care about — a question, a typo fix, or a feature idea. Don't stress about polish; drafts are meant to be rough. Paste your three links into the cohort channel.

## Discuss: Becoming native to the dev world

| Prompt | What a strong answer sounds like |
|---|---|
| Which part of today's four rails felt most foreign? Git, GitHub, localhost, or APIs? | Names the rail, points to a specific sub-concept (e.g. "diffs" inside Git), and connects it to a tutorial that stopped making sense in the past. |
| Share a good-first-issue from any repo you found interesting and pitch why. | Links the issue, names the repo's purpose in one line, and identifies the exact files the fix would touch. |
| Have you ever seen a 500 error in the wild? What was the context? | Recounts the situation, the user impact, and who was actually to blame (server vs client) — uses the status-code vocabulary from today. |
| Does `fork → branch → PR` feel like a social ritual or an engineering one? Maybe both? | Takes a side, gives one piece of evidence for each aspect (the code review is engineering; the maintainer politeness is social). |
| What's one API from today's lab you could imagine chaining into your capstone? | Picks one API, describes the input/output JSON shape, and names the downstream node (LLM, Slack, sheet) that would consume it. |
