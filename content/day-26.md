---
reading_time: 14 min
tags: ["product", "discussion"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Teardown: score 3 AI products", "url": "https://www.svpg.com/"}
resources: [{"title": "Marty Cagan / SVPG", "url": "https://www.svpg.com/"}, {"title": "YC library", "url": "https://www.ycombinator.com/library/"}, {"title": "JTBD primer", "url": "https://jtbd.info/"}, {"title": "a16z: Emerging architectures for LLM apps", "url": "https://a16z.com/emerging-architectures-for-llm-applications/"}]
---

## Intro

Most AI products in 2026 are demos pretending to be products. The ones that survive have done ordinary product work — figured out the job, designed for failure, priced the unit economics. Today we drop the model-first mindset and pick up a product one.

## Read: Three lenses, applied ruthlessly

You can evaluate any AI product on three lenses. Every capstone team should be able to score their own work on all three by end of week.

### Lens 1: Jobs to be done (JTBD) fit

A job is **"what the user is trying to accomplish in a specific context"** — not a persona, not a feature. Clayton Christensen's milkshake example still works: people "hire" a morning milkshake to kill boredom and fullness on a commute, not because they want dessert.

For AI, the question becomes: **is the model doing the job, or is it doing a party trick adjacent to the job?**

- "Summarize this PDF" — usually a party trick. The job is "decide whether to read this."
- "Write me a cover letter" — party trick. The job is "get an interview."
- "Draft an apology email to a client I ghosted" — this is the job. Hire it.

Sharpening from feature to job changes what you build. The AI cover-letter tool that actually fits the job might be: "paste the job posting; we'll list the 3 claims in your resume that probably won't survive the first screen, and suggest edits." Same model, radically different product.

### Lens 2: Failure-mode design

AI products fail differently than deterministic software. The cost of a failure has three dimensions:

| Dimension | Question |
|---|---|
| **Reversibility** | Can the user undo it? |
| **Blast radius** | Who else is affected? |
| **Detectability** | Will the user notice the failure? |

Low reversibility + high blast radius + low detectability = catastrophic (think: an agent that auto-sends emails to the wrong list). High reversibility + low blast radius + high detectability = a draft in a text box.

**Rule**: the worse the failure profile, the more agency you must remove from the AI or gate behind explicit confirmation. Don't let engineers "just ship the auto mode" because the demo is smoother.

### Lens 3: Cost sanity

Every AI feature has a per-invocation cost — tokens, API calls, vector DB queries, GPU seconds. If you don't know yours within 2×, your pricing is guesswork and your runway is a guess.

A simple cost model:

```
cost_per_action ≈ (avg_input_tokens + avg_output_tokens) × price_per_token
                  + tool_call_costs
                  + eval_overhead (about 10-20% in prod)
```

Rules of thumb that held in early 2026:

- Consumer free tier survives only if cost per action < $0.005.
- Paid consumer ($10-20/mo): cost per action should stay under ~$0.10.
- B2B SaaS: $0.50-$2 per action is fine if the action replaces 15 minutes of a human.

If your capstone feature costs $0.40 per run and targets consumers, you either need to cut cost (smaller model, cached retrieval, batch) or reposition for B2B.

### Worked example: Cursor vs. a toy code assistant

Why does Cursor eat so many competitors?

- **JTBD fit** — the job is "make a working change to the repo", not "autocomplete the next line". Cursor's agent mode, diff-first UI, and project-wide context all align to the job.
- **Failure-mode design** — diff view before apply, easy reject, easy revert. Failure is cheap.
- **Cost sanity** — aggressive caching, model routing, a subscription that maps to real per-user inference cost.

Your toy code assistant can match Cursor on none of the three, which is why it doesn't retain.

## Watch: Product thinking from the trenches

A conversation with a product lead at a 2025 AI company about what killed their first three features and what made the fourth stick.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch for the moment they reframe feature → job.
- Notice the honest account of cost pressure on pricing decisions.
- Pay attention to how they decide when to cut a feature vs. iterate.

## Lab: Score 3 real AI products

You will pick three AI products you've personally used, and score each one on the three lenses. Present the teardown to your team or a classmate.

1. Pick three products. Mix sizes: one giant (Cursor, ChatGPT, Perplexity), one mid (Granola, Raycast AI, Linear's AI), one niche (anything you found in the last month).
2. For each, write one crisp sentence describing the **job** you hire it for.
3. Score **JTBD fit** on a 1–5. Justify in one paragraph. Quote a moment where it either nailed or missed the job.
4. Score **failure-mode design** on a 1–5. For each product, name the worst failure you've seen or can imagine and what the UI does about it.
5. Estimate **cost per action** and compare to their price. Research hints — do they mention a smaller model, caching, or tiered limits? If there's no way, make a defensible guess.
6. Rank the three on each lens. The rankings will differ; note where.
7. Pick one product that lost on a lens and sketch, in 5 bullets, what you'd change.
8. Write one paragraph comparing what the winners share. Is it model choice, UX craft, or go-to-market?
9. Prepare a 5-minute live teardown. Use 3 slides max or a single whiteboard.
10. Present it to a classmate. Get one pushback. Rewrite your weakest section.

## Quiz

Three questions on distinguishing features from jobs, the three failure-mode dimensions, and rules of thumb for AI unit economics. One scenario question where you have to call a product either consumer-viable or not.

## Assignment

Apply the three lenses to **your own capstone idea** (even if still fuzzy). Write one page: the job in one sentence, the worst plausible failure and your mitigation, and a back-of-envelope cost per action with the math shown. End with the single biggest risk on any lens and how the capstone week will test it.

## Discuss: Why most AI products are bad

- Pick one venture-backed AI product from 2024-25 that died. Score it on the three lenses post-mortem. What killed it?
- Is JTBD still the right framing for agentic products where the job itself is fuzzy?
- How should pricing move as inference cost drops 10× per year? Does the value anchor to the model or to the workflow?
- When is "we'll figure out unit economics later" defensible? When is it negligent?
- If you had to kill one feature in your capstone today to make the other two great, which one?
