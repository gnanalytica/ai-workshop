---
day: 20
date: "2026-05-28"
weekday: "Thursday"
week: 4
topic: "Context Engineering: CLAUDE.md, AGENTS.md, Rules and Skills"
faculty:
  main: "Harshith"
  support: "Sanjana"
reading_time: "10 min"
tldr: "Stop re-explaining your project to the AI every time. In **Antigravity** (primary) you write a CLAUDE.md, an AGENTS.md, a Cursor rule if you use optional Cursor, and a tiny Skill — and watch the same model behave like it's been on your team for a year."
tags: ["context-engineering", "tooling", "claude", "cursor"]
software: ["Antigravity", "Cursor (optional)"]
online_tools: ["Claude"]
video: "https://www.youtube.com/embed/eBVi_sLaYsc"
prompt_of_the_day: "Read CLAUDE.md and AGENTS.md before doing anything. Then add a /health endpoint to our Express app following the conventions you find there. List the conventions you used."
tools_hands_on:
  - { name: "Antigravity (Google)", url: "https://antigravity.google/" }
  - { name: "Cursor (optional)", url: "https://cursor.com/" }
  - { name: "Claude (web)", url: "https://claude.ai/" }
tools_reference:
  - { name: "Anthropic — Claude Code best practices", url: "https://www.anthropic.com/engineering/claude-code-best-practices" }
  - { name: "Cursor Rules docs", url: "https://docs.cursor.com/context/rules" }
resources:
  - { title: "agents.md spec", url: "https://agents.md/" }
  - { title: "Anthropic Skills overview", url: "https://docs.anthropic.com/en/docs/agents/skills" }
lab: { title: "Wire up CLAUDE.md, AGENTS.md, a Cursor rule, and a Skill", url: "https://cursor.com/" }
objective:
  topic: "Context Engineering: CLAUDE.md, AGENTS.md, Rules and Skills"
  tools: ["Antigravity", "Cursor (optional)", "Claude"]
  end_goal: "A repo where any agent — Claude Code, Cursor, Antigravity — picks up your conventions on the first turn, with no hand-holding."
---

By Day 20 you've written enough AI-assisted code to feel the tax: every new chat starts dumb. Today we fix that. Context engineering is the discipline of writing *for the model that will read your repo tomorrow*.

## 🎯 Today's objective

**Topic.** Context Engineering: CLAUDE.md, AGENTS.md, Rules and Skills.

**By end of class you will have:**
1. A working `CLAUDE.md` and `AGENTS.md` in your capstone repo, each under 60 lines, no fluff.
2. One Cursor rule (`.cursor/rules/*.mdc`) that auto-applies when you edit a specific folder.
3. One reusable Skill (a `SKILL.md` + helper file) that survives across chats.

> *Why this matters.* Day 21 you deploy your capstone. If your context files are honest, the agent stops asking "where does auth live?" every turn.

## ⏪ Pre-class · ~25 min

### Setup (required)

- [ ] **Antigravity** installed and signed in (primary). **Cursor** only if you want the optional second editor and `.cursor/` rules in-tree.
- [ ] Your capstone repo cloned locally with at least 3 files of real code in it.
- [ ] Claude.ai tab open for cross-checking your context files.

### Primer (~10 min)

- **Watch:** "Claude Code in 30 minutes" — https://www.youtube.com/watch?v=eBVi_sLaYsc — focus on the CLAUDE.md section.
- **Read:** the agents.md homepage (5 min). Notice how short the spec is.
- **Skim:** Cursor Rules docs — the `alwaysApply` vs `globs` vs `manual` distinction.

### Bring to class

- [ ] One sentence: *"The thing the AI keeps getting wrong about my project is ___."* That sentence is the first line of your CLAUDE.md.

> 🧠 **Quick glossary.** **CLAUDE.md** = repo memory that Claude Code auto-reads. **AGENTS.md** = vendor-neutral version, same idea. **Rule** = Cursor's per-folder/per-glob context. **Skill** = packaged instructions + scripts an agent can invoke by name.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Why every new chat is dumb | 10 min | The repeating-yourself tax |
| CLAUDE.md vs AGENTS.md vs Rules vs Skills | 15 min | Where each one fits |
| Live edit: Harshith's repo | 15 min | Watch the file shrink as it gets sharper |
| Lab | 15 min | You write yours |
| Show + tear-down | 5 min |  |

### The four layers, plain

1. **CLAUDE.md / AGENTS.md** — *what this repo is + non-obvious conventions*. Lives at repo root. Read every turn.
2. **Sub-CLAUDE.md** — folder-scoped overrides. Useful for `/migrations` or `/edge-functions`.
3. **Cursor rules** — IDE-specific, glob-triggered. Best for "when editing `*.tsx`, prefer Server Components."
4. **Skills** — invoked by name. Best for repeated workflows: `/graphify`, `/security-review`.

### Rules of thumb

- **Write what's not obvious.** "Use TypeScript" is noise. "Filter submissions via `assignments!inner(cohort_id)` — there is no direct `cohort_id`" is gold.
- **One file, one job.** If CLAUDE.md is doing five things, split it.
- **Delete more than you add.** Every line costs tokens on every turn.

## 🧪 Lab: Wire your repo for agents

In your capstone repo:

1. Create `CLAUDE.md` at the root. Sections: *What this is* (2 lines), *Key surfaces* (file map), *Non-obvious architecture* (the gotchas), *Conventions*. Cap at 60 lines.
2. Create `AGENTS.md` — copy CLAUDE.md, strip Anthropic-specific bits, point both at the same content if identical.
3. Create `.cursor/rules/styling.mdc` with `globs: ["**/*.tsx", "**/*.css"]` and 5 lines of styling rules.
4. Create `.claude/skills/changelog/SKILL.md` — a tiny skill that, given a git diff, writes one-line changelog entries.
5. Open a fresh Cursor chat: ask "What does this repo do, and what's one gotcha?" Verify it answers from your file, not from guessing.

**Artifact.** Push the four files. Paste the link to your repo + a screenshot of Cursor quoting your CLAUDE.md back, in the cohort channel.

> ⚠️ **Tell.** If the model answers correctly *without* citing your files, you wrote noise. Rewrite.

## 📊 Live poll

**Which layer will you actually maintain in 3 months?** CLAUDE.md / AGENTS.md / Cursor rules / Skills / *honestly, none*. We'll discuss the honest answer.

## 💬 Discuss

- What's one convention in your repo that *only you* know? That's your CLAUDE.md line 1.
- Where does a Cursor rule beat CLAUDE.md, and vice versa?
- A Skill vs a long prompt — when is each worth it?

## ❓ Quiz

Short quiz on file precedence, glob triggering, and when a Skill beats a rule. Open on your dashboard during class.

## 📝 Assignment · Context that earns its tokens

**Brief.** Submit your repo URL with `CLAUDE.md`, `AGENTS.md`, one rule, one Skill. In a 100-word note, paste **one before/after**: a question the agent got wrong without your context, and got right with it.

**Submit.** Repo URL + note on the dashboard before next class.

**Rubric.** Specificity of conventions (4) · Before/after evidence (4) · File hygiene — under 60 lines, no fluff (2).

## 🔁 Prep for next class

Day 21 is **Capstone Milestone 4: Workspace Setup and First Deploy**.

- [ ] Confirm Node.js 20+, Python 3.11+, and Git are installed and on PATH.
- [ ] Create accounts on **Vercel** and **Supabase** with your college email.
- [ ] Pick the *smallest possible* slice of your capstone you could deploy tomorrow. One page is fine.

## 📚 References

- [Anthropic — Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices) — the canonical CLAUDE.md guide.
- [agents.md](https://agents.md/) — the cross-vendor spec.
- [Cursor Rules](https://docs.cursor.com/context/rules) — globs, alwaysApply, examples.
- [Anthropic Skills](https://docs.anthropic.com/en/docs/agents/skills) — when to package vs prompt.
