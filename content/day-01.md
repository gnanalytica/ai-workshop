---
reading_time: 14 min
tldr: "AI is not magic. It's a very confident autocomplete that learned patterns from the internet."
tags: ["foundations", "theory"]
video: https://www.youtube.com/embed/zjkBMFhNj_g
lab: {"title": "Same prompt, three brains", "url": "https://chat.openai.com/"}
prompt_of_the_day: "You are my {{subject}} TA. Explain {{topic}} to a 3rd-year college student in 5 bullets, one analogy from hostel life, and one mistake students usually make."
tools_hands_on: [{"name": "ChatGPT", "url": "https://chat.openai.com/"}, {"name": "Claude", "url": "https://claude.ai/"}, {"name": "Gemini", "url": "https://gemini.google.com/"}]
tools_demo: [{"name": "Tiktokenizer", "url": "https://tiktokenizer.vercel.app/"}]
tools_reference: [{"name": "Karpathy Intro to LLMs", "url": "https://www.youtube.com/watch?v=zjkBMFhNj_g"}, {"name": "3Blue1Brown Neural Networks", "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi"}]
resources: [{"title": "Attention is All You Need (the paper that started it)", "url": "https://arxiv.org/abs/1706.03762"}, {"title": "A Visual Guide to Transformers", "url": "https://jalammar.github.io/illustrated-transformer/"}]
---

## Intro

You've been using AI for a year. Today you learn what's actually inside the box. No math. No jargon parade. Just the mental model that separates students who *use* AI from students who *understand* it — and that gap decides who gets the internship.

## Read: The stack — from "AI" to the chatbot on your phone

Everybody says "AI" and means five different things. Let's fix that.

```
AI  (big umbrella: anything that mimics thinking)
 └── Machine Learning  (programs that learn from examples, not rules)
      └── Deep Learning  (ML using big neural networks)
           └── LLMs  (deep nets trained on text — ChatGPT, Claude, Gemini)
                └── Agents  (LLMs that take actions: search, click, code)
```

Think of it like your college:
- **AI** is the university.
- **ML** is the engineering department.
- **Deep Learning** is the CSE branch.
- **LLMs** are the AI/ML specialization.
- **Agents** are the final-year students who actually *do* projects.

Each inner circle is more specific, more powerful, and newer.

### Hype vs reality

| Claim you'll hear | What's actually true |
|---|---|
| "AI thinks" | It predicts the next likely word |
| "AI understands you" | It pattern-matches your words to training data |
| "AI is conscious" | It has no memory between chats by default |
| "AI will replace engineers" | It will replace engineers who don't use AI |
| "AI is always right" | It is confidently wrong ~15-30% of the time |

The single most important thing: **an LLM is an extremely well-read autocomplete.** It finished the sentence "Roses are red, violets are…" a billion times during training. Now it finishes *your* sentences too — including "write me a cover letter for Flipkart SDE intern…"

### Tokens, weights, attention — the three words that matter

**Tokens.** The LLM doesn't see letters or words. It sees tokens — chunks of text, roughly 3-4 characters each. "Bengaluru" might be 3 tokens. "LOL" is 1 token. "I'm cooked" is 4 tokens. This matters because you pay per token, and long prompts are slow.

> Example: Your 800-word resume is about 1,100 tokens. Your WhatsApp chat with your hostel group from last Sunday is probably 4,000 tokens.

**Weights.** During training, the model saw trillions of tokens and adjusted billions of internal "dials" (weights) so that its next-token predictions got better. Those weights are the "brain." GPT-4 has roughly 1.7 trillion weights. They're fixed after training — the model doesn't learn from you during a chat.

**Attention.** When predicting the next token, the model looks back at the prompt and decides *which earlier words matter most*. Ask "In the mess menu I showed you earlier, which item has paneer?" — attention is what lets it scroll back to the mess menu part and ignore your earlier rant about Wi-Fi.

Worked example — how a prompt becomes a reply:

1. You type: "Write a leave application to hostel warden."
2. Tokenizer breaks it into ~10 tokens.
3. Model reads tokens, weights light up patterns it saw during training (thousands of formal letters, applications, Indian English conventions).
4. Attention focuses on "leave", "hostel", "warden" — ignores filler.
5. It predicts the next token, then the next, then the next — one at a time — until it hits an end signal.
6. You see a full letter. Feels instant. It was actually ~400 coin-flips weighted by a trillion-parameter brain.

### Why the same prompt gives different answers

Two reasons. First, **temperature** — a dial that controls randomness. Temperature 0 = always pick the top guess. Temperature 1 = sometimes pick the 2nd or 3rd guess for variety. Most chatbots run around 0.7. Second, different models have different weights. ChatGPT, Claude, and Gemini read mostly the same internet but were trained differently — like three toppers who studied the same syllabus but will answer an essay question differently.

## Watch: Karpathy's "Intro to LLMs" (first 30 min)

Andrej Karpathy co-founded OpenAI and led AI at Tesla. This is the clearest intro in the world. Watch the first 30 minutes today — rest across the week.

https://www.youtube.com/embed/zjkBMFhNj_g
<!-- TODO: replace video -->

Watch for:
- The "two files" analogy (weights + run-code)
- Why training costs millions of dollars but running is cheap
- The "dream" explanation of hallucination

## Lab: Same prompt, three brains

30 minutes. You'll poke ChatGPT, Claude, and Gemini with the exact same prompt and spot the personality differences.

1. Open all three tools from the frontmatter. Sign up with your college email if needed (free tiers work).
2. Copy this prompt: *"You are my college placement mentor. I'm a 3rd-year CSE student with a 7.8 CGPA and one internship at a startup. List the 5 highest-leverage things I should do in the next 90 days."*
3. Paste it into ChatGPT. Save the reply in a Google Doc labelled "ChatGPT".
4. Paste the same prompt into Claude. Save under "Claude".
5. Paste into Gemini. Save under "Gemini".
6. Now open Tiktokenizer (in `tools_demo`). Paste your prompt. Note how many tokens it is.
7. Compare the three replies on three axes: specificity, tone, and length. Which one felt most *useful*? Which felt most *generic*?
8. Write one observation at the bottom of your doc: "The model that understood me best was ___ because ___."

Artifact: a single Google Doc with three answers + your take. Share link in the class channel.

## Quiz

Four quick questions on tokens, weights, attention, and the ML → DL → LLM hierarchy. Don't overthink. The quiz is there to catch wobbles, not rank you.

## Assignment

Write a 150-word reflection titled *"What surprised me about AI today."* One paragraph. No AI-assisted writing (we'll know — you'll know). Submit as a text file or Notion page. The goal isn't a great essay. The goal is capturing your honest baseline so Day 30 feels like a transformation, not a memory.

## Discuss: Live session prompts

- Which of the three models "felt" most human to you — and why do you think that is?
- If an LLM is "just autocomplete," why does it feel like it understands you?
- Name one task you'd still trust a human over any AI for, and defend it.
- How would you explain "tokens" to your parents in under 60 seconds?
- If AI is wrong 20% of the time, where in your life is that already acceptable, and where is it absolutely not?
