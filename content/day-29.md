---
reading_time: 14 min
tags: ["capstone", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "6-hour studio build", "url": "https://langchain-ai.github.io/langgraph/"}
resources: [{"title": "LangGraph", "url": "https://langchain-ai.github.io/langgraph/"}, {"title": "MCP", "url": "https://modelcontextprotocol.io/"}, {"title": "Langfuse", "url": "https://langfuse.com/docs"}, {"title": "n8n docs", "url": "https://docs.n8n.io/"}]
---

## Intro

Today is the build. One day, a team, and a scoped one-pager. By the end you have a thin vertical slice running end-to-end, a rough eval, and a dry-run demo in the bag. This is not a code-all-day hackathon. It is a studio with pit stops. Miss a pit stop, the whole day drifts.

## Read: The studio mindset

A studio day has three properties that a hackathon doesn't: a fixed timeline, mandatory pit stops, and a non-negotiable end state. The end state today is **a working thin slice + an eval that runs + a 2-minute demo rehearsal recorded**. Everything you do is in service of that.

### One rule above all: end-to-end before wide

Get the worst version of the full flow working in the first 3 hours. Ugly UI, hardcoded data, 3-out-of-10 eval pass rate. Then, and only then, improve the worst part. Teams that spend the first 5 hours polishing one component lose Saturday.

### Failure modes of build day

| Failure | Looks like | Fix |
|---|---|---|
| **Spec drift** | "What if we also added…" | Re-read the one-pager out loud hourly. |
| **Tool rabbit hole** | 3 hours on a flaky tool | Time-box 45 min; if stuck, mock the tool. |
| **Silent divergence** | Two teammates rewrite the same thing | 15-min standups at each pit stop. |
| **Eval neglect** | "We'll write tests after" | Write them before the fancy UI. |

### What to capture as you build

You'll want this on Sunday. Have one shared doc open all day:

- Every **decision** with a 1-sentence rationale (picked GPT-4.1-mini over 4.1 because cost; picked SQLite over Postgres because ship).
- Every **screenshot** of a working feature.
- Every **failure** and what you did about it.

This doc becomes Sunday's narrative. You cannot reconstruct it later.

## Watch: One team's build day, in 6 minutes

A time-lapsed build day from a prior cohort, with voice-over at each pit stop explaining what they cut and what they kept.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch the moment they abandon a feature at hour 3.
- Notice when they commit to the stack and stop switching.
- Pay attention to the dry-run at the end of the day.

## Studio protocol: the 6-hour timeline

Treat this timeline as the contract. The pit stops matter more than the blocks between them.

### Morning block — Working spec + UI skeleton (0:00–2:00)

1. **0:00–0:15** — Stand-up. Re-read the one-pager. Name today's DRI (rotate from Day 28 if you want). Each person states what they're doing first.
2. **0:15–1:00** — Working spec in the repo: a `SPEC.md` that lists every function signature, every tool, every screen, every eval case topic. No code yet — just the list.
3. **1:00–2:00** — UI skeleton + project skeleton. If you're building a web app, get the empty pages routing. If an agent, the empty graph compiling. If an MCP server, the server registering with Claude Desktop with no-op tools. The **skeleton must run**.

**Pit stop at 2:00** — 10 minutes. Show each other the skeleton. Commit. If the skeleton doesn't run, drop one scope item until it does.

### Midday block — Thin vertical slice (2:00–4:00)

4. **2:00–3:30** — End-to-end happy path. Hardcode where you must. One prompt flowing through one model through one tool (or one step) to one output. Ugly is fine; working is required.
5. **3:30–4:00** — Wire the real input UI and the real output UI. No extra features; only what the one-pager promised.

**Pit stop at 4:00** — 15 minutes. Run the slice five times in a row. It should feel like a product, even a bad one. If it doesn't flow, fix the flow before anything else.

### Afternoon block — Polish + eval (4:00–5:30)

6. **4:00–4:45** — Write the 10 eval cases into `eval/cases.jsonl`. Write a tiny runner that calls your system and marks each pass/fail. Record the baseline pass rate in `EVAL.md`.
7. **4:45–5:30** — Fix the two biggest ugliness points: one UX (loading state, error text, empty state) and one model-quality point (prompt tightening, adding a validator, switching a tool).

**Pit stop at 5:30** — 10 minutes. Re-run eval. Compare to baseline. Commit.

### Evening block — Dry-run demo (5:30–6:00)

8. **5:30–5:40** — Prepare demo assets: pre-opened tabs, pre-typed prompts in a scratchpad, a clean browser window.
9. **5:40–5:55** — Do two full dry-runs, with one teammate acting as panelist. Record the second one on your phone.
10. **5:55–6:00** — Write tomorrow's three polish items. Not twenty — three. These are the only things you are allowed to change Saturday.

### Template for the day's captured decisions

Keep this in `DECISIONS.md`:

```markdown
## Decisions log — build day

- [09:12] Chose LangGraph over CrewAI — team already fluent.
- [10:45] Cut "multi-user" from scope — auth would eat 2 hours.
- [12:30] Switched retrieval from Chroma to SQLite FTS — fewer moving parts.
- [14:05] Added a confirmation gate before write tool — safety > convenience.
- [16:20] Baseline eval: 6/10 pass. After prompt fix: 8/10.
```

The log is gold on demo day. Every entry is a credible answer to a panel question.

## Assignment

Upload two things to the cohort channel:

1. A link to your in-progress repo with today's commits.
2. A **build-day reflection** (≤ 400 words) covering: what you cut and why, what surprised you about the model's behavior, one concrete thing you'd change if you did this build again, and how confident you are (1–5) that Sunday's demo will work.

No quiz today.

## Discuss: Studio retro

Gather as a team for 15 minutes before you close the laptops.

- Did we hit the 2-hour skeleton pit stop cleanly? If not, why — spec or skill?
- Which cut hurt most? Is it really cut, or will it sneak back Saturday?
- Did the DRI role help or feel awkward today? Should it rotate tomorrow?
- Where did our eval surprise us — too easy, too hard, or wrong job?
- What is the single moment in the demo that we need to absolutely nail on Sunday?
