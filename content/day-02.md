---
reading_time: 15 min
tldr: "A vague problem is the root of every wasted sprint. Sharpen the question before you chase the answer."
tags: ["framing", "thinking"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Rewrite a vague problem three times", "url": "https://excalidraw.com/"}
resources: [{"title": "The Heilmeier Catechism (DARPA)", "url": "https://en.wikipedia.org/wiki/George_H._Heilmeier#Heilmeier_Catechism"}, {"title": "IDEO Design Kit — How Might We", "url": "https://www.designkit.org/"}, {"title": "Are You Solving the Right Problem? — HBR", "url": "https://hbr.org/"}]
---

## Intro

Most bad projects are not bad because of bad execution. They are bad because someone answered a question nobody had clearly asked. Today you learn the single highest-leverage habit of a good builder: converting vague, tangled problems into crisp statements that you — and anyone you hand the work to — can actually act on.

## Read: From fog to framing

### The symptom: vague problems

"I want to build something for students." "We should do something with AI for education." "Hostel Wi-Fi is bad." These are not problems. They are *vibes*. Vibes cannot be solved. They can only be argued about.

A crisp problem statement has four properties:

1. **A specific user** — not "students", but "2nd-year students in Block-B hostel who commute to mess at 9:30pm".
2. **A specific painful moment** — the instant where the current experience fails.
3. **A measurable gap** — what is happening today vs. what should be happening.
4. **A reason it matters now** — why bother this week instead of next year.

### Tool 1: The Heilmeier Catechism

George Heilmeier, the former DARPA director, made every project proposer answer the same nine questions. It's brutal and clarifying:

> 1. What are you trying to do? Articulate it with absolutely no jargon.
> 2. How is it done today, and what are the limits of current practice?
> 3. What is new in your approach and why do you think it will be successful?
> 4. Who cares? If you're successful, what difference will it make?
> 5. What are the risks?
> 6. How much will it cost?
> 7. How long will it take?
> 8. What are the mid-term and final "exams" to check for success?
> 9. How will you know you're done?

If you cannot answer (1) in one sentence without buzzwords, you do not understand your problem yet. Go back.

### Tool 2: "How Might We…"

Once you know the pain, reframe it as an invitation. "How Might We" (HMW) is a prompt format invented at P&G and popularized by IDEO. It turns a complaint into a design challenge.

- Too broad: *How might we fix education?* → useless.
- Too narrow: *How might we add a red button to the app?* → traps you into one solution.
- Just right: *How might we help 2nd-year students decide what electives to pick before the 48-hour registration window closes?*

A good HMW is specific about the user and the moment, but silent about the solution.

### Worked example: the mess menu problem

Vague starting point:

> "The mess food is bad."

**Heilmeier pass:**

| Q | Rough answer |
|---|------|
| What are you trying to do? | Reduce the gap between what mess residents want to eat and what is served. |
| How is it done today? | A committee of 5 seniors picks a 4-week rotating menu in July. No feedback loop during the semester. |
| What's new? | A 30-second weekly "what will you actually eat?" poll whose results directly adjust next week's procurement. |
| Who cares? | 420 residents, the mess manager (food waste hits his budget), hostel warden. |
| Risks? | Low poll response, political pushback from committee. |
| Success metric? | Weekly plate-waste weight down 20% in 6 weeks. |

**HMW rewrite:**

> *How might we give mess residents a 30-second weekly way to shape next week's menu, so procurement can cut waste?*

Notice: the problem is now small enough to attack, big enough to matter, and the success metric (plate-waste weight) is concrete.

### The 5 Whys (when you are stuck on symptoms)

Ask "why" five times in a row on the surface complaint. You usually land somewhere unexpected.

1. *Mess food is bad.* Why?
2. *The menu repeats boring items.* Why?
3. *The committee picked items that store well, not items people like.* Why?
4. *They don't know what people like week-to-week.* Why?
5. *There is no feedback loop between eaters and procurement.* → **Root cause**: missing feedback loop, not bad taste.

The fix is now obvious: build the feedback loop. You just avoided building a "better menu algorithm" nobody needed.

### Common framing mistakes

- **Solution-smuggling.** "How might we build an app for mess feedback?" smuggles in "app" as the answer. Strip it.
- **Infinite scope.** "How might we improve campus life?" — cannot be attacked.
- **No user.** Passive voice hides the human. If you can't name the person whose day gets better, start over.
- **No timebox.** If the problem has been around for 10 years, why does it need to be solved *this week*?

## Watch: the art of problem framing

A short talk on why "solving the right problem" is the rarest skill in product work. Watch once at 1x — it rewards attention.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Note the framing flip around the mid-point: from "how do we fix X" to "why does X happen at all?"
- Watch for the phrase "problem statement" vs "solution statement". The speaker is careful.
- Notice how the worked example names a single, specific user by role.

## Lab: three iterations of a crisp problem

You will take a vague problem and rewrite it three times, each rewrite sharper than the last.

1. Pick one of these vague starting points (or bring your own):
   - "Placement prep is stressful."
   - "Class notes are scattered everywhere."
   - "Campus events have low turnout."
   - "The library is always full during exams."
2. Open a blank doc or Excalidraw page. Create three columns labeled **V1**, **V2**, **V3**.
3. **V1** — write the problem as a complaint, the way a friend would say it in the canteen. One line.
4. **V2** — run it through the 5 Whys. Write the root cause and a new problem statement naming a specific user + specific moment.
5. **V3** — rewrite V2 as a "How Might We" that is *specific about the user and moment, silent about the solution*. No "app", "AI", "platform" allowed.
6. Below V3, answer four Heilmeier questions in one line each: What are you trying to do? Who cares? How will we know it worked? What's the biggest risk?
7. Pair with a cohort partner. Trade V3s. Each of you tries to break the other's: is there a user named? a moment? a measurable gap?
8. Rewrite V3 one more time based on their critique.

Use the template:

```
V1 (the complaint):
  _________________________________________________________

V2 (after 5 Whys):
  Root cause: _____________________________________________
  Restated:   _____________________________________________

V3 (How Might We):
  How might we __________________________________________
  for ___________________________________________________
  when __________________________________________________ ?

Heilmeier mini-pass:
  What:    ______________________________________________
  Who:     ______________________________________________
  Success: ______________________________________________
  Risk:    ______________________________________________
```

## Quiz

Quick check on today's core moves — Heilmeier, How-Might-We, 5 Whys, and the four properties of a crisp problem statement. Aim for 75%+. If you score lower, re-read the worked example; we rely on these muscles every single day from here on.

## Assignment

Submit your final **V3 statement plus the four Heilmeier answers** as a **text submission**. One problem, one page, no more. We will grade on specificity and whether your statement names a user, a moment, and a measurable gap. Solution-smuggled language (words like "app", "dashboard", "AI") gets an automatic rewrite request.

## Discuss: sharpening each other's framing

- Read your V3 out loud. Does the group believe the user is a real, specific person — or a vague persona?
- Which of the four properties (user / moment / gap / urgency) is the easiest to fake? Why?
- Give an example from your past where you built something nobody wanted. What was the framing mistake?
- When is it dishonest to solution-smuggle — and when is it fine because the solution is obvious?
- How does a crisp problem statement change *who you would go talk to next*?
