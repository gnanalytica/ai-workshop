---
reading_time: 10 min
tldr: "You cannot read everything — today you build a 5-source signal pipeline that keeps you current in 30 minutes a week."
tags: ["launch", "learning", "habits", "signal"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Build your personal AI signal pipeline", "url": "https://huggingface.co/papers"}
prompt_of_the_day: "Given my role {{role}}, goals {{goals}}, and current knowledge gaps {{gaps}}, recommend 5 AI signal sources (mix newsletter, podcast, YouTube, X list, paper feed) with a weekly time budget under 45 minutes. Explain the unique value of each."
tools_hands_on: [{"name": "HuggingFace Daily Papers", "url": "https://huggingface.co/papers"}, {"name": "The Batch", "url": "https://www.deeplearning.ai/the-batch/"}, {"name": "Artificial Analysis", "url": "https://artificialanalysis.ai"}]
tools_demo: [{"name": "Karpathy's YouTube", "url": "https://www.youtube.com/@AndrejKarpathy"}, {"name": "arxiv cs.LG", "url": "https://arxiv.org/list/cs.LG/recent"}]
tools_reference: [{"name": "Anthropic Skilljar", "url": "https://anthropic.skilljar.com"}, {"name": "DeepLearning.ai Courses", "url": "https://www.deeplearning.ai/courses/"}, {"name": "Stanford AI Index", "url": "https://aiindex.stanford.edu"}, {"name": "State of AI Report", "url": "https://www.stateof.ai"}]
resources: [{"name": "Latent Space", "url": "https://www.latent.space"}, {"name": "Interconnects", "url": "https://www.interconnects.ai"}, {"name": "Papers With Code", "url": "https://paperswithcode.com"}]
---

## Intro

Morning lecture is short because the habit you build this afternoon matters more than any single technique from this cohort. Two days until demo. After demo, the field moves on without you — unless you have a pipeline. Today you build that pipeline.

### Quick glossary

- **arxiv** — the open preprint server where most AI papers land first (cs.LG, cs.AI, cs.CL).
- **Newsletter** — a curated weekly email digest; one good one replaces 50 hours of Twitter.
- **Signal pipeline** — your personal filtered set of sources that keeps you current in under 45 min/week.
- **Paper-skim** — the 3-minute read: abstract, last figure/table, conclusion.
- **Thought leader** — a practitioner whose takes are worth tracking (e.g., Karpathy, Nathan Lambert, swyx).
- **Firehose** — the unfiltered stream (raw arxiv, all of X); useful only when hunting, dangerous as a habit.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Light lecture | 20 min | Channels, the 3-minute paper skim, hype-vs-substance red flags |
| Studio work on capstone | 30 min | Pick your 5 sources + calendar the Friday slot; then back to capstone |
| Share + Q&A | 10 min | 1-liner per team: your 5 picks and the one source you'll never miss |

**Before class** (~10 min): list your role, goals, and current knowledge gaps so you can pick sources that actually fit you.
**After class** (~30 min tonight): subscribe to your 5 picks, post your Signal Pipeline doc in the cohort channel, and continue capstone build — two days from demo.

## Read: The Signal Pipeline (650 words)

The AI field ships faster than you can read. A new frontier model every six weeks, a new agent framework every Tuesday, a thousand arxiv papers a day. If you try to read everything, you read nothing. If you read nothing, you are six months stale in six weeks.

The answer is not "read more." The answer is a signal pipeline: a small set of curated sources that filter for you, read weekly on a calendar slot, with a trusted fallback for depth when you need it. Aim for under 45 minutes a week. Seriously.

### Organize by channel

**Newsletters (pick 1-2, weekly)**
- **The Batch** by Andrew Ng / DeepLearning.ai — balanced, beginner-friendly, Friday.
- **Import AI** by Jack Clark (Anthropic co-founder) — policy-aware, thoughtful.
- **Interconnects** by Nathan Lambert — deep technical takes on RLHF, post-training, open models.
- **Latent Space** by swyx — dev-focused, tools, infrastructure.
- **TLDR AI** — 5-minute daily skim.
- **Ben's Bites**, **The Rundown AI**, **AI News (Smol.ai)** — high-volume aggregators. Pick one if you need volume.

**Podcasts (pick 1, on commute)**
- **Latent Space** — practitioner interviews.
- **Dwarkesh Patel** — long-form with researchers and founders; the best interviewer in the space.
- **No Priors** — VC lens, good for industry motion.
- **The AI Daily Brief** (Nathaniel Whittemore) — 15 min, daily, news focus.
- **Machine Learning Street Talk** — academic depth.
- **Practical AI** — applied, tooling-heavy.

**YouTube (pick 2, on-demand depth)**
- **Andrej Karpathy** — rare but gold. His "from-scratch" series is the best ML education ever recorded.
- **3Blue1Brown** — math intuition, unmatched.
- **Yannic Kilcher** — paper walkthroughs.
- **AI Explained** — benchmark-aware news.
- **Matthew Berman**, **David Shapiro** — practitioner takes.
- **Two Minute Papers** — fast research summaries.
- **Fireship** — when you want a laugh and a 100-second update.

**X / Twitter (build one list, scroll 5 min/day)**
Core list: `@karpathy`, `@DrJimFan`, `@natolambert`, `@simonw`, `@SebastienBubeck`, `@AravSrinivas`, `@swyx`, `@sh_reya`, `@AnthropicAI`, `@OpenAI`, `@GoogleDeepMind`. Put them in a List so the algorithm doesn't eat your signal. Mute everyone else during work hours.

**Arxiv + Papers (1 skim per week)**
- **HuggingFace Daily Papers** (huggingface.co/papers) — community-voted, the best filter.
- **Papers With Code** — papers linked to repos that actually run.
- **arxiv.org cs.LG and cs.AI** — firehose, only when hunting something specific.

**Communities (lurk, post when you've built something)**
- r/LocalLLaMA — best open-weights community on the internet.
- r/MachineLearning — academic lean.
- Latent Space Discord, HuggingFace Discord — builder energy.

**Annual depth reads (3 per year)**
- **State of AI Report** (Nathan Benaich, October) — the one PDF to read cover-to-cover.
- **Stanford AI Index** (April) — data-rich, policy-leaning.
- **McKinsey Global AI Survey** — enterprise adoption signal.

### Skimming a paper in 3 minutes

Abstract (60 sec) → last figure or table (60 sec) → conclusion (60 sec). If interested, then read related work and methods. 90% of papers don't pass the 3-minute filter, and that's fine.

### Spotting hype vs substance

Four red flags: (1) No benchmark numbers, just vibes. (2) Benchmark numbers but no LiveBench or LM Arena. (3) "First to do X" where X is narrow. (4) Funding round announcement masquerading as a technical release. Four green flags: code released, eval transparent, limitations section exists, and the author has shipped before.

## Watch: Karpathy YouTube Tour + 3-Minute Paper Skim (10 min)

<!-- TODO: replace video -->

Instructor walks through Karpathy's channel and demos the 3-minute arxiv skim on a current paper.

## Lab: Build your pipeline (30 min)

1. Pick exactly 5 sources across channels — 1 newsletter, 1 podcast, 1 YouTube channel, 1 X list, 1 paper feed (10 min).
2. Calendar 30 minutes every Friday. Name it "AI signal." Make it recurring (5 min).
3. Create a simple doc: source, channel, frequency, why (10 min).
4. Subscribe / follow / bookmark all 5 right now (5 min).

Afternoon: capstone build.

## Quiz

1. Why is "read everything" a failed strategy?
2. Name one newsletter, one podcast, one YouTube channel worth following.
3. What three parts do you skim first in a paper?
4. Name two hype red flags.
5. Which annual report is the single best yearly deep-read?

## Assignment

**Weekly deliverable**: your AI Signal Pipeline doc. 5 sources + channel + frequency + why you picked each. Post in cohort channel. Continued capstone build — you are two days from demo.

## Discuss: The Source That Changed How You Think

Name one source (person, paper, podcast, newsletter) from this list — or outside it — that has actually changed how you think about AI. One sentence on what shifted. The cohort will leave with a shared curated list.
