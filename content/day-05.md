---
reading_time: 15 min
tags: ["systems", "thinking"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Draw a causal-loop diagram of a campus problem", "url": "https://excalidraw.com/"}
resources: [{"title": "The Systems Thinker", "url": "https://thesystemsthinker.com/"}, {"title": "Thinking in Systems — Donella Meadows (book)", "url": "https://hbr.org/"}, {"title": "Excalidraw", "url": "https://excalidraw.com/"}]
---

## Intro

Most problems you will work on are not isolated events. They are symptoms of a *system* — interconnected parts, loops, and delays. Today you learn to see those systems. This is the single biggest unlock for anyone who wants to stop building things that fix one bug while quietly creating two more.

## Read: maps, loops, leverage points

### From events to systems

Donella Meadows, the grandmother of modern systems thinking, describes three levels of seeing:

1. **Events** — "the mess queue was long today."
2. **Patterns** — "the mess queue is always long on Wednesdays."
3. **Systems** — "Wednesday is surprise-menu day, so more people show up, mess cooks slower because they're unfamiliar, and social-media posts draw even more people — creating a reinforcing loop."

Most arguments happen at level 1. Real solutions require level 3.

### The two loops you need to know

**Reinforcing loop (R):** a change in X causes more of Y, which causes more of X. Self-amplifying. Examples: virality, compound interest, rich-get-richer, hype cycles.

**Balancing loop (B):** a change in X causes more of Y, which causes *less* of X. Self-correcting. Examples: thermostats, hunger → eat → full → stop eating, traffic congestion pushing people to alternate routes.

Almost every interesting system is a few reinforcing loops tangled with a few balancing loops, often with **delays** between cause and effect. Delays are where our intuition fails — we keep pushing on a lever and nothing happens, so we push harder, then everything overshoots.

### Causal loop diagrams (CLDs)

A CLD is the cheapest way to map a system. Notation:

- Draw variables as short noun phrases (e.g., "plate waste", "student frustration", "menu variety").
- Draw arrows between variables.
- Label each arrow **+** (same direction — more X means more Y) or **−** (opposite — more X means less Y).
- If a loop is dominantly reinforcing, mark it **R**. If balancing, **B**.
- Mark delays with two parallel lines: `—‖—`.

### Worked example: the mess queue

Variables:

- Queue length at mess
- Student frustration
- Students arriving early (to beat the queue)
- Students skipping mess (eating outside)
- Mess throughput (plates served per minute)

Relationships:

- `Queue length` → **+** → `Student frustration`
- `Student frustration` → **+** → `Students arriving early`
- `Students arriving early` → **+** → `Queue length` (at peak windows)
- `Student frustration` → **+** → `Students skipping mess`
- `Students skipping mess` → **−** → `Queue length` (delay: students re-evaluate weekly)

You now see two loops:

- **R1 (vicious):** Queue → Frustration → Arrive-early → Queue. Reinforcing. This explains why queues get worse even as the mess tries harder.
- **B1 (corrective, slow):** Queue → Frustration → Skip-mess → Queue-shorter. Balancing, but with a delay of days or weeks.

The naive fix is "add a counter" or "hire more staff". The systems view suggests a different move: break R1 by *staggering* mess slot times by hostel block, which prevents early-arrival from compounding.

### Leverage points (Meadows's list, simplified)

Meadows ranks leverage points — places to intervene — from weakest to strongest:

| Rank | Leverage | Example |
|------|----------|---------|
| Low | Parameters / numbers | Increase mess staff by 2 |
| Medium | Feedback loops | Add a "how was today's food?" daily poll |
| Higher | Information flows | Show live queue time on a hostel screen |
| Higher | Rules | Stagger meal times by hostel block |
| Very high | Goals of the system | Redefine mess success from "low cost per plate" to "low plate-waste + high satisfaction" |
| Highest | Paradigm | "Feeding is a service, not a logistics job" |

Most students instinctively reach for parameters. The bigger wins are in rules, goals, and paradigms.

### A second worked example: placement prep panic

Variables: anxiety, prep hours, mock interviews taken, confidence.

- `Anxiety` → **+** → `Prep hours` (short term)
- `Prep hours` → **+** → `Confidence`
- `Confidence` → **−** → `Anxiety` (delayed)
- `Anxiety` → **−** → `Mock interviews taken` (people avoid scary things)
- `Mock interviews taken` → **+** → `Confidence`

Loops:

- **B1:** Anxiety → Prep → Confidence → less Anxiety. Balancing, slow.
- **R1 (vicious):** Anxiety → Avoid mocks → less Confidence → more Anxiety. Reinforcing.

Insight: *no amount of solo prep hours will fix the panic unless you break the mock-avoidance loop.* That is a structural insight, not a study-harder insight. The leverage point is changing the rule ("mocks are mandatory twice a week in small groups") rather than the parameter ("study more hours").

### Delays — the hidden monster

Whenever a system behaves surprisingly — overshooting, oscillating, failing despite effort — look for a delay. Scholarship disbursement, fee refund systems, campus maintenance tickets all suffer from this. The shorter the delay between action and visible feedback, the faster the system can self-correct. *Shortening a feedback delay is almost always high leverage.*

## Watch: seeing systems, not events

A short primer on causal loops and stock-and-flow thinking. Pay attention to how the speaker *draws* the same problem in three different ways.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Notice how loops are labeled R or B and why that label matters.
- Listen for any mention of "delay" — it's where intuition breaks.
- Watch how a low-leverage intervention is contrasted with a high-leverage one.

## Lab: draw a causal-loop diagram in Excalidraw

You'll map one real campus problem as a causal loop diagram.

1. Pick one problem with clear structure: hostel fee payment queues, library seat scarcity during exams, mess plate-waste, placement-cell email overload, or bring your own.
2. Open Excalidraw. Create a blank canvas.
3. List 5–8 variables as sticky notes. Keep them as short noun phrases. Resist listing actions ("students complain") — write them as *quantities* ("complaints per day").
4. Draw arrows between them. For each arrow, label **+** or **−**.
5. Identify at least **one reinforcing loop** and **one balancing loop**. Label them R1, B1.
6. Mark any arrow where there is a real-world delay with a small `||` on the arrow.
7. Circle one variable that looks like a low-leverage intervention point (e.g., a number you'd tweak).
8. Circle one variable that looks like a high-leverage intervention point (a rule, goal, or paradigm).
9. In a text box next to the diagram, write 3 lines: *what the system does today*, *where the highest leverage is*, *what you would test first*.
10. Export a PNG and upload it for submission.

Template text to include on your canvas:

```
System: _______________________________________
Time horizon I'm looking at: ___________________

Loops found:
  R1 — ___________________________________
  B1 — ___________________________________

Highest-leverage intervention I see: ___________
Why it beats a parameter tweak: ________________
```

## Quiz

Quick check on reinforcing vs balancing loops, the role of delays, and Meadows's ordering of leverage points. Four questions. Aim for 75%+ before Day 6. These loops will appear again when we decompose the capstone.

## Assignment

Submit your Excalidraw PNG + the 3-line text as a **file upload**. The diagram must show: at least 5 variables, at least one reinforcing loop, at least one balancing loop, and one marked high-leverage intervention. If your diagram has no loops, you haven't modeled a system — you've drawn a flowchart. Redo it.

## Discuss: where loops hide

- Give an example of a vicious reinforcing loop in your own life as a student. What would break it?
- Why do institutions usually intervene at the lowest-leverage points?
- When is it dangerous to act on a causal loop diagram you built in 30 minutes?
- What's the longest feedback delay you've personally experienced on campus? What does that delay do to behavior?
- Pick someone else's diagram. What variable is missing that would change the story?
