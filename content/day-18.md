---
day: 18
date: "2026-05-26"
weekday: "Tuesday"
week: 4
topic: "Deployment with Vercel and Supabase (OpenCode)"
faculty:
  main: "Harshith"
  support: "Sandeep"
reading_time: "12 min"
tldr: "Localhost is for you. A live URL is for everyone else. Today: deploy yesterday's repo to Vercel in under 5 minutes, add a Supabase database, and wire OpenCode/Antigravity/Codex to ship the next change without leaving the chat."
tags: ["deployment", "vercel", "supabase", "backend"]
software: ["Node.js", "Python", "Git"]
online_tools: ["Vercel", "Supabase", "Antigravity", "Codex", "GitHub"]
video: "https://www.youtube.com/embed/2HBIzEx6IZA"
prompt_of_the_day: "I have a public GitHub repo with a static index.html that calls a weather API. I want to (a) deploy it on Vercel, (b) add a Supabase table to log every search with timestamp + city, (c) read those logs back on the page. Write me a step-by-step deployment plan. No code yet."
tools_hands_on:
  - { name: "Vercel", url: "https://vercel.com/" }
  - { name: "Supabase", url: "https://supabase.com/" }
  - { name: "OpenCode", url: "https://opencode.ai/" }
  - { name: "Antigravity", url: "https://antigravity.google/" }
  - { name: "Codex", url: "https://chatgpt.com/codex" }
tools_reference:
  - { name: "Vercel — Deploy from GitHub", url: "https://vercel.com/docs/getting-started-with-vercel" }
  - { name: "Supabase — Quickstart", url: "https://supabase.com/docs/guides/getting-started" }
resources:
  - { title: "Vercel Edge Functions docs", url: "https://vercel.com/docs/functions" }
  - { title: "Supabase JS client", url: "https://supabase.com/docs/reference/javascript/introduction" }
lab: { title: "Repo → Vercel → Supabase logging", url: "https://vercel.com/" }
objective:
  topic: "Deployment with Vercel and Supabase using OpenCode"
  tools: ["Vercel", "Supabase", "OpenCode", "Antigravity", "Codex", "GitHub"]
  end_goal: "A publicly accessible Vercel URL whose page logs each search to a Supabase table and displays the last 5 entries."
---

Yesterday you went from laptop folder → public repo. Today you go from public repo → public **URL with a database** — the actual finale-day setup. We'll use OpenCode (or Antigravity / Codex) so most of the work happens inside one chat.

## 🎯 Today's objective

**Topic.** Deployment with Vercel + Supabase, driven by OpenCode-style coding agents.

**By end of class you will have:**
1. Yesterday's GitHub repo deployed to a live `.vercel.app` URL with auto-redeploy on push.
2. A Supabase project with one `searches` table (id, city, created_at).
3. Page logs every search and renders the last 5 from the database.

> *Why this matters.* This is *the* skeleton. Most capstone projects are a static front-end + Supabase + Vercel. After today you've built it once.

## ⏪ Pre-class · ~25 min

### Setup (required)

- [ ] **Node.js** ≥ 20: `node -v`.
- [ ] **Python** 3.10+ for any local scripts.
- [ ] **Vercel** account, signed in via GitHub.
- [ ] **Supabase** account + a new empty project (it takes ~2 min to provision — start it before class).
- [ ] Pick one agent: **OpenCode** CLI, **Antigravity**, or **Codex**. Just one.

### Primer (~10 min)

- **Read:** Vercel quickstart — https://vercel.com/docs/getting-started-with-vercel
- **Read:** Supabase quickstart — https://supabase.com/docs/guides/getting-started

### Bring to class

- [ ] Your Day-17 GitHub repo URL.
- [ ] Supabase project URL + `anon` public key (Settings → API).

> 🧠 **Quick glossary.** **Deployment** = your code runs on someone else's machine, reachable by a URL. **Edge function** = code that runs near the user, on Vercel's network. **anon key** = a public Supabase API key safe to ship to the browser (RLS protects the data). **RLS** = Row Level Security — Postgres rules deciding who can read/write what.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Vercel: GitHub → live URL | 10 min | Import, deploy, share link |
| Supabase: project → table → RLS | 15 min | Schema in the dashboard |
| Wire `supabase-js` in the page | 15 min | Insert + select |
| OpenCode-driven change | 15 min | Add a feature without leaving chat |
| Debug + redeploy | 10 min | Push → Vercel rebuilds in 30 sec |
| Q&A | 5 min |   |

### The deploy loop you'll use forever

1. Edit code locally.
2. `git push`.
3. Vercel auto-detects, rebuilds, redeploys.
4. Refresh the live URL. Done.

### Why Supabase for v1

- **Postgres** + auth + storage + realtime in one click.
- Free tier is plenty for a class project (500 MB DB, 50k MAU).
- `supabase-js` is a one-line import in the browser.

## 🧪 Lab: Deploy + database in one sitting

1. Vercel → *Add New Project* → import your Day-17 repo → *Deploy*. Wait. Open the live URL.
2. Supabase → *Table Editor* → new table `searches`: `id` (bigint, identity), `city` (text), `created_at` (timestamptz, default `now()`). Disable RLS *for class only* (we'll harden Day 19+).
3. In `index.html`, add the Supabase client:

```html
<script type="module">
  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
  const sb = createClient('YOUR_URL', 'YOUR_ANON_KEY');

  document.getElementById('b').addEventListener('click', async () => {
    const city = 'Bengaluru';
    // fetch weather (existing code)…
    await sb.from('searches').insert({ city });
    const { data } = await sb.from('searches').select('city, created_at').order('created_at', { ascending: false }).limit(5);
    document.getElementById('log').innerHTML = data.map(r => `${r.city} — ${new Date(r.created_at).toLocaleTimeString()}`).join('<br>');
  });
</script>
<div id="log"></div>
```

4. Open **OpenCode** (`opencode` in terminal) or Antigravity / Codex. Prompt: *"In this repo, add an input box so the user can type any city instead of hard-coded Bengaluru. Then commit and push."*
5. Watch it edit, commit, push. Vercel auto-rebuilds. Refresh your live URL.
6. Type a city. Watch the log grow. Open Supabase Table Editor — confirm the row.

**Artifact.** Live Vercel URL + Supabase project name in the cohort channel. Faculty will click and submit a test entry.

## 📊 Live poll

**Where did the deployment friction land?** GitHub auth on Vercel / Supabase RLS error / `import` not working in browser / CORS / Nowhere — clean ride.

## 💬 Discuss

- What happens if you commit your `anon` key vs your `service_role` key? Why does Supabase ship a public-by-design key?
- Vercel rebuilt in 30 seconds. What did it actually do under the hood?
- When would you add an Edge Function instead of calling Supabase directly from the browser?

## ❓ Quiz

Short quiz on Vercel build flow, Supabase keys, and where RLS lives. Open it on your dashboard.

## 📝 Assignment · Deployed mini-app

**Brief.** Take your Day-17 project (or the one we built today) and add **one user-visible feature** that requires writing to and reading from Supabase. Push, redeploy, share the live URL.

**Submit.** Live URL + repo URL on the dashboard.

**Rubric.** Live URL works for a stranger (4) · DB write + read both demonstrable (4) · README updated with deploy notes (2).

## 🔁 Prep for next class

Day 19 is **Context Engineering — Embeddings & RAG.** You'll teach a model facts it doesn't know.

- [ ] Install **Python 3.10+** + `pip install langchain chromadb sentence-transformers`.
- [ ] Sign up for **Hugging Face** (free).
- [ ] Have your **Gemini** or **ChatGPT** key handy if you have one (we'll use free tier where possible).

## 📚 References

- [Vercel — Getting Started](https://vercel.com/docs/getting-started-with-vercel)
- [Supabase — Getting Started](https://supabase.com/docs/guides/getting-started)
- [supabase-js reference](https://supabase.com/docs/reference/javascript/introduction)
- [OpenCode docs](https://opencode.ai/) — the open-source agent CLI.
