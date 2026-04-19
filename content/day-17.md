---
reading_time: 14 min
tldr: "Graduate from chat tricks to a real prompting toolkit: roles, chains of thought, structured output, few-shot, and failure modes."
tags: ["prompting", "llms", "concepts"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Build your personal prompt library", "url": "https://huggingface.co/chat/"}
prompt_of_the_day: "You are a {{role}}. Think step-by-step before you answer. Then critique your own answer and revise it once. Return final answer as JSON with keys: answer, confidence, caveats."
resources: [{"title": "Anthropic Prompt Library", "url": "https://docs.anthropic.com/en/prompt-library/library"}, {"title": "OpenAI Prompting Guide", "url": "https://platform.openai.com/docs/guides/prompt-engineering"}, {"title": "HuggingFace Chat", "url": "https://huggingface.co/chat/"}]
---

## Intro

Week 1 you learned to ask. Today you learn to direct. The five patterns in this lesson are what separate people who "use ChatGPT" from people who get reliably great work out of AI. By the end you'll have a personal prompt library you'll reuse for years.

## Read: Five patterns that actually work

A prompt is a specification. Vague spec, vague output. Rich spec, rich output. The patterns below compound — stack them, and the same model gives dramatically better answers.

### Pattern 1: Role prompting

Start by casting the model. "You are a senior recruiter at a top-tier consulting firm reviewing this resume for a case-interview role." That one sentence changes which tokens become probable. You're not lying to the model — you're pointing its frozen intuitions toward the right subset of the internet.

```
Read this, don't type it

Weak : "Review my resume"
Strong: "You are a senior recruiter at McKinsey India. You've seen 10,000
         resumes. Review this one for an entry-level consultant role.
         Flag the top 3 weaknesses and suggest one fix per weakness."
```

Specificity in the role beats adjectives every time. "Senior recruiter at McKinsey India" beats "good recruiter."

### Pattern 2: Chain of thought

Ask the model to think out loud before answering. Phrases like "Let's think step by step" or "First, list the relevant facts. Then reason through them. Then give your final answer" measurably improve performance on anything requiring reasoning — math, logic puzzles, tricky analysis.

Why it works: remember, the model generates one token at a time, and each token conditions the next. When it has "thinking tokens" before the answer token, the answer token lands on a much better foundation. You're giving it runway.

### Pattern 3: Few-shot examples

Show, don't tell. If you want a specific format or style, paste 2–3 examples before your real request. The model will pattern-match hard.

```
Read this, don't type it

Q: "I missed the placement deadline"
A: { "emotion": "anxious", "urgency": "high", "next_step": "email coordinator today" }

Q: "I'm not sure which company to apply to"
A: { "emotion": "uncertain", "urgency": "low", "next_step": "list top 5 criteria" }

Q: "I bombed the aptitude test"   <-- your real question
A:
```

The model will produce a JSON object matching the pattern. No instructions needed.

### Pattern 4: Structured output

Ask for JSON, XML, or a specific markdown shape. Frontier models are trained to follow schemas. This is what makes AI usable in real apps — you can parse the output programmatically on Day 21.

```
Read this, don't type it

Return your answer as JSON with this exact schema:
{
  "answer": string,
  "confidence": "low" | "medium" | "high",
  "sources_needed": string[]
}
Do not include any text outside the JSON.
```

Many modern APIs also support a strict "JSON mode" that guarantees valid JSON. But even in plain chat, the above prompt gets you 95% of the way.

### Pattern 5: Self-critique and revise

A second pass almost always beats the first pass. Append: "Now critique your own answer as a harsh editor. List 3 weaknesses. Then write a revised version that fixes them." You're essentially asking the model to play two roles — author and editor — and the editor catches what the author missed.

### Putting them together

The best real-world prompts stack three or four patterns.

| Layer | What to write |
|---|---|
| Role | "You are a senior data-science mentor." |
| Task | "Given these notes, design a 2-week study plan." |
| Thinking | "First list the topics. Then group them by difficulty. Then schedule." |
| Format | "Return as a markdown table with columns: day, topic, est. hours." |
| Critique | "After the table, write one paragraph on what a weaker plan would look like so I can compare." |

Paste that into any modern model and you'll get a near-consultant-quality plan.

### When prompts fail — and what to do

Three common failure modes:

- Hallucination on facts. Fix: give the model the source text in the prompt, or use RAG (Day 19).
- Refusal / over-caution. Fix: clarify intent ("this is for my own placement prep, not for sharing"), or switch to a local model.
- Ignoring format. Fix: few-shot it, or end the prompt with "Respond ONLY with the JSON, no preamble."

If nothing works, the prompt is probably wrong, not the model. Shorten it. Simplify. Try again.

## Watch: Prompt patterns in action

A compact tour of chain-of-thought, role, and few-shot prompting with live before/after examples. Watch how each pattern changes the output on the same underlying question.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch how a single role line shifts tone dramatically.
- Notice the accuracy lift from "think step by step."
- See how few-shot makes JSON output almost perfect.

## Lab: Your personal prompt library

Goal: build a reusable library of 6 prompts you'll actually use this semester.

1. Open a Google Doc titled "My Prompt Library v1." Create six headings: Study, Placement Prep, Writing, Coding, Debugging, Life Admin.
2. Open https://huggingface.co/chat/ and pick any modern frontier model. You'll test prompts here.
3. For the Study heading, write a prompt using at least 3 of today's patterns. Example goal: "Given a topic, output a 1-day study sprint plan as JSON." Paste your prompt into the chat, test with 3 different topics, iterate until the output is consistently good. Save the final prompt to your doc.
4. Do the same for Placement Prep. Example goal: "Given a target company, output 5 behavioral interview questions and model answers."
5. Now for Writing. Goal: "Given a paragraph, output a harsher, tighter version and explain what you cut." Use self-critique.
6. For Coding and Debugging, make prompts that force the model to ask a clarifying question if the user's request is ambiguous. (Hint: add "If anything is unclear, ask one question before answering.")
7. For Life Admin, write a prompt that turns a screenshot of a messy WhatsApp chat into a clean JSON of action items.
8. Paste today's prompt-of-the-day, fill `{{role}}`, and try it on your hardest question of the week. Save the result.

Every prompt in your doc should use at least 3 of today's 5 patterns. Comment on each one explaining which patterns you stacked.

## Quiz

Expect four checks on the five patterns, one scenario question asking which pattern fixes which failure, and one "spot the weak prompt" rewrite question. Trust the stacking principle — layered prompts win.

## Assignment

Pick one prompt from your library. Run it on 3 different models (two cloud, one local from yesterday). Paste all three outputs into your doc with a 2-sentence verdict per model. Submit the doc link.

## Discuss: The prompting mindset

- Which pattern felt most like "unlocking" the model for you?
- When does self-critique actually make things worse — if ever?
- How do you balance "short prompts feel natural" with "long prompts work better"?
- Which of your 6 library prompts will you actually use this week?
- What's a task where no amount of prompting will rescue you, and you should reach for code or RAG instead?
