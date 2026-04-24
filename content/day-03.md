---
day: 3
date: "2026-05-05"
weekday: "Tuesday"
week: 1
topic: "Prompting Guide: CREATE, few-shot, chain-of-thought, structured output"
faculty:
  main: "Raunak"
  support: "Sanjana"
reading_time: "12 min"
tldr: "Stop asking. Start directing. Today you learn the CREATE framework, give the model 3 examples instead of begging, force JSON output, and ask it to think step-by-step. Same model, 5× better answers."
tags: ["prompting", "framework", "fundamentals"]
software: []
online_tools: ["ChatGPT", "Grok", "Claude", "Gemini", "OpenAI Playground", "Google AI Studio"]
video: "https://www.youtube.com/embed/jC4v5AS4RIM"
prompt_of_the_day: "You are a senior placement coach. Context: I'm a 7.8 CGPA CSE student, 1 startup intern, target role SDE-1 at a product company. Examples of strong answers: <2 STAR examples>. Task: rewrite my Tell-me-about-yourself in 90 seconds. Output as 3 bullets. Tone: confident, not boastful."
tools_hands_on:
  - { name: "OpenAI Playground", url: "https://platform.openai.com/playground" }
  - { name: "Google AI Studio", url: "https://aistudio.google.com/" }
  - { name: "ChatGPT", url: "https://chat.openai.com/" }
  - { name: "Claude", url: "https://claude.ai/" }
  - { name: "Gemini", url: "https://gemini.google.com/" }
tools_reference:
  - { name: "Anthropic Prompt Engineering Guide", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" }
  - { name: "OpenAI Prompt Engineering Guide", url: "https://platform.openai.com/docs/guides/prompt-engineering" }
resources:
  - { title: "Lilian Weng — Prompt Engineering", url: "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/" }
  - { title: "Learn Prompting", url: "https://learnprompting.org/" }
lab: { title: "CREATE rewrite — bad prompt → great prompt", url: "https://platform.openai.com/playground" }
objective:
  topic: "Prompting Guide: CREATE, few-shot, chain-of-thought, structured output"
  tools: ["OpenAI Playground", "Google AI Studio", "ChatGPT", "Claude"]
  end_goal: "A before/after table — your 3 worst prompts rewritten with CREATE + few-shot + structured output, with measurable quality lift."
---

The model didn't get worse between Day 1 and Day 30 — *you* will get sharper. Today is the most ROI-dense day in Week 1. One framework, four techniques, every future class assumes you know them.

## 🎯 Today's objective

**Topic.** Prompting Guide: CREATE, few-shot, chain-of-thought, structured output.

**By end of class you will have:**
1. Rewritten 3 of your weakest prompts using the **CREATE** template.
2. Used **few-shot** (3 examples) to make the model match a tone you couldn't describe.
3. Forced a model to return clean **JSON** you could paste into a spreadsheet.
4. Used **chain-of-thought** to catch a math/logic mistake before it hurt you.

> *Why this matters.* Day 30 your capstone needs a deterministic output. You can't ship a demo where the AI returns prose 50% of the time and JSON the other 50%.

## ⏪ Pre-class · ~20 min

### Setup (required)

- [ ] Sign in to **OpenAI Playground** (free trial credits) and **Google AI Studio** (free).
- [ ] Have your "3 worst prompts" Doc from Day 2 open.

### Primer (~10 min)

- **Watch:** Andrew Ng + OpenAI "ChatGPT Prompt Engineering for Devs" — first 2 lessons.
- **Read:** Anthropic's "Be clear and direct" page — https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct

### Bring to class

- [ ] 3 weak prompts (real ones from your life — placement, lab report, hostel-mess complaint, JEE doubt).
- [ ] One *example* of writing you wish AI could match (your favourite teacher's mail tone, etc.).

> 🧠 **Quick glossary.** **Few-shot** = giving the model 1–5 examples. **Chain-of-thought** = "think step by step" before answering. **System prompt** = the instructions the model sees before the user. **Structured output** = forcing JSON / table / specific schema. **Temperature** = randomness dial (0 = boring, 1 = wild).

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap Day 2 + intro CREATE | 10 min | Why prompts fail |
| CREATE walkthrough | 15 min | C·R·E·A·T·E live demo on Playground |
| Few-shot + CoT demo | 15 min | Same problem, 3 prompt versions |
| Lab: rewrite your 3 prompts | 20 min | In Playground |
| Discussion + Q&A | 5 min | |

### The CREATE framework

- **C — Character.** *"You are a senior ICICI relationship manager…"*
- **R — Request.** The single, precise task.
- **E — Examples.** 1–3 few-shot pairs the model can mimic.
- **A — Adjustments.** Length, tone, what to avoid.
- **T — Type of output.** Bullets, table, JSON schema.
- **E — Extras.** Constraints, edge cases, audience.

### Three more techniques

- **Few-shot.** "Here are 3 sample answers in the tone I want. Now do mine." Cuts 80% of tone-tuning.
- **Chain-of-thought.** Add *"Think step by step before the final answer."* — wins on math, logic, and debugging.
- **Structured output.** End with *"Return only valid JSON matching: { name: string, score: 0-10, reason: string }"*. Now your output is parseable.

## 🧪 Lab: Bad prompt → CREATE prompt

1. Pick your **worst prompt** from Day 2 prep.
2. In **OpenAI Playground** (gpt-4o-mini), run it as-is. Save the output.
3. Rewrite it using full CREATE — Character, Request, 2 Examples, Adjustments, Type (JSON), Extras.
4. Run again with **temperature 0.2**. Save the output.
5. Add *"Think step by step before answering. Then give final JSON."* — run a third time.
6. Repeat for 2 more prompts.
7. Score each before/after on a 1–5 scale: *usefulness*, *specificity*, *tone match*.

**Artifact.** A Google Doc with a 3-row table: original prompt · CREATE prompt · score lift · what surprised you. Share link in the cohort channel.

## 📊 Live poll

**Which technique gave you the biggest quality jump?** (a) Adding a Character (b) 2-3 examples (few-shot) (c) "Think step by step" (d) Forcing JSON output (e) All of them, equally.

## 💬 Discuss

- Which part of CREATE felt fakest to you — and did the output prove you wrong?
- When does few-shot *hurt*? (Hint: when your examples are inconsistent.)
- If you had to teach CREATE to a hostel junior in 60 seconds, what would you skip?

## ❓ Quiz

Short quiz on CREATE letters, when CoT helps, and what structured output buys you. Open it from your dashboard when unlocked.

## 📝 Assignment · The CREATE rewrite

**Brief.** Pick **one task you'll actually do this week** (cover letter, project report intro, parents-explainer about your placement situation). Submit: (a) your *naive* prompt, (b) your *CREATE* prompt with all 6 letters labelled, (c) both outputs, (d) 60-word note on what changed and why.

**Submit.** Paste on dashboard before next class.

**Rubric.** CREATE completeness (4) · Output quality lift (4) · Reflection honesty (2).

## 🔁 Prep for next class

Day 4 is **open-source models and the Indian stack** — Sarvam, Mistral, Qwen, LLaMA, DeepSeek. Why would you ever leave ChatGPT?

- [ ] Create a **Hugging Face** account.
- [ ] Browse https://www.sarvam.ai/ — find one Indic model that interests you.
- [ ] Skim the leaderboard at https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard.

## 📚 References

- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) — the cleanest of the bunch.
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering) — official, exhaustive.
- [Lilian Weng — Prompt Engineering](https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/) — research-flavoured.
- [Learn Prompting](https://learnprompting.org/) — interactive practice.
