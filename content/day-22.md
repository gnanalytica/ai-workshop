---
day: 22
date: "2026-06-01"
weekday: "Monday"
week: 5
topic: "Agentic AI: ReAct agents, tool use, LangGraph, MCP, Multi-Agentic System"
faculty:
  main: "Sandeep"
  support: "Harshith"
reading_time: "12 min"
tldr: "An LLM that just chats is a calculator. An LLM with tools, memory, and a graph of decisions is an agent. Today you build a ReAct agent in LangGraph, give it two tools, and watch it loop until it's done."
tags: ["agents", "langgraph", "mcp", "react"]
software: ["LangChain", "LangGraph", "CrewAI"]
online_tools: []
video: "https://www.youtube.com/embed/aHCDrAbH_go"
prompt_of_the_day: "Build me a ReAct agent in LangGraph with two tools: web_search and calculator. Question to answer: 'What was the GDP per capita of India in the latest IMF data, and how many times has it grown since 2000?' Show the trace."
tools_hands_on:
  - { name: "LangGraph", url: "https://langchain-ai.github.io/langgraph/" }
  - { name: "LangChain", url: "https://python.langchain.com/" }
  - { name: "CrewAI", url: "https://www.crewai.com/" }
  - { name: "Model Context Protocol", url: "https://modelcontextprotocol.io/" }
tools_reference:
  - { name: "ReAct paper (Yao et al.)", url: "https://arxiv.org/abs/2210.03629" }
  - { name: "Anthropic — Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" }
resources:
  - { title: "LangGraph quickstart", url: "https://langchain-ai.github.io/langgraph/tutorials/introduction/" }
  - { title: "MCP servers list", url: "https://github.com/modelcontextprotocol/servers" }
lab: { title: "Two-tool ReAct agent in LangGraph", url: "https://langchain-ai.github.io/langgraph/tutorials/introduction/" }
objective:
  topic: "Agentic AI: ReAct agents, tool use, LangGraph, MCP, Multi-Agent Systems"
  tools: ["LangGraph", "LangChain", "CrewAI", "MCP"]
  end_goal: "A working ReAct agent in 60 lines of Python that uses two tools and prints its reasoning trace, plus a sketch of a 2-agent CrewAI team."
---

A chatbot answers. An agent **acts**. The difference is a loop, a set of tools, and a controller that decides what to do next. Today we open that loop.

## 🎯 Today's objective

**Topic.** Agentic AI: ReAct agents, tool use, LangGraph, MCP, Multi-Agent Systems.

**By end of class you will have:**
1. A working ReAct agent in LangGraph with two tools, running locally.
2. Read its full *Thought → Action → Observation* trace and explained one step.
3. A 2-agent CrewAI sketch (researcher + writer) and a one-paragraph note on when MCP beats a custom tool.

> *Why this matters.* Half the capstone projects this cohort will pitch agents. Knowing the wiring under "I built an agent" separates demos from toys.

## ⏪ Pre-class · ~25 min

### Setup (required)

- [ ] Python venv with `pip install langchain langgraph langchain-openai crewai`.
- [ ] OpenAI **or** Anthropic API key in `.env`. Confirm with a 2-line `chat.invoke("hi")`.
- [ ] Optional: install Claude Desktop and try one MCP server (filesystem).

### Primer (~10 min)

- **Watch:** "What is LangGraph?" — https://www.youtube.com/watch?v=aHCDrAbH_go (8 min).
- **Read:** Anthropic's *Building effective agents* — skim "Workflows vs agents" and "When to use agents."
- **Skim:** the ReAct paper abstract + Figure 1 (Yao et al.). You don't need the math.

### Bring to class

- [ ] One *agent-shaped problem* from your capstone. Not "summarise text" — that's a pipeline. Try "find me the cheapest train Bangalore→Hyderabad next Friday and book a placeholder."

> 🧠 **Quick glossary.** **ReAct** = Reason + Act loop. **Tool** = a function the LLM can call. **LangGraph** = library for building stateful agent graphs. **MCP** = Model Context Protocol — a standard way to plug tools into any agent. **CrewAI** = multi-agent orchestration with role-playing.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Chatbot vs workflow vs agent | 10 min | Where each fits |
| ReAct loop, drawn on the whiteboard | 10 min | Thought → Action → Observation |
| Live build: LangGraph agent | 20 min | 60 lines, two tools |
| MCP demo + multi-agent sketch | 10 min | Why MCP, when to use Crew |
| Lab + Q&A | 5 min |  |

### The minimum agent

```
loop:
  thought  = LLM(state)         # "I need the latest GDP figure"
  action   = pick_tool(thought) # web_search("India GDP per capita 2025")
  observe  = run_tool(action)   # "$2,710 per IMF April 2025"
  state    = state + observe
  if LLM says "done": break
```

That's it. Everything else — LangGraph, CrewAI, AutoGen — is sugar on this loop.

### When to reach for what

- **One LLM call** — classification, summary. Don't build an agent.
- **Fixed pipeline (workflow)** — LangChain chain. Predictable, cheap, debuggable.
- **Agent (LangGraph)** — when the *path* depends on intermediate results.
- **Multi-agent (CrewAI)** — when roles are genuinely different and parallel: researcher + critic + writer.
- **MCP** — when the *same* tool needs to plug into Claude Desktop, Cursor, your custom agent, all at once.

## 🧪 Lab: Two-tool ReAct agent

1. New file `agent.py`. Define two `@tool`s: `web_search(query)` (use Tavily or DuckDuckGo) and `calculator(expression)`.
2. Build a LangGraph `StateGraph` with one node `agent` (the LLM) and one node `tools` (the tool runner). Edges: `agent → tools → agent` until `END`.
3. Run with the prompt of the day. Print every `(thought, action, observation)` triple.
4. Break it on purpose: ask a question requiring **three** tool calls. Watch the loop hold up.

**Artifact.** `agent.py` + a copy-pasted trace in your repo at `/labs/day-22/`. Push.

> ⚠️ **Cost watch.** Each loop costs ~₹1–4. Cap with `recursion_limit=10` so a runaway agent doesn't burn your credits.

## 📊 Live poll

**Where does your capstone need an agent (vs a workflow)?** Auth/forms / Search-and-summarise / Multi-step reasoning / Booking-style flows / *Honestly, nowhere.*

## 💬 Discuss

- A workflow is cheaper and more reliable. When is the agent's flexibility worth the extra cost?
- Your capstone uses Razorpay. Should that be an MCP server or a hand-coded tool? Argue both sides.
- Two agents (researcher + writer) vs one agent with two tools — what changes?

## ❓ Quiz

Short quiz on the ReAct loop, when MCP beats custom tools, and what `recursion_limit` does. Open on the dashboard mid-class.

## 📝 Assignment · Your first agent

**Brief.** Submit your `agent.py` plus a 150-word note: *what the agent did well, where it failed, what it cost in tokens.*

**Stretch (optional).** Convert one of your tools into an MCP server (e.g., filesystem read) and call it from Claude Desktop or Cursor. +2 bonus points if you push the server config + a screenshot.

**Submit.** GitHub link + note on the dashboard before Day 23.

**Rubric.** Tools wired and called correctly (4) · Trace is readable, with thoughts visible (4) · Honest reflection on failures + cost (2).

## 🔁 Prep for next class

Day 23 is **Cost Estimation of AI** — tokens, knowledge graphs, Neo Cloud GPUs.

- [ ] Save the *exact* token count from today's agent run. We'll cost it out tomorrow.
- [ ] Read OpenAI's pricing page and Anthropic's pricing page. Note the gap.
- [ ] Bring one capstone feature you're worried will be expensive at scale.

## 📚 References

- [LangGraph quickstart](https://langchain-ai.github.io/langgraph/tutorials/introduction/) — the canonical tutorial.
- [Anthropic — Building effective agents](https://www.anthropic.com/research/building-effective-agents) — the post that reset this field.
- [ReAct paper (Yao et al., 2022)](https://arxiv.org/abs/2210.03629) — the original loop.
- [MCP servers](https://github.com/modelcontextprotocol/servers) — 100+ ready-to-use tools.
