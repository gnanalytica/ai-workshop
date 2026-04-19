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
---

## Intro

The difference between a student who gets 3x output from AI and one who gives up saying "AI is mid" — is not intelligence. It's prompt craft. Today you learn the only framework you'll ever need, and a small taste of what's coming in Week 3: *context engineering.*

> 🧠 **Quick glossary**
> - **Prompt** = the instruction you give the AI. Everything you type is a prompt.
> - **Context** = extra info you give the AI beyond the instruction (your notes, a file, a role).
> - **Zero-shot** = ask without examples ("summarise this").
> - **Few-shot** = give 2–3 examples inside the prompt so AI mimics the pattern.
> - **Chain-of-thought (CoT)** = ask AI to "think step by step" before answering.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Yesterday's AI stack — today, how to actually *talk* to it |
| Mini-lecture | 20 min | The CREATE framework + zero-shot vs few-shot vs chain-of-thought |
| Live lab     | 20 min | Iterate one real prompt five times — watch quality climb |
| Q&A + discussion | 15 min | Which CREATE letter do you skip — and what's it costing you? |

**Before class** (~10 min): skim the main read section below.
**After class** (~30 min tonight): finish the 5-version prompt iteration lab and start your personal prompt library with its first entry.

## Read: CREATE — the only prompt framework you need

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

### Zero-shot, few-shot, chain-of-thought — three patterns to know

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

### Structured output — the hidden superpower

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

### A peek at "context engineering" (Week 3 teaser)

Prompt engineering = one good message. **Context engineering** = designing the *whole information environment* around the AI: what it knows, what it has access to, what it doesn't see, what it remembers across chats. In Week 3 (Day 19) you'll build a `CLAUDE.md` file — a permanent context brief that travels with every chat. For now, just know: the future of working with AI is not better prompts, it's better *context systems*.

| Prompt engineering | Context engineering |
|---|---|
| One message | A whole environment |
| "Write me X" | "Here's who I am, what I've built, what I'm building, and how I work — now write X" |
| Repeats every time | Loads once, reuses forever |
| Good for: one-off tasks | Good for: personal AI teammates |

## Watch: Prompting masterclass snippets

Short curated clip covering CREATE, few-shot, CoT, and structured output.

https://www.youtube.com/embed/T9aRN5JkmL8

Watch for:
- Why "think step by step" doubles accuracy on reasoning tasks
- How role-prompting changes tone without you asking
- The one-example trick that beats zero-shot every time

## Lab: Iterate one prompt five times

35 minutes. One prompt. Five rewrites. You'll feel the curve.

1. Pick a real task you actually need done. Suggestions: *"Draft 3 LinkedIn posts about my last internship" / "Summarise my DBMS notes into exam flashcards" / "Plan my study week for end-sems."* Whatever you pick, it must be real.
2. Open Claude. Write your first prompt in 10 seconds — however you'd normally ask. Save the output as V1.
3. Rewrite using **C** and **R** only (add context + role). Save as V2.
4. Rewrite adding **E** (one example of what good output looks like). Save as V3.
5. Rewrite adding **A** and **T** (constraints + tone). Save as V4.
6. Rewrite adding structured output (ask for JSON, table, or markdown with headings). Save as V5.
7. Line up V1 through V5 in a Google Doc. Read them in order. Write one sentence: *"The biggest jump happened between V__ and V__ because __."*
8. Pick the best of the five. Clean it up. Add it to a new note called "My Prompt Library" — this is your first entry.

Artifact: Google Doc with 5 versions + one reflection sentence. Plus your first library entry.

## Quiz

Four questions on CREATE, zero-shot vs few-shot, CoT, and structured output. You don't have to name the framework — you have to recognize the parts.

## Assignment

Build a personal prompt library with **10 templates.** Categories to cover: (1) study/notes, (2) resume/cover letter, (3) LinkedIn post, (4) code explanation, (5) email/message, (6) brainstorming, (7) summarisation, (8) translation, (9) debate/devil's advocate, (10) free choice. Each template must have visible `{{placeholders}}` so you can reuse it. Store in Notion, Google Docs, or a plain markdown file. This is an artifact you'll *actually* use for the next two years.

## Discuss: Live session prompts

- Which of the six CREATE letters do you skip most often — and what's it costing you?
- Is asking for JSON "cheating," or is it how adults use LLMs?
- When does few-shot *hurt* instead of help?
- Your prompt library has 10 entries today. In 3 months, how big should it be, and what categories will dominate?
- Where's the line between "prompting" and just "writing clearly"?
