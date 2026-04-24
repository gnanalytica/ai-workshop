---
day: 21
date: "2026-05-29"
weekday: "Friday"
week: 4
topic: "Capstone Milestone 4: Workspace Setup and First Deploy"
faculty:
  main: "Harshith"
  support: "Sanjana"
reading_time: "10 min"
tldr: "Today your capstone leaves your laptop. Node + Python + Git locally, Antigravity or Cursor open, and a one-page slice live on a vercel.app URL backed by Supabase. Demo Day starts to feel real."
tags: ["capstone", "milestone", "deploy", "vercel", "supabase"]
software: ["Nodejs", "Python", "Git", "Antigravity", "Cursor"]
online_tools: ["Vercel", "Supabase"]
video: "https://www.youtube.com/embed/seVxXHi2YMs"
prompt_of_the_day: "Walk me through deploying this Next.js app to Vercel with a Supabase backend. Stop at every command and explain what it does and what could go wrong on a Windows laptop."
tools_hands_on:
  - { name: "Vercel", url: "https://vercel.com/" }
  - { name: "Supabase", url: "https://supabase.com/" }
  - { name: "Cursor", url: "https://cursor.com/" }
  - { name: "Antigravity", url: "https://antigravity.google/" }
tools_reference:
  - { name: "Vercel — deploy Next.js", url: "https://vercel.com/docs/frameworks/nextjs" }
  - { name: "Supabase — quickstart", url: "https://supabase.com/docs/guides/getting-started" }
resources:
  - { title: "GitHub — first repo guide", url: "https://docs.github.com/en/get-started/quickstart/create-a-repo" }
  - { title: "Vercel + Supabase integration", url: "https://vercel.com/integrations/supabase" }
lab: { title: "Ship one page to a public URL", url: "https://vercel.com/new" }
objective:
  topic: "Capstone Milestone 4: Workspace Setup and First Deploy"
  tools: ["Node.js", "Python", "Git", "Vercel", "Supabase", "Cursor"]
  end_goal: "A live `*.vercel.app` URL serving one real page from your capstone, with the repo on GitHub and Supabase wired in."
---

> 🚩 **Milestone 4.** This is a graded capstone checkpoint. By end of class, your project must have a public URL. No URL = no milestone.

You've prototyped enough. Today the project gets a passport — a public URL anyone in your hostel can open on their phone.

## 🎯 Today's objective

**Topic.** Capstone Milestone 4: Workspace Setup and First Deploy.

**By end of class you will have:**
1. Local stack confirmed: `node -v` ≥ 20, `python --version` ≥ 3.11, `git --version` working.
2. GitHub repo pushed, one Supabase project created, one Vercel deployment green.
3. A live URL displaying *one* real page of your capstone — even if it's just the hero + a button.

> *Why this matters.* Demo Day is 9 days away. Things that aren't deployed don't get demoed.

## ⏪ Pre-class · ~30 min

### Setup (required)

- [ ] Install Node.js 20 LTS, Python 3.11, Git. Run `node -v && python --version && git --version` and screenshot.
- [ ] GitHub account with SSH key OR personal access token saved.
- [ ] Vercel account (sign in with GitHub).
- [ ] Supabase account (sign in with GitHub). Create one new project — pick **Mumbai** or **Singapore** region for low latency from India.

### Primer (~10 min)

- **Watch:** "Deploy Next.js to Vercel in 5 min" — https://www.youtube.com/watch?v=seVxXHi2YMs
- **Read:** Supabase quickstart, the *Project URL* and *anon key* section. Copy both into a `.env.local` template.

### Bring to class

- [ ] The smallest deployable slice of your capstone in a folder. If you have nothing, run `npx create-next-app@latest capstone --ts --tailwind --app` before class.

> 🧠 **Quick glossary.** **Vercel** = hosting that auto-deploys on `git push`. **Supabase** = Postgres + Auth + Storage you can hit from anywhere. **`.env.local`** = secrets file, never commit.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Stack check, room walk | 10 min | Everyone runs the three `-v` commands |
| GitHub → Vercel pipeline | 15 min | Push triggers deploy |
| Supabase wiring | 15 min | URL + anon key into `.env.local` and Vercel envs |
| Lab: ship it | 15 min | Get a live URL |
| Demo round | 5 min | Three random students share their URLs |

### The mental model

- **GitHub** holds the truth. **Vercel** mirrors it to a URL. **Supabase** is the database your URL talks to.
- Every `git push` to `main` redeploys. That's the loop you'll live in for the rest of the workshop.
- Secrets live in **two** places: your local `.env.local` and Vercel's *Environment Variables* panel. Never in code.

## 🧪 Lab: One page, one URL

1. `git init && git add . && git commit -m "milestone 4: bootstrap"`. Push to a new GitHub repo.
2. On vercel.com → **New Project** → import your repo → deploy. Wait for the green check. Open the URL.
3. On supabase.com → your project → Settings → API. Copy `Project URL` and `anon public` key.
4. Add both to `.env.local` and to Vercel → Settings → Environment Variables. Redeploy.
5. Add one Supabase call to your home page (e.g. `select count(*) from auth.users`). Push. Confirm the URL renders without errors.
6. Drop a screenshot of your live URL on a phone in the cohort channel.

**Artifact.** Public URL + GitHub repo URL pasted on the dashboard. Both must work for a stranger.

> ⚠️ **Indian-context gotcha.** Campus Wi-Fi often blocks `vercel.com` CLI auth. If `vercel login` hangs, hotspot from your phone for 60 seconds, then return to campus Wi-Fi.

## 📊 Live poll

**Where did you get stuck?** Node install / Git auth / Vercel deploy / Supabase keys / *I shipped clean*. Honest answer wins a callout.

## 💬 Discuss

- What's the *one* feature you want live by Day 25? Defend the scope.
- Vercel's free tier vs deploying on a college server — when does each make sense?
- One thing you don't yet trust about Supabase. Bring it up.

## ❓ Quiz

Short quiz on env-var placement, Vercel build flow, and which file should never be committed. On your dashboard during class.

## 📝 Assignment · Milestone 4 submission

**Brief.** Submit (a) your live URL, (b) your GitHub repo URL, (c) a 60-second screen recording walking through pushing a one-line change and watching Vercel redeploy.

**Submit.** All three on the dashboard before Day 22.

**Rubric.** URL is live and loads in under 3s (4) · Supabase actually wired and queried (4) · Repo is clean — `.env.local` ignored, README has setup steps (2).

## 🔁 Prep for next class

Day 22 jumps into **Agentic AI** — ReAct, LangGraph, MCP, multi-agent systems.

- [ ] `pip install langchain langgraph` in a fresh Python venv. Confirm imports work.
- [ ] Skim the LangGraph quickstart: https://langchain-ai.github.io/langgraph/
- [ ] Get an OpenAI or Anthropic API key ready (₹500 in credits is enough for the week).

## 📚 References

- [Vercel — Next.js deploy guide](https://vercel.com/docs/frameworks/nextjs) — five-minute version.
- [Supabase — quickstart](https://supabase.com/docs/guides/getting-started) — auth, DB, storage in one read.
- [Vercel + Supabase integration](https://vercel.com/integrations/supabase) — auto-syncs envs.
- [GitHub — first repo](https://docs.github.com/en/get-started/quickstart/create-a-repo) — for anyone still confused by `git push -u origin main`.
