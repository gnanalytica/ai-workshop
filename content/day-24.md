---
reading_time: 14 min
tags: ["mcp", "agents", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Write your first MCP server", "url": "https://modelcontextprotocol.io/"}
resources: [{"title": "Model Context Protocol", "url": "https://modelcontextprotocol.io/"}, {"title": "MCP GitHub org", "url": "https://github.com/modelcontextprotocol"}, {"title": "MCP Python SDK", "url": "https://github.com/modelcontextprotocol/python-sdk"}, {"title": "Claude Desktop config", "url": "https://modelcontextprotocol.io/quickstart"}]
---

## Intro

Every tool-using agent eventually re-invents the same plumbing: how do I describe my tools to the model, how do I stream their output back, how do I swap providers without rewriting everything? MCP is the answer the industry converged on. By 2026 it's supported by Claude, Cursor, VS Code, Zed, OpenAI's Agents SDK, and most serious agent frameworks. Today you write one.

## Read: MCP, stripped of marketing

**Model Context Protocol** is a JSON-RPC 2.0 spec, released by Anthropic in late 2024, for connecting models to **tools**, **resources** (readable data), and **prompts** (reusable templates). The pitch — "USB-C for AI" — is mostly right: one plug shape, many devices.

### Three primitives, that's all

| Primitive | What it is | Example |
|---|---|---|
| **Tool** | A function the model can call | `send_email(to, body)` |
| **Resource** | Readable content the model can fetch | `file://notes/2026-04-17.md` |
| **Prompt** | A parameterized template the client offers users | `/summarize-pr {pr_number}` |

The beauty is separation of concerns: the **server** exposes primitives, the **client** (Claude Desktop, Cursor, your app) decides how to present them. Your server doesn't know or care which model calls it.

### Transports

- **stdio** — server is a subprocess, pipes over stdin/stdout. Easiest to start, local only.
- **Streamable HTTP** — server is a web service, supports remote hosting and auth. What you'd use in production.

Start with stdio. Go HTTP when someone other than you needs to use it.

### Minimal server, Python

```python
# server.py
from mcp.server.fastmcp import FastMCP
import httpx, datetime

mcp = FastMCP("study-helper")

@mcp.tool()
def word_count(text: str) -> int:
    """Count words in a string. Use when a user asks how long a passage is."""
    return len(text.split())

@mcp.tool()
async def city_weather(city: str) -> str:
    """Get current weather for a city. Use only for current conditions,
    not forecasts."""
    async with httpx.AsyncClient() as c:
        r = await c.get(f"https://wttr.in/{city}?format=3")
        return r.text

@mcp.resource("time://now")
def now() -> str:
    """Current ISO timestamp."""
    return datetime.datetime.now().isoformat()

if __name__ == "__main__":
    mcp.run()  # stdio by default
```

Run it. `python server.py` — nothing visible happens. That's correct; it's waiting on stdin.

### Wiring it into Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "study-helper": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"]
    }
  }
}
```

Restart Claude Desktop. You'll see a plug icon in the compose box. Ask "how many words in 'the rain in Spain'" — Claude will call your tool.

### When MCP is the right tool (and when it isn't)

Use MCP when:

- You want to expose the same capability to multiple clients (Claude, Cursor, your own app).
- You're building an internal tool others on your team need.
- You want a clean trust boundary — MCP clients ask permission per tool call.

Don't bother when:

- You have one app and one model; a plain function call is simpler.
- You need sub-10ms latency; JSON-RPC over stdio is not free.
- Your tool is so stateful it needs a database — build it as a service and wrap a thin MCP server around it.

> MCP is a contract, not a framework. It saves you from inventing one, not from thinking.

## Watch: MCP end-to-end walkthrough

A build-along showing a working stdio server, wiring to Claude Desktop, then migrating the same server to HTTP with OAuth.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch how they scope resource URIs — the namespace matters.
- Notice how they handle a tool that needs user confirmation.
- Pay attention to error payloads — MCP errors are structured.

## Lab: Write a minimal MCP server and plug it in

You're building a tiny "notes server" that exposes two tools — `search_notes` and `append_note` — against a local markdown folder.

1. `pip install mcp httpx`. Create a folder `~/mcp-notes/` with 3 sample markdown files inside a `notes/` subfolder.
2. Create `server.py` using `FastMCP`. Name it `notes`.
3. Implement `search_notes(query: str) -> list[str]` — returns file paths that contain `query` (case-insensitive, plain substring is fine).
4. Implement `append_note(filename: str, text: str) -> str` — appends text to a file under `notes/`. Reject paths that escape the folder.
5. Write **precise** docstrings. Your docstring is the model's API reference.
6. Test it standalone with the MCP inspector: `npx @modelcontextprotocol/inspector python server.py`. Click around, invoke both tools.
7. Wire it into Claude Desktop or Cursor via config. Restart.
8. Open a fresh conversation and ask: "Find my notes about LangGraph and add a line saying I finished day 23." Verify the file actually changed on disk.
9. Add one **resource**: `notes://index` that returns the list of all notes as markdown. Re-test.
10. Commit the server. In the README, show a one-line install snippet that a classmate could copy into their config.

## Quiz

Three questions covering the three MCP primitives, the difference between a tool and a resource, and why stdio servers run as subprocesses. One bonus on when you'd pick HTTP transport.

## Assignment

Publish your MCP server to GitHub with a short README: what it does, the config block to install it, and a 30-second demo GIF of it working in Claude Desktop or Cursor. Then consume one MCP server someone else built — a public one from the official servers repo — and write two paragraphs on the design choices you'd imitate or avoid.

## Discuss: Protocols eat platforms

- Why did MCP win over custom plugin systems from OpenAI and others? What did it get right?
- Security: MCP servers can read your files and hit the network. How do you decide which servers to trust?
- Would you build your capstone as an MCP server, a plain app, or both? Why?
- What's missing from MCP that you'd add if you were designing v2?
- When the model picks the wrong MCP tool, whose fault is it — the server author, the client, or the model?
