---
reading_time: 15 min
tags: ["design", "thinking"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Run a tiny problem through five stages in 45 minutes", "url": "https://excalidraw.com/"}
resources: [{"title": "IDEO Design Kit", "url": "https://www.designkit.org/"}, {"title": "IDEO", "url": "https://www.ideo.com/"}, {"title": "Stanford d.school bootleg deck (search it)", "url": "https://hbr.org/"}]
---

## Intro

"Design thinking" has been turned into a meme by consulting slides. Today we strip it back to what it actually is: a set of five habits that keep you honest about who you're building for. No post-it wallpaper required. By the end, you will have pushed a real problem through all five stages in under an hour.

## Read: the five stages — without the sticky-note theatre

Design thinking, as originally practiced at IDEO and Stanford's d.school, is not a waterfall. It is a loop you walk through many times. The five stages are:

1. **Empathize** — understand the human.
2. **Define** — frame the problem.
3. **Ideate** — generate many candidate solutions.
4. **Prototype** — build the cheapest possible version.
5. **Test** — put it in front of real users and watch.

You will usually loop: test reveals you mis-empathized, so you redefine, re-ideate, rebuild. That is not a failure of the process; that *is* the process.

### Stage 1 — Empathize

Goal: get out of your own head and into the user's. Methods: interviews (we cover these in depth tomorrow), shadowing, "day in the life" diaries, reading complaints in real places (college subreddits, WhatsApp groups, Google reviews).

> Warning: never substitute your own intuition for an actual user conversation. You are not the user. Even when you *are* the user, you are one user.

### Stage 2 — Define

Goal: lock a crisp problem statement (see Day 2). A common artifact here is the **POV (Point of View)** statement:

```
[User] needs a way to [need]
because [surprising insight].
```

Example: *A 2nd-year student juggling two electives needs a way to decide between them in under 10 minutes, because waiting for senior opinions means they miss the 48-hour registration window.*

The "because" is the part most people skip and is the most valuable part. It forces you to name the *insight*, not just the surface need.

### Stage 3 — Ideate

Goal: *quantity before quality*. The rookie mistake is to defend the first idea. The pro move is to generate 20 ideas in 15 minutes — including deliberately bad ones — before picking any. Bad ideas shake loose good ones.

Useful ideation tools:

- **Crazy 8s:** fold a page into 8 boxes, one idea per box, 60 seconds each.
- **Worst possible idea:** what would guarantee failure? Often reveals what *must* be true of the good idea.
- **SCAMPER:** Substitute, Combine, Adapt, Modify, Put-to-other-uses, Eliminate, Reverse.

### Stage 4 — Prototype

Goal: make the idea tangible *cheaply*. The prototype's only job is to provoke a reaction. Paper wireframes, a Figma mock, a WhatsApp group set up by hand, a Google Form pretending to be a backend — all valid. At this stage, real code is usually over-investment.

> A prototype you can throw away in 30 minutes is better than one you'd defend for an hour.

### Stage 5 — Test

Goal: watch users meet your prototype. You are not selling; you are learning. Ask them to do a task and *shut up*. Their hesitation, their confused face, their wrong clicks — that's the data.

Three cheap test formats:

| Test | What it surfaces | Cost |
|------|------------------|------|
| 5-second test (first impression) | Does the idea register? | 5 min |
| Task completion (give them a goal) | Usability failures | 15 min |
| Wizard-of-Oz (you fake the backend) | Does the idea work at all? | 30 min |

### Worked mini-case: campus event discovery

Problem: "Nobody knows about campus events until after they happen."

- **Empathize** — talked to 6 students; surprise: most heard about events from one or two "hub" friends on specific WhatsApp groups.
- **Define** — *2nd/3rd-year students in Block-A need a way to see weekend events by Thursday because by Friday evening all plans are already locked in.*
- **Ideate (10 ideas in 10 min)** — a poster wall, an Instagram page, a Telegram channel, an SMS blast, a calendar bot, a QR code on mess tables, a "this-week-in-campus" Friday newsletter, a Notion page, an event-of-the-day lock screen, a shared Google Calendar.
- **Prototype** — Friday newsletter via Google Doc + WhatsApp forward. Built in 20 minutes.
- **Test** — sent to 30 friends on Thursday. 18 opened. 9 said they'd pay attention weekly. Two events got attendance lifts.

Notice: no app, no database, no AI. The prototype answered the real question ("would anyone actually use this?") for a zero rupees and three hours. *That is design thinking done right.*

### What design thinking is NOT

- It is **not** a guarantee. It is a bias toward cheap iteration and real-user feedback.
- It is **not** only for "designers". Engineers and PMs use it every week.
- It is **not** linear. You will loop stages, and that's healthy.
- It is **not** an excuse to spend three weeks covering walls in post-its without talking to a user.

## Watch: design thinking, honestly

A short talk from someone who has actually shipped things using these methods — not a consultant's slide deck.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Note when the speaker uses the word "insight" vs "idea" — they are different.
- Listen for the moment they describe a prototype that cost almost nothing.
- Watch for how they handle a test where the user hates the prototype — the attitude matters.

## Lab: 45-minute end-to-end run

You are going to push one small problem through all five stages in 45 minutes. Yes, really. The constraint is the point — it forces you to work cheap and fast.

Pick a tiny problem you have some access to. Suggestions:

- Finding a study partner before exams.
- Getting hostel laundry back without a mix-up.
- Deciding what to order when four friends can't agree.

Steps:

1. **0–5 min — Empathize.** Text or call two people who have this pain. Ask: "When was the last time this bothered you? What did you do?" Take literal notes of their words.
2. **5–12 min — Define.** Write one POV statement in the `[User] needs a way to [need] because [insight]` format. Spend half your time on the "because".
3. **12–22 min — Ideate.** Crazy 8s on paper or in Excalidraw. 8 ideas, 60 seconds each. Include at least one deliberately terrible idea.
4. **22–32 min — Prototype.** Pick one idea. Sketch the smallest version you could build this weekend. Use paper or Excalidraw — no code, no Figma fidelity yet.
5. **32–42 min — Test.** Send your sketch to one of the two people you interviewed. Ask: "Would this actually help you? What's missing?" Capture their reply verbatim.
6. **42–45 min — Reflect.** In 3 lines: what would you change in the next loop?

Template:

```
POV:
  ______________ needs a way to ______________
  because ________________________________________

Crazy 8s (titles only):
  1.  2.  3.  4.  5.  6.  7.  8.

Prototype chosen: ____________________________
Sketch link / photo: _________________________

Test user reaction (verbatim): _________________
_________________________________________________

Next loop: ______________________________________
```

## Quiz

Quick check on the five stages, what a POV statement is, and why prototyping fidelity should stay low at first. Four questions. Aim for 75%+ before moving on — we use POV statements again heavily during user interviews tomorrow.

## Assignment

Submit your 45-minute run-through as a **text submission** (or a photo of the paper if you worked offline). Include the POV, all 8 Crazy-8 titles, a photo/sketch link of the prototype, and the verbatim test reaction. One page max. Mark clearly what you would change in the next loop.

## Discuss: where design thinking lies to you

- Which of the five stages is most often skipped by teams you've been on, and why?
- Design thinking is sometimes dismissed as "corporate theatre". When is that critique fair?
- Is it okay to start at "Ideate" if you already know the user well? Defend your answer.
- What's the smallest prototype you've ever built that taught you the most? Tell the story.
- How does a 45-minute sprint change the quality of thinking vs. a 3-week sprint?
