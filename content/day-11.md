---
day: 11
date: "2026-05-15"
weekday: "Friday"
week: 2
topic: "Capstone Milestone 2: Idea Lock, Features and Automations with AI"
faculty:
  main: "Sandeep"
  support: "TBD"
reading_time: "10 min"
tldr: "Milestone 2. You pitch your locked idea in 3 minutes, get critiqued, then convert it into a feature list and an automation map. By end of class your capstone has a spine."
tags: ["capstone", "milestone", "features"]
software: []
online_tools: []
video: "https://www.youtube.com/embed/Th8JoIan4dg"
prompt_of_the_day: "You are a startup product manager. Here is my locked idea [paste SCQA]. Break it into (a) 5 must-have features for v1, (b) 3 nice-to-haves, (c) 3 automations that can replace manual work. For each AI feature, name the model + why. Be brutal about scope cuts."
tools_hands_on:
  - { name: "Notion", url: "https://www.notion.so/" }
  - { name: "Figma", url: "https://www.figma.com/" }
  - { name: "ChatGPT", url: "https://chat.openai.com/" }
tools_reference:
  - { name: "Marty Cagan — Inspired (book)", url: "https://www.svpg.com/inspired-how-to-create-products-customers-love/" }
resources:
  - { title: "Y Combinator — How to evaluate startup ideas (10 min)", url: "https://www.youtube.com/watch?v=Th8JoIan4dg" }
  - { title: "First Round — The Feature Audit", url: "https://review.firstround.com/" }
  - { title: "Lenny Rachitsky — MVP scoping", url: "https://www.lennysnewsletter.com/" }
lab: { title: "Idea Lock pitch + feature/automation map", url: "https://www.notion.so/" }
objective:
  topic: "Lock the capstone idea, decompose into features and automations"
  tools: ["Notion", "Figma", "ChatGPT"]
  end_goal: "A locked one-page capstone spec: SCQA + JTBD + 5 features + 3 automations + tech stack hypothesis + one cut you committed to."
---

> 🏁 **Milestone 2 — Idea Lock.** This is the second of four capstone gates. After today, you stop pivoting *what* you're building and start arguing about *how*. Pitch is 3 minutes, Q&A is 4 minutes, you walk out with a locked spec.

## 🎯 Today's objective

**Topic.** Lock the capstone idea. Decompose it into features and automations. Name the AI in each.

**By end of class you will have:**
1. Defended your idea in a 3-minute SCQA pitch in front of the cohort + faculty.
2. A feature list (5 must / 3 nice) with the AI model named for each AI feature.
3. An automation map: 3 manual steps you'll *not* build because automation will do them.

> *Why this matters.* Every demo-day project that ships clearly cut something today. Every one that didn't, didn't.

## ⏪ Pre-class · ~20 min

### Setup (required)

- [ ] Day-10 1-pager finalised (SCQA + causal loop + JTBD).
- [ ] 3-minute pitch rehearsed once *out loud* — not in your head.

### Primer (~5 min)

- **Watch:** YC's *How to evaluate startup ideas* (10 min, watch on 1.5x) — https://www.youtube.com/watch?v=Th8JoIan4dg

### Bring to class

- [ ] One feature you secretly know is scope creep. We'll cut it together.
- [ ] Your laptop with Notion / Figma open.

> 🧠 **Quick glossary.** **Idea Lock** = no more pivoting on the *what*. **Feature** = a thing the user does. **Automation** = a thing that happens *without* the user. **MVP** = smallest thing that proves the riskiest assumption. **AI feature** = feature where an LLM or model does the heavy lift.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Pitches round 1 | 25 min | 5 teams × 3 min pitch + 2 min critique |
| Feature decomposition workshop | 15 min | One team's pitch → live feature breakdown |
| AI vs deterministic | 10 min | Where to use an LLM, where to use plain code |
| Lab: build your map | 20 min | Spec it on Notion |
| Pitches round 2 + lock | 20 min | Remaining teams, final lock |

### Where AI belongs (and where it doesn't)

- **AI is good for.** Open-ended generation, summarisation, classification of fuzzy text, semantic search.
- **AI is bad for.** Exact arithmetic, deterministic workflow steps, anything legally binding without review, tasks where 95% accuracy is unacceptable.
- **The default.** Plain code first. Reach for AI only when plain code can't do it cleanly.

## 🧪 Lab: Feature + automation map

1. **Pitch (3 min).** Deliver SCQA. No slides — talk + your 1-pager.
2. **Critique capture (4 min).** Write down every objection. Don't defend live; capture.
3. **Feature list (8 min).** In Notion: 5 must-have features. For each, mark `[AI]` or `[code]` and name the model if AI.
4. **Automation map (4 min).** List 3 manual tasks an automation will eat (cron job, webhook, agent loop, scheduled email).
5. **Cut commitment (1 min).** Cross out *one* feature publicly. Tell a neighbour what you cut and why.

**Artifact.** A Notion page (or Figma frame) with: SCQA, JTBD, feature list (with `[AI]` tags + model names), automation map, the cut feature, top-3 critiques received. Submit on dashboard.

## 📊 Live poll

**Where in your stack is AI doing real work?** Generation only / Classification / Search / Workflow agent / Just a chat wrapper. Instructor uses this to plan Days 12–18.

## 💬 Discuss

- Which critique landed hardest? What did you change because of it?
- Name one feature you almost kept that you should cut.
- Which "AI feature" is actually a regex in disguise?

## ❓ Quiz

Short quiz on must-have vs nice-to-have, when to use AI vs deterministic code, and what an automation is. Opens on dashboard.

## 📝 Assignment · Locked Spec v1

**Brief.** Polish your in-class Notion page into a **Locked Spec v1**. Add: tech stack hypothesis (frontend, backend, model, db), one risk + mitigation, and the *one* user you'll demo to in week 4. ~500 words.

**Submit.** Dashboard before Day 12.

**Rubric.** Sharpness of cuts (4) · Feasibility of stack (4) · Honesty about risk (2).

## 🔁 Prep for next class

Day 12 jumps into **Text2Image** — Stable Diffusion, ChatGPT Images, Nano Banana, Adobe Firefly. Run by Jayasaagar with Sanjana on support.

- [ ] Free accounts on **Adobe Firefly** and **ChatGPT Plus or free image tier**.
- [ ] If you have a GPU laptop, install **AUTOMATIC1111** or **ComfyUI** locally. Otherwise we'll use hosted Stable Diffusion.
- [ ] Bring 3 image briefs from your capstone (hero shot, illustration, icon).

## 📚 References

- [YC — How to evaluate startup ideas](https://www.youtube.com/watch?v=Th8JoIan4dg) — pitch sanity check.
- [SVPG — Inspired](https://www.svpg.com/inspired-how-to-create-products-customers-love/) — the PM bible.
- [Lenny's Newsletter — MVP scoping](https://www.lennysnewsletter.com/) — practical scope cuts.
- [Notion — Project spec template](https://www.notion.so/templates) — start from one.
