---
reading_time: 14 min
tldr: "Direct an AI to build your app from your Day-14 spec, iterate, deploy, and ship a live URL by tonight."
tags: ["vibe", "shipping", "capstone"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Ship your first AI app to a live URL", "url": "https://bolt.new/"}
prompt_of_the_day: "Build me a single-page web app that does the following:\n- Audience: {{who}}\n- Problem it solves: {{pain}}\n- Core flow: {{six_box_flow}}\n- Success looks like: {{shipped_criteria}}\n- Stack: Next.js + Tailwind. Keep it simple. Add clear placeholder data so I can see it working immediately."
resources: [{"title": "bolt.new", "url": "https://bolt.new/"}, {"title": "Lovable", "url": "https://lovable.dev/"}, {"title": "v0", "url": "https://v0.dev/"}, {"title": "Cursor", "url": "https://cursor.com/"}, {"title": "Claude Code", "url": "https://www.anthropic.com/claude-code"}]
---

## Intro

This is the day you've been prepping for. Every concept, every lab, every discussion — they all converge here. You will not write code. You will direct an AI to write code, iterate on what it gives back, and ship a live URL tonight. Week 2's thinking pays off now.

## Read: Vibe-coding is a real skill

"Vibe-coding" is directing an AI to build software through plain-English conversation. Critics hate the name. The thing itself is real — in 2026, shipping a working MVP in an afternoon is normal, and the people who do it best share one trait: they know what they want before they start typing.

### Why yesterday's spec matters today

The single biggest predictor of whether you ship a good app today is whether your Day-14 spec is sharp. A vague spec yields a vague app. A one-line "a study helper with AI" gets you exactly that — a generic chat box wrapper. A detailed spec gets you something specific and useful.

Your spec already has: who it's for, what pain it removes, the six-box flow, success criteria, an anti-goal. You'll paste that, roughly, as your first message.

### Pick one tool and commit

Don't channel-surf between builders. Pick one and stay all day.

| Tool | Best for | Deploy story |
|---|---|---|
| bolt.new | Full-stack web apps with backend | One-click Netlify |
| Lovable | Polished SaaS-looking UIs, DB included | Built-in deploy + Supabase |
| v0 | Beautiful front-end components, design-forward | One-click Vercel |
| Cursor / Claude Code | Deeper control, working with a real repo | You manage deploy |

For today, we recommend **bolt.new** or **Lovable**. Both run in browser, both deploy for free, both handle the full stack. v0 is gorgeous but more front-end focused. Cursor/Claude Code are the pros' choice — try them next week.

### The iteration loop that actually works

```
Read this, don't type it

 1. Describe      ->  paste spec, get first version
 2. Try it        ->  click through; note what's broken
 3. Name it       ->  "the submit button does nothing; fix and add a loading state"
 4. Let AI work   ->  don't edit manually; direct it back
 5. Repeat        ->  10-20 tight loops beats 2 giant refactors
```

The trap is trying to fix things yourself by reading the code. Don't. The AI wrote it, the AI can fix it. Your job is to see problems clearly and describe them precisely.

### The three layers of your app

Almost every AI app has three layers. Know which one has a bug.

- Front-end. The UI the user sees. Buttons, forms, chat boxes. Bugs here are visual or interaction-based.
- Back-end / API. The glue that calls the LLM, stores data, talks to external APIs. Bugs here are "nothing happens when I click" or "500 error."
- Data. Database, vector store for RAG, file uploads. Bugs here are "my upload disappeared" or "it keeps showing the same answer."

When something breaks, diagnose which layer. "The button doesn't do anything" could be front-end (button isn't wired) or back-end (API never returned). Open the browser's DevTools Network tab to see which.

### Ship criteria, revisited

From your Day-14 spec, you have three success criteria and one anti-goal. Tape them to your screen. At every iteration, ask: am I closer to these three, or farther? Anything that doesn't move those numbers is a distraction.

### The six classic mistakes to avoid

1. Changing the spec mid-build. You lose the AI's context and restart from zero.
2. Adding auth on Day 1. Nobody needs to log in to see your demo. Skip.
3. Making it pretty before it works. Ugly-and-working beats beautiful-and-broken.
4. Copying errors into chat without the context. The AI needs the file, the line, and what you clicked.
5. Quitting on the third failure. Most apps get built on the eighth attempt. Push.
6. Shipping nothing because "it's not ready." Ship ugly. Iterate tomorrow.

## Watch: A full vibe-coded app, start to URL

A recorded session of a builder taking an idea from empty screen to live URL in under an hour using bolt.new or Lovable. Watch the rhythm of describe-try-name-let-AI-work.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Notice how short each instruction is after the first big one.
- Watch how the builder handles errors — always by describing, never by editing.
- Observe how they ship a broken version first, then fix in place.

## Lab: Ship your first AI app

This is a 90–120 minute lab. Block the time. Close Slack. Let's go.

1. Open your Day-14 spec. Read it once, out loud. Fix any vague sentence before you start.
2. Open https://bolt.new/ (or https://lovable.dev/ — your choice, commit to one). Sign in free.
3. Paste today's prompt-of-the-day, filling `{{who}}`, `{{pain}}`, `{{six_box_flow}}`, and `{{shipped_criteria}}` from your spec. Hit send.
4. Wait. The AI will scaffold a project in 30–90 seconds. Click through the preview. Note three things that work and three that don't.
5. Fix the biggest broken thing first, in one sentence. Example: "The chat input doesn't send on Enter. Also, show a loading spinner while the AI responds." Let the AI rebuild. Test again.
6. If your app needs AI inside it (most will), add a clear instruction: "Use the OpenAI/Anthropic API for the chat. Read the key from an environment variable called OPENAI_API_KEY. Add a settings screen where I can paste my key." Most builders now handle this natively.
7. If your app uses RAG (from Day 19), direct: "Add a file upload. When a PDF is uploaded, chunk it, embed it, store embeddings, and use them to answer questions. Show the source page in each answer." Don't worry about the technical terms — the AI has read every tutorial.
8. Iterate until your three success criteria are met. Deploy using the builder's one-click deploy. Copy the live URL.
9. Share the live URL with one classmate RIGHT NOW. Ask them to try one thing and tell you what broke. Fix that thing. Re-share.

Your deliverable is a live URL that a stranger can open and use. Not a GitHub repo. Not a screenshot. A URL.

## Quiz

Four questions today: which tool fits which job, what makes a good iteration instruction, which layer a given bug lives in, and one "spec review" item where you pick the stronger of two specs.

## Assignment

Submit three things in the class channel: (1) your live URL, (2) a screenshot of your best moment, (3) a 150-word reflection on what surprised you about directing an AI to build something real. Watch two classmates' submissions and leave one specific, kind comment on each.

## Discuss: You shipped. Now what?

- What's the single thing about your app you're proud of, and the single thing you already want to rebuild?
- Which worked better — bolt.new, Lovable, v0, or something else — and why?
- When did the AI most misunderstand you, and how did you recover?
- You now know APIs, embeddings, RAG, prompting, and shipping. Which of those will you deepen next, and why?
- If you had one more day with this app, what would you add? What would you cut?
