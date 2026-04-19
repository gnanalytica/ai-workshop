---
reading_time: 15 min
tldr: "Stop re-prompting. Write CLAUDE.md + AGENTS.md once so your AI remembers your project every time — the real unlock of 2026."
tags: ["build", "technical"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Write your capstone's first CLAUDE.md + AGENTS.md + 3 slash commands", "url": "https://claude.com/claude-code"}
prompt_of_the_day: "You are a context engineer. Given my capstone description {{capstone_description}} and stack {{stack}}, draft a CLAUDE.md with these sections: Project Overview, Architecture, Coding Rules, File Locations, Testing Patterns, Common Pitfalls, Slash Commands. Make every rule actionable."
tools_hands_on: [{"name": "Claude Code", "url": "https://claude.com/claude-code"}, {"name": "Cursor", "url": "https://cursor.com"}]
tools_demo: [{"name": "Battle-tested CLAUDE.md examples", "url": "https://github.com/search?q=CLAUDE.md&type=code"}, {"name": "Custom slash commands (Claude Code)", "url": "https://docs.claude.com/claude-code"}]
tools_reference: [{"name": "Anthropic Claude Code docs", "url": "https://docs.claude.com/claude-code"}, {"name": "AGENTS.md spec", "url": "https://agents.md"}, {"name": "Cursor rules docs", "url": "https://docs.cursor.com/context/rules"}]
resources: [{"name": "Sample CLAUDE.md collection", "url": "https://github.com/search?q=filename%3ACLAUDE.md&type=code"}, {"name": "Claude Code hooks guide", "url": "https://docs.claude.com/claude-code"}]
---

## Intro

You've noticed the pattern by now: every time you open a new chat, you re-explain your project. The stack, the folder layout, the naming rules, "don't use class components", "we prefer pytest". That's wasted energy. Today we fix it permanently with **context engineering** — the shift from one-off prompts to reusable instruction files the AI reads automatically.

## Read: From prompting to context engineering

**The shift in one sentence.** Prompting is what you say. Context engineering is what the AI *already knows* before you say anything.

In 2023, the whole industry was obsessed with prompt wording — the perfect incantation. By 2026, the winning teams don't waste brain cycles on single prompts. They build a **context layer**: files, memory, tool definitions, and rules that travel with every AI interaction in their repo. The result: every new chat starts the AI at skill level 10 instead of level 0.

**CLAUDE.md and AGENTS.md — the standard instruction files.**

- **CLAUDE.md** is a markdown file Claude Code (and many other agents) automatically reads when you open a project. It's your project's "onboarding doc for an AI coworker".
- **AGENTS.md** is a vendor-neutral spec (see agents.md) pushed by OpenAI, Cursor, and others for the same purpose. Many projects now ship both — Claude reads CLAUDE.md; Codex, Cursor, and Aider read AGENTS.md.
- **.cursorrules** is Cursor's own flavour, increasingly being replaced by AGENTS.md.

A good instruction file has roughly these sections:

1. **Project Overview** — 3-sentence summary of what this repo does.
2. **Architecture** — ASCII or bullet diagram of the main components and how they talk.
3. **Stack & Conventions** — languages, frameworks, style guides. "TypeScript strict mode. React 19. Tailwind. No class components."
4. **File Locations** — where things live. "API routes: `app/api/`. Components: `components/`. DB migrations: `drizzle/`."
5. **Coding Rules** — dos and don'ts. "Always validate inputs with Zod. Never log secrets. Prefer composition over inheritance."
6. **Testing Patterns** — how to run tests, what framework, where mocks live.
7. **Common Pitfalls** — every gotcha someone burned 4 hours on once. "Don't import from `@/lib/db` in client components. SSR will crash."
8. **Slash Commands & Hooks** — custom shortcuts tailored to this project.

**Why a good CLAUDE.md saves hours.** Without it: every new chat, you explain the same 8 things. The AI guesses the rest wrong and you fix it twice. With it: you type "implement the signup flow" and the AI already knows to use Zod, put the route under `app/api/auth/signup/route.ts`, write a Vitest test alongside it, and not touch `lib/session.ts` (marked "frozen" in your CLAUDE.md). Real teams report 30–60% less back-and-forth after adopting this.

**Slash commands — workflows as muscle memory.** Claude Code lets you define custom commands under `.claude/commands/` (each is just a markdown file with a prompt template). Typing `/review` in Claude Code runs your review checklist. Typing `/ship` runs your pre-commit ritual. Typing `/debug-api` runs your standard API debugging walkthrough. Three you should always write:

- `/review` — "Review the current diff for reuse, quality, and security. Check against our CLAUDE.md coding rules. Output pass/fail per rule."
- `/plan` — "Given this task, produce a 5-step implementation plan with files touched and risks. Wait for approval before coding."
- `/explain` — "Explain this code to me like I'm new to the repo. Use our Architecture section as context."

**Hooks — automating the harness.** Hooks are scripts the Claude Code harness runs automatically at specific events — `PreToolUse`, `PostToolUse`, `Stop`. Common uses: auto-format after every file edit, run tests when Claude finishes, block a command that touches `.env`. Hooks live in `settings.json`. You configure once; they enforce forever. This is how "from now on, always run prettier after an edit" goes from memory-based (unreliable) to harness-enforced (ironclad).

**Project-level memory — the third layer.** Beyond CLAUDE.md there's per-session memory and user-level memory. The hierarchy:

- **User memory** (`~/.claude/CLAUDE.md`) — global preferences. "I'm Sandeep. My email is sandeep@gnanalytica.com. I prefer pnpm over npm."
- **Project memory** (`./CLAUDE.md`) — this repo's rules. Checked into git.
- **Session memory** — what the AI learned this conversation. Ephemeral.

Project memory is the highest-leverage layer because it's shared with your teammates.

**Evals for your context file itself.** The meta-move: evaluate your CLAUDE.md like you'd evaluate a prompt. Make a list of 10 realistic project tasks ("add an API route", "write a migration", "fix a bug in component X"). Give them to Claude Code with and without your CLAUDE.md. Compare quality. The delta tells you whether your context file is pulling its weight.

**What goes wrong when CLAUDE.md is bad.** Three anti-patterns:

- **Too vague.** "Write clean code" is not actionable. "No functions longer than 40 lines" is.
- **Too long.** A 2000-line CLAUDE.md chews your context window and confuses the model. Aim for 100–300 lines. Link out for the rest.
- **Stale.** Update it when your stack changes. An outdated CLAUDE.md is worse than none — it actively misleads.

**Bottom line.** Prompting is a skill. Context engineering is a leverage multiplier. Writing your first CLAUDE.md today will pay back every single chat you have for the rest of your capstone.

## Watch: A battle-tested CLAUDE.md, annotated

Instructor walks through a real 150-line CLAUDE.md from a production AI project — Project Overview, architecture diagram, coding rules, slash commands, hooks — calling out why each line exists. Then shows what happens when you delete it and start a fresh chat.

https://www.youtube.com/embed/VIDEO_ID <!-- TODO: replace video -->

- 100–300 lines is the sweet spot.
- Every rule should be testable (would a human know if it was violated?).
- Slash commands turn workflows into one-word shortcuts.
- Hooks turn rules into harness-level enforcement.

## Lab: Write your capstone's first CLAUDE.md

Budget 45–60 minutes. Do this in Claude Code (preferred) or Cursor.

1. Create a new folder for your capstone repo (or open an existing one). Run `git init` if it isn't a repo yet.
2. Open it in Claude Code. Ask: "Read my repo and draft a starter CLAUDE.md using the 8-section template." It will produce a draft from the files it sees.
3. Edit the draft. Remove fluff. Add **concrete, testable** rules — especially the Common Pitfalls section. Aim for 150–250 lines.
4. Read this, don't type it — this is the shape of what you're writing:

```markdown
# CLAUDE.md — Capstone: RAG Bot for College Handbook

## Project Overview
A RAG chatbot answering student queries from the 300-page handbook PDF.

## Stack
- Next.js 15 (App Router), TypeScript strict
- LlamaIndex + Ollama (local) / Groq (prod)
- pgvector on Neon

## Coding Rules
- Always use Zod for input validation on API routes.
- Never read PDFs at request time — use the ingested index.
- All prompts live in `prompts/` as .md files, never inline.

## Common Pitfalls
- Ollama defaults to port 11434. If absent, fall back to Groq.
- Do not touch `lib/ingest.ts` without re-running the full eval set.
```

5. Create an **AGENTS.md** that mirrors the essentials, tuned for non-Claude agents (Codex, Cursor). Keep it shorter — rules only.
6. Create 3 custom slash commands in `.claude/commands/`: `/review.md`, `/plan.md`, `/explain.md`. Each is a single-prompt markdown file.
7. (Bonus) Add one hook in `.claude/settings.json` — e.g., auto-run your linter after any file edit.
8. Test it. Open a fresh Claude Code session and ask it to implement one small capstone feature. Notice how much *less* you have to re-explain.

## Quiz

Four to ponder: What's the difference between CLAUDE.md, AGENTS.md, and `.cursorrules`? Why is 2000 lines of CLAUDE.md worse than 200? What's a slash command actually — magic or just a saved prompt? What's a hook, and when would you choose a hook over a rule in CLAUDE.md?

## Assignment

Ship a working **CLAUDE.md** + **AGENTS.md** + **3 custom slash commands** for your capstone repo. Commit them to git. In the cohort channel, paste: a screenshot of your repo's root showing these files, and one example task where CLAUDE.md made the AI noticeably smarter on the first try.

## Discuss: Leverage you can't unsee

- Which single rule in your CLAUDE.md do you expect to save the most hours?
- Which section (Architecture? Pitfalls? Slash Commands?) was hardest to write — and why?
- Should CLAUDE.md be checked into git publicly, or does it leak too much project detail?
- What would a team-wide "house style" CLAUDE.md look like across all projects?
- When would a hook be a better tool than a CLAUDE.md rule?
