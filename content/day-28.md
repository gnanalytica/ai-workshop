---
reading_time: 14 min
tldr: "Capstone kickoff. Pick small, scope brutally, commit to shipping a working thing in 48 hours."
tags: ["capstone", "product", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "90-minute scoping sprint", "url": "https://www.svpg.com/"}
resources: [{"title": "SVPG / Marty Cagan", "url": "https://www.svpg.com/"}, {"title": "YC library", "url": "https://www.ycombinator.com/library/"}, {"title": "LangGraph", "url": "https://langchain-ai.github.io/langgraph/"}, {"title": "MCP", "url": "https://modelcontextprotocol.io/"}]
---

## Intro

Three days from now you demo. Today you pick what you're demoing, who you're building it with, and — hardest of all — what you are not building. This is a scoping day disguised as a kickoff. If you leave with a fuzzy idea, Thursday's build day will be chaos. Leave with a one-pager.

## Read: The one-week-ship mindset

A capstone is not a mini-startup. It is a sharply scoped demonstration that you can take a real problem, pick an AI-shaped approach, and ship something a stranger can use. The grading rubric on Sunday will reward **working + narratable + honest** over **ambitious + unfinished**.

### The four capstone archetypes

Pick one. Don't invent a fifth.

| Archetype | Shape | Best for |
|---|---|---|
| **Vertical agent** | A LangGraph agent with 3–6 tools for one domain task | Teams who finished Day 23 cleanly |
| **MCP server + client** | A useful MCP server plugged into Claude/Cursor | Teams who enjoyed Day 24 |
| **Workflow app** | Deterministic pipeline with 2–4 model calls + a clean UI | Teams strong on UX |
| **Eval-first system** | A non-trivial task with a serious eval + optimization loop | Teams who geek out on measurement |

Each archetype has been done well in one week. Picking an archetype is half the scoping work.

### The 1-week scope rule

Budget: roughly 12 focused hours across Thursday's build day, a debug window Friday, and the Saturday polish. Not 80. Scope accordingly.

- 1 user, 1 job, 1 happy path. Ship that end-to-end.
- 2 features is the max. If you're at 3, cut.
- 0 new infrastructure. Use what you know. This is not the week to learn Kubernetes.

### The "what shipped means" contract

For Sunday's demo, "shipped" means:

1. A stranger can try it from a link or a one-line install command.
2. It has an **eval** — at least 10 test cases, pass/fail scored, in the repo.
3. It has a **README** a classmate can follow without you.
4. You can demo the happy path in 2 minutes **without touching code**.

If any of the four are missing, it's not shipped. Adjust scope until all four fit in your time budget.

### Team formation, briefly

- **2 or 3 people.** Solo is allowed but discouraged. 4+ is banned — coordination cost kills a 1-week build.
- **Complementary skill bias.** One builder-heavy, one product/UX-heavy is the strongest pair.
- **One repo, one branch strategy.** Decide main vs. feature branches today, not Thursday.
- **Name a DRI.** Not a boss — a decider. When you're stuck in a 20-minute argument, the DRI calls it.

### Scoping worksheet

Fill this in as a team, today. Print it, tape it to the wall, don't change it after Thursday morning.

```
CAPSTONE ONE-PAGER
==================

Team: _______________________________________________
DRI: ________________________________________________
Archetype: [ ] Vertical agent  [ ] MCP server+client
           [ ] Workflow app    [ ] Eval-first system

USER
----
Who specifically (name + context): _________________
What job are they hiring this for: _________________

THINNEST SLICE
--------------
The one happy path we will demo on Sunday:
  1. User does __________________________________
  2. System does ________________________________
  3. User sees __________________________________

IN SCOPE (max 2 features)
  - _____________________________________________
  - _____________________________________________

EXPLICITLY OUT OF SCOPE (at least 3 tempting things)
  - _____________________________________________
  - _____________________________________________
  - _____________________________________________

STACK
-----
Model(s): _____________________________________
Framework: ____________________________________
Storage: ______________________________________
UI: ___________________________________________

EVAL
----
10 test cases will live in: eval/cases.jsonl
Pass criterion (per case): ______________________
Target pass rate for Sunday: _____%

COST
----
Estimated cost per run: $______
Monthly ceiling we'll accept: $______

RISKS (top 2)
  - _____________________________________________
  - _____________________________________________

ON SUNDAY, WE'LL KNOW WE WON IF:
  _______________________________________________
```

### Worked example: a too-big idea, scoped down

**Idea:** "An AI career coach that reviews my resume, interviews me, plans my prep, and schedules mock interviews with peers."

**Scoped:** "A LangGraph agent that takes a job posting URL and my resume, and produces three specific, cited weak claims on my resume with a rewrite for each. No interviews, no scheduling, no peers. Demo: paste URL, paste resume, see the 3 rewrites in 15 seconds."

Same intent, one-tenth the surface area, demoable. Your scoping job is to do this to your own idea, today.

## Watch: How real builders cut scope

A short with a founder talking through what they cut from their first ship and what they kept. The cuts are the lesson.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch for the moment they kill a feature they were excited about.
- Notice how they frame the thinnest slice.
- Pay attention to how they define "done" up front.

## Lab: 90-minute scoping sprint

This is a studio session, not homework. Block 90 minutes with your team.

1. **0:00–0:15** — Each teammate writes two capstone ideas on index cards, solo.
2. **0:15–0:30** — Share cards, cluster, pick one direction by dot-vote.
3. **0:30–0:45** — Assign the archetype. Name the single user and the single job out loud.
4. **0:45–1:00** — Fill out the in-scope / out-of-scope sections of the worksheet. Out-of-scope must have at least three items, and at least one must be "something we actually want to build but won't."
5. **1:00–1:15** — Write the thinnest slice as three sentences. Then mime the demo: one person pretends to be the user, one narrates, one times it. If it takes more than 2 minutes, cut again.
6. **1:15–1:30** — Name the DRI. Pick the stack. Estimate cost per run. Write the 10 eval cases' topics (not the cases themselves — just topics). Sign the worksheet.
7. Post a photo of the signed worksheet in the cohort channel.

## Quiz

Two light questions. (1) What makes a capstone "shipped"? (2) Given a description of a team's scope, identify which of the in-scope items should move to out-of-scope.

## Assignment

Submit your capstone one-pager as a single markdown file in a fresh GitHub repo (empty otherwise). File name: `CAPSTONE.md`. Include every section from the worksheet. Link the repo in the cohort channel. If your one-pager has the word "and" between two features, you haven't scoped yet — revise.

## Discuss: Scoping is the hard part

- Which item on your out-of-scope list was hardest to cut? Why did you want it?
- Are your two features actually independent, or does one depend on the other? If dependent, can the dependency be faked Sunday?
- The DRI role — comfortable or uncomfortable? How will your team use it?
- What's the demo moment you can already picture? If you can't picture one, what's missing?
- Name one thing your team disagrees on after this session. What would resolve it — data, a spike, or a coin flip?
