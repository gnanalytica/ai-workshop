---
reading_time: 15 min
tags: ["ai-tools", "fundamentals", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Set up Ollama + Continue and refactor with an AI pair", "url": "https://example.com/labs/day-13"}
resources: [{"title": "Ollama", "url": "https://ollama.com/"}, {"title": "Continue (VS Code)", "url": "https://www.continue.dev/"}, {"title": "Cursor", "url": "https://cursor.com/"}, {"title": "Cline", "url": "https://cline.bot/"}]
---

## Intro

You've spent a week learning fundamentals the hard way. Now you'll meet the tool that's changing how developers work: an AI pair programmer. Today is not about *how LLMs work* — that's next week. Today is about *using one well* as a tool, without becoming dependent on it.

## Read: Pair programming with AI, pragmatically

### What an AI pair programmer actually is

It's an editor integration — VS Code, JetBrains, Neovim — that can:

- Autocomplete the next few lines.
- Answer questions about code you highlight.
- Suggest edits to a file you're in.
- Run multi-file refactors when you ask.

That's it. It's not a magic engineer. It's a fast, confident, sometimes-wrong collaborator that reads what you show it.

### The tools you'll see this year

| Tool | Runs models | Best for | Cost |
|------|-------------|----------|------|
| [Ollama](https://ollama.com/) | local | privacy, offline, free | free (your machine) |
| [Continue](https://www.continue.dev/) | local or cloud | VS Code/JetBrains with your choice of model | free (open source) |
| [Cline](https://cline.bot/) | cloud | autonomous multi-file edits in VS Code | free + bring-your-own-key |
| [Cursor](https://cursor.com/) | cloud | full editor rebuilt around AI | paid tier |

Today we'll use **Ollama + Continue** because it runs locally, costs nothing, and teaches you how these tools work underneath.

### The three modes of AI assistance

1. **Autocomplete.** Ghost text as you type. Accept with Tab. Reject by typing.
2. **Chat.** Ask a question about highlighted code. Good for "explain this" or "why is this slow?"
3. **Edit.** Describe a change; the tool proposes a diff. Good for "rename this variable everywhere" or "add type hints to this function."

Beginners reach for chat. Pros use autocomplete for flow and edit mode for refactors.

### How to use it well (and how not to)

> Treat AI suggestions like a pull request from an unfamiliar contributor. Read it, run it, test it. **Never merge unread.**

Do:
- Read every line before accepting.
- Keep functions short so the AI has tight context.
- Use it to *speed up* things you already understand.
- Write the tests yourself, or review AI-generated tests extra carefully.

Don't:
- Let it write code you can't explain.
- Paste confidential code into cloud tools without checking policy.
- Accept its first answer when debugging — ask for alternatives.
- Use it as a search engine replacement for core concepts you need to learn.

### Local models, briefly

`ollama pull qwen2.5-coder:7b` downloads a coding-focused model (~4 GB). It runs on your laptop. It's not as strong as frontier cloud models, but it's:

- Private (nothing leaves your machine).
- Free to run.
- Good enough for refactors, explanations, and autocomplete on most codebases.

For a student laptop, a 7B model is usually the sweet spot. 3B runs everywhere but feels weaker; 13B+ needs 16 GB+ RAM and a decent GPU.

### A note on *not* becoming dependent

The biggest risk with AI tools is skill atrophy. If you accept every completion without reading, in six months you'll be a worse engineer than you are today. The fix is boring: regularly write chunks of code with the tool off. Treat AI like a forklift, not a wheelchair.

## Watch: A real refactor with an AI pair

A short walkthrough of taking a messy 80-line Python function, splitting it with Continue's edit mode, and reviewing each proposed change.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch how the author accepts some suggestions and rejects others.
- Notice they run tests after every accepted change.
- See what they do when the AI confidently proposes a wrong fix.

## Lab: Ollama + Continue, end to end

Install a local AI pair programmer and use it to improve yesterday's code.

1. Install Ollama from [ollama.com](https://ollama.com/). Verify: `ollama --version`. Start the service (macOS/Windows: it auto-starts; Linux: `ollama serve &`).
2. Pull a coding model:
   ```bash
   ollama pull qwen2.5-coder:7b
   ollama run qwen2.5-coder:7b "write a python function that reverses a string"
   ```
   Confirm you get a sensible answer.
3. In VS Code, install the **Continue** extension from the Marketplace.
4. Open Continue's config (`~/.continue/config.json` or via the UI) and add Ollama as a provider:
   ```json
   {
     "models": [
       {
         "title": "Qwen Coder 7B",
         "provider": "ollama",
         "model": "qwen2.5-coder:7b"
       }
     ],
     "tabAutocompleteModel": {
       "title": "Qwen Coder 7B",
       "provider": "ollama",
       "model": "qwen2.5-coder:7b"
     }
   }
   ```
5. Reload VS Code. Open your Day 10 `gh-explorer/explorer.py`. Confirm you get ghost-text autocomplete as you type.
6. Highlight the `get_all` pagination function. Open Continue chat. Ask: *"Explain what this does and one edge case it doesn't handle."* Read the answer critically — is it right?
7. Use edit mode (Cmd/Ctrl+I). Prompt: *"Add a `max_pages` parameter (default 10) to prevent runaway loops. Keep behavior unchanged when not passed."* Review the diff. Accept only if correct.
8. Run your script against a known user. Confirm output is unchanged.
9. Commit in a new branch `feat/ai-refactor` with a clear message. Open a PR to your own repo. In the PR description, list exactly which lines were AI-suggested vs. hand-written.
10. Disable Continue. Without AI help, write a small function `top_n_by(items, key, n)` and a test. Notice how it feels.

Stretch: try Cline instead of Continue for a multi-file change. Compare the experience.

## Quiz

Three questions on when to use autocomplete vs. chat vs. edit, one on local vs. cloud tradeoffs, and one short answer on what "skill atrophy" means in this context.

## Assignment

Submit the PR link from step 9. In a 6-line `AI-USAGE.md` in that PR, describe: which tool, which model, one suggestion you *rejected* and why, and one bug the AI missed that you caught. This reflection is the point, not the code.

## Discuss: Pair, or crutch?

- Where's the line between "using AI to go faster" and "letting AI do the thinking"? Give a specific example of each.
- Your college has a rule against "AI assistance" in assignments. Your internship expects you to use Copilot daily. How do you hold both?
- Local models (Ollama) vs. cloud models (Cursor). When does each win?
- You catch a teammate submitting an AI-generated PR they clearly didn't read. How do you handle it?
