---
reading_time: 14 min
tldr: "You are the director, not the typist. AI writes code; you shape intent, critique output, and steer."
tags: ["concepts", "ai-tools", "vibe"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Direct an AI pair programmer (no typing)", "url": "https://cursor.com/"}
resources: [{"title": "Cursor", "url": "https://cursor.com/"}, {"title": "Claude Code", "url": "https://www.anthropic.com/claude-code"}, {"title": "Replit", "url": "https://replit.com/"}]
---

## Intro

The last four days gave you the mental model of software. Today you put on the director's chair. Your job is not to type code. Your job is to tell an AI what to build, read what it produced, critique it, and steer it. This is the skill that will define the next decade of work.

## Read: From programmer to director

### The shift

The word "programmer" is becoming a verb that humans do less and less. In 2026, you will spend more time:

- describing intent,
- reviewing diffs,
- asking for changes,
- and approving shipping,

than you spend typing. Tools like **Cursor**, **Claude Code**, **Windsurf**, **bolt.new**, **v0**, **Lovable**, and **Replit Agent** are the camera, lights, and crew. You are the director.

> Andrej Karpathy coined "vibe coding": describing the *feel* of what you want and letting the model commit it into being. It is a real skill, not a gimmick.

### The director's four verbs

| Verb | What you do | Analogy |
|---|---|---|
| Intent | Describe the goal with context | "We're shooting a heist sequence" |
| Critique | Read output and identify what's off | "Light the face from the left" |
| Constrain | Narrow the solution space | "Keep it under 90 seconds" |
| Verify | Run / click / observe the result | Watch the playback |

Bad directors skip critique and verify. They ask, accept, and ship. Then things blow up.

### The anatomy of a great prompt to a coding AI

A weak prompt: *"make a todo app"*

A director's prompt:

> Build a single-page todo app. Stack: vanilla HTML + CSS + vanilla JS in one file. Requirements: add a todo (Enter to submit), toggle done (click), delete (x button), persist in localStorage. No dependencies, no build step. Design: clean, minimal, dark mode by default, system font, responsive. When done, show me the file tree and wait for my review before making further changes.

Every clause is a dial:

- **Stack** constrains the solution space.
- **Requirements** define "done".
- **Constraints** ("no dependencies", "one file") prevent scope creep.
- **Design** communicates taste.
- **Protocol** ("wait for review") controls the loop.

### The context-quality axis

AI output quality is mostly a function of the context you give it. Order of impact, roughly:

1. A **clear goal** (1 sentence).
2. **Concrete constraints** (tech stack, file layout, "do not").
3. **Examples** of the style / output you want.
4. **The existing codebase** being in the tool's working memory (Cursor handles this; chat UIs don't).
5. **Feedback loops** — let it run, see the result, iterate.

If your output is bad, your context was bad. "The AI is dumb" is almost always wrong.

### When to let the AI drive vs when to pause

| Let AI drive | Pause and think yourself |
|---|---|
| Boilerplate, setup, scaffolding | Schema / data model decisions |
| Renaming, refactoring, porting | Security, auth, payments |
| Fixing obvious bugs from errors | Anything irreversible (deletes, migrations) |
| Writing tests for existing code | Architectural choices (REST vs WS, SQL vs NoSQL) |
| UI styling iterations | Naming the product |

Rule of thumb: **the AI writes; you decide**.

### The critique loop

Once the AI produces code, your job is to **read the diff like a PR reviewer**:

1. Does it match the intent? (Not "does it compile"; does it solve what I asked.)
2. Is the approach sensible? (Any red flags — fake data, hard-coded secrets, needless complexity?)
3. What did it skip or assume silently?
4. What would break in a real user's hands?

Then respond with targeted feedback, not vague frustration. *"The delete button deletes immediately; add an undo toast that lasts 5 seconds"* beats *"the delete is bad, fix it"*.

### Common traps

- **The agreement trap**: the AI will happily agree with a wrong direction. Push back on its confidence.
- **The hallucinated API**: it imagines a library function that doesn't exist. Always run the code.
- **The silent skip**: it says "I've implemented it" but left a `TODO` inside a function. Read the diff.
- **The yes-machine loop**: you ask for a change, it over-corrects, you ask again, it over-corrects back. Break the loop by restating the spec.
- **The single-file blob**: it puts everything in one file. Ask for structure upfront.

### The modern toolbelt in one table

| Tool | Best for | Where it runs | You type code? |
|---|---|---|---|
| Cursor | Working on a real codebase, IDE-first | Desktop | Rarely; AI types |
| Claude Code | Terminal-native agentic work | Terminal | No |
| Windsurf | IDE with deeper agentic loops | Desktop | Rarely |
| bolt.new | From-scratch web apps in browser | Browser | No |
| v0 by Vercel | UI components, React/Next.js | Browser | No |
| Lovable | End-to-end web apps with deploy | Browser | No |
| Replit Agent | Cloud IDE that can also deploy | Browser | No |
| ChatGPT / Claude.ai | Ad-hoc snippets, explanations | Browser | Copy-paste |

All of these are the pen. You are the author.

## Watch: Vibe-coding in practice

Watch one senior engineer stream a real session with Cursor or Claude Code. Pay attention to what they *do not* type.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Notice how often they stop the AI mid-stream.
- Notice how they phrase corrections.
- Notice that they still read every diff.

## Lab: Direct an AI pair programmer (45 min)

**If you're tempted to type code yourself, stop and ask the AI to do it.** Your hands type English only.

1. Install **Cursor** (`cursor.com`) or **Claude Code** (`anthropic.com/claude-code`). Sign in.
2. Create an empty folder, open it in the tool. Start a new chat/agent session.
3. Write a **director's prompt** for a small utility — e.g. "a single-page JPEG-to-WebP converter that runs entirely in the browser, no backend, with drag-and-drop and a download button". Include stack, constraints, design, and protocol. Paste your prompt into your worksheet.
4. Let the AI generate. **Do not** edit the code yourself. Read the diff.
5. Open the file in a browser. Try it. Find one real bug or UX flaw. Describe it in one sentence in your worksheet.
6. Ask the AI to fix exactly that, with one constraint added (e.g. "also show original-vs-new file size"). Review the new diff.
7. Iterate 2–3 more rounds. For each round, log: your prompt, the change, and whether you accepted or pushed back.
8. At the end, write a 5-line retrospective: what worked, what didn't, what you'd do differently. Attach the final file and your iteration log.

Submit the log + the final output.

## Quiz

4 questions: given a weak prompt, rewrite it as a director's prompt; identify one failure mode in a provided AI-written diff; list three tasks you should *not* offload to the AI; define "vibe coding" in one sentence.

## Assignment

Compare two AI tools (e.g. Cursor vs bolt.new) on the same small spec. Submit a 1-page reflection: what each did well, which you'd choose for what job, and one screenshot each. No code from you. Submission: PDF + screenshots.

## Discuss: The director's chair

- If AI can write most of the code, what is left for a human engineer to own?
- What's the difference between being lazy and being a good director? They can look similar from the outside.
- When is it worth reading every line vs trusting the AI and running the code?
- A junior teammate vibe-codes a PR you can tell they don't fully understand. How do you respond?
- Five years out, which parts of this workflow do you think will be gone entirely?
