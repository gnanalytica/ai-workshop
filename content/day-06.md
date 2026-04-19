---
reading_time: 15 min
tags: ["computational", "thinking"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Decompose a decision with the four CT primitives", "url": "https://excalidraw.com/"}
resources: [{"title": "Computational Thinking — Wikipedia", "url": "https://en.wikipedia.org/wiki/Computational_thinking"}, {"title": "Jeannette Wing's 2006 essay (search it)", "url": "https://hbr.org/"}, {"title": "Excalidraw", "url": "https://excalidraw.com/"}]
---

## Intro

Computational thinking has nothing to do with being a programmer. It is a way of breaking messy reality into pieces a machine — or a junior teammate, or a process — can execute. Today you learn the four primitive moves that underpin every software system, and apply them without writing a single line of code.

## Read: the four primitives

Jeannette Wing, in a 2006 essay that launched the term into mainstream curriculum, argues computational thinking rests on four mental moves:

1. **Decomposition** — break a big messy problem into smaller, well-defined parts.
2. **Pattern recognition** — spot similarities within and across problems.
3. **Abstraction** — hide details that don't matter for your current purpose.
4. **Algorithmic design** — define a step-by-step procedure that produces the desired output.

You use these every day, just unconsciously. Making these moves explicit is what makes you dangerous.

### Primitive 1 — Decomposition

The act of chopping. You take "plan my elective registration" and break it into "list available electives → filter by interest → check schedule conflicts → check professor ratings → rank top 3 → submit form before deadline".

Good decomposition has three properties:

- **Each sub-part can be understood in isolation.** If changing sub-part A forces you to rewrite sub-part B, they weren't really decomposed.
- **The parts together cover the whole.** No hidden steps.
- **Each part has a clear input and output.** "Check schedule conflicts" takes a list of electives and returns a filtered list.

### Primitive 2 — Pattern recognition

Seeing "wait — this is just like that." Planning placement prep feels like planning exam prep, which feels like planning a gym routine. The pattern is *goal-setting + recurring deliberate practice + feedback review*. Recognizing the pattern means you don't reinvent a template every time.

Patterns also apply *within* a problem. If two sub-parts of a decomposition feel the same, maybe they are — and you can reuse one approach.

### Primitive 3 — Abstraction

Deliberate forgetting. When you write "check schedule conflicts", you hide the fact that timetables are in PDFs, slots have sub-codes, and Wednesdays have labs. At *this* level of abstraction, all you care about is: *input → a decision of conflict or no-conflict*. The details matter at a lower level, not this one.

> A mental model is an abstraction. A map is an abstraction. The shortcut "mess is crowded 7:30–8:15pm" is an abstraction of thousands of lived events.

The skill is knowing *which details to drop*. Drop too many and your model lies to you. Drop too few and you drown.

### Primitive 4 — Algorithmic design

Turning a decomposition into a procedure. A recipe. A runbook. Written so that someone else (a teammate, a future-you, a computer) can execute it without guessing.

A good algorithm has:

- **Defined inputs.** "Given a list of 8 electives..."
- **Defined outputs.** "...return the 3 I should register for, ranked."
- **Deterministic steps.** Each step has one obvious meaning.
- **Edge cases named.** "If two electives tie in score, pick the one with the earlier class time."
- **A stopping condition.** You know when you're done.

### Worked example: "which elective should I pick?"

A 3rd-year student has to pick 2 electives out of 8 options. Classic messy real-life decision. Let's run the four primitives.

**Decompose:**

- Gather the 8 elective options (data).
- Score each against criteria.
- Detect schedule conflicts between picks.
- Pick top-ranked non-conflicting pair.

**Pattern-recognize:** this is structurally identical to picking which 2 clubs to join or which 2 courses on Coursera to finish this semester. Same template.

**Abstract:** you are going to ignore details like "what my parents think" or "what a specific senior said". Keep 4 clean criteria:

1. Genuine interest (1–5).
2. Career signal / resume weight (1–5).
3. Professor quality (1–5).
4. Schedule load (inverse — how many hours/week, lower is better, scored 1–5).

**Algorithm:**

```
INPUT: list of 8 electives, each with {name, slot, hours_per_week, prof_rating}
INPUT: my self-scored interest for each elective (1-5)

STEP 1: For each elective, compute
   score = 0.4 * interest
         + 0.25 * career_signal
         + 0.2 * prof_rating
         + 0.15 * (6 - load_score)   # lower load = higher contribution

STEP 2: Sort electives by score, descending.

STEP 3: Starting from top: pick the first elective.
        Walk down the list, pick the highest-scored elective
        whose slot does NOT conflict with already-picked ones.

STEP 4: Stop when 2 are picked.

EDGE CASE: If no non-conflicting second pick exists,
           backtrack — try the 2nd-ranked as first pick instead.

OUTPUT: ranked list of 2 electives, plus a 1-line reason for each.
```

This is code in spirit, not in syntax. It's executable by *you* with a pen and paper. You can also hand it to a friend and they'd make the same decision you would. *That* is the test of a good algorithm.

### Another mini-case: a notes-sharing flow

Problem: "Share unit-3 OS notes with my study group of 5."

Decompose → `scan pages` → `check legibility` → `name file consistently` → `upload to shared drive` → `notify group`.

Pattern: same structure as sharing any set of files. Reusable.

Abstract: we don't care whether it's OS or DBMS notes. We don't care whether Drive or Dropbox. At this level, it's "upload and notify".

Algorithm: a 5-step runbook anyone in the group can follow. Bonus: if the steps are clear, any member can do the next upload without being asked. You just removed the bottleneck that was *you*.

### Why this matters before AI

When you learn to prompt AI models in Week 2, a crisply decomposed problem gives you a crisply scoped prompt. A vague problem gives you vague output. Computational thinking is how you pre-digest the problem so the machine doesn't have to guess.

## Watch: computational thinking without code

A short overview of the four primitives with real-world (non-coding) examples. The visuals are the point.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Listen for how the speaker uses the word "abstraction" — is it "simplifying" or "hiding"? The distinction matters.
- Watch for a pattern-recognition example that is *not* from computing.
- Count how many edge cases the speaker surfaces in their worked algorithm.

## Lab: decompose a real decision you're facing

Pick a real, upcoming decision. Examples: which elective to pick, which internship to apply to, which club to commit to, whether to do a summer project vs a course.

1. Open Excalidraw or a blank doc. Divide the page into four quadrants, one per CT primitive.
2. **Decompose** — write out 4–7 sub-parts of the decision, each with an input and output.
3. **Pattern recognize** — identify at least one *other* decision you've made that had the same structure. Write 2 lines on what the shared pattern is.
4. **Abstract** — list the 3–5 details you are deliberately choosing to ignore and 3–5 you are keeping. Yes, both lists matter.
5. **Algorithm design** — write a pseudocode-style procedure, like the worked example above. Plain English in `STEP 1`, `STEP 2` form is fine. Must include an edge case and a stopping condition.
6. Hand your algorithm to a cohort partner. Ask them to "execute" it verbally on your inputs. If they have to ask you clarifying questions, the algorithm isn't done yet.
7. Tighten the algorithm based on their questions.

Template:

```
DECISION: ____________________________________

DECOMPOSITION (sub-parts with input → output):
  1. _________________________ : ___ → ___
  2. _________________________ : ___ → ___
  3. _________________________ : ___ → ___
  ...

PATTERN: this is structurally like: _____________
Shared template: ________________________________

ABSTRACTION:
  Dropping: ______________________________________
  Keeping:  ______________________________________

ALGORITHM:
  INPUT:  _______________________________________
  STEP 1: _______________________________________
  STEP 2: _______________________________________
  STEP 3: _______________________________________
  EDGE:   _______________________________________
  STOP:   _______________________________________
  OUTPUT: _______________________________________
```

## Quiz

Quick check on the four primitives, what counts as a good decomposition, and the difference between abstraction and oversimplification. Four questions. Aim for 75%+. These primitives are the bridge between Week 1's thinking work and Week 2's building.

## Assignment

Submit your four-quadrant worksheet as a **file upload** (image or PDF). We grade on: whether the decomposition's parts actually compose back to the whole, whether your abstraction explicitly names what is dropped, and whether the algorithm has at least one edge case and a stopping condition. Vague English counts against you.

## Discuss: where CT helps and where it misleads

- What does computational thinking buy you that "just think clearly" doesn't?
- Give an example where abstraction would *harm* a decision because it hides something morally important.
- Which of the four primitives do you use most naturally? Which do you avoid?
- Is algorithmic design a form of intellectual laziness (offloading judgement) or rigor (making judgement explicit)?
- How would you teach a 10-year-old to decompose a problem — without using the word "decompose"?
