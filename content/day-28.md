---
reading_time: 10 min
tldr: "You cannot read everything — today you build a 5-source signal pipeline that keeps you current in 30 minutes a week."
tags: ["launch", "learning", "habits", "signal"]
video: https://www.youtube.com/embed/T9aRN5JkmL8
lab: {"title": "Build your personal AI signal pipeline", "url": "https://huggingface.co/papers"}
prompt_of_the_day: "Given my role {{role}}, goals {{goals}}, and current knowledge gaps {{gaps}}, recommend 5 AI signal sources (mix newsletter, podcast, YouTube, X list, paper feed) with a weekly time budget under 45 minutes. Explain the unique value of each."
tools_hands_on: [{"name": "HuggingFace Daily Papers", "url": "https://huggingface.co/papers"}, {"name": "The Batch", "url": "https://www.deeplearning.ai/the-batch/"}, {"name": "Artificial Analysis", "url": "https://artificialanalysis.ai"}]
tools_demo: [{"name": "Karpathy's YouTube", "url": "https://www.youtube.com/@AndrejKarpathy"}, {"name": "arxiv cs.LG", "url": "https://arxiv.org/list/cs.LG/recent"}]
tools_reference: [{"name": "Anthropic Skilljar", "url": "https://anthropic.skilljar.com"}, {"name": "DeepLearning.ai Courses", "url": "https://www.deeplearning.ai/courses/"}, {"name": "Stanford AI Index", "url": "https://aiindex.stanford.edu"}, {"name": "State of AI Report", "url": "https://www.stateof.ai"}]
resources: [{"name": "Latent Space", "url": "https://www.latent.space"}, {"name": "Interconnects", "url": "https://www.interconnects.ai"}, {"name": "Papers With Code", "url": "https://paperswithcode.com"}]
objective:
  topic: "Building a personal AI signal pipeline — 5 sources, 30-45 min/week, calendar-locked"
  tools: ["HuggingFace Daily Papers", "The Batch", "Karpathy YouTube", "arxiv cs.LG"]
  end_goal: "Ship an AI Signal Pipeline doc — 5 sources (newsletter + podcast + YouTube + X list + paper feed) with a recurring Friday calendar slot created live."
---

## 🎯 Today's objective

**Topic.** How to stay current after graduation without drowning. Channels, the 3-minute paper skim, hype-vs-substance red flags, and a calendar-locked weekly habit.

**Tools you'll use.** HuggingFace Daily Papers, The Batch, Karpathy's YouTube, arxiv cs.LG — plus whatever RSS/bookmark tool you already use.

**End goal.** By the end of today you will have:
1. A 5-source AI Signal Pipeline doc (newsletter + podcast + YouTube + X list + paper feed) with channel, frequency, and why for each.
2. A recurring 30-min "AI signal" calendar slot — created live, not aspirational.
3. All 5 sources actually subscribed / followed / bookmarked *today*.

> *Why this matters:* Two days until demo. After demo, the field moves on without you — unless you have a pipeline. Today you build that pipeline.

---

## ⏪ Pre-class · ~20 min

**Revision / context.** Day 27 you picked your capstone's primary + fallback model based on benchmarks and a private eval. That discipline — *private eval beats leaderboard headline* — is exactly the lens today's pipeline is filtering for. You're building the feed that stays honest about hype.

### Quick glossary

- **arxiv** — the open preprint server where most AI papers land first (cs.LG, cs.AI, cs.CL).
- **Newsletter** — a curated weekly email digest; one good one replaces 50 hours of Twitter.
- **Signal pipeline** — your personal filtered set of sources that keeps you current in under 45 min/week.
- **Paper-skim** — the 3-minute read: abstract, last figure/table, conclusion.
- **Thought leader** — a practitioner whose takes are worth tracking (e.g., Karpathy, Nathan Lambert, swyx).
- **Firehose** — the unfiltered stream (raw arxiv, all of X); useful only when hunting, dangerous as a habit.

### Setup
- [ ] One-line answer to each of: what's my role, what are my 12-month AI goals, where are my biggest knowledge gaps?
- [ ] Calendar open in a second tab — you'll create a recurring Friday slot live.
- [ ] An RSS reader or bookmark folder ready (Readwise, Feedly, Raindrop, or plain Safari reading list).

### Primer (~5 min)
- **Read**: pick ONE source you'd genuinely subscribe to — a newsletter, a podcast, or a YouTube channel. Just one. Write down why it fits *you* specifically (role, commute length, attention span).
- **Watch** (optional): 5 minutes of [Andrej Karpathy's channel](https://www.youtube.com/@AndrejKarpathy) — skim the intros to pick the one series you'd actually finish.

### Bring to class
- [ ] The ONE source you pre-picked + one sentence on why it fits you.
- [ ] Your worst signal habit today (e.g., "30 min of X at 11pm" or "10 Substack subs, 0 reads").
- [ ] A realistic weekly time budget for AI signal (45 min is the ceiling, not the floor).

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Light lecture | 20 min | Channels, the 3-minute paper skim, hype-vs-substance red flags |
| Studio work on capstone | 30 min | Pick your 5 sources + calendar the Friday slot; then back to capstone |
| Share + Q&A | 10 min | 1-liner per team: your 5 picks and the one source you'll never miss |

### In-class checkpoints

- **Cold open**: one-line write-in — "the last AI thing you read that actually changed how you build." No lurking; everyone posts.
- **Teaching beat**: 10 minutes demoing the 3-minute paper skim live on a paper from HuggingFace Daily Papers that dropped this week.
- **Back to your team's build**: pick your 5 sources (1 newsletter, 1 podcast, 1 YouTube, 1 X list, 1 paper feed). Instructor does rounds, raise hand for unblocking.
- **Back to your team's build**: calendar the recurring Friday slot and subscribe/follow live. Instructor rotates and checks that "calendar event created" is actually true.
- **Back to your team's build**: paste your 5-source doc in the cohort channel. One-liner per team on the one source you'll never miss.

### Read: The Signal Pipeline (650 words)

The AI field ships faster than you can read. A new frontier model every six weeks, a new agent framework every Tuesday, a thousand arxiv papers a day. If you try to read everything, you read nothing. If you read nothing, you are six months stale in six weeks.

The answer is not "read more." The answer is a signal pipeline: a small set of curated sources that filter for you, read weekly on a calendar slot, with a trusted fallback for depth when you need it. Aim for under 45 minutes a week. Seriously.

#### Organize by channel

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

#### Skimming a paper in 3 minutes

Abstract (60 sec) → last figure or table (60 sec) → conclusion (60 sec). If interested, then read related work and methods. 90% of papers don't pass the 3-minute filter, and that's fine.

#### Spotting hype vs substance

Four red flags: (1) No benchmark numbers, just vibes. (2) Benchmark numbers but no LiveBench or LM Arena. (3) "First to do X" where X is narrow. (4) Funding round announcement masquerading as a technical release. Four green flags: code released, eval transparent, limitations section exists, and the author has shipped before.

### Watch: Karpathy YouTube Tour + 3-Minute Paper Skim (10 min)

https://www.youtube.com/embed/T9aRN5JkmL8

Instructor walks through Karpathy's channel and demos the 3-minute arxiv skim on a current paper.

### Lab: Build your pipeline (30 min)

1. Pick exactly 5 sources across channels — 1 newsletter, 1 podcast, 1 YouTube channel, 1 X list, 1 paper feed (10 min).
2. Calendar 30 minutes every Friday. Name it "AI signal." Make it recurring (5 min).
3. Create a simple doc: source, channel, frequency, why (10 min).
4. Subscribe / follow / bookmark all 5 right now (5 min).

> ⚠️ **If you get stuck**
> - *You can't decide between two newsletters* → pick the one with a lower frequency first; you can always add the second in week 3 once you know whether you actually read the first.
> - *X feed is a firehose even with a List* → mute terms aggressively (hype, launch, "breaking"), and switch the List to "Latest" not algorithmic. If it's still noise, swap X for an RSS reader on the same accounts' blogs.
> - *The 30-min Friday slot keeps getting overrun by work meetings* → move it to Monday morning and shrink it to 20 min; a consistent small slot beats an aspirational big one that never happens.

Afternoon: capstone build.

### Live discussion prompts — The Source That Changed How You Think

| Prompt | What a strong answer sounds like |
|---|---|
| Name one source that has actually changed how you think about AI. | Names the specific person, paper, podcast, or newsletter (with a link), not a whole platform. Specific beats famous. |
| One sentence on what shifted. | Describes a before/after belief in concrete terms — "I used to think X, now I design for Y because of what this source showed me." Avoids generic praise like "great takes." |

The cohort will leave with a shared curated list.

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action (~40 min — weekly deliverable)
1. Finalise your **AI Signal Pipeline doc**: 5 sources — 1 newsletter, 1 podcast, 1 YouTube, 1 X list, 1 paper feed — with channel, frequency, and why for each.
2. Subscribe / follow / bookmark all 5 *now*, not tomorrow.
3. Create the recurring Friday 30-min calendar event titled "AI signal" — set it repeating weekly.
4. Post the doc in the cohort channel so peers can steal from your list.
5. Tag the one source you'll never miss.

### 2. Reflect (~5 min)
If you could keep only 1 of your 5 sources for a year, which one and why? Star it in the doc.

### 3. Quiz (~15 min)
1. Why is "read everything" a failed strategy?
2. Name one newsletter, one podcast, one YouTube channel worth following.
3. What three parts do you skim first in a paper?
4. Name two hype red flags.
5. Which annual report is the single best yearly deep-read?

### 4. Submit the assignment (~5 min)

**Weekly deliverable**: your AI Signal Pipeline doc. 5 sources + channel + frequency + why you picked each. Post in cohort channel. Continued capstone build — you are two days from demo.

### 5. Deepen (optional ~30 min)
- **Extra video**: one [Dwarkesh Patel](https://www.youtube.com/@DwarkeshPatel) long-form at 1.5x on your next commute.
- **Extra read**: the most recent [State of AI Report](https://www.stateof.ai) — the single best annual cover-to-cover.
- **Try**: the 3-minute skim on one [HuggingFace Daily Papers](https://huggingface.co/papers) pick tomorrow morning. Time yourself.

### 6. Prep for Day 29 (~30-40 min — important)

**Tomorrow is dress rehearsal — no new features.** Two full dry-runs of your 4-minute demo, peer + instructor feedback, and showcase page polish.

- [ ] **Record** a full 3-minute demo practice on webcam — watch it back at least once. Time it honestly.
- [ ] **Export** a polished deck (5-8 slides max) to PDF as a backup.
- [ ] **Confirm** live capstone URL loads in tab 1; pre-recorded Loom backup loaded in tab 2.
- [ ] **Install** [Loom](https://loom.com) or [Descript](https://descript.com) and test your mic.
- [ ] **Write** hook, story, ask as three separate paragraphs in your submission doc.
- [ ] **Read**: one YC Demo Day retro in the [YC Library](https://www.ycombinator.com/library) — steal one hook formula.
- [ ] **Bring**: your raw self-tape link (not polished), and one demo question you're dreading — we'll workshop the bridge live.

---

## 📚 Extra / additional references

### Pre-class primers
- [HuggingFace Daily Papers](https://huggingface.co/papers)
- [The Batch](https://www.deeplearning.ai/the-batch/) — beginner-friendly weekly.

### Covered during class
- [Latent Space](https://www.latent.space), [Interconnects](https://www.interconnects.ai), Import AI, TLDR AI.
- Podcasts: Latent Space, Dwarkesh Patel, No Priors, The AI Daily Brief, Machine Learning Street Talk.
- YouTube: [Karpathy](https://www.youtube.com/@AndrejKarpathy), 3Blue1Brown, Yannic Kilcher, AI Explained, Two Minute Papers.
- [Artificial Analysis](https://artificialanalysis.ai) — live model landscape.

### Deep dives (post-class)
- [Stanford AI Index](https://aiindex.stanford.edu) (April, data-rich).
- [State of AI Report](https://www.stateof.ai) (October, Nathan Benaich).
- [Anthropic Skilljar](https://anthropic.skilljar.com) and [DeepLearning.ai Courses](https://www.deeplearning.ai/courses/).
- [Papers With Code](https://paperswithcode.com)

### Other videos worth watching
- Karpathy "from-scratch" series — the best ML education ever recorded.
- 3Blue1Brown's neural network series for lifelong math intuition.
