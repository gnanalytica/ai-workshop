---
reading_time: 14 min
tldr: "A crisp, Heilmeier-style problem statement is half the work — today you rewrite yours three times until it stops being vague."
tags: ["design", "framing", "problem-statement", "capstone"]
video: https://www.youtube.com/embed/XGNBFRcQMng
lab: {"title": "Rewrite your capstone problem statement 3x", "url": "https://www.darpa.mil/work-with-us/heilmeier-catechism"}
prompt_of_the_day: "You are a skeptical program manager. Interrogate my problem statement using the Heilmeier Catechism. Problem: {{my_capstone_problem}}. For each of the 9 questions, point out what is vague, what is assumed, and what evidence I am missing. Then rewrite the statement in 80 words or fewer."
tools_hands_on: [{"name": "Paper + pen", "url": "https://www.darpa.mil/work-with-us/heilmeier-catechism"}, {"name": "Claude", "url": "https://claude.ai"}]
tools_demo: [{"name": "DARPA Heilmeier Catechism", "url": "https://www.darpa.mil/work-with-us/heilmeier-catechism"}]
tools_reference: [{"name": "Lenny's Newsletter", "url": "https://www.lennysnewsletter.com"}, {"name": "Teresa Torres — Opportunity Solution Tree", "url": "https://www.producttalk.org/opportunity-solution-tree/"}]
resources: [{"name": "The Heilmeier Catechism (DARPA)", "url": "https://www.darpa.mil/work-with-us/heilmeier-catechism"}, {"name": "5 Whys — Lean Enterprise Institute", "url": "https://www.lean.org/lexicon-terms/5-whys/"}, {"name": "How Might We — IDEO", "url": "https://www.designkit.org/methods/how-might-we.html"}]
---

## Intro

You picked your capstone on Day 10. Today we stress-test how you describe it. Most capstones fail not because the tech is hard, but because the problem statement was fuzzy on day one and the fuzziness compounded for four weeks. A sharp problem statement is leverage: it forces honest scope, kills bad features early, and makes every later decision easier.

## Read: Why a crisp problem statement is half the work

Walk into any product review at a well-run company and you will notice something: the first ten minutes are not about solutions. They are about re-stating the problem. People argue over a single verb. They replace "help users find things" with "reduce time-to-first-relevant-result for new users on mobile." That fight is the work. Everything downstream — architecture, model choice, UX, metrics — is just execution of whatever was agreed upon in those first ten minutes.

A vague problem statement hides three diseases. First, **solution smuggling**: you have already decided to build a chatbot and you are reverse-engineering a problem that needs one. Second, **audience blur**: "users" is not a person; "a freelance designer invoicing 3-5 clients a month" is. Third, **success amnesia**: you cannot tell me, in one sentence, what "it worked" looks like. If any of these is true, you do not have a problem statement. You have a mood.

Three tools fix this. Use them in order.

**The Heilmeier Catechism.** In the 1970s, George Heilmeier, then director of DARPA, used nine questions to decide which research projects got funded. They are brutal and they still work:

1. What are you trying to do? (Articulate with absolutely no jargon.)
2. How is it done today, and what are the limits of current practice?
3. What is new in your approach and why do you think it will be successful?
4. Who cares? If you are successful, what difference will it make?
5. What are the risks?
6. How much will it cost?
7. How long will it take?
8. What are the mid-term and final exams to check for success?
9. Why you? Why now?

Write a paragraph for each. Ban the words "leverage," "holistic," "seamless," "AI-powered," and "users." If you cannot describe your capstone in kindergarten English, you do not yet understand it.

**How Might We (HMW).** Once the problem is clear, reframe it as a generative question. Not "build a tool that transcribes doctor notes" but "how might we cut the after-hours documentation burden for a primary-care physician by 30 minutes per day?" Good HMWs have three properties: they name a specific user, they name a specific friction, and they leave solution space open. If your HMW has the solution baked in, you are not ideating — you are decorating.

**The 5 Whys.** Take the symptom your user reports and ask "why?" five times. Toyota invented this on the factory floor to find root causes of defects. Example: *Students do not finish our course.* Why? Assignments feel overwhelming. Why? They batch them until Sunday night. Why? Daily reminders are buried in email. Why? Email is not where they live — they live in a group chat. Why? Because that is where their cohort is. Root cause: the course lives in the wrong surface. Suddenly "build better assignments" becomes "meet students in the chat app."

**The rewriting process.** Draft v1 in five minutes. Do not edit. Hand it to Claude (see today's prompt) and ask it to attack every weasel word. Draft v2 is tighter and names one user. Sleep on it, or walk for 15 minutes. Draft v3 fits on a sticky note. If it does not fit on a sticky note, the problem is still too big — or you are hiding. Most capstones we see shrink by 60% between v1 and v3. That shrinkage is the product of actual thinking.

One warning. Do not confuse a crisp problem statement with a *correct* one. You will be wrong about the problem. That is fine. The point of crispness is not to be right on day one — it is to be **wrong fast and visibly**, so that a single user interview on Day 13 can knock it over and you can move on. Vague statements never get knocked over; they just quietly rot. A sharp, wrong statement is infinitely better than a soft, possibly-right one.

By the end of today you should be able to say, out loud, in under 30 seconds: *who* has *what pain* in *what context*, *how often*, and what *measurable change* you will cause. If you stumble, you are not ready for Day 12.

## Watch: How to pitch a hard problem in 60 seconds

Watch this short explainer on the Heilmeier Catechism and why research funders still use it today. Notice how every answer is concrete — numbers, names, timeframes — and how the speaker refuses abstractions.

https://www.youtube.com/embed/XGNBFRcQMng

- Heilmeier's nine questions are a bias-check, not a template — the goal is honest answers.
- "Who cares?" is the fastest way to kill a bad project. Answer it first.
- If an answer needs a footnote or a diagram, it is not crisp yet.

## Lab: Rewrite your capstone problem statement three times (45 min)

You will need paper, a pen, and Claude open in a second window.

1. **Brain-dump (5 min).** On paper, write everything you believe about your capstone problem: user, pain, frequency, why-now, what-if-it-worked. Do not edit.
2. **Draft v1 — Heilmeier long form (10 min).** On paper, answer the 9 Heilmeier questions in one paragraph each. No bullets, no jargon.
3. **Attack with Claude (10 min).** Paste v1 into Claude using today's Prompt of the Day. Let it tear the draft apart. Copy the three sharpest critiques into your notebook.
4. **Draft v2 — 150 words (8 min).** Rewrite the statement. Name one specific user (give them an age, a job, a context). Name one specific pain with a frequency (per day, per week). Name one measurable success metric.
5. **5 Whys on the core pain (5 min).** Take the pain from v2 and run 5 Whys. Write the root cause underneath.
6. **Draft v3 — sticky note (5 min).** Rewrite on an actual sticky note (or a 3x3 inch box on paper). If it does not fit, cut until it does.
7. **Reframe as HMW (2 min).** Convert v3 into one "How Might We ..." question.

Photograph all three drafts plus the sticky note. You will compare them on Day 15.

## Quiz

Three quick checks, no Googling. Can you name all nine Heilmeier questions from memory? Can you explain the difference between a symptom and a root cause using an example from your own capstone? Can you spot the solution-smuggling in this statement: "We will build an AI assistant that helps busy professionals be more productive"? If you hesitated on any, re-read the Read section.

## Assignment

Submit your v3 sticky-note problem statement plus the HMW reframe to the cohort channel. One sticky-note photo, one line of HMW, no commentary. Also post your root cause from the 5 Whys. Due tonight. Tomorrow we map the full design-thinking cycle on top of this statement — so if yours is still vague, Day 12 will be painful.

## Discuss: What does your problem refuse to admit?

- Which weasel word was hardest to cut from your v1, and why do you think you reached for it?
- Who is the specific person in your v3 — and when did you last talk to someone like them?
- What is the smallest version of "it worked" you could honestly measure in 30 days?
- If a skeptical investor asked "why you, why now?" about your capstone, what is your real answer — not the polished one?
- What would have to be true for this problem to not be worth solving at all?
