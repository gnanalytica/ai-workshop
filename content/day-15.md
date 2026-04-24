---
day: 15
date: "2026-05-21"
weekday: "Thursday"
week: 3
topic: "Vibe Coding (including Plan mode)"
faculty:
  main: "Raunak"
  support: "Harshith"
reading_time: "12 min"
tldr: "Vibe coding = describe what you want, AI writes the code. But raw vibes break at scale. Today you learn the *plan-then-code* loop in Antigravity and Cursor, and ship a tiny working app three ways — Bolt, Emergent, Google AI Studio."
tags: ["coding", "agents", "ide"]
software: ["Antigravity", "Cursor"]
online_tools: ["Bolt", "Emergent", "Google AI Studio"]
video: "https://www.youtube.com/embed/V9_RzjqCXP8"
prompt_of_the_day: "Build a single-page web app that lets a hostel mess committee mark today's menu (breakfast/lunch/dinner) and shows it to students in read-only view. Use plain HTML + JS, persist to localStorage. First, write a 5-step plan. Wait for me to approve before writing code."
tools_hands_on:
  - { name: "Cursor", url: "https://cursor.sh/" }
  - { name: "Antigravity", url: "https://antigravity.google/" }
  - { name: "Bolt", url: "https://bolt.new/" }
  - { name: "Emergent", url: "https://emergent.sh/" }
  - { name: "Google AI Studio", url: "https://aistudio.google.com/" }
tools_reference:
  - { name: "Cursor — Plan mode docs", url: "https://docs.cursor.com/" }
  - { name: "Andrej Karpathy — vibe coding tweet", url: "https://x.com/karpathy/status/1886192184808149383" }
resources:
  - { title: "Simon Willison — building tools with LLMs", url: "https://simonwillison.net/" }
  - { title: "Bolt prompt guide", url: "https://support.bolt.new/" }
lab: { title: "Mess-menu app — three ways", url: "https://bolt.new/" }
objective:
  topic: "Vibe Coding with Plan mode"
  tools: ["Cursor", "Antigravity", "Bolt", "Emergent", "Google AI Studio"]
  end_goal: "A working mess-menu app shipped in three different vibe-coding tools, with a written plan you approved before any code was generated."
---

Vibe coding is real, and it's also a trap. Raw "make me an app" works for the first prompt and falls apart on the fourth. Today you learn the move that pros use: **Plan mode first, code mode second.**

## 🎯 Today's objective

**Topic.** Vibe Coding (including Plan mode).

**By end of class you will have:**
1. Built the same tiny app three times — once each in Bolt, Emergent, and Google AI Studio.
2. Used **Cursor's Plan mode** (or Antigravity's plan flow) to scope a feature *before* a single line of code.
3. A felt sense of when to switch tools mid-build.

> *Why this matters.* Your capstone will live or die by how well you can *direct* a code-gen tool. Vibe ≠ winging it.

## ⏪ Pre-class · ~20 min

### Setup (required)

- [ ] **Cursor** installed and signed in (free tier is fine).
- [ ] Bookmarks for **Bolt.new**, **Emergent**, **Google AI Studio**.
- [ ] Optional: try **Antigravity** if you got an invite.

### Primer (~5 min)

- **Watch:** Any 4-min "Cursor Plan mode walkthrough" on YouTube.
- **Read:** Karpathy's original *vibe coding* tweet — https://x.com/karpathy/status/1886192184808149383

### Bring to class

- [ ] One micro-feature you've always wanted: hostel mess menu, fee deadline tracker, lab attendance counter.

> 🧠 **Quick glossary.** **Vibe coding** = describing what you want in natural language, accepting most of what the AI writes. **Plan mode** = AI writes a step-by-step plan first; you approve, *then* it codes. **Agent loop** = AI runs, observes errors, fixes itself.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Why plan first | 10 min | Demo of vibe-then-fix vs plan-then-code |
| Lab block A: Bolt + Emergent | 20 min | Same prompt, two tools |
| Lab block B: AI Studio | 10 min | Gemini-native build |
| Cursor + Plan mode | 15 min | Take the best output local, iterate |
| Poll + discuss | 5 min | Which tool felt fastest *and* most controllable |

### Plan-then-code in 4 steps

1. **State the goal in one sentence** — "menu app, 3 meals, localStorage, read-only view."
2. **Ask for a plan, not code** — "Before writing anything, list 5 steps and the files you'll create."
3. **Edit the plan** — drop a step, add a constraint (no React, plain JS only).
4. **Approve → code.** Now let it rip.

### When to swap tools

- **Bolt** — fastest for "give me a working web app from scratch." Stackblitz under the hood.
- **Emergent** — agentic, longer-running tasks; good when you want it to keep going.
- **Google AI Studio** — best when you want to riff with Gemini directly + see token-level behaviour.
- **Cursor** — once you have code locally, this is your home base.

## 🧪 Lab: Mess-menu app, three ways

1. Open **Bolt**. Paste the prompt of the day. Note: it includes "First, write a 5-step plan. Wait for me to approve." Did Bolt obey?
2. Approve the plan (or correct it), let Bolt generate. Click *Preview* — does it work?
3. Open **Emergent** in a new tab. Same prompt. Compare its plan to Bolt's.
4. Open **Google AI Studio** → pick *Build* → same prompt. Compare again.
5. Take the best output, download it, open in **Cursor**. Toggle **Plan mode** (Cmd-Shift-P / Ctrl-Shift-P). Ask: *"Add a date stamp to each saved menu and show last 7 days."* Approve plan → run.
6. Confirm `localStorage` persistence by reloading the page.

**Artifact.** A GitHub gist (or zipped folder uploaded to Drive) with your final `index.html` + a 4-line note: which tool you'd pick again, for what.

## 📊 Live poll

**For a 1-day hackathon, which would you start with?** Bolt / Emergent / Google AI Studio / Cursor from scratch / Depends on the project.

## 💬 Discuss

- Did any tool *skip* the plan and just code? How did you correct it?
- Which tool's output was hardest to read after the fact?
- Where did vibe coding actively hurt you — a hallucinated API, a broken import, a fake library?

## ❓ Quiz

Short quiz on Plan mode behaviour, agent loops, and tool fit. Open it on your dashboard during class.

## 📝 Assignment · Vibe-built micro-tool

**Brief.** Pick **your own** micro-feature (not the mess menu). Use Plan mode first, ship a working version. Write a 100-word note: where vibe coding helped, where it failed, what you'd do differently.

**Submit.** GitHub gist link + reflection on the dashboard.

**Rubric.** App actually works (4) · Plan was written and edited (3) · Honest reflection (3).

## 🔁 Prep for next class

Day 16 is **Capstone Milestone 3** — you present your prototype.

- [ ] Polish your Day-14 deck.
- [ ] Have a working demo URL (Bolt-hosted is fine for v1).
- [ ] 5-minute pitch + 2-minute Q&A. Rehearse once out loud.

## 📚 References

- [Cursor docs — Plan mode](https://docs.cursor.com/) — official.
- [Bolt support — prompting tips](https://support.bolt.new/)
- [Simon Willison's blog](https://simonwillison.net/) — daily notes on building with LLMs.
- [Geoffrey Huntley — vibe coding is here to stay](https://ghuntley.com/) — practitioner take.
