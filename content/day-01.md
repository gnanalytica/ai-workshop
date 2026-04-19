---
reading_time: 15 min
tldr: "Welcome. Today you start. In 30 days you'll ship your own AI thing — on demo day, live, to real humans. Let's go."
tags: ["foundations", "kickoff"]
video: https://www.youtube.com/embed/zjkBMFhNj_g
lab: {"title": "Same prompt, three brains", "url": "https://chat.openai.com/"}
prompt_of_the_day: "You are my {{subject}} TA. Explain {{topic}} to a 3rd-year college student in 5 bullets, one analogy from hostel life, and one mistake students usually make."
tools_hands_on: [{"name": "ChatGPT", "url": "https://chat.openai.com/"}, {"name": "Claude", "url": "https://claude.ai/"}, {"name": "Gemini", "url": "https://gemini.google.com/"}]
tools_demo: [{"name": "Tiktokenizer", "url": "https://tiktokenizer.vercel.app/"}]
tools_reference: [{"name": "Karpathy Intro to LLMs", "url": "https://www.youtube.com/watch?v=zjkBMFhNj_g"}, {"name": "3Blue1Brown Neural Networks", "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi"}]
resources: [{"title": "Attention is All You Need (the paper that started it)", "url": "https://arxiv.org/abs/1706.03762"}, {"title": "A Visual Guide to Transformers", "url": "https://jalammar.github.io/illustrated-transformer/"}]
---

## Intro

Pause for a second. Right now, on your laptop, you have access to the most powerful thinking tool humans have ever built — and most students will graduate without ever learning how to actually *use* it.

That's the gap we close in 30 days. Not by watching lectures. By doing. By shipping. By demo day, you'll have a working AI product that solves a real problem, live, pitched to a panel.

You've used ChatGPT. That's great — it's the starting line, not the finish. Today you find out what's actually inside the magic box, and why knowing that will 10x everything you do with it.

## Read: Welcome — here's what the next 30 days look like

**Your mission on day 30**: stand on a stage (or Google Meet) and demo a thing *you* built with AI. Not a slide about AI. A live thing.

Here's how we get there:

| Week | Theme | What you walk away with |
|---|---|---|
| 1 · Foundations | What AI actually is, and isn't | A mental model that works, even 3 years from now |
| 2 · Exposure | Hands-on with every flavor of AI tool | Your personal AI stack + your capstone problem picked |
| 3 · Think & Tell | Design thinking for your capstone | A 1-page spec + wireframes of what you'll build |
| 4 · Dev + AI Build | GitHub, RAG, local models, context engineering | Confidence to direct AI to build things for you |
| 5 · Build, Ship, Agentic | Vibe-coding, deploying, agents, swarms | A live URL of your capstone v0 |
| 6 · Launch | Ethics, benchmarks, polish, demo | A shipped capstone, a certificate, a portfolio page |

Two checkpoints you'll hear a lot about:
- **Day 10** — you lock in the one problem you'll build.
- **Day 30** — you demo it live.

Everything in between is scaffolding to get you there.

### Today's agenda (≈ 2 hours total)

| Block | Time | What |
|---|---|---|
| Welcome + course tour | 15 min | We're doing right now. You're in it. |
| Read below | 25 min | What AI is and what AI isn't (the 10-point split) |
| Watch Karpathy (first 30 min) | 30 min | The clearest AI explainer ever filmed |
| Hands-on lab | 30 min | Three AI tools, one prompt, spot the differences |
| Reflection + assignment | 20 min | 150 words, no AI help, no perfection needed |

**Homework tonight**: finish the Karpathy video, submit reflection before tomorrow 11am.

## Read: What AI is — and what AI isn't

Half your peers will quote Elon Musk about AI destroying the world. The other half will claim AI wrote an entire Flipkart clone for them in 2 hours. Both are lying (or confused). Here's the actual shape.

### What AI **is** ✓

1. **A pattern machine.** It saw trillions of sentences, articles, codebases, and now finishes *your* sentences by matching patterns. Including patterns you haven't explicitly given it.
2. **A brilliant, under-slept intern.** Fast, creative, knows a little about everything, occasionally makes things up with total confidence.
3. **A force multiplier.** You can now do in 1 hour what used to take 1 week — if you know how to direct it.
4. **Stateless by default.** Every chat starts fresh. It does not remember you unless the app specifically gives it memory (Claude Projects, ChatGPT memory, etc.).
5. **A text → text function.** Give it text, it predicts text. Vision models add images, voice models add speech — but underneath, it's all turned into tokens (more on that in a moment).

### What AI **isn't** ✗

1. **Not conscious.** No feelings, no awareness, no desires. It doesn't "want" anything. Those charming responses are patterns, not personhood.
2. **Not always right.** Current models are confidently wrong 15–30% of the time depending on the task. This is called *hallucination*. Always verify on anything that matters.
3. **Not thinking like you do.** It predicts the next token. That's math, not reasoning. Sometimes the math *looks* like reasoning. That's useful, not deep.
4. **Not a human replacement for judgment.** It can draft your SOP but shouldn't pick your career. It can help diagnose a bug but shouldn't sign off on medical decisions.
5. **Not a search engine.** Search finds things that exist. LLMs *generate* things that sound right. Huge difference — especially when you ask for citations. (More on that Day 3.)

### The one line that unlocks everything

> **An LLM is an extremely well-read autocomplete.**

Hold onto that. Everything in the next 30 days — prompting, RAG, agents, vibe coding — is just different ways to steer a very good autocomplete toward useful work.

## Read: The stack — from "AI" to the chatbot on your phone

Everybody says "AI" and means five different things. Let's fix that once and for all.

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
- **LLMs** are the AI/ML specialisation.
- **Agents** are the final-year students who actually *do* projects.

Each inner circle is more specific, more powerful, and newer.

### Tokens, weights, attention — the three words that will save you hours

Don't memorise. Just meet them. You'll see them everywhere for the next 29 days.

- **Tokens** = chunks of text, roughly 3–4 characters each. The LLM sees tokens, not letters. You *pay* per token and long prompts are slow. A Flipkart SDE cover letter ≈ 400 tokens. A full resume ≈ 1,100 tokens. (Tomorrow we'll play with this.)
- **Weights** = the billions of internal dials trained on trillions of tokens. The "brain". Fixed after training — the model doesn't learn from your chat.
- **Attention** = how the model decides *which parts of your prompt matter most* for the next word. It's why "in the mess menu I shared earlier, which item has paneer?" works — attention scrolls back to the mess menu part.

One line to hold: **tokenise → weigh → attend → predict → repeat.** That's the whole show.

### Why the same prompt gives different answers

Two reasons. **Temperature** — a dial that controls randomness. Temperature 0 = always pick the top guess. Temperature 1 = mix it up. Most chatbots run ~0.7. And **different models have different weights** — ChatGPT, Claude, Gemini read roughly the same internet but were trained differently. Three toppers, same syllabus, different essays.

## Watch: Karpathy's "Intro to LLMs" (first 30 min today)

Andrej Karpathy co-founded OpenAI and led AI at Tesla. This is the clearest intro in the world. Watch the first 30 minutes today — the rest across the week.

https://www.youtube.com/embed/zjkBMFhNj_g

Watch for:
- The "two files" analogy (weights + run-code)
- Why training costs millions but running is cheap
- The "dream" explanation of hallucination

## Lab: Same prompt, three brains (30 min, optionally in pairs)

Three AI tools. One prompt. Spot the personality differences. Works great as a pair activity — one person drives, one observes, swap halfway.

1. Open all three chat tools from the "Hands-on" box above. Sign up with your college email if needed — free tiers are enough.
2. Copy this prompt exactly: *"You are my college placement mentor. I'm a 3rd-year CSE student with a 7.8 CGPA and one internship at a startup. List the 5 highest-leverage things I should do in the next 90 days."*
3. Paste into ChatGPT. Save the reply in a Google Doc labelled "ChatGPT".
4. Same prompt into Claude. Save under "Claude".
5. Same prompt into Gemini. Save under "Gemini".
6. Open **Tiktokenizer** (in "Demo"). Paste your prompt. Note the token count — that's what the model actually saw.
7. Compare the three replies on three axes: **specificity, tone, length.** Which felt most *useful*? Which felt most *generic*?
8. Write one line at the bottom: *"The model that understood me best was ___ because ___."*

**Artifact**: one Google Doc with three answers + your take. Drop the share link in the cohort channel.

## Quiz

Four quick questions on what's AI / what's not, the ML → DL → LLM hierarchy, and your first taste of tokens + attention. Don't overthink. The quiz is here to catch wobbles, not rank you.

## Assignment

Write a 150-word reflection titled *"What surprised me about AI today."* One paragraph. **No AI-assisted writing** (we'll know — you'll know). Submit as a text file or Notion page via the dashboard.

The goal isn't a great essay. It's capturing your honest baseline so Day 30 feels like a transformation, not a memory.

## Discuss: Live session prompts

- Which of the three models *felt* most human to you — and why do you think that is?
- If an LLM is "just autocomplete," why does it feel like it understands you?
- Name one task you'd still trust a human over any AI for, and defend it.
- How would you explain "tokens" to your parents in under 60 seconds?
- If AI is wrong 20% of the time, where in your life is that *already* acceptable, and where is it absolutely not?
