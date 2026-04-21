---
reading_time: 14 min
tldr: "Your problem lives inside a system of loops — diagram it, find the leverage point, then pitch the whole thing in 60 seconds using SCQA."
tags: ["design", "systems-thinking", "storytelling", "pitch", "capstone"]
video: https://www.youtube.com/embed/_EMnnq3teEs
lab: {"title": "Causal-loop diagram + 60-sec SCQA pitch for your capstone", "url": "https://excalidraw.com"}
prompt_of_the_day: "I am pitching my capstone in 60 seconds using the SCQA structure (Situation, Complication, Question, Answer). Capstone: {{my_capstone}}. Surprising insight from interviews: {{insight}}. Leverage point from my causal-loop diagram: {{leverage_point}}. Draft three versions of the pitch — one analytical, one emotional, one contrarian — each under 150 words. Then tell me which is strongest and why."
tools_hands_on: [{"name": "Excalidraw", "url": "https://excalidraw.com"}]
tools_demo: [{"name": "Napkin AI", "url": "https://www.napkin.ai"}, {"name": "Y Combinator Library", "url": "https://www.ycombinator.com/library"}]
tools_reference: [{"name": "Thinking in Systems — Donella Meadows (book)", "url": "https://donellameadows.org/systems-thinking-resources/"}, {"name": "Randy Olson — ABT narrative", "url": "https://www.randyolsonproductions.com/abt-framework"}]
resources: [{"name": "Donella Meadows — Leverage Points essay", "url": "https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/"}, {"name": "SCQA framework — Barbara Minto (Pyramid Principle)", "url": "https://www.barbaraminto.com"}, {"name": "Pixar's 22 story rules", "url": "https://www.pixar.com"}]
objective:
  topic: "Systems thinking + storytelling — causal-loop diagrams, Meadows' leverage points, and the SCQA pitch"
  tools: ["Excalidraw", "Claude"]
  end_goal: "Ship a causal-loop diagram with a red-circled leverage point, a 60-second SCQA pitch under 150 words, and a 2-minute voice memo of you delivering the pitch out loud."
---

## 🎯 Today's objective

**Topic.** Diagram the system behind your capstone problem, find the leverage point, then compress the whole thing into a 60-second pitch sharp enough for a stranger.

**Tools you'll use.** Excalidraw (the canvas), Claude (the three-variant pitch critic via today's Prompt of the Day).

**End goal.** By the end of today you will have:
1. A causal-loop diagram with at least one closed loop, polarity on every arrow, and a leverage point circled in red.
2. A 60-second SCQA pitch under 150 words, naming one specific user.
3. A 2-minute voice memo of you delivering the pitch out loud — no reading.

> *Why this matters:* Tomorrow locks your 1-page spec. The spec's "why" section only works if the loop, leverage point, and pitch are already sharp today.

---

## ⏪ Pre-class · ~20 min

**Revision / context.** Yesterday (Day 13) you ran a paired Mom-Test drill and booked two real candidate-user interviews before Day 15 — all aimed at past behaviour (the workaround, the emotion spike, what they refuse to pay for), never at future opinions. The JTBD hypotheses you wrote in the format *When [situation], I want to [motivation], so I can [outcome]* are today's diagram nodes. The surprising quote that contradicted your Day 11 belief — the one Claude flagged from the transcript — is today's SCQA **Complication**. If Day 13 interviews produced no contradictions, the pitch will feel flat; re-read the transcript for an emotion spike before drawing a single arrow.

### Setup (required)

- [ ] Open [Excalidraw](https://excalidraw.com) in a browser tab — no account needed.
- [ ] Skim your Day 13 interview transcripts and highlight 3 direct quotes that surprised you.

### Primer (~5 min)

- **Read**: Donella Meadows' [Leverage Points essay](https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/) — focus on the top-to-bottom ranking. You do not need to memorise twelve; internalise the gradient.
- **Watch** (optional): The Meadows clip linked in the Watch section — preview it tonight to calibrate your ear for systems language.

### Bring to class

- [ ] **Pick ONE capstone problem you will map today** — no switching mid-class. If two candidates are still alive, pick the one with the sharpest Day 13 interview insight.
- [ ] 5 variables surrounding that problem jotted on paper (people, incentives, delays, emotions, metrics).
- [ ] The single interview quote from Day 13 that most contradicted your Day 11 belief — it will become your SCQA Complication.

> 🧠 **Quick glossary**
> - **Causal loop** = a diagram of variables connected by arrows showing how changes feed back on themselves (reinforcing or balancing).
> - **Leverage point** = the spot in a system where a small, well-placed push produces outsized change (Donella Meadows' list).
> - **SCQA** = Situation → Complication → Question → Answer — McKinsey's skeleton for any crisp pitch.
> - **Pixar pitch** = "Once upon a time… every day… one day… because of that… until finally…" — story arc in six beats.
> - **Narrative arc** = the shape of tension and release that makes a pitch land instead of flatline.

---

## 🎥 During class · 60 min live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Your capstone doesn't live in a vacuum — it lives in a system |
| Mini-lecture | 20 min | Causal loops, Meadows' leverage points, SCQA and the Pixar pitch |
| Live lab     | 20 min | Draw one causal-loop diagram on a volunteer's capstone, find the leverage point |
| Q&A + discussion | 15 min | Where's the real leverage? Where are you just treating symptoms? |

### In-class moments (minute-by-minute)

- **00:05 — Cold-open**: name one variable that secretly drives your capstone problem but nobody talks about — shout it out, one word.
- **00:15 — Think-pair-share**: 90 seconds — draw your partner's simplest loop (3 nodes, 3 arrows) from their verbal description; compare to their mental model.
- **00:30 — Polarity poll**: instructor names pairs of variables ("anxiety" and "inbox-checking"); class signals + or − with hands; defend any disagreement in one sentence.
- **00:45 — Leverage debate**: two volunteers argue for different leverage points on the same loop (parameter vs. paradigm); class votes which would move the system more in 30 days.
- **00:55 — Pitch-relay**: pair up, deliver your SCQA pitch in 60 seconds; partner has to repeat the Complication back from memory — if they cannot, the Complication is not sharp enough.

### Read: Loops, leverage points, and stories that stick

**Why systems thinking, now?** By Day 13 you have heard users describe their pain. Pain is a *symptom*. Systems thinking asks what *pattern of relationships* produces the pain — and which point in that pattern is worth intervening in. Most capstones fail not because the solution is bad but because it intervenes at a weak leverage point. A stronger diagram saves you weeks.

**Causal-loop diagrams (CLDs).** The basic grammar: nodes (variables that can go up or down), arrows (causal links), and polarity marks. An arrow labelled **+** means "moves in the same direction" (more A → more B). An arrow labelled **−** means "moves in the opposite direction" (more A → less B). Closed loops of arrows are either *reinforcing* (R — the loop amplifies change, a vicious or virtuous circle) or *balancing* (B — the loop stabilises around a goal).

Example. A productivity-app capstone. Nodes: Number of unread emails, Anxiety, Times-per-day checking inbox, Real work hours, Output quality. Arrows: unread emails → + anxiety → + checking inbox → − unread emails (momentarily) → but checking inbox → − real work hours → − output quality → + anxiety. You now have an R-loop (anxiety feeding checking feeding anxiety) and a hidden cost (output quality collapsing). The symptom is "too many emails." The system is "an anxiety feedback loop that steals deep-work hours."

Draw the loop and a new question appears: where do you intervene? Reducing email volume (the obvious fix) barely touches the loop because the driver is anxiety, not volume.

**Meadows' leverage points.** Donella Meadows' famous essay lists twelve places to intervene in a system, ordered weakest to strongest. The weak ones are parameters (tweak a number — e.g., inbox limit). Middle ones are structures (buffer sizes, delays, information flows — e.g., surface only the three emails that matter today). The strong ones are goals, mindsets, and paradigms (redefine what "managing email" even means — e.g., treat the inbox as a search tool, not a to-do list).

You do not need to memorise all twelve. Remember the punchline: **parameters are the easiest lever and the weakest; paradigms are the hardest lever and the strongest.** Most capstones default to parameter fixes because they feel concrete. Look one level higher.

For your capstone, after drawing the loop, ask: *at which node would a small change cause a disproportionate shift in the whole loop's behaviour?* That is your leverage point. Circle it in red.

### Read: From systems to story

Once you know the loop and the leverage point, you can tell the problem's story with unusual clarity. Humans remember stories, not bullet points. Two frameworks you will use for the rest of the workshop:

**SCQA (Situation, Complication, Question, Answer).** From Barbara Minto's *Pyramid Principle*. Start with a stable Situation the audience agrees with. Introduce the Complication that disrupts it. Surface the Question it raises. Deliver the Answer. Example, 60 seconds: *"Solo accountants spend 40% of their week inside email. (Situation.) But most of those checks are anxiety-driven, not information-driven — they check 47 times a day and find something actionable 3 times. (Complication.) So how do you quiet the inbox without missing the 3 that matter? (Question.) We triage incoming email by urgency using a model trained on the user's own past responses, surfacing only what needs action today. (Answer.)"* Notice how the Complication is a surprising fact — usually the insight from your interviews.

**The ABT (And, But, Therefore).** Randy Olson's compression of story structure into three words. *"Freelancers need to bill clients **and** track hours. **But** existing tools are built for teams, so solo users juggle three apps. **Therefore** we built a single-screen workflow that collapses invoicing, tracking, and follow-up into one surface."* If your pitch cannot fit the AND-BUT-THEREFORE test, the story is still muddled.

**The Pixar pitch formula.** *Once upon a time, [X]. Every day, [Y]. One day, [Z]. Because of that, [A]. Because of that, [B]. Until finally, [C].* Works for products too. Forces a real protagonist and a turning point. Use this when SCQA feels too corporate.

**Delivering the 60-second pitch.** Three rules. First, **earn the complication** — the insight should surprise a smart listener, not bore them. Second, **name one person** — not "users," but "Aisha, a solo accountant in Nairobi serving 40 small businesses." Specificity travels further than abstraction. Third, **close with a concrete ask or next step** — a beta user, a referral, an intro, a piece of feedback. A pitch that ends without an ask is a lecture.

**Great pitch examples.** YC Demo Day pitches (ycombinator.com/library) are master classes in compression. Watch how the best ones establish the Situation in under 10 seconds, hit the Complication with a number that makes the audience gasp, and deliver the Answer with a metric. Also study Napkin AI (napkin.ai) for how it auto-diagrams narrative text — a useful sanity check that your pitch has a real structure.

### Watch: Donella Meadows on leverage points

A short video on systems thinking and why small interventions at the right point cause cascading change, while large interventions at the wrong point accomplish nothing.

https://www.youtube.com/embed/_EMnnq3teEs

- The strongest leverage is almost never where it first appears to be.
- Most interventions target parameters; most impact comes from mindsets.
- Loops have delays — interventions often look like they failed before they work.

### Lab: Causal-loop diagram + SCQA pitch (60 min)

1. **Open Excalidraw (excalidraw.com)** and create a new canvas titled "[Your capstone] — CLD v1."
2. **List 6-10 variables (5 min).** From your Day 13 interview insights, write down the nouns that change over time — anxiety, emails, hours, output, trust, churn, revenue, etc.
3. **Draw the arrows (10 min).** Connect nodes with arrows. Label each arrow **+** (same direction) or **−** (opposite). Do not worry about beauty.
4. **Close at least one loop (5 min).** Your diagram must contain at least one closed loop. Label it **R** (reinforcing) or **B** (balancing).
5. **Find the leverage point (5 min).** Mark the node where a small shift would cascade hardest. Circle it in red. Write one sentence on *why* that node.
6. **Write the SCQA pitch (15 min).** Using the leverage point, draft a 60-second pitch in SCQA form. Keep under 150 words. Name one specific user.
7. **Run Claude (10 min).** Paste your pitch using today's Prompt of the Day. Pick the strongest of the three versions it generates — or merge.
8. **Pair and deliver (10 min).** Pair with a classmate. Deliver your pitch verbally in 60 seconds. Let them time you. Swap. Give one note: where did the Complication land or fail?

> ⚠️ **If you get stuck**
> - *Your diagram has no closed loops — only one-way arrows from cause to symptom* → you have drawn a tree, not a system; ask "what does the symptom cause?" and follow that arrow back to an earlier node to close the loop.
> - *You cannot pick between two leverage points* → apply Meadows' ladder: parameters are weakest, paradigms strongest. If both candidates are parameters, neither will cascade — look one level up for a structure or a goal.
> - *Your SCQA Complication is not actually surprising (it just restates the Situation)* → pull the Complication directly from a Day 13 interview quote that contradicted your own prior belief; if nothing did, your interviews were polite — not your pitch's fault.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Which loop in your diagram was the biggest surprise? Did you know it was there before you drew it? | Names the specific loop (3+ nodes), describes what it reinforces or balances, and admits whether drawing it changed your view of the problem or just confirmed it. |
| Is your leverage point a parameter, a structure, or a paradigm? Which level were you tempted to default to, and why? | Classifies the point using Meadows' ladder, admits the default (usually parameter) and the pull toward it (easier to build, easier to explain), and why the chosen level actually moves the loop. |
| Whose interest in your system is *not* aligned with solving the problem? (Every system has one.) | Names a specific actor — a platform, a gatekeeper, an incumbent, a user subgroup — and explains the incentive that keeps the problem alive. Avoids vague villains. |
| Which version of your pitch — analytical, emotional, contrarian — felt most like you? Which would travel furthest through a stranger? | Distinguishes authenticity from reach; acknowledges they may differ. The strong answer picks the travelling version even if it's uncomfortable. |
| What fact in your pitch would make a sceptic stop scrolling? | A concrete number, a counterintuitive behaviour, or a quote from a user — sourced, specific, and surprising. "AI is growing fast" does not qualify. |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action: lock CLD + pitch + voice memo (~50 min)

1. Finalise your causal-loop diagram in Excalidraw: at least one closed loop, polarity marks on every arrow, leverage point circled in red.
2. Lock your 60-second SCQA pitch to under 150 words, naming one specific user.
3. Record a 2-minute voice memo of you delivering the pitch out loud — no reading.
4. Tag one cohort member to give you a single-note reaction before Day 15.

### 2. Reflect (~10 min)

*Is my leverage point a parameter, a structure, or a paradigm — and which level was I tempted to default to?* A strong reflection names the Meadows level, admits the pull toward the easier fix, and explains why the chosen point actually moves the loop rather than treating a symptom.

### 3. Quiz (~15 min)

Three sanity checks on the dashboard. Can you name the polarity rule for a reinforcing loop versus a balancing loop? Can you identify your capstone's leverage point in one sentence without jargon? Can you deliver your SCQA pitch without reading, in under 70 seconds, to a stranger who does not know what a "capstone" is? If not, iterate once more tonight.

### 4. Submit (~5 min)

Post three artifacts to the cohort channel: (1) a screenshot of your Excalidraw causal-loop diagram with the leverage point circled, (2) your 60-second SCQA pitch as plain text (under 150 words), (3) a 2-minute voice memo of you delivering the pitch out loud. Yes, out loud — we can hear the difference between a pitch that has been spoken and one that has only been typed.

### 5. Deepen (optional, ~30 min)

- **Extra video**: A YC Demo Day pitch from the [YC Library](https://www.ycombinator.com/library) — notice the 10-second Situation and the number that lands the Complication.
- **Extra read**: [Randy Olson on the ABT narrative](https://www.randyolsonproductions.com/abt-framework) — the 3-word compression of story structure.
- **Try**: Paste your CLD into [Napkin AI](https://www.napkin.ai) and see whether the auto-diagram matches the story you think you are telling.

### 6. Prep for Day 15 (~30-40 min — important, CAPSTONE MILESTONE 2)

**Tomorrow is Capstone Milestone 2 — the 1-day design sprint + locked 1-page spec.** You compress Jake Knapp's 5-day sprint into one: 3-question foundation → Crazy 8s → storyboard → Figma wireframes → 1-page spec → public commitment to the cohort. Whatever you lock tomorrow is what you build next week. Today's CLD, leverage point, and pitch become the "why" of that spec.

- [ ] **Skim ahead**: the "Sprint in a Day" short from the [GV Sprint methodology site](https://www.gv.com/sprint/) — skim the timebox logic. Bookmark [Figma wireframing basics](https://www.figma.com/resources/learn-design/).
- [ ] **Think**: draft a **"will NOT build" list** of at least 5 items tonight — the anti-scope list is the most important part of tomorrow's spec. Candidates: authentication (hardcoded user), payments (stub), mobile (desktop only), multi-language, admin dashboards, onboarding.
- [ ] **Set up**: confirm your [Figma](https://www.figma.com) account works; optional [v0.dev](https://v0.dev) account for Crazy 8s sketching. Gather all Day 11–14 artifacts into one doc: v3 sticky, POV statement, interview insights, CLD, SCQA pitch. Print (or grab) a 1-page template so your spec cannot bleed onto page 2 without you noticing.

---

## 📚 Extra / additional references

Optional deep-dives. Pick what interests you; skip what doesn't.

### Short watches

- [Donella Meadows on leverage points](https://www.youtube.com/embed/_EMnnq3teEs) — the class clip, rewatch at 1.5x.
- A YC Demo Day pitch from the [YC Library](https://www.ycombinator.com/library) — compression at 60-second scale.

### Reading

- [Donella Meadows — Leverage Points essay](https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/) — the ranking you applied to your CLD.
- [SCQA — Barbara Minto (Pyramid Principle)](https://www.barbaraminto.com) — the skeleton for the 60-second pitch.
- [Randy Olson — ABT narrative](https://www.randyolsonproductions.com/abt-framework) — And, But, Therefore.
- [Donella Meadows Institute — systems thinking resources](https://donellameadows.org/systems-thinking-resources/) — archives and exercises.

### Play

- [Excalidraw](https://excalidraw.com) — the canvas for today's diagram.
- [Napkin AI](https://www.napkin.ai) — narrative-to-diagram sanity check.

### If you're hungry for a rabbit hole

- Thinking in Systems — Donella Meadows (book).
