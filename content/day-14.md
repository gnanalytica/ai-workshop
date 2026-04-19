---
reading_time: 14 min
tldr: "Ship a real tiny app today. You write the spec and the commentary; AI does 95% of the typing."
tags: ["vibe", "ai-tools", "shipping"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Ship your first vibe-coded app", "url": "https://bolt.new/"}
resources: [{"title": "bolt.new", "url": "https://bolt.new/"}, {"title": "Lovable", "url": "https://lovable.dev/"}, {"title": "v0 by Vercel", "url": "https://v0.dev/"}, {"title": "Cursor", "url": "https://cursor.com/"}]
---

## Intro

Week 2 ends with something real. You will direct an AI to build and deploy a tiny app with your name on it, live on the internet, by the end of today. You will not write the code. You will write the spec, the critique, and the commentary.

## Read: The anatomy of a shippable tiny app

### What "tiny" means here

A good Day-14 app is:

- **One clear purpose.** A single sentence fits on an Insta bio.
- **One screen.** Maybe two.
- **Zero backend** if you can avoid it, or the simplest possible backend if you can't.
- **Usable by a stranger** within 10 seconds of landing.
- **Deployable with one click.**

> Your goal is not impressive. Your goal is *shipped*.

### 20 tiny-app prompts to steal from

Pick one or invent better. All of these are 2–4 hour builds when you vibe-code well:

- Pomodoro timer with a motivating quote per cycle.
- Tip splitter for hostel chai runs.
- JPEG → WebP batch converter (browser-only).
- "Where should we eat" randomizer with a weighted list.
- Hostel laundry turn tracker (localStorage).
- Flashcard trainer that reads a CSV you paste.
- Resume → one-page printable generator from a form.
- Markdown → presentation slides (arrow-key nav).
- A kanban for one person with 3 columns, keyboard-driven.
- A micro-survey that gives back a shareable result image.
- Placement CGPA-threshold eligibility filter (paste a CSV, pick a minimum).
- A CRON-expression explainer.
- A "what's my IST now in 5 cities" world clock.
- A dice roller for tabletop RPGs with history.
- A mood tracker with a week chart (localStorage + Chart.js).
- A "read it in N minutes" text-length estimator.
- A QR code generator from any text.
- A study-playlist shuffler that pulls from a hardcoded YouTube list.
- A habit streak tracker (30-day grid).
- A Bingo-card generator for online meetings.

### Pick your weapon

| Tool | Pick it if | Deploys to |
|---|---|---|
| bolt.new | You want one URL that builds and deploys | StackBlitz / Netlify |
| Lovable | You want a polished end-to-end web app | Own hosting, 1 click |
| v0 by Vercel | You want a beautiful UI-first React app | Vercel |
| Cursor + Vercel | You want more control | Vercel |
| Replit Agent | You want a cloud IDE experience | Replit |

All are fine. Pick one, don't tool-shop.

### The spec template

Before opening any tool, fill this in on paper:

```
Name:              ___________________________
One-line pitch:    ___________________________
Users:             ___________________________
The 3 must-haves:  1. _________________________
                   2. _________________________
                   3. _________________________
Explicit non-goals: - _________________________
                    - _________________________
Stack constraint:  e.g. "single HTML file, no build"
Design feel:       e.g. "clean, minimal, dark by default"
```

If you can't fill this in, you're not ready to prompt. The spec is the hardest part of the day.

### The director's loop, one more time

```
  spec  ->  prompt  ->  generate  ->  run  ->  critique  ->  re-prompt
                               ^                                 |
                               +---------------------------------+
```

Repeat until the 3 must-haves work and the non-goals are respected.

### What to do when the AI gets stuck

- **Restate the spec.** Paste the original spec into the chat. Ask it to list what it has built vs what's left.
- **Ask for a plan first.** "Don't code yet — outline the approach in 6 bullets."
- **Narrow the ask.** Break the feature into one tiny step.
- **Swap tools.** If bolt.new is looping, ask ChatGPT or Claude for a second opinion, then return.
- **Delete and restart.** Five wrong turns deep? Start a fresh session with a crisper spec. This is usually faster than debugging.

### Shipping: the last 5%

Your app isn't done until it has:

- A public URL (not `localhost`).
- A readable title tag (shows up in the browser tab).
- A meta description (shows up when you share on WhatsApp).
- A favicon, even a single letter one.
- A one-line "made by you" footer.

Each of these is a one-sentence ask to the AI. Do not skip them. The polish is what makes it feel real.

### Director's commentary — the submission

You will submit the deployed URL + a one-paragraph (150–250 word) **director's commentary** describing:

- The spec you started with.
- The tool you chose and why.
- One moment the AI got it gloriously right.
- One moment it got it wrong, and how you corrected it.
- What you would do differently next time.

This paragraph is the assignment. The app is the proof.

## Watch: A real vibe-coding ship session

Watch one developer take a blank screen to a deployed app in under an hour. Pause and resume as you work.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Notice how often they redeploy.
- Notice the tiny polish moves at the end.
- Notice how rare it is that they open the code themselves.

## Lab: Ship it (60–90 min)

**Strict rule: you do not type any code. The AI does.** If you're tempted to type code yourself, stop and ask the AI to do it instead.

1. Fill in the **spec template** on paper. 10 minutes, no tool open. One-line pitch, 3 must-haves, 2 non-goals, stack constraint, design feel.
2. Open your chosen tool (bolt.new, Lovable, Cursor, v0, or Replit). Paste a director's prompt derived from your spec.
3. Let the AI generate the first version. Open the preview. Try it. Log what works and what doesn't in a worksheet.
4. Iterate 3–5 rounds. Each round: one concrete request, review the diff, test the change. Keep your iteration log with prompts + outcomes.
5. Add the polish layer: title tag, meta description, favicon, footer. Each is a one-sentence prompt.
6. Deploy. bolt.new / Lovable / v0 / Vercel / Replit all have a one-click deploy. Get a public URL.
7. Open the URL on your phone and on a classmate's laptop. If it's broken outside your machine, go back to step 4.
8. Write the **director's commentary** paragraph. Include the URL, a screenshot, and your iteration log.

Submit the URL + commentary + log.

## Quiz

3 questions: identify the weakest line in a given spec template, pick the right tool for a given scenario, and name three "polish layer" items most students forget.

## Assignment

Submit three things: (1) the **deployed URL** of your tiny app, (2) your **director's commentary** paragraph (150–250 words), (3) a screenshot of the live app on any device other than your own. No code in the submission. The app's source being viewable from the deployed tool's project page is fine.

## Discuss: Closing Week 2

- How did it feel to ship something without writing code? Better, worse, different from what you expected?
- Where did the AI still need human taste, and where was it better than you would have been?
- If you had another hour, what single feature would you add — and could you now write a sharp enough prompt for it?
- What's the smallest real problem in your life you could solve with a Day-15 follow-up app?
- Week 3 is about going deeper. What do you now wish you understood better — APIs, data, git, or prompting itself?
