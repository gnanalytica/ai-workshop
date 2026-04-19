---
reading_time: 14 min
tldr: "A one-day design sprint to turn your fuzzy capstone idea into a 1-page spec you can actually build."
tags: ["capstone", "design-sprint", "concepts"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Your 1-page capstone spec", "url": "https://www.thesprintbook.com/"}
prompt_of_the_day: "You are my product coach. I want to build {{idea}} for {{user}}. Ask me 5 sharp questions that will force me to decide the smallest useful version I can ship in 7 days."
resources: [{"title": "Google Ventures Design Sprint", "url": "https://www.thesprintbook.com/"}, {"title": "Shape Up (pitch format)", "url": "https://basecamp.com/shapeup"}, {"title": "Claude Code", "url": "https://www.anthropic.com/claude-code"}]
---

## Intro

You've spent two weeks learning to think clearly with AI. Now you're about to build. But before you touch a single tool, we compress Google Ventures' 5-day Design Sprint into one focused day. By tonight you'll have a 1-page spec: the problem, the user, the flow, and what "shipped" looks like. That paper beats three weeks of vibes.

## Read: From fuzzy idea to a spec someone can build

Every student walks in with an idea like "an AI thing for studying" or "something for placements." That's a vibe, not a plan. A spec answers four questions, hard: who is this for, what pain does it remove, what do they do with it, and how do you know it worked. If you can't answer those in one page, no AI tool on earth will save you.

The Design Sprint was invented at Google Ventures to take a startup from idea to tested prototype in five days. We're going to squeeze it into six hours, skip the user-testing half, and replace the fancy prototype with a paper sketch plus a written spec. That's enough.

### The four decisions that unlock everything

Every good build rests on four decisions made in order. Skip one and you'll be lost by Day 19.

| Decision | Bad answer | Good answer |
|---|---|---|
| Who | "Students" | "Second-year CS students at my college prepping for campus placements in the next 90 days" |
| Pain | "Studying is hard" | "They waste 2 hours scrolling LeetCode without knowing which 5 problems actually match their target company" |
| Job | "Help them study" | "Given a target company, surface a ranked 10-problem practice set and track what they solve" |
| Done | "It works" | "One friend uses it for a week and says it replaced their random LeetCode routine" |

Notice the pattern: the bad answers are abstract nouns, the good answers are specific verbs and countable nouns. Your spec must read like the right column.

### The one-day sprint, hour by hour

You don't need a conference room or sticky notes. You need a notebook, a timer, and discipline. Here's the compressed flow.

```
Read this, don't type it

HOUR 1  Map the problem       -> write the 4 decisions above, 1 page
HOUR 2  Lightning demos       -> list 5 apps you love, steal 1 idea from each
HOUR 3  Sketch the user flow  -> 6 boxes from "user opens app" to "user is happy"
HOUR 4  Paper-prototype       -> draw 3-5 screens on paper, label buttons
HOUR 5  Define "shipped"      -> 3 crisp success criteria, 1 anti-goal
HOUR 6  Write the 1-page spec -> the document you'll hand to the AI on Day 21
```

Lightning demos sound silly but they're the secret weapon. You don't need to invent a novel UI. If Duolingo's streak, Spotify's "Daily Mix," and Notion's slash-menu work, borrow them. Good artists steal.

### The user flow: six boxes, no more

A user flow is just a horizontal chain of boxes showing what happens, in order. Not a wireframe. Not a mockup. Just nouns and verbs.

```
Read this, don't type it

[ Lands on site ] -> [ Uploads notes PDF ] -> [ AI indexes it ]
      -> [ Asks a question ] -> [ Gets answer + source page ] -> [ Saves favorite ]
```

That's a RAG app for lecture notes in one line. When you sit down in bolt.new on Day 21, you'll paste that exact chain as your first instruction. Clarity upstream, speed downstream.

### The "shipped" definition

Most student projects die because "done" is undefined. Fix that now. Write three success criteria that a stranger could verify in 60 seconds.

- A live URL anyone can open without login.
- Upload a PDF and get back at least one correct answer with the source page.
- One real classmate has used it and said something honest about it.

Add one anti-goal — something you explicitly will NOT do. "I will not add user accounts." "I will not support non-English documents." Anti-goals are where scope creep goes to die.

## Watch: The design sprint in 90 seconds

Jake Knapp, who invented the Sprint at Google Ventures, walks through the full five-day version. Watch it and mentally compress — the principles matter, not the schedule.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Notice how the sprint starts with a long-term goal, not a feature.
- Watch how the team prioritizes one user flow over many.
- Observe how the prototype is intentionally cheap.

## Lab: Write your 1-page capstone spec

No AI tools today. This is the last think-before-build exercise. Grab paper, a timer, and go.

1. Set a 60-minute timer. Open a fresh Google Doc titled "My Capstone Spec v1."
2. Answer the four decisions from the table above. One sentence each. If you can't be specific, your "who" is wrong — narrow it.
3. Open 5 apps you love on your phone. For each, write one sentence: "The idea I'm stealing is ___." You now have 5 design primitives to remix.
4. On paper, draw the six-box user flow. Photograph it and paste it into the doc.
5. Sketch 3 to 5 screens on paper — just boxes and labels. "Upload button here. Chat input here. Answer appears here with a source chip." Photograph and paste.
6. Write three "shipped" criteria and one anti-goal. Make them testable by a stranger in under a minute.
7. Paste today's prompt-of-the-day into ChatGPT or Claude. Answer its 5 questions inside your doc. Let it push back on your weak spots.
8. Read the whole doc aloud to a friend or roommate. If they can't repeat back what you're building, rewrite until they can.

Your deliverable is one Google Doc, one page, screenshots allowed. If it runs longer than a page you've added things you don't need yet.

## Quiz

A short quiz on scoping will follow. Expect questions on the difference between a user, a pain, a job, and a definition of done. Expect one trick question about scope creep. There is a right answer and a tempting wrong answer — pick the one a stranger could verify.

## Assignment

Submit your 1-page spec as a public Google Doc link by tomorrow morning. It must contain: the four decisions, the six-box user flow, at least three paper-screen photos, three success criteria, and one anti-goal. If a classmate reads it and can't sketch roughly what you're building, revise it before Day 21.

## Discuss: Defending your scope

- What was the single hardest thing to cut from your idea, and why did you cut it?
- Whose specific problem is this — name one real person you know who fits the profile.
- What's a "shipped" criterion you're tempted to fudge, and what would honest success actually look like?
- Which app did you steal the most from, and what did you change?
- What will you say no to in the next 7 days that your past self would have said yes to?
