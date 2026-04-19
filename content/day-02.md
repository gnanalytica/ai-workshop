---
reading_time: 10 min
tldr: "Bad prompts get bad answers. Learn the CREATE framework and watch AI quality jump 10x — same tool, same free account."
tags: ["use", "prompt", "productivity"]
video: https://www.youtube.com/embed/jC4v5AS4RIM
lab: {"title": "Rewrite 3 prompts using CREATE", "url": "https://chat.openai.com/"}
prompt_of_the_day: "You are a {{role, e.g. strict placement coach}}. Context: {{who I am and what I need}}. Task: {{the specific thing I want}}. Format: {{bullets / table / 200 words / email}}. Constraints: {{tone, length, must-include, must-avoid}}. Examples of what good looks like: {{paste 1-2 examples or say 'none'}}."
resources: [{"title": "OpenAI Prompting Guide", "url": "https://platform.openai.com/docs/guides/prompt-engineering"}, {"title": "Anthropic Prompt Library", "url": "https://docs.anthropic.com/en/prompt-library/library"}, {"title": "Google Prompting Essentials", "url": "https://grow.google/prompting-essentials/"}]
---

## Intro

Yesterday you got wins. Today you get leverage. The difference between an average AI user and someone who feels like they hired a team is one skill: prompting. Same tool, same account — but 10x the quality. By the end of today you'll have a personal prompt library you can paste for the rest of your life.

## Read: The CREATE framework

Most people type into AI like they type into Google. That's the problem. AI is not a search box — it's a very literal collaborator. The more it knows about who you are, what you want, and what "good" looks like, the better it answers. Use this acronym. Name it. Live by it.

**CREATE** stands for:

- **C — Character / role.** Who should the AI pretend to be?
- **R — Request.** What exactly do you want?
- **E — Examples.** What does good look like?
- **A — Audience / context.** Who are you, who's this for?
- **T — Tone & format.** Voice, length, structure.
- **E — Edge cases / constraints.** What to avoid, must-include, limits.

You don't have to use all six every time. But if an AI answer is bad, check which letter you skipped.

### Before and after (same tool, same day)

**Bad prompt:** "write me a cover letter for a data science internship"

**Result:** Generic, robotic, uses the phrase "highly motivated individual", sounds like 50,000 other letters.

**CREATE prompt:**

```
Copy and paste this prompt:

You are a senior recruiter at a Bangalore product startup who screens 200 CVs a week.

I'm a 3rd-year ECE student with a CGPA of 8.1, two Kaggle bronze medals, and one Python-based college project on traffic signal optimisation. I'm applying for a Data Science Intern role at a logistics startup (20-person team, Series A).

Write a cover letter of 180 words max.

Tone: confident, specific, no buzzwords. Sound like a real 21-year-old, not a LinkedIn bot.

Must include: my Kaggle work framed in plain English, why logistics interests me, one question I'd want to ask the founder.

Avoid: "highly motivated", "passionate", "synergy", any phrase that sounds like a template.

Example of good opening line: "I spent last weekend trying to predict Bangalore auto fares from 3 GB of messy CSVs — I didn't win, but I learnt why logistics data is genuinely fun."
```

**Result:** You now have a letter you'd actually send. Specificity is the whole game.

### The five moves that instantly upgrade any prompt

| Move | What to add | Example |
|------|-------------|---------|
| Give it a role | "You are a…" | "You are a harsh DSA interviewer." |
| Give it *you* | Your background in one line | "I'm a 2nd-year CSE student, weak at recursion." |
| Ask for a format | Bullets / table / 3 sections | "Reply as a 3-column table." |
| Show an example | "Good looks like this: …" | Paste a paragraph you liked. |
| Ask it to think | "Before answering, list your assumptions." | Forces slower, better reasoning. |

### Your reusable prompt library (copy these into a Notes app today)

**Study helper**
```
You are a patient tutor. I'm a 2nd-year engineering student. Explain {{topic}} in this order: (1) one-line intuition, (2) formal definition, (3) worked example with numbers, (4) three practice questions — don't solve them yet.
```

**Writer-with-my-voice**
```
Rewrite this {{email / essay / message}} in my voice. My voice samples are below. Keep it under {{N}} words. Don't use em-dashes, corporate buzzwords, or the word "delve". Samples: {{paste 2-3 things you've written}}.
```

**Explainer / simplifier**
```
Explain {{topic}} three times: (a) to a 10-year-old using a food analogy, (b) to a 2nd-year engineering student, (c) to a senior professor. Keep each version under 100 words.
```

**Decision-helper**
```
I'm trying to decide between {{A}} and {{B}}. Give me: 3 reasons for A, 3 reasons for B, 3 questions I should ask myself, and finally your honest recommendation if you were me.
```

### The "wow" trick of the day

After any AI answer, type: **"What did you assume that might be wrong? What would you ask me to make this 2x better?"** The AI will reveal exactly what it guessed about your situation. Fix those, re-ask, and the next answer is dramatically better.

## Watch: Prompt engineering basics in 10 minutes

One short primer on structuring prompts. Watch for the before/after demos — they're the clearest way to internalise why CREATE works.

https://www.youtube.com/embed/jC4v5AS4RIM
<!-- TODO: replace video -->

- Notice how experts almost always give the AI a *role* first.
- Count how many times they refine a prompt rather than re-prompt from scratch.
- Pay attention to format instructions — "reply as a table" changes everything.

## Lab: Rewrite three real prompts

You'll end with a Google Doc containing your 3 bad-vs-good prompt pairs.

1. Open a Google Doc. Title it "My Prompt Upgrades — Day 2".
2. Write down 3 things you'd actually ask an AI this week: e.g. "help me study for OS midterm", "write a DM to a senior for referral", "help me plan my week".
3. For each one, first write the *lazy* version you'd have typed on Day 1. Paste it into ChatGPT. Screenshot the answer.
4. Now rewrite it using CREATE — all six letters. Paste the new version into the same chat. Screenshot the new answer.
5. Under each pair, write 2 lines: what got better and why.
6. Ask the AI: *"What did you assume that might be wrong about me?"* Paste its reply into your doc.
7. Save one of your three as a permanent template in a Notes app called "My Prompts".
8. Submit the Doc link.

**Victory condition:** one Google Doc with three before/after pairs and one saved template you'll reuse this semester.

## Quiz

Four quick questions: what CREATE stands for, which letter most people skip, the "critique your assumptions" move, and spotting which of four prompts is best.

## Assignment

Share your Google Doc link and pick the single biggest jump in quality from your three pairs. In 3 lines tell us: what was the lazy prompt, what did you add, and what did the AI do differently. No screenshots needed beyond your doc.

## Discuss: Why does giving AI a "role" change the answer so much?

- Which letter of CREATE felt most unnatural to add — and why?
- Share your single best prompt from today. Would you let a junior copy it?
- Has anyone's AI pushed back or refused something after you gave more context? What happened?
- Where should we *not* use a heavy prompt — when is a one-liner enough?
- Does writing better prompts feel like writing better briefs for a human? Good or bad thing?
