---
day: 5
date: "2026-05-07"
weekday: "Thursday"
week: 1
topic: "Grounded research with AI: Fast vs Thinking vs Deep Research"
faculty:
  main: "Jayasaagar"
  support: "Aparna"
reading_time: "12 min"
tldr: "Three modes of AI research: Fast (1 min, vibes), Thinking (5 min, structured), Deep Research (30 min, cited report). Today you run the same question through all three and see when each is worth the wait — and the cost."
tags: ["research", "grounding", "citations"]
software: []
online_tools: ["NotebookLM", "Perplexity", "Deep Research"]
video: "https://www.youtube.com/embed/6dHmu1GALmA"
prompt_of_the_day: "Compare campus placement trends for CSE branches across IITs, NITs, and Tier-2 colleges in 2024–2025. Cite at least 5 sources. Output: 1-page brief, plus a 'what changed vs 2023' section."
tools_hands_on:
  - { name: "Perplexity", url: "https://www.perplexity.ai/" }
  - { name: "NotebookLM", url: "https://notebooklm.google.com/" }
  - { name: "ChatGPT Deep Research", url: "https://chat.openai.com/" }
  - { name: "Gemini Deep Research", url: "https://gemini.google.com/" }
tools_reference:
  - { name: "NotebookLM Help", url: "https://support.google.com/notebooklm" }
  - { name: "Perplexity Spaces", url: "https://www.perplexity.ai/hub/blog/introducing-perplexity-spaces" }
resources:
  - { title: "Anthropic — extended thinking", url: "https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking" }
  - { title: "Stanford HAI — On AI hallucinations", url: "https://hai.stanford.edu/news/hallucinating-law-legal-mistakes-large-language-models-are-pervasive" }
lab: { title: "Same question, three depths", url: "https://www.perplexity.ai/" }
objective:
  topic: "Grounded research with AI: Fast vs Thinking vs Deep Research"
  tools: ["Perplexity", "NotebookLM", "Deep Research"]
  end_goal: "A 1-page comparison: same question answered Fast / Thinking / Deep — with notes on when each is worth using and where each lied."
---

By Day 4 you can pick a model and prompt it well. By Day 5 you stop letting any single model be the final word. Real research is **grounded** — every claim points to a source you can click. Today you learn three speeds of grounded AI.

## 🎯 Today's objective

**Topic.** Grounded research with AI: Fast vs Thinking vs Deep Research.

**By end of class you will have:**
1. Run the same real question through **Perplexity (Fast)**, a **Thinking** model (Claude/o1), and **Deep Research**.
2. Loaded your own PDFs into **NotebookLM** and queried them — only — without the model hallucinating.
3. Caught at least one *confident-but-wrong* answer and traced where it came from.
4. A clear rule of thumb: when to use which mode for *what kind of question*.

> *Why this matters.* Your capstone (Week 4) needs sources. Your placement prep needs facts. A model that confidently fabricates a launch date, a stat, or a citation will cost you a viva — or, later, a customer.

## ⏪ Pre-class · ~25 min

### Setup (required)

- [ ] Free account on **Perplexity** (https://www.perplexity.ai/).
- [ ] Free account on **NotebookLM** (https://notebooklm.google.com/).
- [ ] Pick **3 PDFs** you actually need to read this semester (paper, textbook chapter, internship report).

### Primer (~10 min)

- **Watch:** any 5-min "How NotebookLM works" walkthrough.
- **Skim:** Perplexity's Spaces blog post.

### Bring to class

- [ ] **One real question** you want a sourced answer to (career, project, personal finance — must have a factual answer).
- [ ] Your 3 PDFs uploaded to a NotebookLM notebook.

> 🧠 **Quick glossary.** **Grounded** = answer cites a source the model actually retrieved. **RAG** = retrieval-augmented generation; the system fetches docs first, then writes. **Hallucination** = made-up "fact" that sounds right. **Deep Research** = agent that browses for 10–30 min and writes a report. **NotebookLM** = closed-corpus RAG over *only your* PDFs.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Why "research mode" exists | 10 min | What Fast/Thinking/Deep change |
| Demo: 1 question, 3 modes | 15 min | Live, with cost+time |
| NotebookLM tour | 15 min | Closed-corpus questioning |
| Lab: your question, 3 modes | 20 min | |
| Discussion + Q&A | 5 min | |

### The three speeds

- **Fast (~30 sec).** Perplexity default, Gemini grounded, ChatGPT search. Good for *"what is X?"*, *"who founded Y?"*, latest news.
- **Thinking (~3-5 min).** Claude with extended thinking, OpenAI o1, Gemini Thinking. Good for *"compare X and Y on these 4 axes"*, multi-step logic, math.
- **Deep Research (~10-30 min).** ChatGPT, Gemini, Perplexity Pro variants. Browses 30+ sources, writes a multi-page cited report. Good for *"market analysis"*, *"literature review"*, *"competitive landscape"*.
- **NotebookLM (closed corpus).** Different beast — answers *only* from PDFs you upload. Best for trustworthy citations from your own material.

## 🧪 Lab: Same question, three depths

1. Pick your **one real question** from prep.
2. Run it on **Perplexity (Fast)**. Note time, source count, key claim.
3. Run it on **ChatGPT (with reasoning/o1)** or **Claude (with thinking)**. Note time + reasoning trace.
4. Run it on **ChatGPT/Gemini Deep Research**. Walk away for 15 min while it works.
5. Open **NotebookLM**, ask the same question against your 3 PDFs. Note where it refuses or contradicts the open-web answers.
6. Build a 4-row table: mode · time · source quality · how confident you'd be quoting it in a viva.
7. Write 3 sentences: *for this question I would ship with __ because __.*

**Artifact.** Google Doc with the question, 4 outputs, comparison table, recommendation. Share link in the cohort channel.

## 📊 Live poll

**For your placement-prep research (target companies, salary bands, interview style), which would you trust most?** (a) Perplexity Fast (b) Thinking model (c) Deep Research (d) NotebookLM with HR PDFs (e) Talking to a senior.

## 💬 Discuss

- Where did Deep Research's "33 sources cited" turn out to be padding?
- What's a question NotebookLM is *better* at than Deep Research, and why?
- If you only had time for one mode for your final-year project, which would you pick?

## ❓ Quiz

Short quiz on grounding, RAG, when each mode wins, and NotebookLM's limits. Open from your dashboard when unlocked.

## 📝 Assignment · One brief, three modes

**Brief.** Pick **one researchable question** about your dream company or higher-studies target (e.g., *"What's the SDE-1 selection process at Razorpay in 2025?"*). Submit a 1-page brief: (a) Fast answer in 5 bullets, (b) Thinking answer in 5 bullets, (c) Deep Research summary in 8 bullets, (d) which lied/was thin and how you caught it.

**Submit.** Paste on dashboard before next class.

**Rubric.** Source quality (4) · Mode-fit reasoning (4) · Caught-a-lie evidence (2).

## 🔁 Prep for next class

Day 6 is **Capstone Milestone 1: ideathon, brainstorm, research**. The day your 30-day demo starts becoming real.

- [ ] Bring **3 problems** you've personally lived (hostel mess, attendance, lost UPI receipts, JEE doubt loops).
- [ ] Open a fresh **Google Doc** titled `<your name> – Capstone M1`.
- [ ] Re-read your Day 1 baseline reflection — your capstone should solve a problem *you* care about.

## 📚 References

- [NotebookLM](https://notebooklm.google.com/) — start with 3 PDFs, scale to 50.
- [Perplexity Spaces blog](https://www.perplexity.ai/hub/blog/introducing-perplexity-spaces) — collaborative research.
- [Anthropic — extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking) — what "thinking" actually does.
- [Stanford HAI on hallucinations](https://hai.stanford.edu/news/hallucinating-law-legal-mistakes-large-language-models-are-pervasive) — why citations matter.
