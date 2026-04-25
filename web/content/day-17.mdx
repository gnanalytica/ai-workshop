---
day: 17
date: "2026-05-25"
weekday: "Monday"
week: 4
topic: "Git, GitHub, localhost, APIs"
faculty:
  main: "Raunak"
  support: "Sandeep"
reading_time: "12 min"
tldr: "If your demo lives only on your laptop, it doesn't exist. Today: git basics that actually stick, push to GitHub, run a local dev server, and call your first real API. By the end you have a public repo and a localhost app talking to a public API."
tags: ["git", "github", "apis", "fundamentals"]
software: []
online_tools: []
video: "https://www.youtube.com/embed/USjZcfj8yxE"
prompt_of_the_day: "I just ran `git push` and got 'rejected — non-fast-forward'. Explain in 3 sentences what's happening, why, and the safest way to fix it without losing work. Assume I'm a 3rd-year CSE student who's pushed exactly twice before."
tools_hands_on:
  - { name: "Git CLI", url: "https://git-scm.com/" }
  - { name: "GitHub", url: "https://github.com/" }
  - { name: "Postman", url: "https://www.postman.com/" }
  - { name: "OpenWeather API", url: "https://openweathermap.org/api" }
tools_reference:
  - { name: "GitHub — Hello World", url: "https://docs.github.com/en/get-started/start-your-journey/hello-world" }
  - { name: "MDN — Fetch API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" }
resources:
  - { title: "Pro Git book (free)", url: "https://git-scm.com/book/en/v2" }
  - { title: "Postman Learning Center", url: "https://learning.postman.com/" }
lab: { title: "Repo + localhost + API call", url: "https://github.com/" }
objective:
  topic: "Git, GitHub, localhost, APIs"
  tools: ["Git", "GitHub", "Postman", "Public API"]
  end_goal: "A public GitHub repo containing a tiny web app that runs on localhost and fetches live data from a public API."
---

You shipped a demo on Day 16. Today is the plumbing under it. Git so you don't lose work. GitHub so others can see it. Localhost so you can develop fast. APIs so your app can do things it doesn't know how to do alone.

## 🎯 Today's objective

**Topic.** Git, GitHub, localhost, APIs.

**By end of class you will have:**
1. A public GitHub repo with at least 3 commits and a README.
2. A localhost dev server running your app.
3. A working `fetch()` call to a real public API (weather for your city, by default).

> *Why this matters.* Every job, every internship, every group project. Git fluency compounds for the rest of your career.

## ⏪ Pre-class · ~25 min

### Setup (required)

- [ ] **Git** installed: `git --version` returns 2.40+.
- [ ] **GitHub** account with email verified.
- [ ] Set local identity: `git config --global user.name "Your Name"` + `user.email`.
- [ ] **Postman** desktop or web app signed in.
- [ ] Free **OpenWeather** API key (https://openweathermap.org/api).

### Primer (~10 min)

- **Read:** GitHub's *Hello World* — https://docs.github.com/en/get-started/start-your-journey/hello-world
- **Watch:** "Git in 100 seconds" by Fireship.

### Bring to class

- [ ] Your Day-15 vibe-coded mess-menu folder. We'll put it under git.

> 🧠 **Quick glossary.** **Repo** = a folder tracked by git. **Commit** = a snapshot. **Push** = upload commits to GitHub. **Origin** = the GitHub remote. **localhost** = your own machine, accessed at `http://localhost:PORT`. **API** = a URL that returns data instead of a webpage. **Endpoint** = one specific API URL.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Git mental model | 15 min | Working dir → staging → commit → remote |
| Live: init → push | 15 min | One repo, every command typed live |
| Localhost servers | 10 min | `python -m http.server` and Live Server |
| API anatomy + Postman | 15 min | GET, query params, JSON, status codes |
| Lab + debug | 15 min | Wire it all together |

### The 8 commands you'll use 95% of the time

```bash
git init
git status
git add <file>
git commit -m "message"
git remote add origin <url>
git push -u origin main
git pull
git log --oneline
```

### What APIs feel like

- A URL like `https://api.openweathermap.org/data/2.5/weather?q=Bengaluru&appid=KEY`
- You GET it. You get back **JSON** — a structured blob your code can read.
- `200` = good. `401` = bad key. `404` = wrong URL. `429` = too many requests.

## 🧪 Lab: Repo + localhost + API call

1. Open your Day-15 folder. `cd` in. Run `git init`.
2. Create a `README.md` with the app's name + 1-line description. `git add . && git commit -m "init"`.
3. On GitHub, create a **new public repo** with the same name. Copy the *push existing* commands. Run them.
4. Confirm the repo shows up on github.com under your username.
5. Start a localhost server: `python -m http.server 8000`. Open http://localhost:8000.
6. In Postman, GET `https://api.openweathermap.org/data/2.5/weather?q=YOUR_CITY&appid=YOUR_KEY&units=metric`. Confirm 200 + JSON.
7. In your `index.html`, add a button + this snippet:

```html
<button id="b">Weather</button><pre id="o"></pre>
<script>
const KEY = "PASTE_YOUR_KEY";
document.getElementById('b').onclick = async () => {
  const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Bengaluru&appid=${KEY}&units=metric`);
  const j = await r.json();
  document.getElementById('o').textContent = `${j.name}: ${j.main.temp}°C, ${j.weather[0].description}`;
};
</script>
```

8. Reload localhost, click the button. Commit + push: `git add . && git commit -m "weather" && git push`.

**Artifact.** GitHub repo URL — paste in the cohort channel. Faculty will click and run.

## 📊 Live poll

**Where did you get stuck first?** SSH/HTTPS auth / merge conflict / CORS error / API key 401 / Nowhere — smooth sailing.

## 💬 Discuss

- What's the difference between `git pull` and `git fetch`, and when does it bite?
- Why is hard-coding `KEY` in client-side JS a bad idea? Where should it live in production?
- What's one thing the README should contain that the code can't tell you?

## ❓ Quiz

Short quiz on git verbs, HTTP status codes, and the request/response loop. Open it on your dashboard.

## 📝 Assignment · Public repo, real API

**Brief.** Pick a *different* public API (https://github.com/public-apis/public-apis). Build a tiny one-page app that calls it and renders one piece of data. Push to GitHub with a real README (what it does, how to run, screenshot).

**Submit.** Repo URL on the dashboard.

**Rubric.** Repo runs after `git clone` (4) · API call works without code edits (3) · README has run instructions + screenshot (3).

## 🔁 Prep for next class

Day 18 is **Deployment with Vercel + Supabase** — taking your localhost app to a live URL.

- [ ] Sign up for **Vercel** (link your GitHub) and **Supabase** (free tier).
- [ ] Have **Node.js 20+** installed: `node -v`.
- [ ] Bring the repo from today — it's the one we'll deploy.

## 📚 References

- [Pro Git book (free, full)](https://git-scm.com/book/en/v2) — the canonical reference.
- [GitHub — Hello World](https://docs.github.com/en/get-started/start-your-journey/hello-world)
- [MDN — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Public APIs list](https://github.com/public-apis/public-apis) — pick your assignment API from here.
