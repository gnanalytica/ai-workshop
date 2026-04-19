---
reading_time: 14 min
tags: ["ux", "product", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Redesign one AI feature for trust", "url": "https://excalidraw.com/"}
resources: [{"title": "Nielsen Norman Group", "url": "https://www.nngroup.com/"}, {"title": "Figma", "url": "https://www.figma.com/"}, {"title": "Excalidraw", "url": "https://excalidraw.com/"}, {"title": "Apple HIG: Generative AI", "url": "https://developer.apple.com/design/human-interface-guidelines/generative-ai"}, {"title": "Google PAIR guidebook", "url": "https://pair.withgoogle.com/guidebook/"}]
---

## Intro

A working model is not a working product. Most AI features feel slightly off not because the model is wrong, but because the UI pretends the model is never wrong. Today's question: when your model is probabilistic, what does a trustworthy interface look like?

## Read: UX for systems that sometimes lie

The design problem with AI features is that the output quality is a **distribution**, not a value. Your UI has to give the user tools to navigate that distribution — to notice when things look off, to intervene, to recover. Five patterns do most of the work.

### 1. Uncertainty, made visible

If your model is confident, say so; if it isn't, say that too. Options, ordered by how much they change the UX:

- Hedging language in the output itself ("it looks like…", "I'm not sure, but…").
- Inline confidence badges on specific claims.
- Highlighting parts of the answer that came from retrieval vs. were generated.
- A dedicated "sources" panel with per-claim citations.

Perplexity won users by making the last one non-optional. Copy the pattern.

### 2. Citations and receipts

For anything factual, show receipts. The design question is **where**: footnotes under the paragraph, hover cards over claims, or a side panel. Rule: the closer the source is to the claim, the more the user trusts it.

### 3. Stop, undo, regenerate

Three controls no AI feature should ship without:

| Control | Why it matters |
|---|---|
| **Stop** | Long generations need an interrupt. No stop button = no trust. |
| **Undo** | Especially for write actions. An agent that can't undo is a liability. |
| **Regenerate / try again** | Let users escape bad outputs without restarting the task. |

### 4. Progressive disclosure of agency

An AI feature can act in several modes:

1. **Suggest** — shows output, user copies manually.
2. **Draft** — inserts into the doc, marked as AI-generated.
3. **Apply with confirmation** — proposes an action, asks yes/no.
4. **Auto-apply** — does it; user can undo.

Default to the lowest mode you can get away with. Move up only when usage patterns prove it's safe and wanted.

### 5. Failure modes, by design

Every AI feature has failure modes. Good design names them in the UI. GitHub Copilot's gray ghost text says "this is a guess, not a commit". Notion AI's "continue writing" button implicitly accepts that it can be ignored. Your feature needs the equivalent — a visual contract with the user that says **"this output is provisional"**.

### Worked example: "AI-summarize my notes"

Naive design: button labeled "Summarize" → replaces the note with AI output. Awful.

Redesign, applying the patterns:

- Button labeled **"Draft summary"** (not "Summarize" — that implies correctness).
- Output opens in a **side pane**, not in place of the note.
- Each bullet in the summary has a small **source link** to the note region it came from.
- A visible **stop** button while generating; a **regenerate** button after.
- An explicit **"Insert at top of note"** action — never auto-inserts.
- A faint **"AI-generated"** marker on inserted content that persists for 24 hours.

The feature does the same work. The user is now in charge.

## Watch: Interfaces for probabilistic systems

A talk from a designer who ships AI features at scale. Focus is less on the model and more on the micro-interactions — skeleton loaders, confidence states, the undo stack.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch how they handle streaming output — it shapes the perceived latency.
- Notice the copy on error states; AI errors need different words than 500s.
- Pay attention to how they test designs with users who don't trust AI.

## Lab: Redesign one AI feature for trust

You will take one existing AI feature — yours or someone else's — and redesign it in Figma or Excalidraw.

1. Pick a feature. Defaults if stuck: "AI reply in Gmail", "AI summarize PR in GitHub", "AI-generated cover letter from a resume".
2. Use it for real. Take screenshots of every screen, every state (idle, loading, result, error).
3. Write a list of every moment the UI could lie to you, rush you, or trap you.
4. Open Excalidraw (or a fresh Figma file). Draw the current flow as-is. Annotate in red where trust breaks.
5. Redesign the flow applying all five patterns: uncertainty, citations, stop/undo/regenerate, progressive agency, named failure modes.
6. Explicitly show at least one new state that the original UI hid (e.g. low-confidence output, a mid-generation stop, an undo after apply).
7. Pick one **micro-interaction** and design it carefully — the streaming skeleton, the regenerate animation, the citation hover card.
8. Write 3 sentences of rationale for each pattern change. Not "prettier" — functional.
9. Share the file link with a classmate. Ask them to point to one thing that still feels untrustworthy.
10. Iterate once, then post your before/after in the cohort channel.

## Quiz

Three questions on the five trust patterns, the difference between "suggest" and "apply with confirmation" modes, and why streaming matters for perceived latency. A bonus on when auto-apply is acceptable.

## Assignment

Build a **Loom or screen-recorded** walkthrough (under 3 minutes) of your redesign. Narrate why each change exists. Put the Figma/Excalidraw link and the video in a single markdown file in your repo. If you can't defend a design choice in one sentence, cut it.

## Discuss: Taste in the age of mediocrity

- Which AI product today has the best UX for uncertainty, and what specifically do they do?
- Auto-apply vs. confirmation: where's the line, and does it move as trust grows?
- Citations are trusted even when wrong. Is that a feature or a failure?
- How do you design for users who don't know the model can be wrong?
- When an AI feature's accuracy drops from 95% to 92%, what should change in the UI — and what shouldn't?
