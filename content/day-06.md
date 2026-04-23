---
reading_time: 17 min
tldr: "Every chat model has a personality and a superpower — plus a separate class of reasoning models for slow, careful work. Pick the right brain for the job and train it to remember you."
tags: ["exposure", "tools"]
video: https://www.youtube.com/embed/YgvL0dA_2Pg
lab: {"title": "Build your personal Jarvis in Claude Projects", "url": "https://claude.ai"}
prompt_of_the_day: "You are my personal Jarvis for {{context: e.g. 3rd-year CSE at NITK}}. My goals this month are {{goals}}. My constraints are {{time, budget, tools}}. My thinking style is {{style}}. For every answer: (1) ask one clarifying question first if the task is ambiguous, (2) give the shortest honest answer, (3) end with one next step I can do in 10 minutes."
tools_hands_on: [{"name": "ChatGPT", "url": "https://chatgpt.com"}, {"name": "Claude", "url": "https://claude.ai"}, {"name": "Gemini", "url": "https://gemini.google.com"}]
tools_demo: [{"name": "Grok", "url": "https://grok.com"}, {"name": "Microsoft Copilot", "url": "https://copilot.microsoft.com"}, {"name": "Kimi", "url": "https://kimi.moonshot.cn"}]
tools_reference: [{"name": "Poe", "url": "https://poe.com"}, {"name": "HuggingChat", "url": "https://huggingface.co/chat"}, {"name": "Meta AI", "url": "https://meta.ai"}, {"name": "Mistral Le Chat", "url": "https://chat.mistral.ai"}, {"name": "DeepSeek (reasoning)", "url": "https://www.deepseek.com"}, {"name": "OpenAI — reasoning models", "url": "https://platform.openai.com/docs/guides/reasoning"}]
resources: [{"name": "Claude Projects guide", "url": "https://claude.ai"}, {"name": "ChatGPT Custom Instructions", "url": "https://chatgpt.com"}]
objective:
  topic: "Frontier chat models, reasoning vs fast-chat, memory and projects"
  tools: ["Claude", "ChatGPT", "Gemini"]
  end_goal: "Ship a living Claude Project (your Jarvis) loaded with your resume, transcript, and 5 capstone ideas — plus a 3-model comparison screenshot proving why context beats a blank chat."
---

## 🎯 Today's objective

**Topic.** Frontier chat models, reasoning vs fast-chat, memory and projects

**Tools you'll use.** ChatGPT, Claude, Gemini (hands-on today); Grok, Copilot, Kimi (demoed for contrast).

**End goal.** By the end of today you will have:
1. A personal Claude Project ("Jarvis") with your resume, transcript, and 5 capstone ideas uploaded.
2. Three side-by-side screenshots (ChatGPT / Claude-with-context / Gemini) showing why the same prompt gets vastly different answers.
3. One concrete routing rule for yourself — which task goes to which model, and why.

> *Why this matters:* Friday you pick a capstone. Today you build the tool that will help you pick it.

---

### 🌍 Real-life anchor

**The picture.** You text the friend who answers in seconds for movie picks, and you call the cousin who thinks slowly before helping you read a lease. Same you, different *kind* of help — plus a barista who remembers your usual without asking.

**Why it matches today.** **Fast vs reasoning** models are those two friends; **Memory / Projects** are the barista who does not make you repeat your order every visit.

## ⏪ Pre-class · ~20 min

**Faculty note.** Budget ~2 minutes for the 🌍 *Real-life anchor* above — read it aloud or ask one volunteer to restate it in their own words — so the analogy lands before setup.

**Revision / context.** Friday (Day 5) you delivered your 2-minute show-and-tell pitch, stole three cohort tricks, and locked in your **Personal AI Stack v1** — tools, top 10 prompts, top 3 use cases, and your "next bet" for Day 30. Today extends the "tools" row of that stack: the single-chatbot habit is why half your Week-1 prompts felt mid. Pull up your Stack v1 PDF before class; today you'll upgrade "My AI Tools" from a flat list into a routed stack with a Jarvis attached.

### Setup (required)

- [ ] Create free accounts on [ChatGPT](https://chatgpt.com), [Claude](https://claude.ai), and [Gemini](https://gemini.google.com) — same email is fine, but verify login before class starts.
- [ ] In ChatGPT Settings → Personalization, toggle **Memory** ON. In Claude Settings → Profile, open the Custom Instructions field so you know where it lives.

### Primer (~5 min)

- **Read**: Skim the [Claude Projects guide](https://claude.ai) — focus on what "Project knowledge" and "Project instructions" mean. You need those two concepts cold.
- **Watch** (optional): A 3–5 minute clip of someone using Projects/GPTs to pin a system prompt + files. Any short demo on [Poe](https://poe.com) comparing two models on the same question also works.

### Bring to class

- [ ] Your latest resume as a PDF (even a half-page "about me" if you don't have one yet).
- [ ] A plain text list of 5 capstone ideas you are genuinely curious about — hostel, placement, family, hobby, research. No filtering.

> 🧠 **Quick glossary**
> - **Custom Instructions / System Prompt** = a rule you set once that applies to every chat.
> - **Memory** = the model writes down facts about you as you chat (ChatGPT Memory, Gemini Saved Info).
> - **Projects** = a pinned workspace with reference files + system prompt (Claude Projects, ChatGPT GPTs, Gemini Gems).
> - **Context window** = how much text the model can "see" in one chat.
> - **Jarvis** = your personal Claude Project loaded with your resume, goals, and constraints.
> - **Reasoning model** = a chat model trained or run in a mode that spends extra compute *thinking* before answering (chain-of-thought-style). Slower and often pricier — but steadier on multi-step logic, hard bugs, and exam-style proofs.

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Why one chat window is not enough — the five-personality map |
| Mini-lecture | 20 min | Custom Instructions, Memory, Projects — the three features that change everything |
| Live lab     | 20 min | Build your Jarvis in Claude Projects — upload resume + capstone ideas |
| Q&A + discussion | 15 min | Which model is your default, and what did Memory unlock |

### In-class checkpoints

- **Live poll (LMS)** — Run the **dashboard Live poll** for today so counts match in-class discussion (same wording as the official cohort poll for this day).
- **Fist-of-5 cold open**: on the count of three, show fingers — how many of the five frontier chat models have you used in the last 7 days. Scan the room; we are calibrating the gap.
- **Think-pair-share**: in 90 seconds with the person next to you, each name one task you currently do in ChatGPT that probably belongs in Claude or Gemini instead. Be specific about the task, not the tool.
- **Live poll**: drop in the cohort channel your current "default model". We read the tally live and ask the two outliers to defend their pick for 30 seconds each.
- **Breakout of three**: same prompt ("plan my next 4 Tuesday evenings") goes into three different models per trio. Regroup and vote on whose answer you would actually follow — and why.

### Read: Five models, five personalities

The big frontier chat models look identical from the outside. They all have a text box. But in 2026, the gap between the best answer and the average answer is almost entirely about knowing which model to ask, how to set it up, and how to talk to it. Most students give up on "AI" after three mediocre ChatGPT replies. The actual reason the reply was mediocre is that they asked the wrong model, with no context, in one line.

Here is the honest field guide we use in this cohort.

| Model | Best at | Weak at | Use when |
|-------|---------|---------|----------|
| Claude | Long-form writing, code review, nuanced reasoning, safety | Real-time web, images | Essays, resumes, capstone planning, reading long PDFs |
| ChatGPT | Code generation, plugins, general tasks, voice mode | Heavy citation | Python scripts, daily assistant, voice walks |
| Gemini | Google Workspace, long context, Drive/Gmail | Personality | Analyzing your Gmail, Google Docs edits, 1M-token PDFs |
| Grok | Real-time X feed, news, edgy tone | Careful writing | "What is trending on placements today?" |
| Kimi | Chinese-language context, long docs | English nuance | Reading Chinese research, cross-cultural work |

A useful mental model: Claude is the thoughtful senior, ChatGPT is the eager intern, Gemini is the Google employee, Grok is the news junkie cousin, Kimi is the exchange student from Tsinghua. You would not ask all five the same question the same way in real life, so stop doing it online.

### Read: Reasoning models — when to pay for "think longer"

**Not every task wants the same kind of model.** Most chat defaults are tuned for *low latency* and fluent answers. **Reasoning models** (sometimes exposed as a separate mode or API) trade time and tokens for reliability on fragile work: multi-step algebra, competitive programming edge cases, gnarly debugging, "prove this invariant," or planning under tight constraints.

**When reasoning wins.** Use a reasoning-style model when a wrong answer is expensive — security review logic, grading rubrics, tricky data wrangling, or when you've already failed twice with the fast default.

**When fast chat wins.** First drafts, brainstorming, summarizing a long doc, rewriting tone, boilerplate code with tests — you want throughput, not a 30-second think.

**How to spot them in the wild.** Vendors label unevenly: "reasoning," "thinking," "Pro/Max with extended thinking," or separate SKUs (e.g. OpenAI reasoning family, DeepSeek-R1-style models on Hugging Face or via API). The *behavioral* test: same prompt, does the system show intermediate steps or take visibly longer before the final line?

**Cohort rule.** Add one line to your Personal Stack: *"Fast model for drafts; reasoning model for proofs, money, and merges."* You will reuse this on capstone debugging week.

### Read: Memory and Projects — the two features that change everything

A raw chat window is amnesiac. Every new conversation starts from zero; you type your context again like a goldfish. The three features that fix this:

1. **Custom Instructions / System Prompt** (ChatGPT Settings → Personalization, Claude Settings → Profile, Gemini Saved Info). Write once: "I am a 3rd-year CSE student at NITK. I prefer concise answers. I am preparing for SDE placements. Always give me the smallest useful next step." Every future conversation inherits this.
2. **Memory** (ChatGPT Memory, Gemini Saved Info). The model writes down facts about you as you chat. You can view and edit the memory list. Good memory turns the tool from a vending machine into a tutor who has known you for a semester.
3. **Projects** (Claude Projects, ChatGPT Projects/GPTs, Gemini Gems). A project is a workspace that pins reference files, a system prompt, and past chats together. This is where your "Jarvis" will live.

**Why we build Jarvis in Claude Projects today:** Claude has the cleanest Projects UI, the biggest file upload budget on the free tier, and the best long-form writing. You will upload your resume, your transcript, your capstone brainstorm, and your class schedule. For the next 25 days, every planning conversation starts inside this project. By Day 30 your Jarvis will know more about your cohort journey than your hostel roommate.

### Read: Prompting mindset for thinking partners

Treat the model as a smart but literal collaborator who cannot read your mind. Three rules:

- Give **context before task**. "I have a 4-hour Tuesday evening. I need to finish DSA revision and one capstone milestone. What should I do?" beats "help me plan".
- Ask for **one clarifying question first** when the task is open-ended. This is in today's prompt-of-the-day. It forces the model to slow down.
- End every response with a **10-minute next action**. Humans drown in plans. Always get one concrete move.

**A note on privacy.** Anything you paste into a free-tier chatbot may be used for training. Do not paste your Aadhaar, your friend's grades, or your company's NDA. For sensitive work use the "improve the model for everyone" toggle off, or use the enterprise tier. We will revisit this in Week 4.

### Watch: Picking the right chatbot in 2026

A ten-minute walkthrough of the five models above, same prompt across all of them, and how the answers differ. Watch for the difference in tone, length, and how each model handles uncertainty.

https://www.youtube.com/embed/YgvL0dA_2Pg

- Notice which model asks a clarifying question unprompted.
- Watch how Grok's real-time data changes the answer for "trending placement news".
- Compare how Claude and ChatGPT structure the same resume-review output.

### Lab: Build your personal Jarvis

Time: 40 minutes. Artifact: a living Claude Project you will use all cohort.

1. Sign in at https://claude.ai and click **Projects → Create project**. Name it "Jarvis — <your name>".
2. In **Project instructions**, paste today's prompt-of-the-day and fill every `{{placeholder}}` with real details about you.
3. Upload to **Project knowledge**: your latest resume (PDF), your transcript or grade card, and a 1-page text file listing 5 capstone ideas you are curious about. If you have no resume yet, upload a half-page "about me".
4. Start a new chat in the project. Ask: "Read everything in project knowledge. Summarize me back to me in 5 bullets. What gaps do you see for a capstone pick?"
5. Ask a second follow-up: "Based on what you know, which 3 of my capstone ideas are most fundable, most learnable, and most interesting? Score each 1–5."
6. Open a **second browser tab** with ChatGPT and a **third** with Gemini. Paste the exact same two prompts into each. Do not give them your project context on purpose.
7. Screenshot all three final responses side by side. Notice how much better the Claude answer is because of context.
8. Back in Claude, ask Jarvis: "Given today was Day 6 of a 30-day workshop and Day 10 is an ideathon, what should I think about this week to be ready?" Save the reply in a note called `capstone-scratch.md`.

> ⚠️ **If you get stuck**
> - *Claude rejects your PDF upload as too large* → split the file (e.g., resume + transcript as two PDFs) or export pages as a single compressed PDF; free-tier limits are per-file, not per-project.
> - *Jarvis ignores your project instructions and gives generic answers* → open a fresh chat inside the project (not a regular chat), and start the turn with "Read everything in project knowledge first, then answer."
> - *ChatGPT Memory never triggers* → confirm Memory is enabled in Settings → Personalization, then explicitly say "Remember that I am..." once; silent inference is unreliable on the free tier.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Which model felt most like a friend and which felt most like a vending machine? Why? | Names a specific interaction moment (a clarifying question, a tone shift, a push-back) rather than a vibe. Ties the "friend" feeling to a concrete model behavior you can reproduce. |
| Did any model refuse something you thought was reasonable? Did any model over-agree? | Describes the exact prompt and the refusal/agreement verbatim. Distinguishes between a policy refusal, a safety hedge, and sycophancy — and says what you would try differently. |
| What did you put into Memory that you would never tell a human stranger? | Honest about the trade-off: shares the category of detail (health, grades, family) and weighs the convenience against the privacy cost. Does not hand-wave with "nothing sensitive". |
| If you could only use one model for the rest of the cohort, which and why? | Picks based on two or more concrete workflows in your week, not marketing claims. Names at least one thing you would lose by choosing it. |
| What surprised you when the same prompt produced five different answers? | Points at a structural difference (length, citations, hedging, format) rather than "X was better". Connects the difference to how each model is trained or positioned. |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action: finish Jarvis + 3-model comparison (~45 min)

1. Finish building your Claude Project with resume, transcript, and 5 capstone ideas uploaded.
2. Run the same planning prompt through ChatGPT, Claude (Jarvis), and Gemini; screenshot all three answers.
3. Write a one-sentence caption per screenshot explaining why that answer was good (or bad).

### 2. Reflect (~10 min)

*Which model felt most like a thinking partner tonight, and what specific behavior earned that feeling?* A good reflection names the exact turn where a model pushed back, asked a clarifying question, or refused to flatter you — and ties that moment to which kind of tasks you will route to it for the next 24 days. Vague "Claude felt smarter" does not count; quote a sentence.

### 3. Quiz (~17 min)

Includes transfer scenarios + spaced recall from earlier days (~8+ items total). If a question feels easy, treat it as speed practice.

Sample themes: Memory vs Projects; which model for a 90-page Drive doc vs breaking news; why Jarvis-with-context beat blank ChatGPT. The dashboard also adds a transfer scenario + spaced item from earlier weeks.

### 4. Submit (~5 min)

Post to the cohort Slack channel before 11 pm:

1. A screenshot of your Claude Project sidebar showing uploaded files and project instructions.
2. Three screenshots of your best three chatbot conversations from today (any model), each with a one-sentence caption on why the answer was good.

This is your daily artifact. It is the ticket to Day 7.

**Peer or self-review:** One line (chat or DM): what changed after someone skimmed your artifact — or the biggest gap if you worked solo.

**Stretch (optional):** Pick one rubric row and over-ship it (extra example, tighter screenshot, or second iteration).

### 5. Deepen (optional, ~30 min)

- **Extra read**: The [ChatGPT Custom Instructions](https://chatgpt.com) settings page — write a custom instruction that is shorter than three sentences but changes every future reply.
- **Try**: Drop the exact same prompt into [Grok](https://grok.com), [Microsoft Copilot](https://copilot.microsoft.com), and [HuggingChat](https://huggingface.co/chat). Note which one's tone you would actually listen to on a bad day.
- **Explore**: [Poe](https://poe.com) — one login, many models; good for cheap A/B tests on a hard prompt.

### 6. Prep for Day 7 (~30-40 min — important)

**Tomorrow you give Jarvis a library card.** Day 7 is research tools — Perplexity, NotebookLM, Gemini Deep Research — and the 4-step hallucination check. You'll ship a 1-page `brief-<topic>.md` on your capstone domain with at least 5 inline citations, and generate a NotebookLM Audio Overview.

- [ ] **Skim ahead**: the [Perplexity Pro Search docs](https://www.perplexity.ai) — a 3-minute scan of what Pro Search, Focus, and Sources actually mean. Vocabulary before class.
- [ ] **Think**: pick one capstone domain you are curious about and write a **one-line problem statement** (e.g., "hostel mess menu feedback is invisible to the mess committee"). That line is tomorrow's lab input.
- [ ] **Set up**: sign in at [Perplexity](https://www.perplexity.ai) and [NotebookLM](https://notebooklm.google.com) with your Google account; confirm [Gemini](https://gemini.google.com) shows the **Deep Research** toggle. Collect 2–3 URLs, PDFs, or YouTube links related to your domain — NotebookLM will eat them tomorrow.

---

## 📚 Extra / additional references

Optional deep-dives. Pick what interests you; skip what doesn't.

### Short watches

- [Picking the right chatbot in 2026](https://www.youtube.com/embed/YgvL0dA_2Pg) — the five-model walkthrough from class, at 1.5x.

### Reading

- [Claude Projects guide](https://claude.ai) — where Project knowledge and instructions live.
- [ChatGPT Custom Instructions](https://chatgpt.com) — the one setting that changes every future chat.

### Play

- [ChatGPT](https://chatgpt.com), [Claude](https://claude.ai), [Gemini](https://gemini.google.com) — the three you compared live.
- [Grok](https://grok.com), [Microsoft Copilot](https://copilot.microsoft.com), [Kimi](https://kimi.moonshot.cn) — demoed side-by-side so you see the personality gap.
- [Poe](https://poe.com) — one login, many models; good for cheap A/B tests on a hard prompt.
- [HuggingChat](https://huggingface.co/chat) — open-weights alternatives when you need a model with no memory of you.
- [Meta AI](https://meta.ai) — worth bookmarking for WhatsApp-native flows.
- [Mistral Le Chat](https://chat.mistral.ai) — free web chat from Mistral; a European, Apache-licensed voice in the mix.
