---
reading_time: 14 min
tldr: "Agents = LLMs + tools + a loop. The magic, the fragility, and the future of applied AI."
tags: ["agents", "product", "discussion"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Map the agent you'd actually build", "url": "https://langchain-ai.github.io/langgraph/"}
resources: [{"title": "LangGraph docs", "url": "https://langchain-ai.github.io/langgraph/"}, {"title": "CrewAI docs", "url": "https://docs.crewai.com/"}, {"title": "Browser-use", "url": "https://github.com/browser-use/browser-use"}, {"title": "Anthropic: Building effective agents", "url": "https://www.anthropic.com/research/building-effective-agents"}]
---

## Intro

For three weeks you built things that answer. This week you build things that act. An agent is not a cleverer chatbot — it is a program that chooses its next step based on what just happened. That freedom is the feature and the failure mode. Today we ground the word "agent" so you stop using it loosely.

## Read: What an agent actually is

A useful working definition, borrowed from Anthropic and hardened through 2025: an **agent** is an LLM in a loop that decides which tool to call, sees the result, and decides again — until a stop condition. Everything else — memory, planning, multi-agent routing — is an optimization over that loop.

### The ReAct loop, demystified

The canonical shape is **Reason → Act → Observe**, repeated. On paper:

```
┌──────────────┐
│  User goal   │
└──────┬───────┘
       ▼
   ┌───────┐     ┌──────────┐
   │ Think │ ──▶ │ Tool call│
   └───▲───┘     └────┬─────┘
       │              ▼
       │        ┌──────────┐
       └──────  │ Observe  │
                └──────────┘
                     │
                     ▼
                  Done?
```

The loop has four moving parts worth naming explicitly:

| Part | What it does | Where it breaks |
|---|---|---|
| **Reasoner** | Picks the next tool + arguments | Hallucinates tools; over-plans |
| **Tools** | Actual side-effectful capabilities | Flaky APIs, bad schemas |
| **Observation** | Feeds tool output back | Blows up context window |
| **Stop condition** | Ends the loop | Never triggers → infinite spin |

If you can't point at these four in your agent's code, you don't have an agent, you have a vibe.

### Workflow vs. agent — and why you want the workflow most days

Most "agent" products in 2026 are actually **workflows**: a fixed DAG of LLM calls with tools in known positions. They are cheaper, faster, and easier to evaluate. Use a true agentic loop only when the path genuinely can't be known up front — research, debugging, open-ended web tasks.

> Rule of thumb: if you can draw the state diagram in under 10 nodes, don't use a free-form agent. Hard-code the graph.

### The three failure modes you will hit

1. **The thrash** — the model calls the same tool with slightly different args forever. Fix: dedupe by argument hash, cap iterations.
2. **The confident wrong** — model fabricates a tool output or ignores a real one. Fix: validate tool results with a schema; log observation text back verbatim.
3. **The context bomb** — 40 tool observations later, the prompt is 180k tokens of logs. Fix: summarize intermediate observations, keep only the last N raw.

### Worked example: "book me a quiet study room for Thursday"

What tools does this agent need?

- `list_rooms(building, date)` — availability
- `get_noise_profile(room_id)` — historical noise data
- `check_my_calendar(date)` — my free slots
- `book_room(room_id, start, end)` — the commit step

The reasoner's job: intersect free slots with available quiet rooms, propose one, confirm, book. Notice: booking is irreversible — that tool needs a human confirmation gate. Good agents distinguish **read tools** (cheap, retry freely) from **write tools** (gated, logged, undoable).

## Watch: How to think about agents in 2026

Short talk contrasting workflows, agents, and multi-agent systems — with specific guidance on when each pays off.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch for how they define the stop condition — most teams skip this.
- Notice how they handle write actions vs. read actions.
- Note the cost curves: agents get expensive fast when loops don't terminate.

## Lab: Paper-map the agent you'd actually build

No code today. Pick a real task from your life — not a toy. Examples: "triage my GitHub notifications", "pick a weekend movie from what's on my streaming services", "update my resume from my last 3 commits". Then:

1. On paper, write the user goal in one sentence. If it takes two, split it.
2. List every **tool** the agent would need. Separate read vs. write.
3. Draw the ReAct loop for a happy path — number the steps.
4. Identify the **stop condition**. "When the model says done" is not one; be specific.
5. Identify the **failure mode** you'd hit first. Thrash, confident wrong, or context bomb?
6. Decide: is this actually a workflow? If you can draw a fixed DAG, redraw it as a DAG.
7. Add a human-in-the-loop gate before every write tool. Mark which actions need confirmation.
8. Estimate cost: guess tokens per iteration × expected iterations × price. Is this <$0.10 per run? If not, redesign.
9. Sketch the eval: how would you know the agent did the task right on 10 test cases?
10. Photograph your paper map. Post it in the cohort channel.

## Quiz

Four short questions on ReAct anatomy, when to prefer a workflow over an agent, and what a stop condition really is. Expect one trick question about multi-agent systems — most of them are just workflows with extra steps.

## Assignment

Write a one-page spec for your paper-mapped agent. Include: the user, the goal, the tool list with read/write tags, the stop condition, and the first failure mode you expect. End with one paragraph on why an agent is the right shape here vs. a hard-coded workflow. If you can't defend that choice, your assignment is to redesign it as a workflow.

## Discuss: Agents, agency, and taste

- When does "agent" add real value over a good workflow, and when is it a résumé word?
- Who owns the action when an agent books the wrong room — the user, the builder, the model provider?
- How do you explain to a non-technical user what your agent can and cannot do?
- What is the smallest agent you've used that actually worked for you? What made it work?
- Multi-agent systems: real pattern or hype? Where have you seen one genuinely outperform a single well-prompted loop?
