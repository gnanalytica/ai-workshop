---
reading_time: 14 min
tldr: "A week of theory means nothing without a personal stack. Today you build yours — and steal your classmates' best tricks."
tags: ["foundations", "theory"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Show-and-tell: 2-minute AI win", "url": "https://claude.ai/"}
prompt_of_the_day: "Act as my blunt AI coach. Here are three prompts I wrote this week: {{prompt1}} / {{prompt2}} / {{prompt3}}. For each, give me one sharper rewrite and one reason mine was weak."
tools_hands_on: [{"name": "Claude", "url": "https://claude.ai/"}, {"name": "ChatGPT", "url": "https://chat.openai.com/"}]
tools_demo: [{"name": "Anthropic Cookbook", "url": "https://github.com/anthropics/anthropic-cookbook"}, {"name": "OpenAI Cookbook", "url": "https://cookbook.openai.com/"}]
tools_reference: [{"name": "DAIR.AI Prompt Engineering Guide", "url": "https://www.promptingguide.ai/"}, {"name": "OpenAI Cookbook", "url": "https://cookbook.openai.com/"}, {"name": "Anthropic Cookbook", "url": "https://github.com/anthropics/anthropic-cookbook"}]
resources: [{"title": "Build a Personal AI Stack (essay)", "url": "https://www.oneusefulthing.org/"}, {"title": "Ethan Mollick's practical AI tips", "url": "https://www.oneusefulthing.org/"}]
---

## Intro

Week 1 is done. You've met AI's brain, its cousins, its manners, and its failures. Today you convert five days of input into one page of personal output: your AI Stack v1. Plus, you steal the best tricks from the room — because 30 students' experiments in a week is 150 experiments, and you only saw 5 of them.

## Read: What we learned — the one-page map

```
Day 1: What AI is + inside an LLM          → tokens, weights, attention
Day 2: Open-model landscape + Indian AI    → Chinese, Indian, tiny families
Day 3: Prompts + context engineering       → CREATE framework, few-shot, CoT
Day 4: Ethics + AI failures                → hallucination, bias, privacy, red lines
Day 5: Show-and-tell + personal stack      → today
```

Zoom out and you see the pattern: we went from *"what is this machine"* to *"how do I speak to it"* to *"what can go wrong"* to *"what's my personal relationship with it."* That's not an accident — that's the only sensible order.

### The myth of the "AI hack"

You'll see LinkedIn posts this week with titles like *"The one ChatGPT prompt that replaces a whole team"*. Ignore them. After five days you already know the truth:

| The internet says | The truth |
|---|---|
| "One prompt rules them all" | Different tools for different jobs |
| "AI replaces thinking" | AI rewards thinkers, punishes skippers |
| "Just ask it anything" | Context beats cleverness |
| "AI gives you superpowers" | AI gives you leverage — only if you had direction |

The students who win with AI aren't the ones who discover secret prompts. They're the ones who build systems — a prompt library, a tool stack, a verification habit — and iterate weekly.

### Pattern recognition across the cohort

Over the past four days you've watched your classmates use AI for different things. If this class is like every cohort before it, the uses clustered into five buckets:

1. **Study & notes** — summarising, flashcards, concept explanations
2. **Career & writing** — resumes, cover letters, LinkedIn, emails
3. **Projects & code** — explaining, debugging, brainstorming (we'll level this up from Week 2)
4. **Life admin** — travel planning, budgets, messages, translation
5. **Creative** — writing, art, music, roleplay

Worked example. Take Priya — 3rd-year Civil, CGPA 7.2, no coding interest. Her Week-1 wins looked nothing like a CS major's. She used Claude to turn her grandmother's handwritten recipes into a blog, used Sarvam to translate them into Kannada, and used ChatGPT to design Instagram captions. She's not "behind" — she's ahead, because she built an AI workflow that actually fits *her* life. Your stack should fit yours, not somebody else's.

### The "personal AI stack" — what it actually is

A personal AI stack is a 1-page document with four sections:

| Section | What goes in |
|---|---|
| **My AI tools** | Which models/apps you use, and for what (e.g., "Claude = writing, ChatGPT = quick Qs, Sarvam = Kannada") |
| **My top 10 prompts** | Your prompt library from Day 3, starred favourites |
| **My red lines** | What you refuse to do with AI (Day 4 assignment) |
| **My next bet** | One specific AI skill you want to own by Day 30 |

You'll revise this stack every Sunday for the next four weeks. By Day 30 you'll have v5 — and it will be the single most valuable artifact in your college AI folder, more than any certificate.

### Two unspoken rules of the cohort

1. **Steal shamelessly.** If Rohit's prompt for LinkedIn posts is better than yours, use it. Credit him. That's how communities level up.
2. **Share your failures.** Everyone shares wins. The students who share their *fails* — "here's a prompt I thought would work and didn't" — teach the room more than ten success stories.

## Watch: Instructor's hidden-gem prompts

Short compilation of 5-7 prompts the instructor uses daily that you won't see in any guide. Edge cases, weird tricks, format hacks.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

Watch for:
- The "critic mode" prompt that makes AI roast your own work
- The "explain it to me like…" ladder (ELI5 → ELI-grandma → ELI-hiring-manager)
- The two-word addition that unlocks better answers 60% of the time

## Lab: 2-minute pitch — your best AI win of the week

45 minutes total — most of it is listening.

1. Before class, pick your single best AI moment from Days 1-4. Could be a great prompt, a surprise answer, a hallucination you caught, a translation that nailed it, a small workflow that saved you an hour.
2. Prepare a 2-minute pitch with three parts: (a) what the task was, (b) what you did, (c) why it worked (or why it surprisingly didn't).
3. Optionally prepare one screenshot or a live demo. Keep it to one window.
4. In class, go in a round. Everyone presents. 2 minutes hard cap. Instructor keeps time.
5. While others present, take notes in a single Google Doc titled *"Cohort Tricks — Week 1"*. One line per student: name + their trick.
6. After the round, star the three tricks you want to steal this weekend.
7. As a group, vote on three categories: *Most Useful, Most Creative, Most Surprising.* Winners get bragging rights and a mention in next week's intro.
8. End of class: everyone shares their "stolen trick" with the person they took it from and thanks them. (Small ritual. Builds the room.)

Artifact: your 2-minute pitch delivered, plus the cohort tricks doc you took notes in.

## Quiz

Four synthesis questions pulling across all five days — a little tokens, a little Indian models, a little prompting, a little ethics. This is the "did Week 1 stick?" checkpoint.

## Assignment — WEEKLY DELIVERABLE

This is the big one. Submit by Sunday night.

**Week 1 reflection + Personal AI Stack v1 — one single PDF, 1-2 pages max.**

Structure:
1. **Reflection (200 words):** What shifted in how you see AI this week? Be specific — name one belief you had on Day 0 that's now gone.
2. **My AI Tools:** short table — tool / what I use it for / why this one.
3. **My Top 10 Prompts:** your Day 3 library, cleaned up.
4. **My Red Lines:** your Day 4 essay, condensed to 3-5 bullets.
5. **My Next Bet:** one sentence — the specific AI skill you want to own by Day 30.

Submit as PDF in the class channel. We'll read them, and the instructor will pick 3-5 stacks to feature (anonymously if you prefer) in Week 2 Day 1. You'll update this stack every Sunday for the rest of the workshop.

## Discuss: Live session prompts

- Which single classmate's trick will you actually use next week — and why theirs and not yours?
- What belief about AI did you enter Day 1 with that you're leaving Day 5 without?
- Is a personal AI stack overkill for a college student, or under-kill?
- Pick a friend who isn't in this workshop. What one thing would you tell them from Week 1 that would change their life in 10 minutes?
- What do you want Week 2 to teach you that Week 1 didn't?
