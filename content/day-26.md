---
day: 26
date: "2026-06-05"
weekday: "Friday"
week: 5
topic: "Capstone Milestone 5: Add agentic frameworks and a chatbot to your project"
faculty:
  main: "Sandeep"
  support: "Harshith"
reading_time: "10 min"
tldr: "Your capstone gets a brain and a face today. Wire one agent loop (LangGraph or CrewAI) into your existing project, then bolt on a chatbot UI so a non-technical user can drive it. Ship by midnight."
tags: ["capstone", "agents", "chatbot", "milestone"]
software: ["Python 3.10+", "Node 20+ (optional for UI)"]
online_tools: ["LangGraph", "CrewAI", "Streamlit", "Chainlit"]
video: "https://www.youtube.com/embed/aHCDrAbH_go"
prompt_of_the_day: "You are an agent designer. My capstone is <one-line description>. Propose a 3-node agent graph (planner → tool-caller → reflector) with the exact tools each node needs and the stop condition."
tools_hands_on:
  - { name: "LangGraph", url: "https://langchain-ai.github.io/langgraph/" }
  - { name: "CrewAI", url: "https://docs.crewai.com/" }
  - { name: "Chainlit", url: "https://docs.chainlit.io/" }
  - { name: "Streamlit chat", url: "https://docs.streamlit.io/develop/api-reference/chat" }
tools_reference:
  - { name: "LangChain — Agents overview", url: "https://python.langchain.com/docs/concepts/agents/" }
  - { name: "Anthropic — Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" }
resources:
  - { title: "LangGraph quickstart", url: "https://langchain-ai.github.io/langgraph/tutorials/introduction/" }
  - { title: "CrewAI examples repo", url: "https://github.com/crewAIInc/crewAI-examples" }
  - { title: "Chainlit cookbook", url: "https://github.com/Chainlit/cookbook" }
lab: { title: "Wrap your capstone in an agent + chat UI", url: "https://langchain-ai.github.io/langgraph/" }
objective:
  topic: "Add an agent loop and a chatbot front-end to your capstone"
  tools: ["LangGraph or CrewAI", "Chainlit or Streamlit"]
  end_goal: "A running chatbot that calls your capstone's tools through an agent graph and answers a real user task end-to-end."
---

Milestone 5 is the one that flips your capstone from "script with prompts" into "thing a stranger can use." Today you give it an agent loop and a face.

> 🏁 **Milestone 5 callout.** By tonight you must demo: (1) one agent graph with ≥2 tools, (2) a chatbot UI a non-coder can open and use, (3) one full task completed without you touching the code. Submit a 60-second screen-recording on the dashboard.

## 🎯 Today's objective

**Topic.** Add agentic frameworks and a chatbot to your project.

**By end of class you will have:**
1. Picked LangGraph **or** CrewAI (not both) and rewired one workflow from your capstone into an agent loop.
2. Exposed at least two of your capstone's functions as **tools** the agent can call.
3. Shipped a Chainlit or Streamlit chat UI with your project URL pasted into the cohort channel.

> *Why this matters.* Demo Day judges click first, ask later. A working chat box hides 200 lines of glue.

## ⏪ Pre-class · ~25 min

### Setup

- [ ] `pip install langgraph langchain-openai chainlit` (or `crewai crewai-tools streamlit`).
- [ ] Capstone repo on `main` with Milestone 4 merged.
- [ ] One API key working in `.env` — OpenAI, Anthropic, or Groq.

### Primer

- **Watch:** "Building effective agents" walkthrough — https://www.youtube.com/watch?v=aHCDrAbH_go
- **Skim:** Anthropic's *Building effective agents* — pay attention to the "agent vs workflow" distinction.

### Bring to class

- [ ] One sentence: *"The user types ___, my agent does ___ ___ ___, returns ___."*
- [ ] List of every function in your capstone that takes inputs and returns something — these become tools.

> 🧠 **Quick glossary.** **Agent** = LLM in a loop with tools. **Tool** = a Python function the LLM can call by name. **Graph** = nodes (LLM/tool/router) + edges (who calls whom). **State** = the dict that flows through the graph.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| LangGraph vs CrewAI — pick one | 10 min | Decision tree, no holy war |
| Live build: planner → tool → reflect | 25 min | One graph, three nodes |
| Chatbot UI in 15 lines | 15 min | Chainlit live demo |
| Pair debug: stuck loops, infinite recursion | 10 min |  |

### LangGraph vs CrewAI — quick call

- **LangGraph** if you want explicit control of the graph, easier to debug, better for one-user tools.
- **CrewAI** if your capstone is naturally multi-agent (researcher + writer + reviewer) and you want roles, not nodes.
- Both are fine. Don't waste 40 minutes choosing.

### The 3-node pattern that always works

1. **Planner** — LLM call that decomposes the user message into 1–3 sub-tasks.
2. **Tool-caller** — picks a tool, executes, appends result to state.
3. **Reflector** — checks if done; either loops back or returns final answer.

Stop condition: max 6 iterations OR `state.done == True`. Always cap iterations.

## 🧪 Lab: Wrap your capstone

1. Identify 2 functions in your capstone (e.g., `fetch_data`, `summarise`, `query_pdf`). Decorate them as tools.
2. Build the 3-node graph above. Pass your tool list to the tool-caller node.
3. Run from CLI first: one user query, see the trace, fix the obvious break.
4. Wrap in Chainlit: `@cl.on_message async def main(msg): await cl.Message(await graph.ainvoke({"input": msg.content})).send()`
5. Run `chainlit run app.py` and DM the URL (or screen-recording) to your pod.

**Artifact.** GitHub PR titled `milestone-5: agent + chat` + 60-sec Loom of one full task.

> ⚠️ **Common bug.** Tools that mutate global state cause the graph to re-fire forever. Make tools pure or pass state explicitly.

## 📊 Live poll

**Which framework did you pick — and one reason?** LangGraph / CrewAI / built my own / still deciding. Instructor will pull two voters from each side to defend the choice.

## 💬 Discuss

- Where did your agent loop infinite? What stop rule fixed it?
- Which of your capstone functions made *bad* tools — and why?
- Chat UI changed how you thought about the prompt. How?
- One thing your agent does that a plain function call can't.

## ❓ Quiz

Short class quiz on agent loops, tools, stop conditions, and the LangGraph vs CrewAI trade-off. Open it from your dashboard when prompted.

## 📝 Assignment · Milestone 5 ship

**Brief.** Submit your PR + Loom by 23:59 IST. Include in the PR description: agent framework, list of tools exposed, and the stop condition you set.

**Submit.** Dashboard → Day 26 → upload PR link + Loom URL.

**Rubric.** Working agent loop with ≥2 tools (4) · Usable chat UI a non-coder can open (4) · Clear stop condition + no runaway loops (2).

## 🔁 Prep for next class

Day 27 — **AI ethics, safety, guard-rails, red-teaming**. The chatbot you just built is now an attack surface.

- [ ] Try one prompt-injection on your own bot. Note what happened.
- [ ] Read OWASP LLM Top 10 — https://owasp.org/www-project-top-10-for-large-language-model-applications/. Skim, don't memorise.
- [ ] Bring one screenshot where any public chatbot (Indian or global) gave a clearly unsafe answer.

## 📚 References

- [LangGraph quickstart](https://langchain-ai.github.io/langgraph/tutorials/introduction/) — the official 20-minute path.
- [Anthropic — Building effective agents](https://www.anthropic.com/research/building-effective-agents) — the essay every team should read.
- [Chainlit cookbook](https://github.com/Chainlit/cookbook) — copy-paste UIs.
- [CrewAI examples](https://github.com/crewAIInc/crewAI-examples) — multi-agent patterns.
