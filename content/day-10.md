---
reading_time: 14 min
tldr: "Checkpoint day. You brainstorm, shape, pitch, vote, and leave with a locked capstone one-pager."
tags: ["exposure", "tools", "capstone", "checkpoint"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Ideathon: brainstorm → shape → pitch → vote", "url": "https://claude.ai"}
prompt_of_the_day: "Help me pick a capstone. Run me through the Heilmeier Catechism for each of these 3 ideas: {{idea_1}}, {{idea_2}}, {{idea_3}}. For each, answer the 9 Heilmeier questions in 2 lines each. Then apply my 3-filter test: (a) is there one real user I can name? (b) can I build a usable slice in 4 weeks? (c) do I care enough to push through week 3 despair? End with a single recommendation and one risk."
tools_hands_on: [{"name": "Claude", "url": "https://claude.ai"}, {"name": "Perplexity", "url": "https://www.perplexity.ai"}, {"name": "Gamma", "url": "https://gamma.app"}]
tools_demo: [{"name": "ChatGPT", "url": "https://chatgpt.com"}]
tools_reference: [{"name": "Heilmeier Catechism (DARPA)", "url": "https://www.darpa.mil"}, {"name": "YC Library", "url": "https://www.ycombinator.com/library"}, {"name": "Teresa Torres — Opportunity Solution Tree", "url": "https://www.producttalk.org"}]
resources: [{"name": "Heilmeier Catechism", "url": "https://www.darpa.mil"}, {"name": "Paul Graham essays", "url": "https://www.ycombinator.com/library"}]
---

## Intro

Checkpoint day. You have touched a dozen tools in nine days. Today the workshop changes gears: from exposure to commitment. By 9 pm you will have a locked capstone one-pager and a team of two or three. Everything in Weeks 3 and 4 is built on what you decide today.

> 🧠 **Quick glossary**
> - **Capstone** = the one thing you'll build and demo live on Day 30.
> - **Heilmeier Catechism** = DARPA's 9 ruthless questions every project must answer in 2 lines each.
> - **3-filter test** = Real user? Small scope? You care? Three yeses = ship.
> - **Non-goals** = the "won't build" list — the most important section of your one-pager.
> - **Steelman** = the strongest honest version of an argument, made before critiquing it.

### Today's 1-hour live session — ideathon format

| Block | Time | What |
|---|---|---|
| Kickoff + rules | 5 min  | Set expectations, team size (2–3), time limits, non-goals matter |
| Brainstorm (solo, silent) | 10 min | Fill a scoping worksheet — 5 ideas, no filter |
| Shape in pairs | 15 min | Run top 3 ideas through Heilmeier + 3-filter test with a partner |
| Pitches (rotating groups, 2 min each) | 20 min | Everyone pitches — partner asks one Heilmeier question per idea |
| Vote + form teams | 10 min | Commit to a capstone team + problem, start the one-pager |

**Before class** (~10 min): come with 2–3 capstone ideas on paper — hostel life, placement pain, family problems all fair game.
**After class** (~30 min tonight): lock your capstone one-pager and submit via dashboard with the tag `#milestone-1`.

### In-class moments (minute-by-minute)

- **00:05 — Kickoff fist-of-5**: rate your current conviction in your top idea, 1 to 5. We write the number on a sticky and revisit at 00:55 — did shaping move it up, down, or kill it?
- **00:15 — Silent solo brainstorm with 3 sticky notes**: one idea per sticky, no editing, three minutes each. No phones, no Claude yet — this round is pen and paper so the obvious ideas clear out first.
- **00:30 — Shape in pairs using Heilmeier template**: partners take turns. Pitcher has 2 minutes; listener must ask questions 1, 4, and 9 from the Heilmeier list (objective, who cares, metrics) before the timer ends. Swap.
- **00:45 — Pitch round with one-word feedback**: each pitcher gets 2 minutes. Listeners drop a single word in chat: "sharp", "big", "where?", "care?", "been-done". No sentences, no rescues — the word is the signal.
- **00:55 — Team-lock stand-up**: teams form around clusters and read their one-pager's "non-goals" section aloud before "scope". If non-goals are shorter than scope, you have not committed yet — redo it before you submit.

## Before class · ~20 min pre-work

### Setup (if needed)
- [ ] No setup required — your [Claude](https://claude.ai), [Perplexity](https://www.perplexity.ai), and [Gamma](https://gamma.app) accounts from earlier days are all you need.
- [ ] Open your Jarvis Project in Claude; you will paste today's prompt-of-the-day inside it.

### Primer (~5 min)
- **Read**: The one-page [Heilmeier Catechism (DARPA)](https://www.darpa.mil) — nine questions, two lines each. Memorize questions 1, 4, and 9; they are the ones your partner will ask you in class.
- **Watch** (optional): Any 3–5 minute [YC Library](https://www.ycombinator.com/library) clip on "how to pick a startup idea" or Teresa Torres on [opportunity solution trees](https://www.producttalk.org). The framing transfers to capstone scoping directly.

### Bring to class
- [ ] 2–3 candidate capstone problem statements written on paper — hostel life, placement pain, exam prep, family problems all fair game.
- [ ] For each candidate, one real human's name who might use it — even if you have not asked them yet.

## Read: How to pick a capstone worth four weeks

**Why scope discipline is the whole game.** Every cohort, the students who ship are not the smartest or the most technical. They are the ones who picked a small enough problem. A capstone is four weeks of part-time work: realistically 40–60 hours total. That is enough for one real feature for one real user, not a platform, not a marketplace, not "the AI for X" where X is an entire industry. If your idea cannot be described in a single honest sentence with a noun for the user, it is too big.

**The Heilmeier Catechism.** George Heilmeier, former DARPA director, wrote nine questions that every proposed project must answer. We use them verbatim because they are ruthless and short:

1. What are you trying to do? Articulate objectives with no jargon.
2. How is it done today, and what are the limits of current practice?
3. What is new in your approach and why will it succeed?
4. Who cares? If you succeed, what difference will it make?
5. What are the risks?
6. How much will it cost?
7. How long will it take?
8. What are the mid-term and final exams to check for success?
9. What are the metrics that matter?

If you cannot answer any of the nine in two lines, you do not understand your idea yet. Use today's prompt-of-the-day to run all three of your candidate ideas through the catechism with Claude.

**The 3-filter test.** A faster gate we use alongside Heilmeier.

| Filter | Question | Why it matters |
|--------|----------|----------------|
| Real user | Can you name one specific person who will use this in Week 4? | No named user = no feedback loop = no learning |
| Small scope | Can you ship a crappy but usable version in 10 hours? | If not, you will never reach demo day |
| You care | Will you still be excited in Week 3 when it breaks at 2 am? | Capstone survival is emotional, not technical |

Three yeses = ship. Two yeses = shape the idea for another week before committing. One or fewer = drop it, pick a different idea.

**College-relatable examples of well-scoped capstones.**

- "A Telegram bot my hostel mess committee uses to log today's menu and collect one-tap feedback." One user (the mess secretary), small scope (bot + sheet), and you eat there daily.
- "An AI flashcard generator that turns a Bio-Chem textbook chapter into Anki cards for my NEET-repeat cousin." One user (your cousin), small scope (one chapter), and there is a deadline.
- "A Chrome extension that rewrites my placement cover letters in the voice of the company I'm applying to." One user (you), small scope (extension + prompt), and you feel every bad letter.

Poorly-scoped versions of the same ideas: "a full mess management platform", "an AI tutor for all science subjects", "a career-automation suite". Same domains, 10x scope, 0.1x chance of shipping.

**Team formation.** Teams of 2 or 3. Solo is allowed but harder; teams of 4 move slower than teams of 2 for this size of project. Pick complementary skills where you can, but more important: pick someone whose work-rhythm matches yours. A morning person and a 3 am person will miss every standup. Agree on: one primary communication channel, two 30-minute sync times per week, one shared doc for decisions.

**The ideathon format (90 minutes total).**

- **Round 1 — Brainstorm (10 min).** Every student writes 5 capstone ideas alone, no filter, no judgement. Quantity first.
- **Round 2 — Shape (15 min).** Pick your top 3. Run today's prompt-of-the-day in Claude. Rewrite each idea into one honest sentence: "I am building <thing> for <user> so they can <outcome>."
- **Round 3 — Pitch in pairs (20 min).** Pair up with a stranger. Each person pitches all 3 ideas in 2 minutes. Partner asks one Heilmeier question per idea. Switch.
- **Round 4 — Peer voting (10 min).** Everyone writes their single favorite idea (yours or someone else's) on a sticky. Cluster. Top clusters attract teammates.
- **Round 5 — Team lock (35 min).** Teams form around clusters. Each team picks one idea, runs it through the 3-filter test together, writes the one-pager, submits.

**What the one-pager must contain.** Problem (who hurts, one real named user if you have one), scope (one sentence describing the Week-4 demo), non-goals (what you will explicitly NOT build — this is the hardest and most important section), team (names and roles), risks (top 2), and success metric (how you will know at demo day whether it worked).

**Why "what I won't build" matters more than "what I will build".** Scope creep kills every cohort project. The non-goals section is a commitment to your future self: in Week 3 when you are tempted to add auth, mobile, analytics, and payments, the one-pager says no. Locking this today — while you are calm — protects you from yourself later.

## Watch: Steelmanning three cohort ideas

The instructor picks the three most-voted ideas from the morning and steelmans each for four minutes — strongest version of the argument, then the one risk that will kill it. Watch how an idea sharpens when you defend it generously before critiquing it.

https://www.youtube.com/embed/VIDEO_ID <!-- TODO: replace video -->

- Notice how "I would use this" beats "the market is $X billion" every time.
- Listen for the moment an idea gets smaller and better in the same sentence.
- Watch the instructor refuse to rescue a too-big idea — the kindness is the refusal.

## Lab: Run the ideathon

Time: 90 minutes, run live with the cohort. Artifact: a locked `capstone-one-pager.md` for your team.

1. **Brainstorm (10 min).** Solo. Dump 5 ideas. No editing. Use hostel life, placement pain, exam prep, campus events, family problems as prompts.
2. **Shape (15 min).** Pick your top 3. Open https://claude.ai and paste today's prompt-of-the-day. Copy the Heilmeier answers back into your notes.
3. **Research sanity check (5 min, parallel).** For your top idea, one 30-second https://www.perplexity.ai query: "does this already exist?" Celebrate if yes — you now have a differentiator to find.
4. **Pitch in pairs (20 min).** Find a partner. 2 minutes each. Partner must ask one Heilmeier question per idea. Take notes on your partner's reactions.
5. **Peer voting (10 min).** Write your single favorite idea on a sticky. Cluster on the board (or in a cohort Miro).
6. **Team lock (20 min).** Form a team around a cluster. Run the 3-filter test out loud together. If one member fails the "I care" filter, reshape the idea until they pass or they leave the team — both are fine.
7. **Write the one-pager (10 min).** Use the template: Problem, User, Scope, Non-goals, Team, Risks, Metric. Keep it to one page. Draft in Claude if stuck; rewrite in your own words.
8. **Submit.** Post `capstone-one-pager.md` to the cohort channel with the tag `#milestone-1`. This is your commitment.

> ⚠️ **If you get stuck**
> - *Your three candidate ideas all feel too big and Claude keeps encouraging them* → add this line to the Heilmeier prompt: "For each idea, rewrite it 3x smaller — same user, same pain, one-tenth the scope." Pick the smallest version that still feels worth doing.
> - *No team cluster forms around your idea and you feel rejected* → this is data, not judgment. Either join the cluster closest to your idea (your skill + their problem often beats your problem), or commit to solo with a smaller scope and one named user.
> - *You cannot name a real human user for Week 4* → stop the one-pager. Spend 15 minutes messaging three people who might hurt from this problem. If none reply by tonight, pick a different idea — "I will find users later" fails every cohort.

## After class · ~30-45 min post-work

### Do (the assignment)
1. Lock your capstone one-pager and submit. Use the template exactly: Problem, Scope, Non-goals, Team, Risks, Success metric — ≤ 400 words.
2. Make sure the "Non-goals" section is at least as long as "Scope". If not, you have not committed.
3. Name one real human user by name (not "someone in my hostel") with a plan to contact them this week.
4. Submit `capstone-one-pager.md` via the cohort dashboard with the tag `#milestone-1` before midnight. Scope locks tonight.

### Reflect (~5 min)
Prompt: *Which of the 3 filters (real user / small scope / you care) is weakest for your locked idea, and what is your tripwire for killing or reshaping it by Week 3?* A good reflection names the weakest filter honestly, describes the specific signal that would tell you the idea is dying (user unreachable, scope ballooning past 15 hours, motivation gone after a bad day), and pre-commits to an action — reshape, pivot, or kill — with a date.

### Stretch (optional, for the curious)
- **Extra read**: A [Paul Graham essay](https://www.ycombinator.com/library) on "how to get startup ideas" — replace "startup" with "capstone" as you read.
- **Try**: Run your locked idea through the Heilmeier Catechism *again* with a different model (ChatGPT or Gemini) and compare which risks each one surfaces. Different models notice different failure modes.

## Quiz

Four checks before you lock. Which two Heilmeier questions did your team answer worst? Which of the 3 filters is weakest for your chosen idea, and what is your plan for it? Can you name one real human who will use your Week-4 demo? What is the single most important thing on your "won't build" list?

## Assignment — CAPSTONE MILESTONE 1

Your team submits a locked capstone one-pager (Markdown, ≤ 400 words) containing:

1. **Problem** — who hurts, in one sentence. Name a real user if possible.
2. **Scope** — what the Week-4 demo will do, in one sentence.
3. **Non-goals** — 3–5 bullet list of what you will explicitly NOT build.
4. **Team** — names, roles, primary comms channel.
5. **Risks** — top 2, with a one-line mitigation each.
6. **Success metric** — one measurable thing that tells you at demo day whether it worked.

Submit before midnight. This is the biggest deliverable of the workshop so far and the foundation for Weeks 3–4. Once submitted, your scope is locked — changes after today require instructor approval.

## Discuss: The idea you fell in love with and had to kill

| Prompt | What a strong answer sounds like |
|---|---|
| Which idea did you almost pick that failed the 3-filter test? What killed it? | Names the specific filter (real user / small scope / you care) and the exact test moment it broke. Avoids romanticizing — strong answers sound like a post-mortem, not a eulogy. |
| When your partner pushed back on your best idea, did you defend it or did it shrink? Which was the right response? | Distinguishes between defending the problem (good) and defending the solution (often bad). Shows one specific pushback where shrinking made the idea better, with the "before vs after" sentence. |
| Is your team's "won't build" list long enough? What is missing from it? | Lists at least one tempting feature you know you will want to add in Week 3 (auth, mobile, analytics, a second user type). Writing it down is pre-committing against yourself. |
| Who is the one user you will talk to in Week 3? How will you get them on a call? | Names a real human with a real relationship, and a concrete first-contact plan (WhatsApp today, 15-min call Friday). Vague answers ("someone in my hostel") mean you have no user yet. |
| What would make you abandon this capstone in Week 3, and how will you prevent that? | Identifies the specific failure mode (team unavailable, tool stops working, user unreachable, you lose interest) and the tripwire that catches it early. Strong answers include a "switch point" — what you will do by end of Week 3 if the signal is red. |

## References

### Pre-class primers
- [Heilmeier Catechism (DARPA)](https://www.darpa.mil) — nine questions that every project must answer.
- [YC Library](https://www.ycombinator.com/library) — "how to pick an idea" essays that transfer cleanly to capstones.

### Covered during class
- [Claude](https://claude.ai) — where you run today's Heilmeier prompt.
- [Perplexity](https://www.perplexity.ai) — 30-second "does this already exist?" sanity check.
- [Gamma](https://gamma.app) — for the pitch deck you will rebuild once scope locks.

### Deep dives (post-class)
- [Teresa Torres — Opportunity Solution Tree](https://www.producttalk.org) — the clearest framework for turning a problem into a shippable bet.
- [Paul Graham essays](https://www.ycombinator.com/library) — the patron saint of "make something people want" thinking.
