---
reading_time: 16 min
tldr: "An agent is a model in a loop with tools — today you build one with LangGraph and plug in your first MCP server."
tags: ["build", "ship", "agentic"]
video: https://www.youtube.com/embed/2B7_Y-6KBSQ
lab: {"title": "Build a 3-tool LangGraph agent and wire up an MCP server", "url": "https://langchain-ai.github.io/langgraph/"}
prompt_of_the_day: "You are an agent with tools: {{tool_list}}. Goal: {{goal}}. Before each tool call, state your reasoning in one sentence. After each tool result, state what you learned in one sentence. Stop when the goal is met or after 6 steps."
tools_hands_on: [{"name": "LangGraph", "url": "https://langchain-ai.github.io/langgraph/"}, {"name": "Model Context Protocol", "url": "https://modelcontextprotocol.io"}]
tools_demo: [{"name": "CrewAI", "url": "https://crewai.com"}, {"name": "LangChain agents", "url": "https://langchain.com"}]
tools_reference: [{"name": "HuggingFace smolagents", "url": "https://huggingface.co/docs/smolagents"}, {"name": "AutoGen", "url": "https://microsoft.github.io/autogen/"}, {"name": "browser-use", "url": "https://github.com/browser-use/browser-use"}, {"name": "Playwright-MCP", "url": "https://github.com/microsoft/playwright-mcp"}, {"name": "OpenRouter", "url": "https://openrouter.ai"}]
resources: [{"name": "Anthropic: Building effective agents", "url": "https://www.anthropic.com/engineering/building-effective-agents"}, {"name": "MCP specification", "url": "https://modelcontextprotocol.io/specification"}]
objective:
  topic: "ReAct agents with tool-use — a 3-tool LangGraph loop plus your first MCP server"
  tools: ["LangGraph", "Model Context Protocol"]
  end_goal: "Ship a 3-tool LangGraph agent, export a successful + failed trace, apply one loop-fix, and wire one MCP server into Cursor or Claude Desktop."
---

## 🎯 Today's objective

**Topic.** The jump from one-shot prompts to loops that act. ReAct, tool contracts, agent break-modes, and MCP as the USB-C standard for AI tools.

**Tools you'll use.** LangGraph for the agent loop. Model Context Protocol for the tool-plug-in half — via Cursor or Claude Desktop.

**End goal.** By the end of today you will have:
1. A working 3-tool LangGraph agent (`web_search`, `calculator`, `write_file`) that solves the India/Pakistan population-ratio task end-to-end.
2. A successful trace and a deliberately-broken trace, plus the one loop-fix you applied.
3. One MCP server (filesystem, fetch, or Playwright-MCP) wired into Cursor or Claude Desktop and used on a real capstone task.

> *Why this matters:* Yesterday (Day 22) your v0 went live on the internet. Today is the day the gap between "AI is cool" and "AI gets things done" closes — you hand a model a browser, a calculator, a filesystem, and a goal.

---

## ⏪ Pre-class · ~20 min

**Revision / context.** Yesterday (Day 22) you deployed your v0 to Vercel, computed cost-per-user at 10/100/1000 users, audited the trust-UX stack, and published `llms.txt`. Your capstone now has a live URL. Today we give the model inside that URL *hands* — tools it can call, a loop it can run — and the industry-standard cable (MCP) for plugging those tools in.

### Quick glossary

- **Agent** — a model in a loop with tools and a goal, deciding what to do next from observations.
- **ReAct loop** — the Reason + Act pattern: thought → action → observation → repeat.
- **Tool use** — named, described, schema'd functions the model can call mid-loop.
- **MCP** — Model Context Protocol; the USB-C cable standard for connecting models to tools and data.
- **LangGraph** — a graph-based agent framework with first-class state, nodes, and conditional edges.
- **CrewAI** — a role-based multi-agent framework for sequential assembly-line workflows.

### Setup
- [ ] Confirm Python 3.11+ is available (`python --version`). If not, use a cloud notebook — Google Colab or Replit — and note it in your submission.
- [ ] Install [LangGraph](https://langchain-ai.github.io/langgraph/) in a fresh virtual environment (`pip install langgraph langchain-anthropic`).
- [ ] Have a Claude or OpenAI API key ready in an env var.
- [ ] Install [Claude Desktop](https://claude.ai) or [Cursor](https://cursor.com) for the MCP half of the lab.

### Primer (~5 min)
- **Read**: the one-page [MCP intro](https://modelcontextprotocol.io) — what it is, what problem it solves.
- **Watch** (optional): [Tracing an agent step by step](https://www.youtube.com/embed/2B7_Y-6KBSQ).

### Bring to class
- [ ] A working `python -c "import langgraph; print(langgraph.__version__)"` or a cloud notebook URL.
- [ ] Three candidate tools you'd want your capstone agent to use — written down.
- [ ] An open tab at the [MCP specification](https://modelcontextprotocol.io/specification).

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | From one-shot prompts to loops that take action |
| Mini-lecture | 20 min | ReAct, tool contracts, predictable agent break-modes, MCP as USB-C |
| Live lab     | 20 min | Build a 3-tool LangGraph agent; wire an MCP server into Cursor or Claude |
| Q&A + discussion | 15 min | The MCP server you would publish next |

### In-class checkpoints

- **Cold-open**: name the last "agent" demo you saw that actually worked end-to-end. One sentence on why.
- **Think-pair-share**: 90 seconds — your partner names three tools their capstone agent would need; you spot which one has the fuzziest description.
- **Live trace-read**: paste the instructor's agent trace in chat. Where would you cut context? Vote A/B/C.
- **MCP breakout**: three groups — filesystem server, fetch server, Playwright-MCP. Each group reports back the single tool they'd most miss.
- **Fail-mode bingo**: shout the break-mode you hit first (infinite retry / goal drift / hallucinated tool / context blow-up / premature success).

### Read: ReAct, tool-use, planning loops, and MCP

#### The ReAct loop — reason plus act

ReAct is the simplest agent pattern that actually works, and it underlies almost every agent framework you will meet. The acronym expands to Reason + Act. The model alternates between two kinds of output:

1. **Thought:** free-text reasoning about what to do next.
2. **Action:** a structured call to a tool — `search("term")`, `read_file("path")`, `calculator("2+2")`.

The loop:

```
while not done:
    thought = model.think(history)
    action = model.choose_tool(thought)
    observation = tool.run(action)
    history.append(thought, action, observation)
```

That is the entire pattern. Everything else — planning, reflection, self-critique, multi-agent orchestration — is a variation on which thoughts the model emits, which tools are exposed, and how history is pruned.

The power is that the model gets to see the consequences of its actions and adjust. If search returns nothing, it tries different keywords. If a calculation fails, it reads the error and corrects its inputs. If a file does not exist, it lists the directory. That closed loop is what separates agents from chatbots.

#### Tool-use — the contract that makes it work

A tool is a function the model can call. But to the model, a tool is three things:

- **Name** — `web_search`, `write_file`.
- **Description** — what it does, in plain English, crisply. The model reads this every turn.
- **Schema** — typed inputs and outputs, usually JSON schema.

Good tools have small surface area. `write_file(path, content)` is great. `filesystem(operation, path, content, mode, flags)` is a pit of despair — the model will fill in `flags` wrong every time. A tool should do one thing and describe itself in one sentence.

For model-agnostic agent setups, **OpenRouter** (`openrouter.ai`) is worth knowing — one API key routes your agent to 100+ models (Anthropic, OpenAI, Mistral, Llama, DeepSeek) via a single OpenAI-compatible endpoint. Handy when you want to swap the underlying brain without rewriting your LangGraph nodes.

Return values matter as much as inputs. Return structured data the model can parse. Return errors with a hint about how to fix them: `{"error": "file not found", "suggestion": "try listing the directory first"}`. The model is a reader; give it good prose.

#### Planning loops — and why agents break

Pure ReAct works for three or four steps. Beyond that it starts to wander. The model forgets the goal, retraces steps, or gets stuck on a failing tool and retries it ten times.

Planning loops mitigate this by giving the model a two-level structure:

- **Plan step:** write a numbered plan of what to do.
- **Execute step:** do step 1, check if it worked, mark it done, move to step 2.
- **Replan step:** if the plan no longer fits reality, rewrite it.

LangGraph, CrewAI, and most modern frameworks expose planning as first-class state. The model is not just emitting thoughts; it is updating a data structure that persists across turns.

Agents break for predictable reasons. Memorize this list — you will hit each one today:

- **Infinite retry.** A tool fails; the model tries the same call again with identical inputs. Fix: pass the previous error back with a "do not retry identical inputs" rule.
- **Goal drift.** Six steps in, the model is exploring something tangential. Fix: restate the goal in the system prompt every turn, or summarize history into a working memory.
- **Hallucinated tools.** The model invents a tool that does not exist. Fix: strict tool schemas and rejecting calls to unknown tools cleanly.
- **Context blow-up.** After ten tool calls the context is full of junk. Fix: summarize old observations, keep only the most recent few verbatim.
- **Premature success.** The model declares victory without checking. Fix: a final verification tool the model must call before stopping.

#### MCP — USB-C for AI tools

The Model Context Protocol is a specification published by Anthropic and now adopted across the industry. It is the cable standard for connecting AI models to tools, data sources, and services. Before MCP, every vendor had their own plugin format: OpenAI had plugins, Claude had tools, LangChain had its own wrappers, Cursor had its own extension system. Every integration was re-built for every host.

MCP flips that. You write **one MCP server** that exposes a set of tools, and any MCP-compatible client — Cursor, Claude Desktop, Zed, your own app — can use them. Think USB-C: one cable, one spec, any device.

An MCP server exposes three things:

- **Tools** — callable functions (same idea as LangChain tools).
- **Resources** — readable data the model can fetch (files, DB rows, API responses).
- **Prompts** — reusable prompt templates the user can invoke.

The transport is usually stdio (for local processes) or Streamable HTTP (for remote servers). You run the server, tell the client where to find it, and the client handshakes to discover capabilities. Any model that supports tool use can now use your server — no vendor-specific code.

The practical implication: stop building one-off integrations. If you have a useful capability — a search over your company wiki, a wrapper over your internal API, a custom data source — expose it as an MCP server. It then works across every AI host your team uses, now and next year.

#### CrewAI and the multi-agent tease

CrewAI is a framework that makes multi-agent workflows trivial to describe. You define agents by role — "researcher", "writer", "reviewer" — give each one tools and a backstory, and CrewAI orchestrates the handoffs. It is a beautiful abstraction for a small class of problems: anything where a sequential assembly line of roles produces better output than a single generalist.

We demo it today. Tomorrow we go deep on multi-agent patterns and when the abstraction hurts more than it helps.

### Watch: Tracing an agent step by step

https://www.youtube.com/embed/2B7_Y-6KBSQ

### Lab: A 3-tool LangGraph agent + your first MCP server

Part A — the agent:

1. Install LangGraph. Create a project with three tools: `web_search`, `calculator`, `write_file`.
2. Define the graph: an LLM node, a tool node, a conditional edge that routes back to the LLM until the LLM emits a final answer.
3. Set a goal: "Find the current population of India and Pakistan, compute the ratio, and write the result to `out.txt`."
4. Run it. Export the full trace (thoughts, actions, observations).
5. Deliberately break one tool (make `calculator` return wrong results). Watch the agent fail. Fix by adding a verification step.

Part B — MCP:

1. Pick one existing MCP server (filesystem, fetch, or Playwright-MCP).
2. Configure Cursor or Claude Desktop to connect to it. Verify the tools appear in the client.
3. Use it for one real task in your capstone workflow.

> ⚠️ **If you get stuck**
> - *LangGraph agent loops forever on the same tool call* → your conditional edge isn't checking for a final-answer signal; add a step counter and a max-steps fallback that routes to END, and pass the previous error back in the next turn.
> - *MCP server doesn't appear in Claude Desktop or Cursor* → check the client config file path (`claude_desktop_config.json` for Claude, settings JSON for Cursor), confirm the command works standalone in a terminal, and fully restart the client — hot reload is unreliable.
> - *Model keeps inventing a tool name that doesn't exist* → your tool descriptions are too vague or overlap. Rename for specificity (`read_file` not `fs`) and reject unknown tool calls loudly instead of silently failing.

### Live discussion prompts — The MCP server you would build next

| Prompt | What a strong answer sounds like |
|---|---|
| If you were to publish one MCP server for your team or community, what would it wrap? | Names a specific existing capability or data source (internal wiki, a public API, a CLI tool) — not a generic category. One sentence on why it deserves to be an MCP server rather than a REST call. |
| What three tools would it expose, with names and one-line descriptions? | Each tool has a verb-noun name, a small typed input, and a single job. No "do_everything" god tools. |
| Who benefits, and how would they discover and install it? | Identifies the concrete user (teammates, a public community), the host they use (Claude Desktop, Cursor, custom app), and a distribution plan — even if it's just "share the repo in #eng." |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action (~60 min)
1. Finish the 3-tool LangGraph agent: `web_search`, `calculator`, `write_file` with a conditional-edge loop.
2. Run the population-ratio goal end-to-end and export one successful trace (thoughts + actions + observations).
3. Deliberately break `calculator`, capture one failed trace, then apply one loop-fix (step counter, verification tool, or error-passback) and re-run.
4. Wire one MCP server (filesystem, fetch, or [Playwright-MCP](https://github.com/microsoft/playwright-mcp)) into Claude Desktop or Cursor and use it for one real capstone task.
5. Submit the repo, both traces, and a one-paragraph writeup of the loop-fix.

### 2. Reflect (~5 min)
Which of the five predictable break-modes (infinite retry, goal drift, hallucinated tools, context blow-up, premature success) hit you first today, and why your tool design invited it?

### 3. Quiz (~15 min)
1. What does ReAct stand for and what are the two kinds of model output each turn?
2. What three things define a tool from the model's perspective?
3. Name three predictable ways agents break and one fix for each.
4. What does MCP stand for and what analogy is used for it?
5. What three kinds of capabilities does an MCP server expose?

### 4. Submit the assignment (~5 min)
**Daily:** Submit (a) your working LangGraph agent repo, (b) a full trace of one successful run and one failed run, and (c) a one-paragraph writeup of the single loop-fix you had to make to keep the agent from breaking.

### 5. Deepen (optional ~30 min)
- **Extra video**: an [AutoGen](https://microsoft.github.io/autogen/) multi-agent demo to preview Day 24.
- **Extra read**: [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) end-to-end.
- **Try**: add a fourth tool via [browser-use](https://github.com/browser-use/browser-use) and run a real web task.

### 6. Prep for Day 24 (~30 min — important)

**Tomorrow one agent becomes two.** Day 24 is multi-agent orchestration: supervisor / swarm / hierarchical patterns, Claude Skills and Plugins, and a 2-agent delegating workflow built in either the Claude Agent SDK or OpenAI Swarm.

- [ ] **Confirm** your Day 23 LangGraph agent runs end-to-end — you need a working single-agent baseline before splitting it.
- [ ] **Install** either [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk) (`pip install claude-agent-sdk`) **or** [OpenAI Swarm](https://github.com/openai/swarm) (`pip install git+https://github.com/openai/swarm.git`).
- [ ] **Pick** one capstone task that naturally splits in two roles — researcher+writer, planner+coder, intake+responder.
- [ ] **Stub** two system prompts, one per role, before class.
- [ ] **Skim** [Anthropic — multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) (the architecture diagram is enough).

---

## 📚 Extra / additional references

### Pre-class primers
- [Model Context Protocol intro](https://modelcontextprotocol.io)
- [MCP specification](https://modelcontextprotocol.io/specification)

### Covered during class
- [LangGraph](https://langchain-ai.github.io/langgraph/) — graph-based agent framework.
- [CrewAI](https://crewai.com) — role-based sequential agents.
- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Tracing an agent step by step](https://www.youtube.com/embed/2B7_Y-6KBSQ)

### Deep dives (post-class)
- [HuggingFace smolagents](https://huggingface.co/docs/smolagents)
- [AutoGen](https://microsoft.github.io/autogen/)
- [browser-use](https://github.com/browser-use/browser-use)
- [Playwright-MCP](https://github.com/microsoft/playwright-mcp)
- [LangChain agents](https://langchain.com)
- [OpenRouter](https://openrouter.ai) — one key, 100+ models; useful for model-agnostic agent setups.

### Other videos worth watching
- [Agent tracing walkthrough](https://www.youtube.com/embed/2B7_Y-6KBSQ) — re-watch once your agent is running.
