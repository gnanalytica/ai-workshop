---
reading_time: 12 min
tldr: "A week of theory means nothing without a personal stack. Today you build yours — and steal your classmates' best tricks."
tags: ["foundations", "kickoff"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Show-and-tell: 2-minute AI win", "url": "https://claude.ai/"}
prompt_of_the_day: "Act as my blunt AI coach. Here are three prompts I wrote this week: {{prompt1}} / {{prompt2}} / {{prompt3}}. For each, give me one sharper rewrite and one reason mine was weak."
tools_hands_on: [{"name": "Claude", "url": "https://claude.ai/"}, {"name": "ChatGPT", "url": "https://chat.openai.com/"}]
tools_demo: [{"name": "Anthropic Cookbook", "url": "https://github.com/anthropics/anthropic-cookbook"}, {"name": "OpenAI Cookbook", "url": "https://cookbook.openai.com/"}]
tools_reference: [{"name": "DAIR.AI Prompt Engineering Guide", "url": "https://www.promptingguide.ai/"}, {"name": "OpenAI Cookbook", "url": "https://cookbook.openai.com/"}, {"name": "Anthropic Cookbook", "url": "https://github.com/anthropics/anthropic-cookbook"}]
resources: [{"title": "Build a Personal AI Stack (essay)", "url": "https://www.oneusefulthing.org/"}, {"title": "Ethan Mollick's practical AI tips", "url": "https://www.oneusefulthing.org/"}]
---

## Intro

Week 1 — done. Five days ago you only had ChatGPT. Today you know where AI actually shows up in real life, what's going on inside an LLM (tokens, attention), the seven families of tools and which job each one's for, and how to write a prompt that doesn't waste the model's time. **You now know more about how AI actually works than 90% of people on LinkedIn posting about it.**

Today we turn five days of input into one page of output: your AI Stack v1. Plus — we steal the best tricks from the room. Because 30 students running experiments for a week = 150 experiments, and you only saw 5 of them.

> 🧠 **Quick glossary**
> - **Personal AI stack** = a 1-page doc listing your tools, prompts, red lines, and next bet.
> - **Show-and-tell** = a class ritual where everyone shares a 2-min win. You learn more from 30 wins than 1 lecture.
> - **Trick stealing** = encouraged. This is a cohort, not an exam.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Week 1 recap + the one-page map | 10 min | Five days in five lines |
| Show-and-tell round — 2-min per student | 30 min | Everyone shares one AI win from the week |
| Vote: Most Useful / Creative / Surprising | 5 min | Light competition, bragging rights |
| Q&A + Week 2 preview | 15 min | What to expect starting Monday |

**After class** (45 min this weekend): finalise your Personal AI Stack v1 PDF (the big weekly deliverable).

### In-class moments (minute-by-minute)

- **00:05 — Fist-of-5 cold open**: on camera, 1–5 fingers for *"how different does AI feel to me today vs five days ago?"* Instructor calls on one 5 and one 2 for a single sentence each.
- **00:15 — Think-pair-share**: 90 seconds on *"What belief about AI did you enter Day 1 with that you're leaving Day 5 without?"* Each pair volunteers the sharper of the two beliefs.
- **00:30 — Live vote during show-and-tell**: as students pitch, everyone ranks in a running chat tally — *Most Useful / Most Creative / Most Surprising*. Instructor reads the top three out loud at the end of the round.
- **00:45 — Steal-a-trick stand-up**: each student names the one classmate trick they're stealing this weekend and tags them by name in chat. Fast round, one line per person, no passing.
- **00:55 — One-line close**: *"My next bet by Day 30 is ___."* No editing. This line goes straight into the Personal AI Stack v1 draft.

## Before class · ~20 min pre-work

### Setup (if needed)

- [ ] No setup required — today is a show-and-tell, bring what you already have.
- [ ] Open a blank Google Doc titled "Cohort Tricks — Week 1" so you can take notes live.

### Primer (~5 min)

- **Read**: Ethan Mollick's "One Useful Thing" blog (https://www.oneusefulthing.org/) — pick any one recent post. Goal is to see how a working practitioner thinks about AI weekly.
- **Watch** (optional): Re-watch the 1–2 min of Day 1's IBM video that felt densest — you'll understand it differently after four days.

### Bring to class

- [ ] Your single best AI moment from Days 1–4 — a prompt, an output, a surprise, a fail — prepared as a 2-minute pitch.
- [ ] Optional: one screenshot or one browser tab ready to demo (don't over-prepare slides — the constraint is the point).

## Read: What we learned — the one-page map

```
Day 1: What AI is + real-life applications → where AI already shows up around you
Day 2: Inside an LLM                       → tokens, weights, attention
Day 3: The AI tool landscape               → 7 tool families, which job → which tool
Day 4: Prompts + context engineering       → CREATE framework, few-shot, CoT
Day 5: Show-and-tell + personal stack      → today
```

Zoom out and you see the pattern: we went from *"where does AI even live"* to *"what's actually inside the box"* to *"which box for which job"* to *"how do I speak to it"* to *"what's my personal stack."* That's not an accident — it's the only sensible order. (Ethics + failure modes come in Week 4 Day 26, once you've actually shipped things worth being careful about.)

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

Over the past four days you watched your classmates use AI for different things. If this class is like every cohort before it, the uses clustered into five buckets:

1. **Study & notes** — summarising, flashcards, concept explanations
2. **Career & writing** — resumes, cover letters, LinkedIn, emails
3. **Projects & code** — explaining, debugging, brainstorming (we'll level this up from Week 2)
4. **Life admin** — travel planning, budgets, messages, translation
5. **Creative** — writing, art, music, roleplay

**Worked example.** Priya — 3rd-year Civil, CGPA 7.2, no coding interest. Her Week-1 wins looked nothing like a CS major's. She used Claude to turn her grandmother's handwritten recipes into a blog, used Sarvam to translate them into Kannada, and used ChatGPT to design Instagram captions. She's not "behind" — she's ahead, because she built an AI workflow that actually fits *her* life. Your stack should fit yours, not somebody else's.

### The "personal AI stack" — what it actually is

A personal AI stack is a 1-page document with four sections:

| Section | What goes in |
|---|---|
| **My AI tools** | Which models/apps you use, and for what (e.g., "Claude = writing, ChatGPT = quick Qs, Sarvam = Kannada") |
| **My top 10 prompts** | Your prompt library from Day 4, starred favourites |
| **My top 3 use cases** | The three jobs where AI already saves you the most time (from Day 3's tool audit) |
| **My next bet** | One specific AI skill you want to own by Day 30 |

You'll revise this stack every Sunday for the next four weeks. By Day 30 you'll have v5 — and it will be the single most valuable artifact in your college AI folder, more than any certificate.

### Two unspoken rules of the cohort

1. **Steal shamelessly.** If Rohit's prompt for LinkedIn posts is better than yours, use it. Credit him. That's how communities level up.
2. **Share your failures.** Everyone shares wins. The students who share their *fails* — "here's a prompt I thought would work and didn't" — teach the room more than ten success stories.

## Watch: Instructor's hidden-gem prompts

A short compilation of 5-7 prompts your instructor uses daily that you won't see in any guide. Edge cases, weird tricks, format hacks.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

Watch for:
- The "critic mode" prompt that makes AI roast your own work
- The "explain it to me like…" ladder (ELI5 → ELI-grandma → ELI-hiring-manager)
- The two-word addition that unlocks better answers 60% of the time

## Lab: 2-minute pitch — your best AI win of the week

This IS the live class today. Most of the hour is listening to each other. 30 classmates × 2 min = 60 min of collective wisdom.

> ⚠️ **If you get stuck**
> - *You feel like you have no "win" worth sharing* → you do. The best pitches of the week are almost always someone saying "I thought this would work and it didn't, here's what I learned." Share that instead. Fails teach the room more than wins.
> - *Your screenshot / live demo breaks during your 2 minutes* → keep going with words. Describe the prompt, the output, and the aha. Instructor will not extend your clock — the constraint is the point, not the demo.
> - *You took no notes and suddenly it's "name the trick you're stealing" time* → fine. Name the presenter who stuck with you most and the one-line gist you remember. Ask them for the prompt afterwards. That's the whole ritual.

1. Before class, pick your single best AI moment from Days 1-4. Could be a great prompt, a surprise answer, a hallucination you caught, a translation that nailed it, a small workflow that saved you an hour.
2. Prepare a 2-minute pitch with three parts: (a) what the task was, (b) what you did, (c) why it worked (or why it surprisingly didn't).
3. Optionally prepare one screenshot or a live demo. Keep it to one window.
4. In class, go in a round. Everyone presents. 2 minutes hard cap. Instructor keeps time.
5. While others present, take notes in a single Google Doc titled *"Cohort Tricks — Week 1"*. One line per student: name + their trick.
6. After the round, star the three tricks you want to steal this weekend.
7. As a group, vote on three categories: *Most Useful, Most Creative, Most Surprising.* Winners get bragging rights and a mention in next week's intro.
8. End of class: everyone shares their "stolen trick" with the person they took it from and thanks them. (Small ritual. Builds the room.)

**Artifact**: your 2-minute pitch delivered, plus the cohort tricks doc you took notes in.

## After class · ~30-45 min post-work

### Do (the assignment)

1. Open a new document titled "Personal AI Stack v1 — [Your Name]."
2. Write a 200-word reflection on what shifted this week — name one specific Day-0 belief that's gone.
3. Add four short sections: **My AI Tools** (table from Day 3's tool audit), **My Top 10 Prompts** (your Day 4 library, cleaned), **My Top 3 Use Cases** (the three jobs where AI saves you the most time right now), **My Next Bet** (one sentence — the AI skill you'll own by Day 30).
4. Keep the whole artifact to 1–2 pages. Export as PDF.
5. Submit via the dashboard by Sunday night. Opt into the "feature anonymously" box if you're open to it.

### Reflect (~5 min)

**Prompt:** *"Which classmate's trick am I actually going to steal this weekend — and will I credit them when I use it in Week 2?"* A good reflection names the person, the trick, and the specific moment next week you'll deploy it. Attribution matters here — the cohort only levels up if credit flows.

### Stretch (optional, for the curious)

- **Extra video**: TBD — instructor will pick a Week 2 primer based on which bucket (study / career / code / life / creative) the cohort leaned into.
- **Extra read**: One entry from the Anthropic Cookbook (https://github.com/anthropics/anthropic-cookbook) or OpenAI Cookbook (https://cookbook.openai.com/) that matches your "next bet."
- **Try**: Take your Personal AI Stack v1 and feed it to Claude with the prompt *"Roast this like a senior PM interviewer. Where am I fooling myself?"* Screenshot the best sentence and tape it above your desk.

## Quiz

Four synthesis questions pulling across all five days — a little tokens, a little Indian models, a little prompting, a little ethics. This is the "did Week 1 stick?" checkpoint.

## Assignment — WEEKLY DELIVERABLE

This is the big one. Submit by Sunday night.

**Week 1 reflection + Personal AI Stack v1 — one single PDF, 1–2 pages max.**

Structure:
1. **Reflection (200 words):** What shifted in how you see AI this week? Be specific — name one belief you had on Day 0 that's now gone.
2. **My AI Tools:** short table from your Day 3 tool audit — tool / what I use it for / why this one.
3. **My Top 10 Prompts:** your Day 4 library, cleaned up.
4. **My Top 3 Use Cases:** the three jobs where AI already saves you the most time — one line each, concrete.
5. **My Next Bet:** one sentence — the specific AI skill you want to own by Day 30.

Submit as PDF via the dashboard. The instructor will pick 3-5 stacks to feature (anonymously if you prefer) in Week 2 Day 1. You'll update this stack every Sunday for the rest of the workshop.

## Discuss: Live session prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Which single classmate's trick will you actually use next week — and why theirs and not yours? | Names the classmate and the specific trick (not "their whole approach"). Explains the gap in your own workflow it fills. Shows you actually listened, not just voted. |
| What belief about AI did you enter Day 1 with that you're leaving Day 5 without? | A specific belief, stated as you believed it on Day 0 ("I thought Claude and ChatGPT were basically the same product"). Then what replaced it, and what piece of evidence flipped it. |
| Is a personal AI stack overkill for a college student, or under-kill? | Rejects the framing: the stack is cheap to build, compounds weekly, and the opportunity cost of not having one is invisible but large. Or argues the opposite with specifics — not just "depends." |
| Pick a friend who isn't in this workshop. What one thing would you tell them from Week 1 that would change their life in 10 minutes? | One concrete thing they can do *today*, not a concept. "Open Claude, paste your resume, ask it to roast you as a Razorpay hiring manager" — not "learn about prompting." |
| What do you want Week 2 to teach you that Week 1 didn't? | Points to a specific gap you *noticed* this week — image tools, voice, a coding use-case, agents. Shows you've read the Week 2 preview enough to aim the question. |

## References

### Pre-class primers
- [Ethan Mollick — One Useful Thing](https://www.oneusefulthing.org/) — the most practical weekly AI writer online.

### Covered during class
- [Claude](https://claude.ai/), [ChatGPT](https://chat.openai.com/) — today's show-and-tell tools.
- [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook) — recipe-style examples for Claude.
- [OpenAI Cookbook](https://cookbook.openai.com/) — the same, for GPT.

### Deep dives (post-class, if curious)
- [DAIR.AI Prompt Engineering Guide](https://www.promptingguide.ai/) — return here every few weeks as your needs grow.
- [Build a Personal AI Stack (essay)](https://www.oneusefulthing.org/) — inspiration for your v2 onward.

### Other videos worth watching
- Instructor's own "hidden-gem prompts" compilation — linked in the cohort channel once recorded.
