---
reading_time: 16 min
tldr: "An agent is a model in a loop with tools — today you build one with LangGraph and plug in your first MCP server."
tags: ["build", "ship", "agentic"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Build a 3-tool LangGraph agent and wire up an MCP server", "url": "https://langchain-ai.github.io/langgraph/"}
prompt_of_the_day: "You are an agent with tools: {{tool_list}}. Goal: {{goal}}. Before each tool call, state your reasoning in one sentence. After each tool result, state what you learned in one sentence. Stop when the goal is met or after 6 steps."
tools_hands_on: [{"name": "LangGraph", "url": "https://langchain-ai.github.io/langgraph/"}, {"name": "Model Context Protocol", "url": "https://modelcontextprotocol.io"}]
tools_demo: [{"name": "CrewAI", "url": "https://crewai.com"}, {"name": "LangChain agents", "url": "https://langchain.com"}]
tools_reference: [{"name": "HuggingFace smolagents", "url": "https://huggingface.co/docs/smolagents"}, {"name": "AutoGen", "url": "https://microsoft.github.io/autogen/"}, {"name": "browser-use", "url": "https://github.com/browser-use/browser-use"}, {"name": "Playwright-MCP", "url": "https://github.com/microsoft/playwright-mcp"}]
resources: [{"name": "Anthropic: Building effective agents", "url": "https://www.anthropic.com/engineering/building-effective-agents"}, {"name": "MCP specification", "url": "https://modelcontextprotocol.io/specification"}]
---

## Intro

Until now every LLM call you have made has been a one-shot: prompt in, text out. Today that changes. An agent is a model in a loop, with the ability to call tools and decide what to do next based on what the tools return. It is the difference between asking a model "what is the weather in Mumbai?" and handing it a browser, a calculator, a file system, and a goal — and watching it work.

This is the day the gap between "AI is cool" and "AI gets things done" closes. You will build a three-tool LangGraph agent, trace its reasoning, hit one of its predictable failure modes, and fix it. You will also plug your first MCP server into Cursor or Claude and understand why every AI vendor in 2026 speaks MCP natively.

## Read: ReAct, tool-use, planning loops, and MCP

### The ReAct loop — reason plus act

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

### Tool-use — the contract that makes it work

A tool is a function the model can call. But to the model, a tool is three things:

- **Name** — `web_search`, `write_file`.
- **Description** — what it does, in plain English, crisply. The model reads this every turn.
- **Schema** — typed inputs and outputs, usually JSON schema.

Good tools have small surface area. `write_file(path, content)` is great. `filesystem(operation, path, content, mode, flags)` is a pit of despair — the model will fill in `flags` wrong every time. A tool should do one thing and describe itself in one sentence.

Return values matter as much as inputs. Return structured data the model can parse. Return errors with a hint about how to fix them: `{"error": "file not found", "suggestion": "try listing the directory first"}`. The model is a reader; give it good prose.

### Planning loops — and why agents break

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

### MCP — USB-C for AI tools

The Model Context Protocol is a specification published by Anthropic and now adopted across the industry. It is the cable standard for connecting AI models to tools, data sources, and services. Before MCP, every vendor had their own plugin format: OpenAI had plugins, Claude had tools, LangChain had its own wrappers, Cursor had its own extension system. Every integration was re-built for every host.

MCP flips that. You write **one MCP server** that exposes a set of tools, and any MCP-compatible client — Cursor, Claude Desktop, Zed, your own app — can use them. Think USB-C: one cable, one spec, any device.

An MCP server exposes three things:

- **Tools** — callable functions (same idea as LangChain tools).
- **Resources** — readable data the model can fetch (files, DB rows, API responses).
- **Prompts** — reusable prompt templates the user can invoke.

The transport is usually stdio (for local processes) or Streamable HTTP (for remote servers). You run the server, tell the client where to find it, and the client handshakes to discover capabilities. Any model that supports tool use can now use your server — no vendor-specific code.

The practical implication: stop building one-off integrations. If you have a useful capability — a search over your company wiki, a wrapper over your internal API, a custom data source — expose it as an MCP server. It then works across every AI host your team uses, now and next year.

### CrewAI and the multi-agent tease

CrewAI is a framework that makes multi-agent workflows trivial to describe. You define agents by role — "researcher", "writer", "reviewer" — give each one tools and a backstory, and CrewAI orchestrates the handoffs. It is a beautiful abstraction for a small class of problems: anything where a sequential assembly line of roles produces better output than a single generalist.

We demo it today. Tomorrow we go deep on multi-agent patterns and when the abstraction hurts more than it helps.

## Watch: Tracing an agent step by step

<!-- TODO: replace video -->

## Lab: A 3-tool LangGraph agent + your first MCP server

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

## Quiz

1. What does ReAct stand for and what are the two kinds of model output each turn?
2. What three things define a tool from the model's perspective?
3. Name three predictable ways agents break and one fix for each.
4. What does MCP stand for and what analogy is used for it?
5. What three kinds of capabilities does an MCP server expose?

## Assignment

**Daily:** Submit (a) your working LangGraph agent repo, (b) a full trace of one successful run and one failed run, and (c) a one-paragraph writeup of the single loop-fix you had to make to keep the agent from breaking.

## Discuss: The MCP server you would build next

If you were to publish one MCP server for your team or community to use, what would it wrap? Post the name, the three tools it would expose, and who would benefit. We will vote on the best ideas and encourage a few of you to actually build and publish them this week.
