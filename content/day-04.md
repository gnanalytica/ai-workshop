---
reading_time: 14 min
tldr: "A good prompt is not a magic spell. It's a well-briefed junior — context, role, examples, constraints, tone, evaluation."
tags: ["foundations", "theory"]
video: https://www.youtube.com/embed/T9aRN5JkmL8
lab: {"title": "Iterate one prompt five times", "url": "https://claude.ai/"}
prompt_of_the_day: "You are a {{role}}. Context: {{one paragraph about the situation}}. Task: {{what you want done}}. Constraints: {{bullet list of must-dos and must-nots}}. Examples: {{1-2 good examples}}. Output format: {{JSON / markdown / table}}."
tools_hands_on: [{"name": "Claude", "url": "https://claude.ai/"}, {"name": "ChatGPT", "url": "https://chat.openai.com/"}]
tools_demo: [{"name": "Anthropic Prompt Library", "url": "https://docs.anthropic.com/en/prompt-library/library"}, {"name": "Google AI Studio", "url": "https://aistudio.google.com/"}]
tools_reference: [{"name": "Anthropic Prompt Engineering Guide", "url": "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview"}, {"name": "DAIR.AI Prompt Engineering Guide", "url": "https://www.promptingguide.ai/"}, {"name": "OpenAI Prompting Guide", "url": "https://platform.openai.com/docs/guides/prompt-engineering"}]
resources: [{"title": "Chain-of-Thought paper", "url": "https://arxiv.org/abs/2201.11903"}, {"title": "Anthropic 'Context is King' post", "url": "https://www.anthropic.com/"}]
objective:
  topic: "Prompting craft — the CREATE framework, few-shot, CoT, structured output"
  tools: ["Claude", "ChatGPT"]
  end_goal: "Walk away with 5 versions of one prompt (V1 lazy → V5 structured), your first entry in a personal Prompt Library, and the habit of auditing any weak prompt against CREATE."
---

## 🎯 Today's objective

**Topic.** How to *actually talk* to whichever tool you picked yesterday. The only prompt framework you need — CREATE — plus few-shot, chain-of-thought, and structured output.

**Tools you'll use.** Claude (primary lab tool today), ChatGPT (comparison).

**End goal.** By the end of today you will have:
1. Five versions of the same real prompt — V1 lazy, V5 fully CREATE-structured with JSON output — and a one-line diagnosis of where quality jumped.
2. The first entry in your **Prompt Library** (a Notion / Doc / `.md` file you'll populate all week).
3. The reflex to ask "which CREATE letter am I skipping?" before hitting send.

> *Why this matters:* the difference between a student who gets 3x output from AI and one who gives up saying "AI is mid" is not intelligence — it's prompt craft. CREATE is the cheapest career skill you'll pick up all month.

---

## ⏪ Pre-class · ~20 min

**Revision / context.** Yesterday you mapped 7 tool classes (chat, research, Indian AI, creative, code, open-source, automation) and matched 3 tasks from your life to Perplexity, NotebookLM, Sarvam, and friends. You walked away with a named personal stack. Today we zoom in on one skill that transfers *across every tool in that stack*: how you phrase the request. The "right tool" matters; the right prompt matters more.

### Setup (if needed)

- [ ] No new setup required — Claude and ChatGPT accounts from Day 1 are enough.
- [ ] Create an empty Notion page, Google Doc, or markdown file called **"My Prompt Library"** — we start populating it today.

### Primer (~5 min)

- **Read**: The Anthropic Prompt Engineering overview (https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) — skim the left sidebar to see which techniques exist. You don't need to understand them yet.
- **Watch** (optional): Any 3–5 min "prompt engineering intro" video — instructor to link one in the channel if a great one surfaces, otherwise skip.

### Bring to class

- [ ] One real weak prompt you've typed in the past week — the worse the better. We'll rewrite it live.
- [ ] One real task you've been putting off that AI could help with (resume bullet, DBMS notes, a difficult email) — this becomes your V1 in the lab.

> 🧠 **Quick glossary**
> - **Prompt** = the instruction you give the AI. Everything you type is a prompt.
> - **Context** = extra info you give the AI beyond the instruction (your notes, a file, a role).
> - **Zero-shot** = ask without examples ("summarise this").
> - **Few-shot** = give 2–3 examples inside the prompt so AI mimics the pattern.
> - **Chain-of-thought (CoT)** = ask AI to "think step by step" before answering.

---

## 🎥 During class · 60 min live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | This week's tool landscape — today, how to actually *talk* to any of them |
| Mini-lecture | 20 min | The CREATE framework + zero-shot vs few-shot vs chain-of-thought |
| Live lab     | 20 min | Iterate one real prompt five times — watch quality climb |
| Q&A + discussion | 15 min | Which CREATE letter do you skip — and what's it costing you? |

### In-class moments (minute-by-minute)

- **00:05 — Cold-open prompt read-aloud**: instructor pastes a terrible 8-word prompt on screen. Students shout in chat which CREATE letter is missing most. First correct answer gets credit for the day.
- **00:15 — Think-pair-share**: 90 seconds on *"Which CREATE letter do you skip most often — and what's it costing you?"* Each pair names their shared skip and one concrete cost.
- **00:30 — Live poll**: *"Is asking for JSON output cheating or just how adults use LLMs?"* Bars appear. Instructor calls on a "cheating" voter and a "adult" voter to steelman the other side in 20 seconds each.
- **00:45 — Live rewrite relay**: one student drops a real weak prompt in chat. Three volunteers each add one CREATE letter on screen — C, then R, then E — while the room watches the output quality jump between versions.
- **00:55 — Chat close**: *"The CREATE letter I'm adding to every prompt from tomorrow is ___."*

### Read: CREATE — the only prompt framework you need

Forget "prompt engineering" as some mystical art. A prompt is a briefing. You brief a junior intern by giving them enough to not waste your time. Do the same with the model.

**C — Context.** What's the situation? Who am I? What's already been tried?
**R — Role.** Who should the AI be? (Expert? Peer? Critic?)
**E — Examples.** Show, don't just tell. Even one example 5x the output quality.
**A — Active constraints.** What MUST the output do, and what MUST it NOT do?
**T — Tone.** Formal? Casual? Sarcastic? Hinglish?
**E — Evaluation.** How will you judge the answer? Tell the model.

Worked example. Compare these two prompts:

> **Weak:** "Write me a cover letter for SDE internship."

> **Strong:** "**Context:** I'm a 3rd-year CSE student at VIT Vellore, CGPA 8.1, two hackathon wins, one React side project. Applying to Razorpay SDE-Intern. **Role:** You are a senior engineer at Razorpay who's reviewed 500 intern applications. **Examples:** [paste one cover letter you like]. **Constraints:** Under 250 words, mention one specific Razorpay product, no clichés like 'passionate' or 'go-getter'. **Tone:** confident but humble, Indian English. **Evaluation:** If a hiring manager would skim past this, it fails."

The second one takes 90 seconds longer to write. It saves 30 minutes of editing.

### Read: Zero-shot, few-shot, chain-of-thought — three patterns to know

**Zero-shot:** Ask without any example. Fastest. Works for simple tasks.
*"Summarise this article in 3 bullets."*

**Few-shot:** Give 1-5 examples first. Dramatically better for formatting or style tasks.

```
Example 1:
Input: "Prof cancelled class yaar"
Sentiment: relieved
Reason: "class cancelled" + "yaar" signals relief

Example 2:
Input: "Mess food was peak today, I'm cooked"
Sentiment: positive
Reason: "peak" is Gen-Z slang for excellent

Now classify:
Input: "Placements list dropped and I'm not on it"
```

**Chain-of-thought (CoT):** Add "Think step by step before answering." The model writes out reasoning before the final answer. Works shockingly well on math, logic, and debugging.

*"A mess charges ₹3200/month for unlimited meals. I eat 20 days/month, 2 meals a day. Street food costs ₹80/meal. Which is cheaper? Think step by step."*

### Read: Structured output — the hidden superpower

If you ask nicely, the model will reply in any format you want: JSON, CSV, markdown tables, YAML. This is how you go from "AI gives me text" to "AI gives me data I can paste into Excel."

Example prompt:
*"Give me 5 project ideas for a 3rd-year CSE student. Return as JSON with keys: title, difficulty (1-5), time\_days, tech\_stack (array), one\_line\_pitch."*

The model will reply:
```json
[
  {"title": "Hostel mess rating app", "difficulty": 2, "time_days": 7, "tech_stack": ["React Native", "Firebase"], "one_line_pitch": "Tinder for paneer."}
]
```

Now you can paste that straight into a spreadsheet. That's the leap.

### Read: A peek at "context engineering" (Week 3 teaser)

Prompt engineering = one good message. **Context engineering** = designing the *whole information environment* around the AI: what it knows, what it has access to, what it doesn't see, what it remembers across chats. In Week 3 (Day 19) you'll build a `CLAUDE.md` file — a permanent context brief that travels with every chat. For now, just know: the future of working with AI is not better prompts, it's better *context systems*.

| Prompt engineering | Context engineering |
|---|---|
| One message | A whole environment |
| "Write me X" | "Here's who I am, what I've built, what I'm building, and how I work — now write X" |
| Repeats every time | Loads once, reuses forever |
| Good for: one-off tasks | Good for: personal AI teammates |

### Watch: Prompting masterclass snippets

Short curated clip covering CREATE, few-shot, CoT, and structured output.

https://www.youtube.com/embed/T9aRN5JkmL8

Watch for:
- Why "think step by step" doubles accuracy on reasoning tasks
- How role-prompting changes tone without you asking
- The one-example trick that beats zero-shot every time

### Lab: Iterate one prompt five times (35 min)

One prompt. Five rewrites. You'll feel the curve.

> ⚠️ **If you get stuck**
> - *Your V2–V5 outputs all look basically the same* → your "real task" is probably too generic ("write me a LinkedIn post"). Pick something with constraints reality actually has — a specific internship, a specific reader, a word limit — then the CREATE letters have something to bite into.
> - *Claude asks you to verify email / hits a usage limit mid-lab* → switch to ChatGPT for the remaining versions. Note the switch in your doc. The framework works identically across models; that's the point.
> - *V5 JSON output comes back with surrounding prose ("Sure, here's your JSON:…")* → add one line at the end: *"Return ONLY valid JSON, no preamble, no code fences."* If it still adds fences, that's usually fine — the content is the artifact, not the wrapper.

1. Pick a real task you actually need done. Suggestions: *"Draft 3 LinkedIn posts about my last internship" / "Summarise my DBMS notes into exam flashcards" / "Plan my study week for end-sems."* Whatever you pick, it must be real.
2. Open Claude. Write your first prompt in 10 seconds — however you'd normally ask. Save the output as V1.
3. Rewrite using **C** and **R** only (add context + role). Save as V2.
4. Rewrite adding **E** (one example of what good output looks like). Save as V3.
5. Rewrite adding **A** and **T** (constraints + tone). Save as V4.
6. Rewrite adding structured output (ask for JSON, table, or markdown with headings). Save as V5.
7. Line up V1 through V5 in a Google Doc. Read them in order. Write one sentence: *"The biggest jump happened between V__ and V__ because __."*
8. Pick the best of the five. Clean it up. Add it to a new note called "My Prompt Library" — this is your first entry.

**Artifact**: Google Doc with 5 versions + one reflection sentence. Plus your first library entry.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Which of the six CREATE letters do you skip most often — and what's it costing you? | Names one specific letter (not "all of them") and one specific failure mode it causes — e.g., "I skip Examples, so the model defaults to LinkedIn-bro tone every time." Shows self-awareness, not guilt. |
| Is asking for JSON "cheating," or is it how adults use LLMs? | Reframes the question: structured output isn't a trick, it's the bridge between "AI text" and "software that uses AI." Mentions a real use (spreadsheets, APIs, pipelines). |
| When does few-shot *hurt* instead of help? | Gives at least one case: when your examples accidentally encode a bias, when the task is genuinely novel (examples anchor the model to the wrong shape), or when examples eat your token budget on a long context. |
| Your prompt library has 10 entries today. In 3 months, how big should it be, and what categories will dominate? | Doesn't just say "bigger." Predicts which categories *grow* vs which stay small — based on what the student actually does every day. Shows the library is a living artifact, not a trophy. |
| Where's the line between "prompting" and just "writing clearly"? | Concedes there isn't a hard line — great prompting IS clear writing with extra scaffolding (role, examples, output format) that you wouldn't add when writing to humans. |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate: build your 10-template prompt library (~50 min)

1. Open your "My Prompt Library" doc.
2. Build 10 reusable templates — one each for: study/notes, resume/cover letter, LinkedIn post, code explanation, email/message, brainstorming, summarisation, translation, debate/devil's advocate, and a 10th of your choice.
3. Every template must include `{{placeholder}}` variables so future-you can just fill in blanks.
4. Each template should apply at least 3 of the CREATE letters visibly (tagged in the template itself is fine).
5. Export to PDF or share a Notion link — you'll submit in step 4.

### 2. Reflect (~10 min)

**Prompt:** *"Which of the 10 templates will I actually use this week — and which did I include just to hit the count?"* A good reflection is honest: most people have 2–3 genuinely load-bearing templates and 7 aspirational ones. Naming the gap is the whole point; it tells you where to invest next.

### 3. Quiz (~15 min)

Four questions on CREATE, zero-shot vs few-shot, CoT, and structured output. Available on the dashboard. You don't have to name the framework — you have to recognize the parts.

### 4. Submit the assignment (~5 min)

Submit your 10-template Prompt Library (PDF or Notion link) via the dashboard before next class. This is an artifact you'll *actually* use for the next two years — don't skip the export.

### 5. Deepen (optional, ~25 min)

- **Extra video**: TBD — instructor will pick based on which CREATE letters the class struggled with most.
- **Extra read**: DAIR.AI's Prompt Engineering Guide (https://www.promptingguide.ai/) — the most comprehensive free resource online; bookmark, don't binge.
- **Try**: Take your best V5 from the lab and run it on three models (Claude, ChatGPT, Gemini). Same prompt, same CREATE structure — see which model rewards structure most. That's your "writing model."

### 6. Prep for Day 5 (~30 min — important)

**Tomorrow closes Week 1.** Day 5 is a show-and-tell: every student pitches their single best AI moment from Days 1–4 in 2 minutes, the room votes Most Useful / Creative / Surprising, and you end the day with your **Personal AI Stack v1** — a 1–2 page PDF that locks in your tools, top 10 prompts, top 3 use cases, and your "next bet" for Day 30.

- [ ] **Skim ahead**: pick your single best AI moment from Days 1–4 — a prompt, an output, a surprise, a fail — and draft a 2-minute pitch (what was the task, what did you do, why did it work).
- [ ] **Think**: which one belief about AI that you entered Day 1 with is *gone* after four days? Bring a specific answer, not a vibe.
- [ ] **Set up**: open a blank Google Doc titled *"Cohort Tricks — Week 1"* so you can take notes live during show-and-tell. Also have your Day 3 tool audit + Day 4 prompt library handy — both feed into Day 5's Personal AI Stack deliverable.

---

## 📚 Extra / additional references

Optional deep-dives. Pick what interests you; skip what doesn't.

### Short watches

- Short clip covering CREATE, few-shot, CoT, structured output — https://www.youtube.com/embed/T9aRN5JkmL8
- [Anthropic "Context is King"](https://www.anthropic.com/) — the original post that coined how most practitioners now think about context vs prompts.

### Reading

- [Anthropic Prompt Engineering Overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) — short, official, unhyped.
- [DAIR.AI Prompt Engineering Guide](https://www.promptingguide.ai/) — the encyclopedia.
- [OpenAI Prompting Guide](https://platform.openai.com/docs/guides/prompt-engineering) — official, terse, worth a full read once.
- [Chain-of-Thought paper](https://arxiv.org/abs/2201.11903) — the 2022 paper that made "think step by step" famous.

### Play

- [Claude](https://claude.ai/) — today's primary lab tool.
- [Anthropic Prompt Library](https://docs.anthropic.com/en/prompt-library/library) — steal-worthy templates by the dozen.
- [Google AI Studio](https://aistudio.google.com/) — free place to test Gemini prompts with a system prompt field.
