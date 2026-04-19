---
reading_time: 16 min
tldr: "Stop typing code and start directing it — ship your capstone v0 by the end of today."
tags: ["build", "ship", "agentic"]
video: https://www.youtube.com/embed/LCEmiRjPEtQ
lab: {"title": "Vibe-code your capstone v0", "url": "https://cursor.com/docs"}
prompt_of_the_day: "You are my pair-programmer. Read {{CLAUDE.md}} and the current file tree. I want to build {{feature}}. Before writing code, propose a 3-step plan, call out the riskiest assumption, and wait for my sign-off."
tools_hands_on: [{"name": "Cursor", "url": "https://cursor.com"}, {"name": "bolt.new", "url": "https://bolt.new"}, {"name": "Google Antigravity", "url": "https://antigravity.google.com"}]
tools_demo: [{"name": "Claude Code", "url": "https://claude.com/claude-code"}, {"name": "Cline", "url": "https://cline.bot"}]
tools_reference: [{"name": "Continue", "url": "https://continue.dev"}, {"name": "Lovable", "url": "https://lovable.dev"}, {"name": "v0", "url": "https://v0.dev"}, {"name": "Emergent", "url": "https://emergent.sh"}, {"name": "Replit Agent", "url": "https://replit.com"}, {"name": "Windsurf", "url": "https://codeium.com/windsurf"}]
resources: [{"name": "Anthropic: Claude Code best practices", "url": "https://www.anthropic.com/engineering/claude-code-best-practices"}, {"name": "Cursor: the AI Code Editor", "url": "https://cursor.com"}]
---

## Intro

Today is the day you stop being a typist and start being a director. Week 5 is about shipping — and shipping starts with a working v0 of your capstone, today, on your laptop. You have spent four weeks accumulating context, prompting muscle, a CLAUDE.md from Day 19, a repo, and a problem worth solving. Today you point a vibe-coding tool at it and iterate until something runs.

This is also a checkpoint. By the end of the day you submit a local prototype and a 200-word "director's commentary" explaining the prompts you wrote, the fights you had with the model, and the one moment you almost gave up. That reflection is the deliverable — the code is just evidence.

### Quick glossary

- **Vibe-coding** — directing an AI to write code from intent, not typing it yourself.
- **Spec** — the four-part brief (context, invariants, task, acceptance) you hand the model.
- **Director-not-typist** — the mindset flip: compress intent into English, don't compile English into code.
- **Iteration loop** — spec → code → review → iterate, repeated in short turns.
- **Context (CLAUDE.md)** — the persistent project brief the model reads every session.
- **Scaffolding** — boilerplate, CRUD, CSS, tests — low-cost surface where long-leash agents shine.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Week 5 kickoff — from typist to director |
| Mini-lecture | 20 min | The 4-part spec, tight vs long leash, debugging AI output |
| Live lab     | 20 min | Vibe-code a v0 slice of your capstone — spec, diff, review, iterate |
| Q&A + discussion | 15 min | Where vibe coding broke today and why |

**Before class** (~10 min): open your capstone repo, confirm your Day 19 CLAUDE.md is current, pick one small end-to-end slice you want to ship first.
**After class** (~30 min tonight): finish 5–8 iteration turns on your v0, commit after each accepted diff, record the 90-second screen capture, and write the 200-word director's commentary.

## Read: Director vs Typist — the mindset shift that unlocks AI-first building

Every engineer who is still slow with AI tools in 2026 is stuck in typist mode. A typist reads a Stack Overflow answer, retypes it into their editor, runs it, and debugs line by line. A typist thinks in characters. A director thinks in intent, constraints, and acceptance criteria. The director writes a spec, hands it to a capable junior (the model), reads the output critically, and redirects. The director never touches the keyboard to write code — but they do touch it to write specs, reviews, and rejections.

The mental flip is this: **your job is to compress your intent into unambiguous English, not to compile English into code**. If the model is confused, your spec was bad. If the code is wrong, your spec was incomplete. If the code is fragile, your spec missed the failure modes. The model is a mirror; blaming it is blaming your own prompt.

### The art of the spec

A good spec has four parts, and your CLAUDE.md from Day 19 already carries the first two:

1. **Context** — what the project is, what tech stack, what files exist, what conventions you follow. This is static; CLAUDE.md covers it.
2. **Invariants** — things that must never break. "All API routes must return JSON, never HTML." "No new dependencies without my approval." "TypeScript strict mode stays on."
3. **This task** — the specific change. Not "add login" but "add a `/login` page that accepts email + password, posts to `/api/auth`, stores the returned JWT in an httpOnly cookie, and redirects to `/dashboard` on success."
4. **Acceptance** — how you will know it is done. "I should be able to log in, refresh the page, and still be logged in." "If I type a wrong password I should see 'Invalid credentials' without the page reloading."

If you write those four parts before you press Enter, you will be in the top 5% of vibe coders. Most people skip to part 3 and wonder why the model keeps inventing libraries.

### Iteration loops — spec, code, review, iterate

Vibe coding is not a single prompt. It is a loop. Every turn through the loop has four moves:

- **Spec** — what I want next, with acceptance criteria.
- **Code** — the model writes it. You do not touch the keyboard except to approve diffs.
- **Review** — you read every changed file. You run the thing. You break the thing on purpose.
- **Iterate** — you feed back what is wrong. You do not rewrite; you redirect.

Most beginners break on the Review step. They see a diff that looks vaguely plausible, accept it, and move on. Then they discover four turns later that the model invented a function name that does not exist, wrote tests that import nothing, and silently removed a feature from last week. Review is not optional. Review is where directing happens.

A practical tip: keep turns short. If you are on turn 7 of a single conversation, the model is probably hallucinating context. Start a fresh session, hand it the CLAUDE.md and the current diff, and restate the goal.

### When to let AI off the leash

There are two modes. **Tight leash**: every change is a diff you review before it hits the disk. Cursor's chat and Claude Code's default mode feel like this. **Long leash**: the agent runs a loop, edits many files, runs tests, fixes errors, and only comes back when it is stuck. Claude Code's agent mode, Antigravity's background tasks, Replit Agent, and Emergent feel like this.

The heuristic:
- Tight leash when the code matters long-term: core logic, security boundaries, the data model.
- Long leash when the cost of a bad attempt is low: scaffolding, CSS, tests, migrations, boilerplate CRUD.

If you put long-leash agents on core logic without a strong test suite, you will wake up to a tangle. If you put tight leash on boilerplate, you will be there all day.

### Debugging AI output

The model will lie to you. Not maliciously — it will confidently ship code that does not run, import modules that do not exist, and call APIs that were deprecated in 2023. Three debugging reflexes will save you hours:

- **Run it immediately.** Never accept a diff you have not executed. Half the hallucinations die on the first `npm run dev`.
- **Read the stack trace to the model.** Paste the full error back. Do not paraphrase. The model is better at reading its own mistakes than you are.
- **Ask it to think out loud before it fixes.** "Before you change anything, tell me what you think is wrong and why." If the diagnosis is wrong, the fix will be wrong.

And the nuclear option: **ask for two solutions, pick one**. "Give me two different ways to solve this, with tradeoffs." You get better code and a small education for free.

### The capstone angle

You have three tools to try today — Cursor, bolt.new, Antigravity — but you will pick one as your primary. The choice is less about capability (they all work) and more about where your capstone lives. If you have an existing repo on your machine, Cursor is strongest. If you are building a web app from scratch and want it deployable in one click, bolt.new shines. If you want an agent running long-horizon tasks across many files with a planning UI, Antigravity is the new hotness. Try all three on the same small task first — rebuilding a landing page, say — then commit to one for the real work.

## Watch: Director's-chair vibe coding walkthrough

https://www.youtube.com/embed/LCEmiRjPEtQ

## Lab: Ship a v0 of your capstone

1. Open your capstone repo. Confirm your Day 19 CLAUDE.md is in the root and up to date.
2. Pick ONE primary tool — Cursor, bolt.new, or Antigravity. Open your capstone in it.
3. Write a **one-page spec** for the v0 scope. Not the whole product. The smallest end-to-end path a user can walk: input → AI call → output.
4. Run the spec → code → review → iterate loop until the v0 works locally. Target: 3 hours, 5–8 iterations.
5. Commit after every accepted diff. Your git log is your director's journal.
6. Record a 90-second screen capture of the v0 running.

## Quiz

1. What are the four parts of a good spec?
2. When should you use a long-leash agent vs a tight-leash chat?
3. What is the "read the stack trace to the model" reflex for?
4. Name one signal that a conversation has gone too long and you should start fresh.
5. Why is Review the step most beginners skip?

## Assignment

**Capstone Milestone 3 (daily, checkpoint):** Submit (a) a working local prototype of your capstone v0 — a recording and a repo link — and (b) a 200-word director's commentary. The commentary must name your primary tool, the single hardest prompt you wrote, one moment the model went off the rails and how you pulled it back, and one thing you would do differently next time.

## Discuss: Where does vibe coding stop working?

Share one part of your capstone where the model consistently failed today. Was it a domain-specific library, a subtle UX call, a security concern, a weird framework version? Post the spec you wrote, the output you got, and your theory about why the model struggled. The class will vote on the most interesting failure mode.
