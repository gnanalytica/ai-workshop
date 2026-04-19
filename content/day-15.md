---
reading_time: 14 min
tldr: "Run a compressed 1-day design sprint, wireframe your capstone, and lock a 1-page spec in public — this is Capstone Milestone 2."
tags: ["design", "sprint", "spec", "wireframes", "capstone", "milestone"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Wireframe your capstone in Figma + write your locked 1-page spec", "url": "https://www.figma.com"}
prompt_of_the_day: "Critique my 1-page capstone spec as a ruthless senior PM. Spec: {{paste_spec}}. (1) Which sentence is still vague or hides an assumption? (2) What is on the 'will build' list that belongs on 'will NOT build'? (3) Is the success metric actually measurable in 14 days? (4) Would you greenlight this? If not, what is the single most important change before Monday?"
tools_hands_on: [{"name": "Figma", "url": "https://www.figma.com"}]
tools_demo: [{"name": "v0.dev", "url": "https://v0.dev"}]
tools_reference: [{"name": "Sprint — Jake Knapp (book)", "url": "https://www.thesprintbook.com"}, {"name": "Google Ventures design sprint kit", "url": "https://www.gv.com/sprint/"}]
resources: [{"name": "Sprint — Jake Knapp (book)", "url": "https://www.thesprintbook.com"}, {"name": "GV Sprint methodology", "url": "https://www.gv.com/sprint/"}, {"name": "Figma wireframing basics", "url": "https://www.figma.com/resources/learn-design/"}]
---

## Intro

This is Capstone Milestone 2 — checkpoint day. By the end of today you will have a locked, one-page spec for your capstone, a set of wireframes that show the core flow, and a public commitment to the cohort. Nothing here is decorative. Whatever you lock tonight is what you build next week.

## Read: The 1-day sprint, what "shipped" means, and the discipline of the spec

Jake Knapp's *Sprint* compresses months of product argument into five days. You do not have five days. You have one. The good news: a compressed sprint still captures 80% of the value if you are ruthless about scope. Here is the 1-day version, sized for your capstone.

**Morning — Understand and Define (90 min).** Revisit your artifacts from the week: the crisp problem statement (Day 11), the design-thinking map (Day 12), the interview insights (Day 13), the causal-loop diagram and pitch (Day 14). On one piece of paper, answer three questions in two sentences each. *Who is the one person this is for?* *What is the one job they are hiring this for?* *What changes in their week if this works?* If you cannot write those three answers in under 15 minutes, your foundations from earlier in the week are too soft — fix those before proceeding.

**Mid-morning — Sketch (45 min).** The Crazy 8s exercise. Fold a page into 8 frames. Set an 8-minute timer. Sketch 8 different versions of the core screen — same feature, 8 UI approaches. Bad sketches are fine; different sketches are essential. At minute 8 stop. Dot-vote three favourites. Pick one.

**Midday — Storyboard (60 min).** On a new page, draw 6 frames: the user's state *before* the capstone exists, the triggering moment, three steps of interaction with your capstone, and the after-state. This is not a UI exercise yet — it is a narrative one. Each frame should be labelled with what the user is feeling and what information they need.

**Afternoon — Wireframe (2 hours).** Move into Figma (figma.com). Create a frame for each screen in your storyboard — usually 3 to 6 screens is plenty. Use grey-box wireframes: no colour, no fonts, no logos. Rectangles for images, lines for text, real labels on every button. The discipline of wireframing is *making decisions*. What is the primary action on each screen? Where does the eye go first? What can be cut?

A wireframe is a thinking tool, not a design artifact. If it takes you more than 30 minutes per screen at this stage, you are decorating, not deciding. Push through.

**Late afternoon — 1-page spec (60 min).** This is the deliverable. One page. No longer. Structure:

1. **Problem statement** (2-3 sentences). From your Day 11 v3.
2. **Target user** (1 sentence). One named archetype: "Aisha, solo accountant, 40 clients."
3. **Jobs to be done** (1-3 bullets in JTBD format).
4. **What it does** (3-5 bullets, plain English, no jargon). The core capabilities, nothing else.
5. **What it will NOT do** (3-5 bullets). The anti-scope list. This is the most important section.
6. **Success metric** (1 line). One measurable thing you can check in 14 days. *"3 beta users complete the full flow and return at least twice in the following week."* Not "validated." Not "engagement." A number.
7. **Biggest risk** (1 sentence). The assumption that, if false, sinks the project.
8. **Week-by-week plan** (3 lines: Week 3, Week 4, Week 5).

That is the spec. If it bleeds onto a second page, cut. The discipline of *fitting on one page* is what makes the spec useful.

**What "shipped" means.** Most capstones never ship because "shipped" was never defined. Shipped does not mean "posted on LinkedIn." Shipped means: *a real user, who is not your cohort-mate, completed the core flow on their own device and gave you one honest reaction.* That is the bar. Write it into your spec.

**Scope discipline: the NOT list.** A scope list without a NOT list is a wish list. For every "will build" item, name something you are explicitly *not* building. Not-building is a commitment, not a concession. If you say yes to everything, you will finish nothing. Common NOT-list items for capstone week: authentication (use a hardcoded user), payments (stub it), mobile (desktop only), multi-language, admin dashboards, onboarding flows, email notifications. Any of these can be added later. None are the capstone's core.

**Good spec vs bad spec.** A *bad* spec reads like a press release: adjectives, vision, "we believe," "seamlessly." A *good* spec reads like a contract: specific users, specific actions, specific metrics, specific exclusions. When in doubt, strip every adjective. If the sentence still makes sense, the adjective was noise. If it collapses, rebuild with a number.

**v0.dev as a sketching partner.** v0.dev lets you type a prompt and get a working UI back. Use it in the *sketching* phase, not the wireframing one — type your core screen's description, look at what v0 generates, notice what is obvious to the model that you missed. Treat it like a whiteboard, not a builder. You will still do the real wireframing in Figma, because the act of placing rectangles by hand is where the decisions happen.

**Public commitment.** End today by posting your spec to the cohort channel as a PDF or image. Not a Notion link that can be edited later. A frozen artifact. Public commitment changes behaviour more than any planning app — the point is that other humans are now watching.

## Watch: A design sprint, compressed

A walkthrough of the GV design sprint methodology, compressed to show how each day's output fuels the next. Notice how the team resists "let's make it look nicer" and keeps pulling back to decisions.

https://www.youtube.com/embed/VIDEO_ID <!-- TODO: replace video -->

- The sprint's power is the timebox, not the post-its.
- Every phase ends with a decision, not a discussion.
- Wireframes that "feel ugly" are usually the ones actually making progress.

## Lab: Wireframe + locked spec (3 hours)

1. **Foundations review (15 min).** Re-read your Day 11 sticky note, Day 12 FigJam POV, Day 13 interview insights, Day 14 pitch. Write the three-question answer (who/job/change) at the top of a fresh page.
2. **Crazy 8s (15 min).** 8 frames, 8 minutes, one screen, 8 variants. Dot-vote top 3.
3. **Storyboard (30 min).** 6 frames on paper: before, trigger, 3 interaction steps, after. Label each with user feeling and information need.
4. **Wireframe in Figma (90 min).** Create 3-6 grey-box screens. One primary action per screen. No colour. Label every button.
5. **Draft the 1-page spec (30 min).** Use the 8-section structure above. Fit on one page.
6. **Run the Claude critique (10 min).** Paste spec using today's Prompt. Apply at least two of its suggested cuts.
7. **Export and lock (10 min).** Export the wireframes as PNG and the spec as PDF. These are frozen for the week.
8. **Publicly commit.** Post both to the cohort channel with the message: "This is what I am shipping. Witness me." Tag 2 cohort members to hold you to it.

## Quiz

Three final checks before the weekend. Can you name three things on your NOT-list and explain *why* each one is excluded? Can you state your 14-day success metric as a number? Can you describe the user flow through your wireframes in under 45 seconds without referencing the Figma file? If any answer wobbles, iterate tonight — not Monday.

## Assignment — Capstone Milestone 2 (WEEKLY deliverable)

Submit to the cohort channel, by tonight: (1) your locked 1-page spec as a PDF, (2) your wireframe screens as a single PNG or Figma share link, (3) a one-paragraph public commitment naming the user you will test with in Week 4 and the date of your first test. Two cohort members must react to your post before midnight — if they do not, you nudge them. Locking in public is the point.

This is Milestone 2. Week 4 begins on Monday and you will build — but only against this spec. Anything not in the spec is out of scope. Anything on the NOT-list stays on the NOT-list unless a user interview forces a change, in writing.

## Discuss: What did you cut, and why did it hurt?

- Which feature was hardest to move from your "will build" list to your "will NOT build" list — and what does that reveal about your attachment?
- Is your success metric genuinely measurable in 14 days, or is it a comfortable proxy?
- Which screen in your wireframes took the longest — and is it the most important one, or the one you were most afraid of?
- What is the single assumption in your spec that, if false, kills the project? How will you test it first?
- Re-read your Day 11 sticky note. What changed in one week — and what does that change say about how you frame problems now?
