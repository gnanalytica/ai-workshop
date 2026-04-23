---
reading_time: 16 min
tldr: "A crisp, Heilmeier-style problem statement is half the work — today you rewrite yours three times until it stops being vague."
tags: ["design", "framing", "problem-statement", "capstone"]
video: https://www.youtube.com/embed/XGNBFRcQMng
lab: {"title": "Rewrite your capstone problem statement 3x", "url": "https://www.darpa.mil/work-with-us/heilmeier-catechism"}
prompt_of_the_day: "You are a skeptical program manager. Interrogate my problem statement using the Heilmeier Catechism. Problem: {{my_capstone_problem}}. For each of the 9 questions, point out what is vague, what is assumed, and what evidence I am missing. Then rewrite the statement in 80 words or fewer."
tools_hands_on: [{"name": "Paper + pen", "url": "https://www.darpa.mil/work-with-us/heilmeier-catechism"}, {"name": "Claude", "url": "https://claude.ai"}]
tools_demo: [{"name": "DARPA Heilmeier Catechism", "url": "https://www.darpa.mil/work-with-us/heilmeier-catechism"}]
tools_reference: [{"name": "Lenny's Newsletter", "url": "https://www.lennysnewsletter.com"}, {"name": "Teresa Torres — Opportunity Solution Tree", "url": "https://www.producttalk.org/opportunity-solution-tree/"}]
resources: [{"name": "The Heilmeier Catechism (DARPA)", "url": "https://www.darpa.mil/work-with-us/heilmeier-catechism"}, {"name": "5 Whys — Lean Enterprise Institute", "url": "https://www.lean.org/lexicon-terms/5-whys/"}, {"name": "How Might We — IDEO", "url": "https://www.designkit.org/methods/how-might-we.html"}]
objective:
  topic: "Sharpening the capstone problem statement — Heilmeier, 5 Whys, How Might We"
  tools: ["Paper + pen", "Claude"]
  end_goal: "Three drafts of your problem statement (v1 long-form, v2 150-word, v3 sticky note) + 5-Whys root cause + HMW reframe — all submitted tonight."
---

## 🎯 Today's objective

**Topic.** A crisp problem statement is half the work. Today you stress-test how you describe your capstone — three rewrites, one root cause, one HMW reframe.

**Tools you'll use.** Paper + pen (for v1 and v3) and Claude (for the attack pass on v1).

**End goal.** By the end of today you will have:
1. v1 Heilmeier long-form (handwritten), v2 in 150 words, v3 on a physical sticky note.
2. A 5-Whys root cause underneath the pain in v2.
3. v3 reframed into a single "How Might We …" question.

> *Why this matters:* A sharp, wrong statement is infinitely better than a soft, possibly-right one. The point of crispness today is not to be right — it is to be wrong fast and visibly, so that an interview on Day 13 can knock it over.

---

### 🌍 Real-life anchor

**The picture.** A mechanic does not start by replacing the engine. They ask: *what noise, when, only uphill, after rain?* until the real fault shows up. Vague "it feels weird" wastes everyone's afternoon.

**Why it matches today.** Heilmeier, 5 Whys, and HMW are that diagnostic discipline for your **problem sentence** — crisp enough to test, not mushy enough to hide in.

## ⏪ Pre-class · ~20 min

**Faculty note.** Budget ~2 minutes for the 🌍 *Real-life anchor* above — read it aloud or ask one volunteer to restate it in their own words — so the analogy lands before setup.

**Revision / context.** Yesterday (Day 10) you locked Capstone Milestone 1 — a team, a problem, a non-goals list, a success metric. The one-pager told the world *what* you're building. Today we stress-test *how you describe it* — because the same problem described vaguely and described sharply are two different projects. Your Milestone 1 one-pager is today's raw material; by tonight, the "Problem" sentence inside it is v3, and the v3 sticky note is a much sharper version than what you submitted last night.

### Setup (required)

- [ ] No setup required — paper, a pen, and Claude open in a browser tab is enough.

### Primer (~5 min)

- **Read**: The [Heilmeier Catechism one-pager](https://www.darpa.mil/work-with-us/heilmeier-catechism) — nine questions, no jargon. Notice how every question forces a number, a name, or a date. That is the bar today.
- **Watch** (optional): The 4-min explainer linked in the Watch section below — preview it tonight if you want a head start.

### Bring to class

- [ ] Your current capstone problem written out in ONE sentence — exactly how you would say it to a stranger in a lift.
- [ ] A list of the three fuzziest words in that sentence (the weasel words you already suspect are hiding scope).
- [ ] An actual sticky note or a 3x3 inch box drawn on paper — you will use it for draft v3.

> 🧠 **Quick glossary**
> - **Problem statement** = a one-sentence description of who hurts, where, and why it matters — written before any solution.
> - **Heilmeier Catechism** = nine blunt questions (what are you trying to do, why is it hard, who cares, what's new) that force clarity on any project.
> - **"How Might We" (HMW)** = a reframing trick that turns a complaint into a solvable, open-ended design question.
> - **5 Whys** = ask "why?" five times in a row to drill from symptom to root cause.
> - **JTBD (Jobs To Be Done)** = the "job" the user hires your product to do — the underlying motivation, not the feature.

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Day 10 capstone pick → why the statement matters more than the tech |
| Mini-lecture | 20 min | Heilmeier, HMW, 5 Whys, JTBD — and the traps in each |
| Live lab     | 20 min | Rewrite one volunteer's capstone statement three times, live |
| Q&A + discussion | 15 min | Stress-test statements, call out fuzziness |

### In-class checkpoints

- **Live poll (LMS)** — Run the **dashboard Live poll** for today so counts match in-class discussion (same wording as the official cohort poll for this day).
- **Cold-open**: in one breath, say your capstone out loud to the person next to you; they raise a hand the moment they hear a weasel word.
- **Think-pair-share**: 90 seconds each — swap v1 statements and circle every abstract noun ("users," "productivity," "experience") on your partner's draft.
- **Live poll**: instructor reads 4 anonymised statements; class votes "mood" or "statement" with thumbs up/down and defends the call.
- **Heilmeier gauntlet**: one volunteer stands; three classmates each fire one Heilmeier question; volunteer must answer in 15 seconds each, no jargon.
- **Sticky-note test**: everyone writes v3 on a physical or virtual 3x3 box; if it overflows, cut one clause before leaving.

### Read: Why a crisp problem statement is half the work

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

### Watch: How to pitch a hard problem in 60 seconds

Watch this short explainer on the Heilmeier Catechism and why research funders still use it today. Notice how every answer is concrete — numbers, names, timeframes — and how the speaker refuses abstractions.

https://www.youtube.com/embed/XGNBFRcQMng

- Heilmeier's nine questions are a bias-check, not a template — the goal is honest answers.
- "Who cares?" is the fastest way to kill a bad project. Answer it first.
- If an answer needs a footnote or a diagram, it is not crisp yet.

### Lab: Rewrite your capstone problem statement three times (45 min)

You will need paper, a pen, and Claude open in a second window.

1. **Brain-dump (5 min).** On paper, write everything you believe about your capstone problem: user, pain, frequency, why-now, what-if-it-worked. Do not edit.
2. **Draft v1 — Heilmeier long form (10 min).** On paper, answer the 9 Heilmeier questions in one paragraph each. No bullets, no jargon.
3. **Attack with Claude (10 min).** Paste v1 into Claude using today's Prompt of the Day. Let it tear the draft apart. Copy the three sharpest critiques into your notebook.
4. **Draft v2 — 150 words (8 min).** Rewrite the statement. Name one specific user (give them an age, a job, a context). Name one specific pain with a frequency (per day, per week). Name one measurable success metric.
5. **5 Whys on the core pain (5 min).** Take the pain from v2 and run 5 Whys. Write the root cause underneath.
6. **Draft v3 — sticky note (5 min).** Rewrite on an actual sticky note (or a 3x3 inch box on paper). If it does not fit, cut until it does.
7. **Reframe as HMW (2 min).** Convert v3 into one "How Might We ..." question.

Photograph all three drafts plus the sticky note. You will compare them on Day 15.

> ⚠️ **If you get stuck**
> - *Claude keeps generating a generic rewrite that sounds like a press release* → paste your v1 and add the constraint "Ban the words leverage, holistic, seamless, AI-powered, users. Refuse to write the statement until I name one specific person."
> - *Your sticky note keeps overflowing* → force the cut by deleting every adjective first, then every compound noun; if it still does not fit, your user is too broad — swap "users" for one named person with a job title.
> - *Your 5 Whys loop back on itself by the third "why?"* → you are asking about the solution, not the pain; restart from the user's most recent concrete bad moment, not from your feature idea.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Which weasel word was hardest to cut from your v1, and why do you think you reached for it? | Names the specific word, admits what it was hiding (scope, uncertainty, ego), and links it to a concrete fear — 2-3 sentences, self-aware, not a generic "I was being lazy." |
| Who is the specific person in your v3 — and when did you last talk to someone like them? | First name, age, role, context in one sentence; then a date (or "never") for the last real conversation. If the answer is "never," that is the honest answer — say it. |
| What is the smallest version of "it worked" you could honestly measure in 30 days? | A number with a timeframe and a unit — "3 beta users complete the core flow twice in week 2," not "engagement improves." If you cannot count it, it is not a metric. |
| If a skeptical investor asked "why you, why now?" about your capstone, what is your real answer — not the polished one? | A personal reason (scar, obsession, unfair advantage) plus an external trigger that explains why this year, not last year. Avoid "AI is hot right now." |
| What would have to be true for this problem to not be worth solving at all? | Names the kill-criterion: a market size, a user behaviour, a regulatory fact, or a cheaper existing workaround that, if true, ends the project. Specific, falsifiable. |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action: finish the three drafts (~50 min)

1. Finish all three drafts (v1 Heilmeier long-form, v2 150-word, v3 sticky note) if you did not complete them in the live lab.
2. Run the 5 Whys on the core pain in v2 and write the root cause under your sticky.
3. Convert v3 into a single "How Might We ..." question.
4. Photograph the sticky note AND the HMW line.
5. One post, three artifacts, no commentary — submit via the cohort channel thread.

### 2. Reflect (~10 min)

*Which weasel word did I fight hardest to keep, and what was it protecting me from?* A good reflection names the word, names the fear (scope, ego, uncertainty), and commits to one concrete thing you will verify on Day 13 instead of assuming.

### 3. Quiz (~17 min)

Includes transfer scenarios + spaced recall from earlier days (~8+ items total). If a question feels easy, treat it as speed practice.

Three quick checks, no Googling. Can you name all nine Heilmeier questions from memory? Can you explain the difference between a symptom and a root cause using an example from your own capstone? Can you spot the solution-smuggling in this statement: "We will build an AI assistant that helps busy professionals be more productive"? If you hesitated on any, re-read the Read section.

### 4. Submit (~5 min)

Submit your v3 sticky-note problem statement plus the HMW reframe to the cohort channel. One sticky-note photo, one line of HMW, no commentary. Also post your root cause from the 5 Whys. Due tonight. Tomorrow we map the full design-thinking cycle on top of this statement — so if yours is still vague, Day 12 will be painful.

**Peer or self-review:** One line (chat or DM): what changed after someone skimmed your artifact — or the biggest gap if you worked solo.

**Stretch (optional):** Pick one rubric row and over-ship it (extra example, tighter screenshot, or second iteration).


### 5. Deepen (optional, ~30 min)

- **Extra video**: A second pass on the Heilmeier explainer — this time pausing after each question and answering aloud for your own capstone.
- **Extra read**: Teresa Torres on the [Opportunity Solution Tree](https://www.producttalk.org/opportunity-solution-tree/) — it pairs beautifully with HMW and previews Day 13.
- **Try**: Run the Heilmeier Catechism on someone else's side project (a friend, a classmate). Teaching the frame is the fastest way to internalise it.

### 6. Prep for Day 12 (~30-40 min — important)

**Tomorrow we map the full design-thinking loop on top of your v3 statement.** Day 12 is the five stages — Empathize, Define, Ideate, Prototype, Test — in a FigJam board, with a Claude critique at the end.

- [ ] **Skim ahead**: the [IDEO Design Kit methods page](https://www.designkit.org/methods.html) — pick three methods whose names you do not recognise. Also glance at [Stanford d.school resources](https://dschool.stanford.edu/resources) for a 5-minute case clip.
- [ ] **Think**: list 3 assumptions you're making about your capstone user that you have NOT yet verified with a real human. These become the Empathize column tomorrow. Also prepare to generate deliberately bad ideas (the $1 version, the no-screen version, the 7-year-old version).
- [ ] **Set up**: create a free [FigJam account](https://www.figma.com/figjam/) tonight — you will wireframe the 5-column DT map live. Have your Day 11 v3 sticky note open alongside; it becomes the anchor of the Define column.

---

## 📚 Extra / additional references

Optional deep-dives. Pick what interests you; skip what doesn't.

### Short watches

- The 4-min Heilmeier Catechism explainer linked in class — rewatch pausing after each question to answer for your own capstone.

### Reading

- [The Heilmeier Catechism (DARPA)](https://www.darpa.mil/work-with-us/heilmeier-catechism) — the nine questions, one page, no fluff.
- [5 Whys — Lean Enterprise Institute](https://www.lean.org/lexicon-terms/5-whys/) — Toyota's root-cause drill.
- [How Might We — IDEO Design Kit](https://www.designkit.org/methods/how-might-we.html) — the reframing trick.
- [Teresa Torres — Opportunity Solution Tree](https://www.producttalk.org/opportunity-solution-tree/) — connects problem framing to discovery.
- [Lenny's Newsletter](https://www.lennysnewsletter.com) — working PMs on how real problem statements get sharpened inside shipping teams.

### Play

- Run the Heilmeier Catechism on a friend's side project. Teaching the frame is the fastest way to internalise it.
- Write a v3 sticky for a problem that is *not* your capstone (a broken commute, a messy inbox). The muscle generalises.

### If you're hungry for a rabbit hole

- Barbara Minto's Pyramid Principle — the structured-writing bible behind SCQA; half of Day 14 is downstream of this.
- DARPA's research portfolio archives — see Heilmeier's catechism in the wild.
