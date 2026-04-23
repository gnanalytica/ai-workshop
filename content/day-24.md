---
reading_time: 18 min
tldr: "Two agents that delegate beat one agent that tries everything — today you wire up a swarm, a skill, and a plugin."
tags: ["build", "ship", "agentic"]
video: https://www.youtube.com/embed/wgmCjrMFoyc
lab: {"title": "Build a 2-agent delegating workflow with Claude Agent SDK or OpenAI Swarm", "url": "https://docs.claude.com/en/api/agent-sdk"}
prompt_of_the_day: "You are the supervisor. You have two worker agents: {{agent_a}} and {{agent_b}}. For the user request '{{request}}', decide which worker to call first, what to pass them, and what to do with their output. Hand off explicitly and never do the worker's job yourself."
tools_hands_on: [{"name": "Claude Agent SDK", "url": "https://docs.claude.com/en/api/agent-sdk"}, {"name": "OpenAI Swarm", "url": "https://github.com/openai/swarm"}, {"name": "OpenClaw", "url": "https://github.com/openclaw/openclaw"}]
tools_demo: [{"name": "AutoGen", "url": "https://microsoft.github.io/autogen/"}, {"name": "Claude Skills", "url": "https://docs.claude.com/en/docs/build-with-claude/skills"}, {"name": "Claude Plugins", "url": "https://claude.com/plugins"}]
tools_reference: [{"name": "LangGraph multi-agent", "url": "https://langchain-ai.github.io/langgraph/concepts/multi_agent/"}, {"name": "CrewAI flows", "url": "https://docs.crewai.com/concepts/flows"}, {"name": "OpenAI Agents SDK", "url": "https://openai.github.io/openai-agents-python/"}, {"name": "DeepLearning.ai agent courses", "url": "https://deeplearning.ai"}, {"name": "Magentic-One", "url": "https://www.microsoft.com/en-us/research/publication/magentic-one"}, {"name": "Meta CICERO", "url": "https://ai.meta.com/research/cicero/"}]
resources: [{"name": "Anthropic: multi-agent research system", "url": "https://www.anthropic.com/engineering/multi-agent-research-system"}, {"name": "OpenAI Swarm on GitHub", "url": "https://github.com/openai/swarm"}]
objective:
  topic: "Multi-agent orchestration — supervisor, swarm, hierarchical + Claude Skills and Plugins"
  tools: ["Claude Agent SDK", "OpenAI Swarm", "Claude Skills", "Claude Plugins", "OpenClaw"]
  end_goal: "Ship a working 2-agent delegating workflow with typed handoffs, three traces, a handoff diagram, and a one-paragraph rationale."
---

## 🎯 Today's objective

**Topic.** Multi-agent orchestration. Why two narrow agents beat one bloated agent, the three patterns (supervisor / swarm / hierarchical), and how Claude Skills and Plugins package reusable agent behavior.

**Tools you'll use.** Claude Agent SDK or OpenAI Swarm for the core lab; Claude Skills and Plugins as the packaging story; OpenClaw as an open-source reference.

**End goal.** By the end of today you will have:
1. A working 2-agent workflow (supervisor or swarm) with a typed handoff payload.
2. Three exported traces showing the handoffs end-to-end.
3. A handoff diagram + one-paragraph rationale explaining the role split.

> *Why this matters:* Yesterday's single agent hits a ceiling fast. Splitting roles is the first real architecture choice you'll make for your capstone.

---

### 🌍 Real-life anchor

**The picture.** A busy restaurant: front desk takes the order, kitchen cooks, runner plates. One person trying to greet, chop, and bill at once burns the food and forgets the change.

**Why it matches today.** Multi-agent splits **roles** so each "person" has a small job, clear handoff, and fewer collisions — same idea as supervisor / swarm patterns.

## ⏪ Pre-class · ~20 min

**Faculty note.** Budget ~2 minutes for the 🌍 *Real-life anchor* above — read it aloud or ask one volunteer to restate it in their own words — so the analogy lands before setup.

**Revision / context.** Day 23 gave you one agent in a loop with tools via LangGraph, plus your first MCP server. You met the five predictable break-modes (infinite retry, goal drift, hallucinated tools, context blow-up, premature success). Today, the fix for several of those failures is *structural*: stop stuffing one agent, split the work.

### Quick glossary

- **Multi-agent** — separation of concerns: narrow roles, small toolsets, clear inputs and outputs.
- **Supervisor** — a boss agent that delegates to workers and decides the next step.
- **Swarm** — peer-to-peer handoffs between agents without a central supervisor.
- **Skills** — packaged, auto-loaded instruction bundles that teach a Claude agent a specific task.
- **Plugins** — installable bundles of skills, commands, hooks, and MCP servers shipped as one unit.
- **Handoff** — the function an agent calls to transfer control to another agent.
- **Orchestration** — how agents, handoffs, and state compose into a workflow.

### Setup
- [ ] Confirm your Day 23 LangGraph agent runs end-to-end — you need a working single-agent baseline before splitting it.
- [ ] Install either [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk) (`pip install claude-agent-sdk`) OR [OpenAI Swarm](https://github.com/openai/swarm) (`pip install git+https://github.com/openai/swarm.git`).
- [ ] Pick one capstone task that naturally splits in two roles — researcher+writer, planner+coder, intake+responder.
- [ ] Stub two system prompts, one per role, before class.

### Primer (~5 min)
- **Read**: [Anthropic — multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) (skim the architecture diagram).
- **Watch** (optional): [Two agents doing the tango](https://www.youtube.com/embed/wgmCjrMFoyc).

### Bring to class
- [ ] The two stub system prompts.
- [ ] A clear handoff payload sketch (what Agent A passes to Agent B).
- [ ] A tracing dashboard ready (Claude traces or OpenAI dashboard).

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | One bloated agent vs two narrow ones |
| Mini-lecture | 20 min | Supervisor, swarm, hierarchical; Swarm's two primitives; Skills and Plugins |
| Live lab     | 20 min | Build a 2-agent delegating workflow with Claude Agent SDK or OpenAI Swarm |
| Q&A + discussion | 15 min | When did one agent become two in your capstone |

### In-class checkpoints

- **Live poll (LMS)** — Run the **dashboard Live poll** for today so counts match in-class discussion (same wording as the official cohort poll for this day).
- **Lab confidence (quick)** — After the live lab: fist-of-5 on shipping tonight's artifact (Zoom hands; not graded).
- **Cold-open**: in 10 words, why did your Day 23 single agent get confused?
- **Think-pair-share**: 90 seconds — name a two-role split in your capstone; partner tries to collapse it back to one agent. Who wins?
- **Live poll**: supervisor, swarm, or hierarchical for your capstone? Post S / W / H with one-line reason.
- **Handoff design breakout**: pairs draft the JSON payload Agent A hands to Agent B — inputs, outputs, what must never leak.
- **Skill-or-prompt debate**: one teammate argues "skill", another "just put it in the system prompt". 60 seconds each.

### Read: Orchestration patterns, Swarm minimalism, Skills, and Plugins

#### Why multi-agent at all

A single agent with twelve tools becomes a jack-of-all-trades. Its system prompt bloats. Its tool-choice accuracy drops. Its context fills with irrelevant observations from tools it did not need. The classic symptom: the more capable you try to make one agent, the worse it gets at any single task.

Multi-agent architecture is a separation-of-concerns move. Each agent has a narrow role, a focused system prompt, a small toolset, and clear inputs and outputs. You compose them into a workflow. Two good small agents beat one bloated big agent, the same way two good microservices beat one monolith for a certain class of problem.

Multi-agent is not free. You pay in latency (handoffs add turns), cost (each agent uses tokens), and complexity (debugging a swarm is harder than debugging a loop). Use it when the roles are genuinely distinct, not because "more agents" sounds impressive.

#### Three orchestration patterns

**Supervisor.** A single "boss" agent reads the user request and delegates to worker agents. Workers return results to the supervisor, which decides the next step. This is the pattern most production systems use because it is easy to reason about. LangGraph's supervisor template and CrewAI's hierarchical process are both supervisor patterns.

**Swarm.** Agents can hand off to each other directly, peer-to-peer, without going through a central supervisor. The current agent decides which other agent should take over, and control transfers. OpenAI Swarm is the canonical minimal implementation — about 300 lines of Python — and its strength is simplicity. The weakness: without a supervisor, it is easy to build loops where A hands to B hands back to A forever.

**Hierarchical.** Supervisors of supervisors. A top-level agent delegates to mid-level agents, which have their own workers. Useful for genuinely large problems — think a research team where an editor-in-chief delegates to section editors who delegate to writers. Cost scales fast; use sparingly.

As a starter heuristic: use supervisor unless you have a clear reason to use swarm or hierarchical. It is the pattern with the best debuggability-to-power ratio.

#### OpenAI Swarm minimalism

Swarm is worth studying even if you never ship it to production. It shows how much you can do with two primitives:

- **Agents** — a name, instructions, a set of functions (tools), and a list of other agents this one can hand off to.
- **Handoffs** — a function the agent can call that returns another agent. Swarm replaces the active agent and continues the loop.

That is the whole framework. No graph, no roles, no plans — just agents and handoffs. Read the source. It will change how you think about the more complex frameworks.

#### Claude Skills — reusable agent behaviors

A Claude Skill is a packaged unit of instructions plus optional tools that teaches a Claude agent how to do a specific task. Skills live in a folder, ship as markdown with a small manifest, and get auto-loaded when their description matches the user's request. Think of them as "docstrings you can install" for agents.

The killer property is **context efficiency**. Instead of stuffing every possible instruction into your system prompt, you let the agent discover the right skill on demand. A 200-line skill for "writing a SQL migration" only enters context when the user asks about migrations. The rest of the time, it costs nothing.

If you have found yourself copy-pasting the same multi-paragraph instruction into every new project — "here is how we format commits", "here is our API style", "here is our brand voice" — that is a skill waiting to be written.

#### Claude Plugins — distributing agent behavior

A Claude Plugin bundles skills, commands, hooks, and MCP servers into a single installable unit. Where a skill is one behavior, a plugin is a whole pack: a team's conventions, tools, and workflows shipped as one. Plugins have a marketplace; skills are the ingredients.

The plugin model matters because it turns agent configuration from a local hack into a shareable artifact. Your team can publish a plugin, every developer installs it, and their Claude instances behave consistently. This is the quiet revolution of late 2025: agents finally have a packaging story.

#### Claude Agent SDK vs OpenAI Agents SDK

Both give you a production-grade framework for building agent applications. Both support tools, handoffs, streaming, tracing, and structured outputs. They diverge in personality:

- **Claude Agent SDK** leans into long-horizon agents with strong planning, skills and plugins, and Anthropic's tool-use conventions. It is tuned for Claude models but can be adapted.
- **OpenAI Agents SDK** is minimal, multi-provider-friendly, and has best-in-class tracing via the OpenAI dashboard. Closer in spirit to Swarm, evolved into production form.

Pick one today, finish the lab, then skim the other's docs so you can translate between them. Both will exist in 2027.

#### OpenClaw — open-source agent infrastructure

OpenClaw is a community effort to publish open-source agent templates and tooling that are not locked to a vendor framework. The value proposition is escape velocity from proprietary stacks: you can inspect, fork, and self-host the full agent loop. If you care about reproducibility, on-prem deployment, or simply understanding every line of the system you are running, OpenClaw is worth a look.

OpenClaw URL verified as reference repository.

#### AutoGen, Magentic-One, and the research frontier

AutoGen from Microsoft Research pioneered many multi-agent patterns still in use. Magentic-One is its newer flagship: a supervisor-driven team that browses, codes, and files — a reference implementation of a general-purpose agent team. Meta's CICERO pushed multi-agent into negotiation and natural-language strategy. You will not ship any of these tomorrow, but reading their papers is the fastest way to understand where the field is heading.

### Watch: Two agents doing the tango

https://www.youtube.com/embed/wgmCjrMFoyc

### Lab: Build a 2-agent workflow that delegates

1. Pick a real task from your capstone that naturally splits in two. Examples: `researcher + writer`, `planner + coder`, `intake + responder`.
2. Using either Claude Agent SDK **or** OpenAI Swarm, define two agents with distinct system prompts and tools.
3. Implement the handoff. Agent A does its job and hands a structured output to Agent B. Agent B produces the final response.
4. Instrument tracing so you can see every message between agents.
5. Run three test cases. Export the traces.
6. Draw a diagram — boxes for agents, arrows for handoffs, labels for what each arrow carries. Paste or sketch it in your repo's README.
7. Bonus: fork one template from OpenClaw and note what changed between it and your design.

> ⚠️ **If you get stuck**
> - *Swarm agents hand off back and forth forever (A → B → A → B)* → add a handoff counter to shared state and refuse a handoff when the counter exceeds 3; or promote one agent to supervisor so handoffs go through a single decider.
> - *Agent B receives a blob of text from Agent A instead of structured data* → define a Pydantic / Zod schema for the handoff payload and have Agent A emit JSON matching it; reject unstructured handoffs at the boundary.
> - *Tracing shows both agents calling the same tool on the same input* → their system prompts overlap. Tighten each agent's "you do NOT handle X" clause, and remove the duplicate tool from whichever agent shouldn't own it.

### Live discussion prompts — When did one agent become two?

| Prompt | What a strong answer sounds like |
|---|---|
| Post the moment in your capstone design when you realized one agent was not enough. | Cites a specific symptom from a trace — prompt past 4k tokens, wrong tool chosen, context contaminated with prior-task observations — not a vibe. |
| What did the second agent do that the first could not? | Describes the narrow role and the tools removed from agent one when agent two took over. Names what got simpler, not just what got added. |
| What is the cost of the split — in latency, tokens, or debuggability — and is it worth it? | Acknowledges the tradeoff honestly (extra handoff turn, doubled trace length) and explains why the quality gain justifies it for this use case. |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action (~40 min)
1. Finish the 2-agent workflow in either [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk) or [OpenAI Swarm](https://github.com/openai/swarm) with a typed handoff payload.
2. Run three test cases with tracing enabled, export the traces.
3. Draw a handoff diagram — boxes for agents, arrows labelled with payload contents — and paste into the repo README.
4. Diagram your capstone as a 2-agent system: supervisor or swarm? Which tools move where? Include this diagram in your submission.
5. Bonus: fork one template from [OpenClaw](https://github.com/openclaw/openclaw) and note what you changed.

### 2. Reflect (~10 min)
Where did the handoff leak information Agent B shouldn't see, or starve Agent B of context it needed? Name one schema change you'll make tomorrow.

### 3. Quiz (~17 min)

Includes transfer scenarios + spaced recall from earlier days (~8+ items total). If a question feels easy, treat it as speed practice.
1. Name the three orchestration patterns and one situation where each is the right choice.
2. What are the only two primitives in OpenAI Swarm?
3. What makes a Claude Skill more context-efficient than a giant system prompt?
4. What does a Claude Plugin bundle together?
5. What is one risk of the swarm pattern without a supervisor?

### 4. Submit the assignment (~5 min)
**Daily:** Submit (a) your 2-agent workflow repo with tracing enabled, (b) three sample traces showing handoffs, and (c) a diagram (hand-drawn is fine) that explains the workflow at a glance. Include one paragraph on why you split the roles the way you did.

**Peer or self-review:** One line (chat or DM): what changed after someone skimmed your artifact — or the biggest gap if you worked solo.

**Stretch (optional):** Pick one rubric row and over-ship it (extra example, tighter screenshot, or second iteration).


### 5. Deepen (optional ~30 min)
- **Extra video**: [Magentic-One](https://www.microsoft.com/en-us/research/publication/magentic-one) demo reel.
- **Extra read**: [LangGraph multi-agent concepts](https://langchain-ai.github.io/langgraph/concepts/multi_agent/) and [CrewAI flows](https://docs.crewai.com/concepts/flows).
- **Try**: package one piece of your workflow as a [Claude Skill](https://docs.claude.com/en/docs/build-with-claude/skills) and auto-load it.

### 6. Prep for Day 25 (~30-40 min — important)

**Tomorrow is Mini-Demo Day — Ideathon 2.** You present a 3-minute live demo of your capstone v0 to a rotating panel of five peers, receive critique, and turn that critique into a one-page plan.

- [ ] **Rehearse** your 3-minute demo once on webcam — hook (30s), story with live product (2min), ask (30s). Time it strictly.
- [ ] **Confirm** your deployed URL from Day 22 loads on a phone and a laptop.
- [ ] **Record** a 30-second Loom backup of the demo in case the live URL hiccups.
- [ ] **Write** your 30-second ask on a slide so it stays visible even if you run out of time.
- [ ] **Skim** [YC — How to present to investors](https://ycombinator.com/library) and one clip from [YC Demo Day archives](https://ycombinator.com/demoday).

---

## 📚 Extra / additional references

### Pre-class primers
- [Anthropic — multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [OpenAI Swarm on GitHub](https://github.com/openai/swarm)

### Covered during class
- [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk)
- [OpenAI Swarm](https://github.com/openai/swarm)
- [OpenClaw](https://github.com/openclaw/openclaw)
- [Claude Skills](https://docs.claude.com/en/docs/build-with-claude/skills)
- [Claude Plugins](https://claude.com/plugins)
- [Two agents doing the tango](https://www.youtube.com/embed/wgmCjrMFoyc)

### Deep dives (post-class)
- [LangGraph multi-agent](https://langchain-ai.github.io/langgraph/concepts/multi_agent/)
- [CrewAI flows](https://docs.crewai.com/concepts/flows)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [AutoGen](https://microsoft.github.io/autogen/)
- [Magentic-One](https://www.microsoft.com/en-us/research/publication/magentic-one)
- [Meta CICERO](https://ai.meta.com/research/cicero/)

### Other videos worth watching
- [DeepLearning.ai agent courses](https://deeplearning.ai) — short courses on multi-agent design.
