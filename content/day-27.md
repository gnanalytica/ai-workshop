---
reading_time: 10 min
tldr: "Benchmarks are marketing until you know how to read them — today you pick the right model for YOUR use case, not the leaderboard's."
tags: ["launch", "benchmarks", "evaluation", "models"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Pick the best model for your capstone", "url": "https://lmarena.ai"}
prompt_of_the_day: "Given my capstone use case {{use_case}} and constraints {{latency, cost, context_window}}, compare these candidate models {{model_list}} across MMLU, MT-Bench, LM Arena Elo, and one domain benchmark. Recommend primary + fallback with a one-line justification each."
tools_hands_on: [{"name": "LM Arena", "url": "https://lmarena.ai"}, {"name": "Artificial Analysis", "url": "https://artificialanalysis.ai"}, {"name": "LiveBench", "url": "https://livebench.ai"}]
tools_demo: [{"name": "LM Arena side-by-side", "url": "https://lmarena.ai"}, {"name": "HuggingFace Open LLM Leaderboard", "url": "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard"}]
tools_reference: [{"name": "SEAL Leaderboards", "url": "https://scale.com/leaderboard"}, {"name": "ARC Prize", "url": "https://arcprize.org"}, {"name": "Papers With Code", "url": "https://paperswithcode.com"}, {"name": "LiveBench", "url": "https://livebench.ai"}]
resources: [{"name": "Artificial Analysis", "url": "https://artificialanalysis.ai"}, {"name": "HuggingFace Leaderboard", "url": "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard"}]
objective:
  topic: "Benchmark literacy — reading leaderboards without getting fooled, and picking your capstone's model"
  tools: ["LM Arena", "Artificial Analysis", "LiveBench", "HuggingFace Open LLM Leaderboard"]
  end_goal: "Ship a 1-page model card for your capstone: primary + fallback + why + cost per 1k tokens + monthly spend, with the fallback wired into code."
---

## 🎯 Today's objective

**Topic.** Benchmark literacy. Which benchmarks are saturated, which are contamination-resistant, and how to read a model-release post without getting sold. Then: pick *your* capstone's model with receipts.

**Tools you'll use.** LM Arena for blind side-by-side, Artificial Analysis for the quality/price/latency dashboard, LiveBench for contamination-resistant numbers.

**End goal.** By the end of today you will have:
1. A 1-page model card: primary + fallback model, why, cost per 1k tokens, expected monthly spend.
2. Your 5 real prompts run on LM Arena side-by-side with two diffs pasted into the card.
3. The fallback model wired into your capstone code — not just the doc.

> *Why this matters:* Demo day is three days away. If your primary model's API goes down at 9am on Day 30, "graceful fallback" is either a one-line config flip or a very bad morning.

---

## ⏪ Pre-class · ~20 min

**Revision / context.** Day 26 you red-teamed your capstone and filed three concrete fixes before Day 30. One of those fixes probably implicates the model itself — output filter quality, refusal rates, hallucination shape. Today you upgrade the model choice deliberately: not "whatever I started with," but the best tradeoff on *your* axes.

### Quick glossary

- **Benchmark** — a standardized test (dataset + scoring rules) used to compare models.
- **LM Arena** — lmarena.ai; humans vote blind between two model outputs, producing an Elo ranking.
- **MMLU** — Massive Multitask Language Understanding; 57-subject multiple-choice; now mostly saturated.
- **GPQA** — Graduate-level Google-Proof Q&A; hard science, low contamination.
- **Contamination** — the benchmark leaked into training data, so the model "knows the test."
- **Elo score** — chess-style rating used on LM Arena to rank models by head-to-head human preference.

### Setup
- [ ] Capstone constraints written down: max latency (ms), max cost per 1k tokens, required context window.
- [ ] 5 *real* capstone prompts (not toy examples) saved in a scratch file, ready to paste.
- [ ] Accounts/logins to [LM Arena](https://lmarena.ai) and [Artificial Analysis](https://artificialanalysis.ai) confirmed.

### Primer (~5 min)
- **Read**: skim the [LM Arena](https://lmarena.ai) leaderboard top 20 and write down **2 surprises** — a model you didn't expect to be that high, or a tier collapse you didn't know about.
- **Watch** (optional): a 5-min explainer on benchmark contamination from AI Explained or similar.

### Bring to class
- [ ] Your 2 LM Arena surprises, written in one line each.
- [ ] A shortlist hypothesis: which 3 models you *think* fit your capstone before you run the numbers.
- [ ] The cost ceiling your capstone cannot cross (e.g., "$0.50 per session").

---

## 🎥 During class · 60 min live session

### Agenda

| Block | Time | What |
|---|---|---|
| Light lecture | 20 min | Benchmark literacy — what's saturated, what's contamination-resistant, how to read a release |
| Studio work on capstone | 30 min | Pick primary + fallback model on Artificial Analysis, side-by-side on LM Arena; instructor roams |
| Share + Q&A | 10 min | 1-liner per team: which model you picked and why |

### In-class moments (minute-by-minute)

- **00:05 — Cold open**: instructor shows two leaderboard charts side-by-side with the model names blurred; cohort guesses which model is actually better for a coding capstone, then reveal.
- **00:15 — Teaching beat**: 10 minutes on contamination, saturation, and the three-step release skim — with one live example from a recent launch.
- **00:25 — Back to your team's build**: open Artificial Analysis, filter by your latency and cost constraints, shortlist 3 candidates. Instructor does rounds, raise hand for unblocking.
- **00:40 — Back to your team's build**: run your 5 real capstone prompts on LM Arena side-by-side. Instructor rotates to teams flagged "stuck on cost math."
- **00:55 — Back to your team's build**: write your 2-line "primary + fallback + why." Drop it in chat as you finish — instructor reads the best three aloud.

### Read: The Benchmark Literacy Crash Course (600 words)

Every model launch comes with a chart. Every chart makes that model look like the best. Your job is to see through the chart.

#### The benchmarks you'll see cited most

**MMLU** (Massive Multitask Language Understanding) — 57 subjects, multiple choice. The OG. Now saturated; top models cluster at 88-92%. Useful as a floor, not a ceiling.

**GPQA** (Graduate-level Google-Proof Q&A) — Hard science questions designed so Google doesn't help. Less contaminated than MMLU. A better 2025 signal for "does this model actually reason."

**HumanEval** and **SWE-bench** — Code. HumanEval is tiny Python functions (saturated). SWE-bench is real GitHub issues from real repos. SWE-bench Verified is the signal that matters for coding agents.

**MT-Bench** — Multi-turn conversation, judged by GPT-4. Good proxy for chat quality, biased toward models that "sound like" GPT-4.

**MATH** and **AIME** — Math problems from easy to olympiad. AIME 2024/2025 scores are the current frontier signal.

**ARC-AGI** — Visual pattern puzzles trivial for humans, hard for LLMs. The benchmark that actually moves when reasoning improves. The ARC Prize offers real money for beating it.

#### The leaderboards you should actually check

**LM Arena (lmarena.ai)** — Humans vote blind between two model responses. Elo rankings. The closest thing to "which model do real users prefer right now." Also the easiest to game at the margins, so look at top 10, not rank-1-vs-rank-2.

**Artificial Analysis (artificialanalysis.ai)** — A dashboard mapping quality vs price vs latency vs context window. If you only bookmark one leaderboard, bookmark this — it answers the question you actually have: what gives me the best tradeoff today.

**HuggingFace Open LLM Leaderboard** — Focus on open-weight models. Rerun on fresh benchmarks to reduce contamination.

**LiveBench (livebench.ai)** — Contamination-resistant: questions rotated monthly from sources post-training-cutoff. Trust this more than static benchmarks for anything frontier.

**SEAL (Scale AI)** — Private, held-out benchmarks. Less gameable.

#### Why benchmarks lie

Four reasons, in order of commonness:

1. **Contamination** — The benchmark leaked into training data. Any benchmark older than 18 months is suspect.
2. **Overfitting to the benchmark** — Labs train against leaked or near-duplicate data. The model "knows the test."
3. **Narrow task, broad claim** — "Beats GPT-4" on one benchmark, loses on five others. Always ask: on what?
4. **Evaluator bias** — GPT-4-as-judge favors GPT-4-shaped answers. Human preference favors confident and verbose.

#### How to read a release properly

Three-step skim: (1) Which benchmark and what's the delta vs prior SOTA? (2) What's the cost and latency — not just quality? (3) Is there a LiveBench or LM Arena number? If not, be suspicious.

Then always do a private eval on 20 prompts from your actual use case. Benchmarks tell you what works on average. Your private eval tells you what works for you.

### Watch: Reading a Model Release Paper Live (10 min)

<!-- TODO: replace video -->

Instructor walks through the most recent frontier model release — what to believe, what to skip, what to private-eval.

### Lab: Pick your capstone's model (30 min)

1. Open Artificial Analysis. Filter by your latency and cost constraints (5 min).
2. Shortlist 3 candidates. Open LM Arena, run 5 of your actual capstone prompts side-by-side (15 min).
3. Pick one domain-specific benchmark (SWE-bench for coding, MATH for math, MT-Bench for chat) and check your candidates' scores on LiveBench (5 min).
4. Pick primary + fallback. Write a 2-line why (5 min).

> ⚠️ **If you get stuck**
> - *Artificial Analysis filters hide the model you wanted to compare* → clear filters, sort by the quality metric you care about, then re-apply constraints one at a time to see which one excluded it.
> - *LM Arena side-by-side returns near-identical answers on your prompts* → your prompts are too generic; paste a real capstone prompt with actual user data shape and edge cases, not a toy example.
> - *You can't find a LiveBench number for a model you're considering* → that itself is the signal. Note it on your card as "no contamination-resistant benchmark available" and lean harder on your private eval before committing.

Afternoon: implement the swap in your capstone if needed, then keep building.

### Live discussion prompts — The Benchmark That Fooled You

| Prompt | What a strong answer sounds like |
|---|---|
| Post one benchmark headline from the last year that oversold a model. | Names the specific headline and the delta claimed, identifies which of the four lie-categories (contamination, overfit, narrow-claim, evaluator bias) applied, and links to the release or chart. |
| What did the chart hide? | Points at the missing axis — cost, latency, context, or a benchmark the release skipped — and explains why that omission changed the real-world picture. |
| What private eval would have caught it? | Describes a concrete 20-prompt test tied to a real use case, with a pass/fail criterion, not "we'd vibe-check it." |

Two replies minimum.

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action (~40 min)
1. Ship a 1-page **model card** for your capstone: chosen model + version, why (benchmark + private eval), fallback + switching criteria, cost per 1k tokens, expected monthly spend.
2. Run your 5 real prompts against primary *and* fallback on LM Arena side-by-side; paste two diffs into the card.
3. Check [LiveBench](https://livebench.ai) for a contamination-resistant number; note it or note its absence.
4. Wire the fallback into your capstone code — not just the doc.
5. Post the card link in the cohort channel.

### 2. Reflect (~5 min)
If your primary model's API went down at 9am on Day 30, how many minutes until your fallback is serving real users? Write the number honestly.

### 3. Quiz (~15 min)
1. Why is MMLU less useful in 2026 than in 2023?
2. What makes LiveBench contamination-resistant?
3. What does LM Arena actually measure?
4. Name two reasons benchmarks lie.
5. What should you always do after reading a benchmark?

### 4. Submit the assignment (~5 min)

Ship a 1-page model card for your capstone:
- Model chosen + version
- Why (benchmark + private eval results)
- Fallback model and switching criteria
- Cost per 1k tokens and expected monthly spend

Continue capstone build. Demo day is three days away.

### 5. Deepen (optional ~30 min)
- **Extra video**: a frontier model release day recap from AI Explained to practice the 3-step skim.
- **Extra read**: one recent [SEAL leaderboard](https://scale.com/leaderboard) post — private held-out benchmarks think differently.
- **Try**: run the same 5 prompts on an open-weight model via [HuggingFace Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) top pick — see if the gap is worth the savings.

### 6. Prep for Day 28 (~30-40 min — important)

**Tomorrow: the signal pipeline.** The habit you build tomorrow afternoon matters more than any single technique from this cohort — it's what keeps you current after graduation.

- [ ] **Write down** a one-line answer to each of: what's my role, what are my 12-month AI goals, where are my biggest knowledge gaps?
- [ ] **Open** your calendar in a second tab — you'll create a recurring Friday slot live.
- [ ] **Set up** an RSS reader or bookmark folder (Readwise, Feedly, Raindrop, or plain Safari reading list).
- [ ] **Pre-pick ONE source** you'd genuinely subscribe to — newsletter, podcast, or YouTube channel. Write one sentence on why it fits *you*.
- [ ] **Bring**: your worst signal habit today (e.g., "30 min of X at 11pm" or "10 Substack subs, 0 reads") and a realistic weekly time budget (45 min is the ceiling).

---

## 📚 Extra / additional references

### Pre-class primers
- [LM Arena](https://lmarena.ai) — primary primer.
- [Artificial Analysis](https://artificialanalysis.ai) — quality/price/latency dashboard.

### Covered during class
- [LiveBench](https://livebench.ai) — contamination-resistant.
- [HuggingFace Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard)
- MMLU, GPQA, SWE-bench Verified, MT-Bench, AIME, ARC-AGI.

### Deep dives (post-class)
- [SEAL Leaderboards](https://scale.com/leaderboard)
- [ARC Prize](https://arcprize.org)
- [Papers With Code](https://paperswithcode.com)

### Other videos worth watching
- AI Explained — benchmark release day recaps.
- Any recent frontier-model technical report read with the 3-step skim in hand.
