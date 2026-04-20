---
reading_time: 16 min
tldr: "Two agents that delegate beat one agent that tries everything — today you wire up a swarm, a skill, and a plugin."
tags: ["build", "ship", "agentic"]
video: https://www.youtube.com/embed/wgmCjrMFoyc
lab: {"title": "Build a 2-agent delegating workflow with Claude Agent SDK or OpenAI Swarm", "url": "https://docs.claude.com/en/api/agent-sdk"}
prompt_of_the_day: "You are the supervisor. You have two worker agents: {{agent_a}} and {{agent_b}}. For the user request '{{request}}', decide which worker to call first, what to pass them, and what to do with their output. Hand off explicitly and never do the worker's job yourself."
tools_hands_on: [{"name": "Claude Agent SDK", "url": "https://docs.claude.com/en/api/agent-sdk"}, {"name": "OpenAI Swarm", "url": "https://github.com/openai/swarm"}, {"name": "OpenClaw", "url": "https://github.com/openclaw/openclaw"}]
tools_demo: [{"name": "AutoGen", "url": "https://microsoft.github.io/autogen/"}, {"name": "Claude Skills", "url": "https://docs.claude.com/en/docs/build-with-claude/skills"}, {"name": "Claude Plugins", "url": "https://claude.com/plugins"}]
tools_reference: [{"name": "LangGraph multi-agent", "url": "https://langchain-ai.github.io/langgraph/concepts/multi_agent/"}, {"name": "CrewAI flows", "url": "https://docs.crewai.com/concepts/flows"}, {"name": "OpenAI Agents SDK", "url": "https://openai.github.io/openai-agents-python/"}, {"name": "DeepLearning.ai agent courses", "url": "https://deeplearning.ai"}, {"name": "Magentic-One", "url": "https://www.microsoft.com/en-us/research/publication/magentic-one"}, {"name": "Meta CICERO", "url": "https://ai.meta.com/research/cicero/"}]
resources: [{"name": "Anthropic: multi-agent research system", "url": "https://www.anthropic.com/engineering/multi-agent-research-system"}, {"name": "OpenAI Swarm on GitHub", "url": "https://github.com/openai/swarm"}]
---

## Intro

Yesterday one agent in a loop. Today multiple agents that talk to each other. You will learn the three orchestration patterns that cover 90% of real-world multi-agent systems, build a working two-agent handoff in either the Claude Agent SDK or OpenAI Swarm, and meet two newer abstractions — Claude Skills and Claude Plugins — that are reshaping how reusable agent behaviors ship in 2026.

By the end of today you have a workflow where one agent delegates to another, with a diagram that explains the handoff clearly enough that a teammate could modify it.

### Quick glossary

- **Multi-agent** — separation of concerns: narrow roles, small toolsets, clear inputs and outputs.
- **Supervisor** — a boss agent that delegates to workers and decides the next step.
- **Swarm** — peer-to-peer handoffs between agents without a central supervisor.
- **Skills** — packaged, auto-loaded instruction bundles that teach a Claude agent a specific task.
- **Plugins** — installable bundles of skills, commands, hooks, and MCP servers shipped as one unit.
- **Handoff** — the function an agent calls to transfer control to another agent.
- **Orchestration** — how agents, handoffs, and state compose into a workflow.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | One bloated agent vs two narrow ones |
| Mini-lecture | 20 min | Supervisor, swarm, hierarchical; Swarm's two primitives; Skills and Plugins |
| Live lab     | 20 min | Build a 2-agent delegating workflow with Claude Agent SDK or OpenAI Swarm |
| Q&A + discussion | 15 min | When did one agent become two in your capstone |

**Before class** (~10 min): pick one capstone task that naturally splits in two (researcher+writer, planner+coder, intake+responder) and stub the two system prompts.
**After class** (~30 min tonight): run three test cases with tracing on, export the traces, draw the handoff diagram, and submit the repo with your one-paragraph rationale.

### In-class moments (minute-by-minute)

- **00:05 — Cold-open**: in 10 words, why did your Day 23 single agent get confused?
- **00:15 — Think-pair-share**: 90 seconds — name a two-role split in your capstone; partner tries to collapse it back to one agent. Who wins?
- **00:30 — Live poll**: supervisor, swarm, or hierarchical for your capstone? Post S / W / H with one-line reason.
- **00:45 — Handoff design breakout**: pairs draft the JSON payload Agent A hands to Agent B — inputs, outputs, what must never leak.
- **00:55 — Skill-or-prompt debate**: one teammate argues "skill", another "just put it in the system prompt". 60 seconds each.

## Read: Orchestration patterns, Swarm minimalism, Skills, and Plugins

### Why multi-agent at all

A single agent with twelve tools becomes a jack-of-all-trades. Its system prompt bloats. Its tool-choice accuracy drops. Its context fills with irrelevant observations from tools it did not need. The classic symptom: the more capable you try to make one agent, the worse it gets at any single task.

Multi-agent architecture is a separation-of-concerns move. Each agent has a narrow role, a focused system prompt, a small toolset, and clear inputs and outputs. You compose them into a workflow. Two good small agents beat one bloated big agent, the same way two good microservices beat one monolith for a certain class of problem.

Multi-agent is not free. You pay in latency (handoffs add turns), cost (each agent uses tokens), and complexity (debugging a swarm is harder than debugging a loop). Use it when the roles are genuinely distinct, not because "more agents" sounds impressive.

### Three orchestration patterns

**Supervisor.** A single "boss" agent reads the user request and delegates to worker agents. Workers return results to the supervisor, which decides the next step. This is the pattern most production systems use because it is easy to reason about. LangGraph's supervisor template and CrewAI's hierarchical process are both supervisor patterns.

**Swarm.** Agents can hand off to each other directly, peer-to-peer, without going through a central supervisor. The current agent decides which other agent should take over, and control transfers. OpenAI Swarm is the canonical minimal implementation — about 300 lines of Python — and its strength is simplicity. The weakness: without a supervisor, it is easy to build loops where A hands to B hands back to A forever.

**Hierarchical.** Supervisors of supervisors. A top-level agent delegates to mid-level agents, which have their own workers. Useful for genuinely large problems — think a research team where an editor-in-chief delegates to section editors who delegate to writers. Cost scales fast; use sparingly.

As a starter heuristic: use supervisor unless you have a clear reason to use swarm or hierarchical. It is the pattern with the best debuggability-to-power ratio.

### OpenAI Swarm minimalism

Swarm is worth studying even if you never ship it to production. It shows how much you can do with two primitives:

- **Agents** — a name, instructions, a set of functions (tools), and a list of other agents this one can hand off to.
- **Handoffs** — a function the agent can call that returns another agent. Swarm replaces the active agent and continues the loop.

That is the whole framework. No graph, no roles, no plans — just agents and handoffs. Read the source. It will change how you think about the more complex frameworks.

### Claude Skills — reusable agent behaviors

A Claude Skill is a packaged unit of instructions plus optional tools that teaches a Claude agent how to do a specific task. Skills live in a folder, ship as markdown with a small manifest, and get auto-loaded when their description matches the user's request. Think of them as "docstrings you can install" for agents.

The killer property is **context efficiency**. Instead of stuffing every possible instruction into your system prompt, you let the agent discover the right skill on demand. A 200-line skill for "writing a SQL migration" only enters context when the user asks about migrations. The rest of the time, it costs nothing.

If you have found yourself copy-pasting the same multi-paragraph instruction into every new project — "here is how we format commits", "here is our API style", "here is our brand voice" — that is a skill waiting to be written.

### Claude Plugins — distributing agent behavior

A Claude Plugin bundles skills, commands, hooks, and MCP servers into a single installable unit. Where a skill is one behavior, a plugin is a whole pack: a team's conventions, tools, and workflows shipped as one. Plugins have a marketplace; skills are the ingredients.

The plugin model matters because it turns agent configuration from a local hack into a shareable artifact. Your team can publish a plugin, every developer installs it, and their Claude instances behave consistently. This is the quiet revolution of late 2025: agents finally have a packaging story.

### Claude Agent SDK vs OpenAI Agents SDK

Both give you a production-grade framework for building agent applications. Both support tools, handoffs, streaming, tracing, and structured outputs. They diverge in personality:

- **Claude Agent SDK** leans into long-horizon agents with strong planning, skills and plugins, and Anthropic's tool-use conventions. It is tuned for Claude models but can be adapted.
- **OpenAI Agents SDK** is minimal, multi-provider-friendly, and has best-in-class tracing via the OpenAI dashboard. Closer in spirit to Swarm, evolved into production form.

Pick one today, finish the lab, then skim the other's docs so you can translate between them. Both will exist in 2027.

### OpenClaw — open-source agent infrastructure

OpenClaw is a community effort to publish open-source agent templates and tooling that are not locked to a vendor framework. The value proposition is escape velocity from proprietary stacks: you can inspect, fork, and self-host the full agent loop. If you care about reproducibility, on-prem deployment, or simply understanding every line of the system you are running, OpenClaw is worth a look.

<!-- TODO: verify URL -->

### AutoGen, Magentic-One, and the research frontier

AutoGen from Microsoft Research pioneered many multi-agent patterns still in use. Magentic-One is its newer flagship: a supervisor-driven team that browses, codes, and files — a reference implementation of a general-purpose agent team. Meta's CICERO pushed multi-agent into negotiation and natural-language strategy. You will not ship any of these tomorrow, but reading their papers is the fastest way to understand where the field is heading.

## Watch: Two agents doing the tango

https://www.youtube.com/embed/wgmCjrMFoyc

## Lab: Build a 2-agent workflow that delegates

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

## Quiz

1. Name the three orchestration patterns and one situation where each is the right choice.
2. What are the only two primitives in OpenAI Swarm?
3. What makes a Claude Skill more context-efficient than a giant system prompt?
4. What does a Claude Plugin bundle together?
5. What is one risk of the swarm pattern without a supervisor?

## Assignment

**Daily:** Submit (a) your 2-agent workflow repo with tracing enabled, (b) three sample traces showing handoffs, and (c) a diagram (hand-drawn is fine) that explains the workflow at a glance. Include one paragraph on why you split the roles the way you did.

## Discuss: When did one agent become two?

| Prompt | What a strong answer sounds like |
|---|---|
| Post the moment in your capstone design when you realized one agent was not enough. | Cites a specific symptom from a trace — prompt past 4k tokens, wrong tool chosen, context contaminated with prior-task observations — not a vibe. |
| What did the second agent do that the first could not? | Describes the narrow role and the tools removed from agent one when agent two took over. Names what got simpler, not just what got added. |
| What is the cost of the split — in latency, tokens, or debuggability — and is it worth it? | Acknowledges the tradeoff honestly (extra handoff turn, doubled trace length) and explains why the quality gain justifies it for this use case. |
