---
reading_time: 14 min
tldr: "You don't need to know every AI tool. You need to know which class of tool fits the job in front of you. Today you map it."
tags: ["foundations", "tools"]
video: https://www.youtube.com/embed/T9aRN5JkmL8
lab: {"title": "Tool audit: 5 tasks from your life, matched to tool classes", "url": "https://chat.openai.com/"}
prompt_of_the_day: "I have {{task}} to do. Given these constraints: {{constraints}}. Recommend the 3 best AI tools for this specific job (one chat, one specialist, one free/open-source), with one-line reasoning each."
tools_hands_on: [{"name": "Perplexity", "url": "https://www.perplexity.ai/"}, {"name": "NotebookLM", "url": "https://notebooklm.google.com/"}, {"name": "Sarvam.ai", "url": "https://www.sarvam.ai/"}]
tools_demo: [{"name": "LM Arena", "url": "https://lmarena.ai/"}, {"name": "HuggingFace Model Hub", "url": "https://huggingface.co/models"}, {"name": "Mistral Le Chat", "url": "https://chat.mistral.ai"}]
tools_reference: [{"name": "Qwen", "url": "https://qwenlm.github.io/"}, {"name": "DeepSeek", "url": "https://www.deepseek.com/"}, {"name": "Kimi", "url": "https://kimi.moonshot.cn/"}, {"name": "BharatGPT (CoRover)", "url": "https://corover.ai/bharatgpt/"}, {"name": "Krutrim", "url": "https://www.krutrim.ai/"}, {"name": "Meta AI", "url": "https://meta.ai"}]
resources: [{"title": "HuggingFace Open LLM Leaderboard", "url": "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard"}, {"title": "Meesho x Sarvam case study", "url": "https://www.sarvam.ai/"}]
objective:
  topic: "The AI tool landscape — 7 classes, closed-vs-open, Indian AI stack"
  tools: ["Perplexity", "NotebookLM", "Sarvam.ai", "Mistral Le Chat"]
  end_goal: "Walk away with a 5-task Tool Audit PDF mapping real jobs from your life to tool classes — and a named personal stack (chat / research / Indian / creative / code) you'll actually use."
---

## 🎯 Today's objective

**Topic.** Stop chasing "1,200 AI tools." Learn the 7 classes, the closed-vs-open divide, and the Indian AI stack — then match tool class to job.

**Tools you'll use.** Perplexity (research), NotebookLM (grounded docs), Sarvam (Indian language), Mistral Le Chat (European/open-ish), plus ChatGPT/Claude from Day 1.

**End goal.** By the end of today you will have:
1. A 1-page Tool Audit mapping 5 real tasks from your life → tool class → primary tool + backup.
2. A named personal AI stack across 5 categories (chat, research, Indian AI, creative, code).
3. A working mental model for "is this a conversation or a search?" and "is this my private data?" — the two questions that route 90% of tool decisions.

> *Why this matters:* most people plateau at ChatGPT because nobody told them the other six tool classes exist. After today, you pick the right tool before you start typing.

---

## ⏪ Pre-class · ~20 min

**Revision / context.** Yesterday you opened the box — tokens, weights, attention. You tokenized your name, a Hindi word, an emoji, and watched why "Bengaluru" costs 3 tokens while "hello" costs 1. Crucially: weights are the model's "brain," and different models have different weights. Today that idea gets operational. If weights are the brain, then **open weights** = brain you can download and inspect; **closed weights** = brain behind an API. That distinction routes half your tool decisions.

### Setup (if needed)

- [ ] Open https://lmarena.ai — confirm "Direct Chat" loads. No login needed.
- [ ] Open https://chat.mistral.ai — free, web-only, no card. Sign up with Google for 10 seconds.
- [ ] Optional: open https://www.sarvam.ai — phone OTP signup if you want the playground ready before class.

### Primer (~5 min)

- **Read**: skim the HuggingFace Open LLM Leaderboard — notice how many top names you've never heard of. That's the point of today.
- **Watch** (optional, 3 min): any short Perplexity demo on YouTube — get a feel for what "AI search" looks like vs a regular ChatGPT reply.

### Bring to class

- [ ] A one-sentence product idea you might build for an Indian user (farmer, parent, grandmother, small-shop owner). We'll use it to compare Sarvam vs Qwen live.
- [ ] Your mother tongue ready — you'll be typing in it during the lab.

> 🧠 **Quick glossary for today**
> - **Closed vs open weights** = whether the model file is publicly downloadable (open: Llama, Qwen, Gemma) or locked behind a company (closed: GPT-4o, Claude, Gemini).
> - **Indian AI stack** = Sarvam, BharatGPT, Krutrim — models tuned for Indian languages + culture.
> - **Tool class** = a *category* of AI tool (chat, research, creativity, code, voice, etc.), not a specific product.
> - **Fit** = the match between a tool's strengths and your specific job.

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap Day 2 + hook | 5 min | "Autocomplete" is everywhere — now let's map the tools that wrap it |
| Mini-lecture | 20 min | 7 tool classes, open-vs-closed, Indian AI, "which tool for which job" heuristics |
| Live lab: tool audit | 20 min | Map 3 tasks from your life → 3 tool classes → try one prompt on each |
| Q&A + discussion | 15 min | Where did the "obvious" tool lose? Where did an Indian or open-source option surprise you? |

### In-class checkpoints

- **Cold-open shout-out**: "Name a job you did this week where AI would have helped but you didn't use it." Call on 3 students. Instructor classifies each job into a tool class live.
- **Think-pair-share**: 90 seconds on *"Which AI tool do you use daily? Which have you never opened even once?"* Spot the asymmetry.
- **Live demo**: instructor does the same research prompt on ChatGPT, Perplexity, and Sarvam. Three outputs, three personalities. Class votes which won.
- **Corner debate**: "Closed models are always better than open." Corner 1 agree, 2 disagree, 3 "depends on the job." 45 seconds each. Switch corners mid-debate with a reason.
- **One-line close**: "The tool I'll try tonight is ___ because I keep doing ___."

### Read: The 7 tool classes every AI user should know

You don't need to memorise brands. You need to know which **class** fits which job.

#### 1. Everyday chat

Your daily thinking partner. Good for: summarise, explain, rewrite, brainstorm, classify, rough-draft anything.

Major options:
- **ChatGPT** (OpenAI) — broad, reliable, the default.
- **Claude** (Anthropic) — best for writing, longer context, fewer hallucinations in my experience.
- **Gemini** (Google) — best Google-ecosystem integration, free Gemini 2.5 Flash is very fast.
- **Grok** (xAI) — plugged into X, good for news/current events.
- **Mistral Le Chat** — free European option, fast, underrated.
- **Meta AI** (meta.ai) — free Llama, works in WhatsApp and Instagram.

#### 2. Open-source / local-capable

The models you can download, fine-tune, run on your laptop. Good for: privacy, free scaling, offline, custom training.

Major options:
- **Llama** (Meta) — the most-used open family globally.
- **Qwen** (Alibaba) — strong code + multilingual, sizes from 0.5B to 400B+.
- **DeepSeek** — R1 matched OpenAI's o1 reasoning at a fraction of training cost.
- **Gemma** (Google) — open cousin to Gemini, great for on-device.
- **Phi** (Microsoft) — tiny models that punch way above their weight.

#### 3. Indian AI stack

India is building AI, not importing it. Three names to remember:
- **Sarvam AI** — Bengaluru, Indian-language specialists. Powers Meesho's voice assistant for non-English-reading sellers. Real deployment.
- **BharatGPT** (CoRover) — already running inside Indian Railways' AskDISHA, handling millions of queries in 14+ Indian languages.
- **Krutrim** (Ola) — full-stack bet: silicon + model + apps. Bold.

> **Why this matters**: the companies hiring AI talent in India in 2027 won't just be OpenAI or Google. They'll be Sarvam, Krutrim, Fractal, Ola, Flipkart, Meesho, and startups that don't exist yet. Knowing this ecosystem is a hiring edge.

#### 4. Research / knowledge work

Not general chat — tools optimised for citations, sources, deep research.

- **Perplexity** — AI search with sources. Replaces 80% of Google for many users.
- **NotebookLM** (Google) — upload your own docs, ask grounded questions. Audio overviews.
- **Gemini Deep Research** — multi-step research mode inside gemini.google.com.

#### 5. Creative (images, video, voice, music)

- **Images**: Nano Banana (free in Google AI Studio), Firefly (Adobe, free tier), Ideogram, Midjourney.
- **Video**: Kling, Runway, Pika, Veo (Google Labs).
- **Voice**: ElevenLabs (free tier), HeyGen (avatars), Whisper (transcription).
- **Decks**: Gamma, Tome, Canva Magic Design.

#### 6. Code & vibe-coding

Different from chat — these sit *inside* your editor or run your whole app build.

- **Cursor** (IDE), **Claude Code** (CLI), **Google Antigravity** (web), **Windsurf** (IDE) — AI-native coding environments.
- **bolt.new, v0, Lovable** — describe an app, get a working app. No IDE needed.
- **Google Code Assist** — free VS Code / JetBrains plugin, Gemini-powered.

We'll go deep on these in Weeks 4–5. Today you just need to know they exist.

#### 7. Automation

- **n8n, Zapier, Make** — connect AI to APIs + triggers. "When X happens, tell AI to do Y."

### Read: Closed vs open — the cheat sheet

You'll hear these terms constantly. Here's the no-BS version:

**Closed weights** = the company keeps the model file private. You only use it through their website / API. Examples: GPT-4o, Claude, Gemini. Easiest to use; you don't own anything.

**Open weights** = the company publishes the model file for anyone to download, inspect, modify, run locally. Examples: Llama, Qwen, DeepSeek, Gemma, Phi.

| You care about... | Pick |
|---|---|
| "Just works" | Closed (ChatGPT, Claude, Gemini) |
| Privacy / your data never leaves | Open, run locally (we'll do this Day 17) |
| Fine-tuning on your own data | Open |
| No ₹1700/month bill | Open on free cloud tier (Groq, HuggingFace Chat) |
| Hostel Wi-Fi is dead | Open, running locally |
| Indian languages done right | Sarvam, BharatGPT, Krutrim |

### Read: The "which tool for which job" heuristics

Three shortcuts that work 90% of the time:

1. **"Is it a conversation or a search?"** — conversation → chat tool (Claude). Search → research tool (Perplexity, NotebookLM).
2. **"Is the input my own private data?"** — yes → NotebookLM (grounded) or local open-source model. No → any chat tool.
3. **"Am I writing or coding?"** — writing → Claude. Coding → Cursor / Antigravity / Code Assist / Claude Code.

Memorise those three and you'll save yourself 10 hours of tool-switching.

### Watch: HuggingFace Hub tour + Indian AI snapshot

A 10-minute screencast walking through HuggingFace's model hub and the Sarvam playground. Goal: find any open model in under 30 seconds after this.

https://www.youtube.com/embed/T9aRN5JkmL8

Watch for:
- How to read a model card (license, size, language support).
- The "Spaces" tab — try models in-browser, zero install.
- The difference between "Instruct" and "Base" versions of the same model.

### Lab: Tool audit — 3 tasks, 3 tool classes, 3 tries (40 min)

Works best in pairs — one drives, one observes, swap halfway.

> ⚠️ **If you get stuck**
> - *Perplexity rate-limits the free tier* → fall back to NotebookLM (free, unlimited if logged in) or Gemini Deep Research mode.
> - *Sarvam phone OTP doesn't arrive* → pair up with a classmate and use their session, or switch Task 3 to BharatGPT (CoRover) demo — same role, different vendor.
> - *Your mother tongue's script renders as boxes* → paste into Google Docs; it renders Indic scripts reliably even when your browser doesn't.

1. On a fresh Google Doc, write down **3 tasks you actually did this week**: one short (a message you sent), one medium (a summary you wrote), one Indian-language (a WhatsApp to a parent/relative).
2. For each task, name the *tool class* that fits (see the 7 classes above). Write it down.
3. Now pick a specific tool per class and try each task:
   - **Task 1** (everyday chat) → ChatGPT or Claude.
   - **Task 2** (research) → Perplexity or NotebookLM.
   - **Task 3** (Indian language) → Sarvam or BharatGPT.
4. Paste every output into the doc. One cell per tool-task pair.
5. Rate each output 1–5. Write one sentence per cell: *"Good/bad because…"*.
6. Bonus round: pick *one task* and also run it on Mistral Le Chat or Qwen Chat. How does an open-source / European option compare?
7. End with one line: *"The tool class I'd pick first for each task is ___, ___, ___, because ___."*

**Artifact**: 1-page tool-audit Google Doc. Share the link in the cohort channel.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| If open models are almost as good and free — why does OpenAI still make billions? | Names at least two moats that aren't raw model quality: distribution (ChatGPT app), integration (Microsoft, enterprise), reliability/SLA, and the cost of running a 400B model yourself. "Free to download" ≠ "free to serve." |
| Sarvam or Krutrim: which bet is safer, which is bolder? | Treats "safer" and "bolder" as different axes. Safer = narrower focus (Indian languages, existing revenue via Meesho). Bolder = full-stack (silicon + model + apps). Picks and defends. |
| Would you trust a Chinese open model with your startup's customer data? | Separates the *weights* (which you can inspect and run locally) from the *hosted API*. "Yes if I self-host Qwen; no if I hit chat.qwen.ai with user PII." |
| Does India *need* its own LLM, or is fine-tuning existing ones enough? | Distinguishes sovereignty (who controls the off-switch) from capability (does it work in Tamil). Acknowledges fine-tuning solves capability cheaper, but not sovereignty. |
| Which tool class did you under-use this week? | Names the specific class + the specific job where a different tool would have saved time. Usually "research" (people default to ChatGPT when Perplexity would've been faster). |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate: extend the tool audit to 5 tasks + name your stack (~40 min)

1. Open the lab Google Doc.
2. Extend it to **5 real tasks** from your life — add 2 more tasks you'd like AI help with (CV polish, exam revision, pitch-deck drafting, poster design, …).
3. For each, pick a **primary tool** and a **backup tool**. Backup is for when the primary fails or is rate-limited.
4. Add one paragraph at the bottom: *"My personal AI stack for the next 30 days is — {chat tool}, {research tool}, {Indian AI tool}, {creative tool}, {code tool}. I picked them because…"*
5. Export as PDF — you'll submit it in step 4.

### 2. Reflect (~10 min)

**Prompt**: *"If you had ₹10,000 to bet on one Indian AI company for the next 3 years, which one and why?"* A good reflection names a specific company, ties your bet to a concrete moat (language coverage, existing revenue, founder track record), and doesn't just repeat hype. Jot a few lines for your own record.

### 3. Quiz (~15 min)

Four quick ones on tool classes, open vs closed weights, the Indian AI stack, and the "which tool for which job" heuristics. Available on the dashboard. Don't memorise brands — memorise *why* each class exists.

### 4. Submit the assignment (~5 min)

Submit your 5-task Tool Audit PDF via the dashboard before next class.

### 5. Deepen (optional, ~30 min)

- **Extra video**: instructor will drop a DeepSeek R1 or Qwen architecture walkthrough in the channel based on class questions.
- **Extra read**: Sarvam's blog on Indic tokenisation (https://www.sarvam.ai/) — why Devanagari eats more tokens than English and what they did about it. Ties back to yesterday's tokenizer work.
- **Try**: compare *the exact same prompt* on Mistral Le Chat vs ChatGPT vs Claude. Which one has the most distinctive personality?

### 6. Prep for Day 4 (~35 min — important)

**Tomorrow we learn to actually talk to these tools.** Day 4 introduces the **CREATE** framework (Context, Role, Examples, Active constraints, Tone, Evaluation) plus zero-shot / few-shot / chain-of-thought patterns and structured output. You'll iterate one real prompt five times and watch quality climb.

- [ ] **Skim ahead**: the Anthropic Prompt Engineering Overview — https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview. Just skim the left sidebar to see which techniques exist.
- [ ] **Think**: pick one real weak prompt you typed in the past week — the worse the better. We'll rewrite it live. Also pick one real task you've been putting off that AI could help with (resume bullet, DBMS notes, a tough email) — this becomes your V1 in the lab.
- [ ] **Set up**: create an empty Notion page, Google Doc, or markdown file titled **"My Prompt Library"** — we start populating it tomorrow.

---

## 📚 Extra / additional references

Optional deep-dives. Pick what interests you; skip what doesn't.

### Short watches

- DeepSeek R1 architecture explainer — instructor will drop a link in the channel based on class questions.
- Any short Perplexity demo on YouTube to feel AI-search vs chat.

### Reading

- [LM Arena](https://lmarena.ai/) — crowdsourced model-vs-model voting.
- [HuggingFace Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) — the live open-model scoreboard.
- [Meesho x Sarvam case study](https://www.sarvam.ai/) — Indian-scale AI in production.

### Play

- [Sarvam.ai](https://www.sarvam.ai/) — type in your mother tongue, see the difference vs English-first models.
- [BharatGPT (CoRover)](https://corover.ai/bharatgpt/) — powers Indian Railways' AskDISHA.
- [Perplexity](https://www.perplexity.ai/) — AI search with citations.
- [NotebookLM](https://notebooklm.google.com/) — grounded research on your own docs.
- [Mistral Le Chat](https://chat.mistral.ai) — free EU chat option.

### If you're hungry for a rabbit hole

- [Qwen](https://qwenlm.github.io/) — Alibaba's open family.
- [DeepSeek](https://www.deepseek.com/) — R1 reasoning model.
- [Kimi (Moonshot)](https://kimi.moonshot.cn/) — long-context champion.
- [Gemma (Google)](https://ai.google.dev/gemma) — open cousin to Gemini.
- [Phi (Microsoft)](https://huggingface.co/microsoft) — tiny models that punch up.
- [Krutrim](https://www.krutrim.ai/) — Ola's full-stack Indian AI bet.
- [Meta AI](https://meta.ai) — free Llama in WhatsApp / Instagram.
