---
reading_time: 16 min
tldr: "Stop typing code and start directing it — ship your capstone v0 by the end of today."
tags: ["build", "ship", "agentic"]
video: https://www.youtube.com/embed/LCEmiRjPEtQ
lab: {"title": "Vibe-code your capstone v0", "url": "https://cursor.com/docs"}
prompt_of_the_day: "You are my pair-programmer. Read {{CLAUDE.md}} and the current file tree. I want to build {{feature}}. Before writing code, propose a 3-step plan, call out the riskiest assumption, and wait for my sign-off."
tools_hands_on: [{"name": "Cursor", "url": "https://cursor.com"}, {"name": "bolt.new", "url": "https://bolt.new"}, {"name": "Google Antigravity", "url": "https://antigravity.google.com"}]
tools_demo: [{"name": "Claude Code", "url": "https://claude.com/claude-code"}, {"name": "Cline", "url": "https://cline.bot"}, {"name": "Dify", "url": "https://dify.ai"}]
tools_reference: [{"name": "Continue", "url": "https://continue.dev"}, {"name": "Lovable", "url": "https://lovable.dev"}, {"name": "v0", "url": "https://v0.dev"}, {"name": "Emergent", "url": "https://emergent.sh"}, {"name": "Replit Agent", "url": "https://replit.com"}, {"name": "Windsurf", "url": "https://codeium.com/windsurf"}, {"name": "Google Code Assist", "url": "https://codeassist.google/"}, {"name": "aider", "url": "https://aider.chat"}]
resources: [{"name": "Anthropic: Claude Code best practices", "url": "https://www.anthropic.com/engineering/claude-code-best-practices"}, {"name": "Cursor: the AI Code Editor", "url": "https://cursor.com"}]
objective:
  topic: "Director-not-typist — vibe-coding your capstone v0 from a 4-part spec to a working live prototype"
  tools: ["Cursor", "bolt.new", "Google Antigravity"]
  end_goal: "Submit Capstone Milestone 3 — a working v0 prototype (live URL or local recording + repo link) plus a 200-word director's commentary."
---

## 🎯 Today's objective

**Topic.** Director-not-typist — compressing intent into English instead of compiling English into code.

**Tools you'll use.** Pick one as primary: Cursor, bolt.new, or Google Antigravity. Your Day 19 CLAUDE.md comes along for the ride.

**End goal — MILESTONE DAY.** By the end of today you will have:
1. A working v0 prototype of your capstone — **a live URL that actually loads**, or a recorded local demo + repo link.
2. A 200-word director's commentary naming primary tool, hardest prompt, off-the-rails moment, and one change next time.
3. **Capstone Milestone 3** submitted to the cohort dashboard.

> *Why this matters:* this is the checkpoint where your four weeks of context, prompting, RAG, and context engineering collide into something that runs. Tomorrow (Day 22) you take this v0 live on the public internet; today it just has to work.

---

## ⏪ Pre-class · ~20 min

**Revision / context.** Yesterday (Day 20) you built an n8n flow that automates action. The day before (Day 19) you wrote a CLAUDE.md that gives AI context. Today those two combine: the CLAUDE.md is your director's brief, and the vibe-coding tool is the worker — you specify, it types. If your Day 19 CLAUDE.md is stale, **update it before class starts** — every bad guess the model makes today traces back to missing or wrong context in that file.

### Setup
- [ ] Install [Cursor](https://cursor.com) OR open [bolt.new](https://bolt.new) in a fresh tab — pick one as your primary for today.
- [ ] Pull your capstone repo locally and confirm `CLAUDE.md` from Day 19 is at the root and current.
- [ ] Re-read your Day 15 capstone spec — highlight the single smallest end-to-end slice (input → AI call → output).

### Primer (~5 min)
- **Read**: [Anthropic — Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices) (skim sections 1–3).
- **Watch** (optional): [Director's-chair vibe coding walkthrough](https://www.youtube.com/embed/LCEmiRjPEtQ).

### Bring to class
- [ ] Your capstone repo open in Cursor / bolt.new / [Antigravity](https://antigravity.google.com).
- [ ] A one-paragraph v0 scope written down — the slice you want to ship today.
- [ ] An API key (Claude or OpenAI) in your environment.

> 🧠 **Quick glossary**
> - **Vibe-coding** — directing an AI to write code from intent, not typing it yourself.
> - **Spec** — the four-part brief (context, invariants, task, acceptance) you hand the model.
> - **Director-not-typist** — the mindset flip: compress intent into English, don't compile English into code.
> - **Iteration loop** — spec → code → review → iterate, repeated in short turns.
> - **Context (CLAUDE.md)** — the persistent project brief the model reads every session.
> - **Scaffolding** — boilerplate, CRUD, CSS, tests — low-cost surface where long-leash agents shine.

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Week 5 kickoff — from typist to director |
| Mini-lecture | 20 min | The 4-part spec, tight vs long leash, debugging AI output |
| Live lab     | 20 min | Vibe-code a v0 slice of your capstone — spec, diff, review, iterate |
| Q&A + discussion | 15 min | Where vibe coding broke today and why |

### In-class checkpoints

- **Cold-open confession**: raise a hand if you typed more code than you specced yesterday. Keep it up if you regretted it.
- **Think-pair-share**: in 90 seconds, each partner reads the other's 4-part spec out loud; catch the one missing acceptance criterion.
- **Live poll**: tight leash or long leash for your next change? Post T or L in chat with one-line reason.
- **Breakout debate**: Cursor vs bolt.new vs Antigravity for *your* capstone stack — pick one and defend in 60 seconds.
- **Showcase**: one volunteer screen-shares a rejected diff and the redirect prompt that fixed it.

### Read: Director vs Typist — the mindset shift that unlocks AI-first building

Every engineer who is still slow with AI tools in 2026 is stuck in typist mode. A typist reads a Stack Overflow answer, retypes it into their editor, runs it, and debugs line by line. A typist thinks in characters. A director thinks in intent, constraints, and acceptance criteria. The director writes a spec, hands it to a capable junior (the model), reads the output critically, and redirects. The director never touches the keyboard to write code — but they do touch it to write specs, reviews, and rejections.

The mental flip is this: **your job is to compress your intent into unambiguous English, not to compile English into code**. If the model is confused, your spec was bad. If the code is wrong, your spec was incomplete. If the code is fragile, your spec missed the failure modes. The model is a mirror; blaming it is blaming your own prompt.

#### The art of the spec

A good spec has four parts, and your CLAUDE.md from Day 19 already carries the first two:

1. **Context** — what the project is, what tech stack, what files exist, what conventions you follow. This is static; CLAUDE.md covers it.
2. **Invariants** — things that must never break. "All API routes must return JSON, never HTML." "No new dependencies without my approval." "TypeScript strict mode stays on."
3. **This task** — the specific change. Not "add login" but "add a `/login` page that accepts email + password, posts to `/api/auth`, stores the returned JWT in an httpOnly cookie, and redirects to `/dashboard` on success."
4. **Acceptance** — how you will know it is done. "I should be able to log in, refresh the page, and still be logged in." "If I type a wrong password I should see 'Invalid credentials' without the page reloading."

If you write those four parts before you press Enter, you will be in the top 5% of vibe coders. Most people skip to part 3 and wonder why the model keeps inventing libraries.

#### Iteration loops — spec, code, review, iterate

Vibe coding is not a single prompt. It is a loop. Every turn through the loop has four moves:

- **Spec** — what I want next, with acceptance criteria.
- **Code** — the model writes it. You do not touch the keyboard except to approve diffs.
- **Review** — you read every changed file. You run the thing. You break the thing on purpose.
- **Iterate** — you feed back what is wrong. You do not rewrite; you redirect.

Most beginners break on the Review step. They see a diff that looks vaguely plausible, accept it, and move on. Then they discover four turns later that the model invented a function name that does not exist, wrote tests that import nothing, and silently removed a feature from last week. Review is not optional. Review is where directing happens.

A practical tip: keep turns short. If you are on turn 7 of a single conversation, the model is probably hallucinating context. Start a fresh session, hand it the CLAUDE.md and the current diff, and restate the goal.

#### When to let AI off the leash

There are two modes. **Tight leash**: every change is a diff you review before it hits the disk. Cursor's chat and Claude Code's default mode feel like this. **Long leash**: the agent runs a loop, edits many files, runs tests, fixes errors, and only comes back when it is stuck. Claude Code's agent mode, Antigravity's background tasks, Replit Agent, and Emergent feel like this.

The heuristic:
- Tight leash when the code matters long-term: core logic, security boundaries, the data model.
- Long leash when the cost of a bad attempt is low: scaffolding, CSS, tests, migrations, boilerplate CRUD.

If you put long-leash agents on core logic without a strong test suite, you will wake up to a tangle. If you put tight leash on boilerplate, you will be there all day.

#### Debugging AI output

The model will lie to you. Not maliciously — it will confidently ship code that does not run, import modules that do not exist, and call APIs that were deprecated in 2023. Three debugging reflexes will save you hours:

- **Run it immediately.** Never accept a diff you have not executed. Half the hallucinations die on the first `npm run dev`.
- **Read the stack trace to the model.** Paste the full error back. Do not paraphrase. The model is better at reading its own mistakes than you are.
- **Ask it to think out loud before it fixes.** "Before you change anything, tell me what you think is wrong and why." If the diagnosis is wrong, the fix will be wrong.

And the nuclear option: **ask for two solutions, pick one**. "Give me two different ways to solve this, with tradeoffs." You get better code and a small education for free.

#### The capstone angle

You have three tools to try today — Cursor, bolt.new, Antigravity — but you will pick one as your primary. The choice is less about capability (they all work) and more about where your capstone lives. If you have an existing repo on your machine, Cursor is strongest. If you are building a web app from scratch and want it deployable in one click, bolt.new shines. If you want an agent running long-horizon tasks across many files with a planning UI, Antigravity is the new hotness. Try all three on the same small task first — rebuilding a landing page, say — then commit to one for the real work.

A few alternatives worth knowing so you don't feel locked in. If you prefer the command line, **aider** (OSS, bring-your-own-key) is a slick CLI pair-programmer worth knowing — it sits in your terminal and edits files via git commits. If you live in VS Code or JetBrains and want free Gemini-powered inline completions without a card, **Google Code Assist** (`codeassist.google/`) plugs right in. And if you don't want to touch an IDE at all, **Dify** (`dify.ai`) is an open-source visual LLM-app builder — self-hostable or free cloud tier — that lets you ship a working chatbot / RAG app from drag-and-drop blocks. Good escape hatch if your capstone is mostly prompt-flow orchestration rather than code.

### Watch: Director's-chair vibe coding walkthrough

https://www.youtube.com/embed/LCEmiRjPEtQ

### Lab: Ship a v0 of your capstone

1. Open your capstone repo. Confirm your Day 19 CLAUDE.md is in the root and up to date.
2. Pick ONE primary tool — Cursor, bolt.new, or Antigravity. Open your capstone in it.
3. Write a **one-page spec** for the v0 scope. Not the whole product. The smallest end-to-end path a user can walk: input → AI call → output.
4. Run the spec → code → review → iterate loop until the v0 works locally. Target: 3 hours, 5–8 iterations.
5. Commit after every accepted diff. Your git log is your director's journal.
6. Record a 90-second screen capture of the v0 running.

> ⚠️ **If you get stuck**
> - *Cursor keeps asking permission for every file edit* → switch to Agent mode and whitelist your repo folder in Cursor settings, or pre-approve with "yolo" mode only inside a disposable branch.
> - *Model invents a library that doesn't exist (`npm ERR! 404`)* → paste the exact error back, add the line "do not use packages unless they appear in package.json" to your spec, and re-run.
> - *Conversation has drifted — the model keeps re-introducing a bug you already fixed* → end the session, open a fresh one, attach CLAUDE.md + the current diff, and restate the goal in one sentence.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Share one part of your capstone where the model consistently failed today. | Names a specific surface (e.g., "Stripe webhook signature verification in Next.js 15 app router"), not "AI is bad at backend." Includes the spec you wrote verbatim. |
| What output did you get, and why do you think the model struggled? | Cites a concrete symptom — hallucinated import, deprecated API, silently dropped feature — and connects it to a training-data or context-window hypothesis in 1-2 sentences. |
| What would you change in your spec to get past the block next time? | Proposes a specific additional constraint, invariant, or acceptance test. Avoids "I'd just try a better model." |

---

## 📝 Post-class · ~2 hour focused block

Today's assignment is the **Capstone Milestone 3** checkpoint. Budget the full block — this is the day you get your v0 across the finish line.

### 1. Immediate: submit your v0 (~60-90 min)

Run 5–8 spec → code → review → iterate turns on your v0 until the smallest slice works locally.

1. Commit after every accepted diff — your git log is your director's journal.
2. Record a 90-second screen capture of the v0 running end-to-end.
3. Write the **200-word director's commentary**: primary tool, hardest prompt, off-the-rails moment, one change next time.
4. Submit **Capstone Milestone 3** — working v0 prototype (repo link + recording; live URL if you have one — tomorrow's deploy day makes the URL mandatory).

### 2. Reflect (~5 min)

**Prompt:** *"Where in today's loop did I stop being a director and start being a typist? Name the exact turn and what triggered it."* A strong reflection names the spec that was too thin, the review step that got skipped, or the moment the conversation drifted past turn 7.

### 3. Quiz (~15 min)

Five on the dashboard:
1. What are the four parts of a good spec?
2. When should you use a long-leash agent vs a tight-leash chat?
3. What is the "read the stack trace to the model" reflex for?
4. Name one signal that a conversation has gone too long and you should start fresh.
5. Why is Review the step most beginners skip?

### 4. Submit (~5 min)

Post the Milestone 3 submission on the cohort dashboard: (a) repo link, (b) 90-second recording link, (c) 200-word director's commentary. Drop the recording link in the cohort channel so teammates can react.

### 5. Deepen (optional, ~30 min)
- **Extra video**: another pass through the [LCEmiRjPEtQ walkthrough](https://www.youtube.com/embed/LCEmiRjPEtQ) at 1.5x, this time with your own repo open.
- **Extra read**: [Cursor docs](https://cursor.com/docs) agent mode section.
- **Try**: rebuild the same v0 slice in [Lovable](https://lovable.dev) or [v0](https://v0.dev) and compare director ergonomics.

### 6. Prep for Day 22 (~30-40 min — IMPORTANT, new content)

**Tomorrow your v0 goes on the internet.** Day 22: deploy to Vercel, compute cost-per-user at 10/100/1000 users, audit the six-element trust UX stack, and publish an `llms.txt` so AI search engines of 2026 can cite you.

- [ ] **Push your v0 to GitHub** tonight — Vercel deploys from there.
- [ ] **Sign up for [Vercel](https://vercel.com)** free tier and link your GitHub account.
- [ ] **Confirm your [Supabase](https://supabase.com) account** is live; spin up an empty project if you don't have one. (You'll use the pooled pgbouncer connection tomorrow.)
- [ ] **Open the pricing pages** for whichever models you use (Claude, OpenAI, Gemini) in browser tabs.
- [ ] **Read the [llmstxt.org](https://llmstxt.org) one-page spec** — takes 3 minutes.
- [ ] **Create a blank Google Sheet** for the token-cost worksheet.
- [ ] **Guess** interactions per user per month your product expects. Bring the number.

---

## 📚 Extra / additional references

### Short watches
- [Director's-chair vibe coding walkthrough](https://www.youtube.com/embed/LCEmiRjPEtQ) — a second pass, with your own repo.

### Reading
- [Anthropic — Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Cursor docs](https://cursor.com/docs)

### Play
- [Cursor](https://cursor.com) — tight-leash IDE with agent mode.
- [bolt.new](https://bolt.new) — one-click deployable web app builder.
- [Google Antigravity](https://antigravity.google.com) — long-horizon agent with planning UI.
- [Claude Code](https://claude.com/claude-code) — terminal-native agent.
- [Cline](https://cline.bot) — open-source VS Code vibe-coder.
- [Continue](https://continue.dev) — self-hostable IDE copilot.
- [Replit Agent](https://replit.com) — long-leash cloud agent.
- [Windsurf](https://codeium.com/windsurf) — agentic IDE.
- [Emergent](https://emergent.sh) — long-horizon shipping agent.
- [Google Code Assist](https://codeassist.google/) — free Gemini-powered VS Code / JetBrains plugin; individual tier requires no card.
- [aider](https://aider.chat) — OSS CLI pair-programmer, bring-your-own-key.
- [Dify](https://dify.ai) — open-source visual LLM-app builder; no-code alternative if you don't want to touch an IDE.
