---
reading_time: 16 min
tags: ["web", "hands-on", "ai-tools"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Ship a CRUD app to Vercel or GitHub Pages", "url": "https://example.com/labs/day-14"}
resources: [{"title": "Vercel", "url": "https://vercel.com/"}, {"title": "GitHub Pages", "url": "https://pages.github.com/"}, {"title": "Cloudflare Pages", "url": "https://pages.cloudflare.com/"}, {"title": "MDN: Using fetch", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"}, {"title": "MDN: localStorage", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"}]
---

## Intro

Seven days in. You know Python, the web, APIs, SQL, git, and you've paired with an AI. Today it all lands in one place: you ship a working app to the public internet, at a URL your friends can open. The word "ship" matters — unshipped work does not count.

## Read: From `localhost` to a URL

### What "shipping" a static/CRUD app means in 2026

For a small app, you don't need AWS, Docker, or Kubernetes. You need:

1. Static files (HTML, CSS, JS) hosted on a CDN.
2. Persistence — either `localStorage` (browser-only, free, zero backend) or a tiny hosted backend.
3. A custom domain, optional but cheap.

That's it. End-to-end deploy time: under 10 minutes the first time, under 60 seconds after.

### Hosts to know

| Host | Best for | Price | Setup |
|------|----------|-------|-------|
| [GitHub Pages](https://pages.github.com/) | static sites from a repo | free | push to `main` / `gh-pages` |
| [Vercel](https://vercel.com/) | static + serverless functions | free tier generous | connect GitHub repo |
| [Cloudflare Pages](https://pages.cloudflare.com/) | static + Workers, fast CDN | free tier generous | connect GitHub repo |

All three redeploy automatically on every `git push`. That's the magic.

### Two kinds of persistence for a tiny app

**Option A: `localStorage`** — data stays in the user's browser. Zero backend, zero cost. Good for notes, todos, drafts. Bad for anything multi-device or multi-user.

```js
// write
localStorage.setItem("notes", JSON.stringify(notes));
// read
const notes = JSON.parse(localStorage.getItem("notes") || "[]");
```

**Option B: a free hosted backend** — Supabase, Firebase, or a tiny Vercel serverless function + a hosted DB. More setup, but you get real multi-user state. You'll meet these later; today we stick with `localStorage` to keep the shipping clean.

### The CRUD skeleton every small app has

Four operations on a list of items:

- **Create** — form submit → push new item, re-render, persist.
- **Read** — on load, read from storage, render.
- **Update** — edit in place or via modal, persist.
- **Delete** — button per item, splice, persist.

If you can do these four for one entity, you can build most internal tools.

### Deployment hygiene

> Small app, same rules as a big one: environment parity, no secrets in repo, reproducible builds.

- `.gitignore` includes `.env`, `node_modules/`, `.DS_Store`.
- Every commit on `main` triggers a production deploy — treat `main` as sacred.
- Broken in production? Revert the commit, don't hotfix on `main`.
- Keep the README runnable: clone → one command → running locally.

### A minimal CI check

Even for a tiny static app, add one GitHub Actions workflow that runs on every PR. It catches silly mistakes.

```yaml
# .github/workflows/check.yml
name: check
on: [pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npx --yes htmlhint index.html
```

## Watch: Push to deploy, in real time

A screen recording of taking a vanilla HTML app, connecting it to Vercel, pushing a commit, and watching it go live in under a minute.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch the commit → build → deploy pipeline; notice how fast it actually is.
- Notice the preview URL for each PR (this is the killer feature for reviews).
- See how the author rolls back a bad deploy with one click.

## Lab: Ship a tiny notes app in one evening

You'll extend your Day 12 `campus-notes` repo into a real deployed app. Use your AI pair from Day 13 for the boring bits, but own the structure.

1. In `campus-notes/`, confirm you have `index.html`. Add `style.css` and `app.js` if not already separate files.
2. Build the CRUD UI:
   - A form at the top: title input, body textarea, Save button.
   - A list below: each note shows title, body, created date, and Edit + Delete buttons.
3. Implement Create, Read, Update, Delete against `localStorage`. Use an `id` field (e.g., `crypto.randomUUID()`) per note so edits are stable.
4. Add a search filter that narrows the list as you type.
5. Handle the empty state: show "No notes yet. Write one above." when the list is empty.
6. Run locally: `python3 -m http.server 8000`. Test Create, Edit, Delete, refresh-persists, search.
7. Add the `.github/workflows/check.yml` from above. Open a PR to `main` and watch the check run.
8. Deploy. Pick one:
   - **GitHub Pages:** Settings → Pages → Source: `main` / `/ (root)`. Wait ~30s. Your app is at `https://<user>.github.io/campus-notes/`.
   - **Vercel:** go to [vercel.com/new](https://vercel.com/new), import the repo, framework preset "Other", deploy. Your app is at `https://campus-notes-<hash>.vercel.app`.
9. Share the live URL with a classmate. Ask them to create 3 notes, edit one, delete one. Have them file any bugs as GitHub issues on your repo.
10. Fix one of their issues: new branch, PR with preview deploy, review, merge. Confirm production updates automatically.

Stretch A: swap `localStorage` for a hosted key-value store (Vercel KV or Cloudflare KV). Now notes sync across devices.

Stretch B: add export-to-JSON and import-from-JSON buttons.

## Quiz

Four questions: where `localStorage` data actually lives, why `main` should auto-deploy, what a preview deployment is good for, and the difference between static hosting and a serverless backend.

## Assignment

Submit your live production URL plus the repo link. The app must handle full CRUD, persist across refreshes, have at least two merged PRs (one from a classmate's bug report), and a passing CI check. In `README.md`, include a 2-minute gif or three screenshots. This is your first shipped artifact — it goes in your portfolio.

## Discuss: What "done" actually means

- Your app works on your laptop but breaks on your friend's phone. Is it shipped?
- `localStorage` is free and simple; a real DB is $5/month and simple-ish. When does each make sense for a student project?
- You deployed to `main` and it broke. Revert immediately, or push a forward fix? What's your rule?
- Looking back at Week 2: which of the seven skills (Python, web, APIs, SQL, git, AI pair, deploy) felt most absent from your CS coursework? Why do you think that is?
