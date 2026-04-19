---
reading_time: 14 min
tldr: "LangGraph turns agents into debuggable graphs. Build one, watch it think, fix its loops."
tags: ["agents", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Build a 3-tool LangGraph agent", "url": "https://langchain-ai.github.io/langgraph/"}
resources: [{"title": "LangGraph tutorials", "url": "https://langchain-ai.github.io/langgraph/tutorials/"}, {"title": "LangChain docs", "url": "https://python.langchain.com/docs/"}, {"title": "Langfuse", "url": "https://langfuse.com/docs"}, {"title": "CrewAI", "url": "https://docs.crewai.com/"}]
---

## Intro

Yesterday you mapped an agent on paper. Today you build one that actually runs — in LangGraph, with three real tools, against a messy real task. Your goal is not a pretty demo. Your goal is to watch the loop break, then fix it. That is the skill.

## Read: LangGraph in one sitting

LangGraph models an agent as a **state graph** — nodes are functions, edges are transitions, and state is a typed dict that flows through. It's Pythonic, debuggable, and has mostly eaten the LangChain AgentExecutor pattern by 2026. Alternatives: CrewAI (role-based, nicer for multi-agent), the OpenAI Agents SDK (thin, provider-locked), Claude Agent SDK (same but for Anthropic). Pick LangGraph when you want control.

### The core shape

```python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

llm = ChatOpenAI(model="gpt-4.1-mini").bind_tools(tools)

def reasoner(state: AgentState):
    return {"messages": [llm.invoke(state["messages"])]}

def should_continue(state):
    last = state["messages"][-1]
    return "tools" if last.tool_calls else END

graph = StateGraph(AgentState)
graph.add_node("reasoner", reasoner)
graph.add_node("tools", ToolNode(tools))
graph.add_edge("tools", "reasoner")
graph.add_conditional_edges("reasoner", should_continue)
graph.set_entry_point("reasoner")
app = graph.compile()
```

That's it. Everything else — memory, checkpoints, human-in-the-loop — is an add-on to this skeleton.

### Tool design matters more than prompts

A good tool has:

- A **verb-noun** name (`search_web`, not `tool1`).
- A docstring that says **when to use it**, not just what it does.
- A narrow, typed input schema.
- Deterministic, small outputs. Truncate before returning.

```python
from langchain_core.tools import tool

@tool
def search_web(query: str) -> str:
    """Search the public web. Use for facts newer than 2024 or
    names/events you don't recognize. Do NOT use for math."""
    ...
```

Models follow tool docstrings the way humans follow street signs. Vague docstring, vague agent.

### Debugging a loop that won't stop

Three habits that save hours:

1. **Trace everything.** Hook up Langfuse or LangSmith from minute one. Reading raw tool traces teaches you more than any blog post.
2. **Cap recursion.** `app.invoke(..., {"recursion_limit": 10})`. Fail loud.
3. **Print the messages array after each step** while developing. If you don't know what's in state, you can't reason about why the model did what it did.

## Watch: Build along with LangGraph

A recorded build where someone constructs a small tool-using agent and walks through their debugging sessions. The mistakes are more instructive than the code.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch where they set the recursion limit and why.
- Notice how they write tool docstrings — surgical, not generic.
- Pay attention to how they inspect state between steps.

## Lab: Build a 3-tool agent, then break it

You're building an agent with three tools: a web search, a calculator, and a file-writer. It will take a messy research question and produce a markdown brief on disk.

1. `pip install langgraph langchain langchain-openai tavily-python python-dotenv`. Set `OPENAI_API_KEY` and `TAVILY_API_KEY` in a `.env`.
2. Create `tools.py` with three `@tool`-decorated functions: `search_web(query)` (Tavily), `calc(expression)` (use `numexpr`, not `eval`), and `write_file(path, content)` (restrict to `./out/`).
3. Write precise docstrings. Explicitly say when NOT to use each tool.
4. Create `agent.py` with the LangGraph skeleton above. Bind the three tools. Set recursion limit to 8.
5. Run it on the task: *"Compare the cost of running Llama 3.1 70B on Together.ai vs. on a rented H100, for 1M tokens/day. Write me a one-page brief in `out/brief.md` with a cost table and a recommendation."*
6. Watch it work. It will probably do something wrong. Log the full message trace.
7. Identify the first failure. Is it a bad tool call, a hallucinated number, or a thrash? Write it down.
8. Fix one thing — sharpen a docstring, add a validator, or tighten the system prompt. Re-run.
9. Add a `recursion_limit` assertion and a simple eval: does `out/brief.md` exist and contain the words "cost" and "recommendation"? Make it a function.
10. Commit the repo. Include a `NOTES.md` with the three bugs you saw and how you fixed two of them.

## Quiz

Four questions on LangGraph state, when conditional edges fire, what `bind_tools` actually does under the hood, and the single most common reason agent loops run forever.

## Assignment

Extend your lab agent with a fourth tool of your own — something domain-specific to your capstone idea. Run it on three different real prompts. For each, log: number of iterations, total tokens, cost, and whether the output was correct. Put the table in your repo README. If your agent's average cost per run is >$0.25, redesign until it's cheaper or explain why the cost is worth it.

## Discuss: When agents earn their keep

- In your run, did the agent actually plan — or did it just chain tools linearly? How do you tell?
- Would CrewAI's role-based abstraction have helped here, or added ceremony?
- Where's the line between "prompt the tools harder" and "redesign the graph"?
- Your agent will run against flaky APIs. What's the right retry strategy — at the tool level, the node level, or the graph level?
- If you shipped this to a classmate, what one safeguard is non-negotiable before they press run?
