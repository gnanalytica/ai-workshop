---
reading_time: 14 min
tldr: "Open models are closing the gap with GPT-4, and the next decade of AI won't be written only in San Francisco — it'll be written in Hangzhou, Paris, and Bengaluru."
tags: ["foundations", "theory"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Three models, two tasks, one winner", "url": "https://lmarena.ai/"}
prompt_of_the_day: "Translate this English paragraph into {{language}} as spoken by a college student in {{city}}, not textbook formal: {{paragraph}}"
tools_hands_on: [{"name": "Sarvam.ai", "url": "https://www.sarvam.ai/"}, {"name": "BharatGPT (CoRover)", "url": "https://corover.ai/bharatgpt/"}, {"name": "LM Arena", "url": "https://lmarena.ai/"}]
tools_demo: [{"name": "HuggingFace Model Hub", "url": "https://huggingface.co/models"}, {"name": "Ollama (preview — install Day 17)", "url": "https://ollama.com/"}]
tools_reference: [{"name": "Qwen", "url": "https://qwenlm.github.io/"}, {"name": "DeepSeek", "url": "https://www.deepseek.com/"}, {"name": "Kimi (Moonshot)", "url": "https://kimi.moonshot.cn/"}, {"name": "GLM (Zhipu)", "url": "https://chatglm.cn/"}, {"name": "Phi (Microsoft)", "url": "https://huggingface.co/microsoft"}, {"name": "Gemma (Google)", "url": "https://ai.google.dev/gemma"}, {"name": "Krutrim", "url": "https://www.krutrim.ai/"}]
resources: [{"title": "HuggingFace Open LLM Leaderboard", "url": "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard"}, {"title": "Meesho x Sarvam case study", "url": "https://www.sarvam.ai/"}]
---

## Intro

Yesterday you met three American chatbots. Today you meet twenty more — Chinese, Indian, European, tiny, huge. Here's the secret your LinkedIn feed won't tell you: most of the real progress in AI right now is happening *outside* OpenAI. Once you know this landscape, you stop being a ChatGPT user and start being an AI professional.

> 🧠 **Quick glossary for today**
> - **Model** = the AI itself (a huge file of numbers + a little code to run it).
> - **Weights** = the "numbers" part. The brain.
> - **Open weights** = the brain file is public. Anyone can download and run it.
> - **Closed weights** = the brain file is private. You only talk to it via the company's website/API.
> - **Fine-tune** = teach an open model new tricks with your own data. (We'll do this Week 3.)

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Recap Day 1 + hook | 5 min | One-liner: "LLM = well-read autocomplete" |
| Mini-lecture: closed vs open + Indian AI | 20 min | Model families tour |
| Live lab: Task A together | 20 min | Reasoning task across 3 open models |
| Q&A + discussion | 15 min | What surprised you? |

**Before class** (10 min): skim the table below about why open matters.
**After class** (~30 min tonight): finish Task B of the lab (Indian-language apology), submit the 1-page comparison doc.

### In-class moments (minute-by-minute)

- **00:05 — Raise-a-finger cold open**: "How many open-source LLMs can you name in 10 seconds?" Count fingers on camera. Instructor calls on the highest number to list them — then the lowest to react.
- **00:15 — Think-pair-share**: 90 seconds on *"Would you trust a Chinese open model with your startup's customer data? Why or why not?"* Each pair picks one worry and one mitigation to report back.
- **00:30 — Live poll**: drop a poll — *"Sarvam or Krutrim: which bet is bolder?"* Watch the split. Ask one voter from each side to name the thing that would flip them.
- **00:45 — Pick-a-corner**: "India needs its own LLM" — corner 1 agree, corner 2 "fine-tune is enough", corner 3 "doesn't matter, use GPT." 45 seconds each to defend. Anyone can switch corners mid-debate — and has to say why.
- **00:55 — One-line chat close**: *"The model I'm downloading / trying tonight is ___ because ___."*

## Before class · ~20 min pre-work

### Setup (if needed)

- [ ] Create an account on Sarvam.ai playground (https://www.sarvam.ai/) — phone OTP required, do it before class to avoid the in-lab queue.
- [ ] Open LM Arena (https://lmarena.ai/) once and confirm "Direct Chat" loads — no login needed.

### Primer (~5 min)

- **Read**: Skim the HuggingFace Open LLM Leaderboard (https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) — notice how many top-10 names you've never heard of. That's the point.
- **Watch** (optional): Any 3–5 min walkthrough of the HuggingFace Hub — instructor will share a specific link in the channel if one fits; otherwise just click around the Hub yourself for 3 min.

### Bring to class

- [ ] A one-sentence product idea you might build for an Indian user (farmer, parent, grandmother, small-shop owner) — we'll use it to stress-test Sarvam vs Qwen live.
- [ ] Your mother tongue ready — you'll be typing in it during the lab.

## Read: Closed vs open — and why "open" is the word that matters

An AI model is basically a huge file of numbers (the weights) plus a little code to run it. There are two flavours:

**Closed weights.** The company keeps the file secret. You can only talk to it through their website or API. Examples: GPT-4o (OpenAI), Claude (Anthropic), Gemini (Google).

**Open weights.** The company publishes the file for anyone to download. You can run it on your laptop, your company's server, or a rented GPU. You can also modify it. Examples: Llama (Meta), Qwen (Alibaba), DeepSeek, Mistral.

Why does "open" matter for *you*?

| Reason | What it means for a college student |
|---|---|
| Free to run | No ₹1700/month ChatGPT Plus bills |
| Private | Your data doesn't leave your laptop |
| Customisable | You can fine-tune it on your college's notes |
| No rate limits | Run it 24/7 for your side project |
| Works offline | Hostel Wi-Fi is down? Still works |

The catch: open models are usually *slightly* behind the best closed ones on the hardest tasks. In 2023 they were miles behind. In 2026 the gap is often a single point on a benchmark — close enough that for most real work, you can't tell the difference. (We'll do actual benchmarking on Day 27. Today is just the tour.)

### The Chinese family — loud, fast, and free

For two years now, Chinese labs have been the most prolific *open* releasers on the planet. You should know these names:

- **Qwen** (Alibaba) — the most complete family. Sizes from 0.5B to 400B+. Very strong at code, reasoning, and multilingual work. If you pick one Chinese model to explore, pick this.
- **DeepSeek** — famous for "DeepSeek R1" which embarrassed Silicon Valley by matching OpenAI's o1 reasoning model at a fraction of the training cost.
- **Kimi** (Moonshot AI) — the long-context champion. Feeds in whole textbooks.
- **GLM** (Zhipu / Tsinghua) — strong bilingual (Chinese + English) and one of the oldest open families.

### The "small is beautiful" family

- **Phi** (Microsoft) — tiny models (~3B) that punch above their weight. Runs on a laptop.
- **Gemma** (Google) — Google's open cousin to Gemini. Popular for on-device work.
- **Mistral** (France) — the European contender. Efficient, multilingual, strong at reasoning.

### The India family — this is the part no one else teaches you

India is building AI. Not importing it. Three names to memorise:

- **Sarvam AI** — Bengaluru. Founded 2023. Indian-language specialists. Their models handle Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia in ways GPT-4 still fumbles. **Meesho** uses Sarvam to power its voice assistant for sellers who don't read English — real deployment, not a demo.
- **BharatGPT** (by CoRover) — a voice-and-text conversational platform already running inside Indian Railways' "AskDISHA" assistant, handling millions of queries in 14+ Indian languages.
- **Krutrim** (Ola) — funded by Bhavish Aggarwal. Building a full-stack Indian AI — from silicon to model. Aggressive, ambitious, worth watching.

Worked example — why Indian models matter. Ask GPT-4: *"Translate 'The mess food was kadak today yaar' into formal English."* It'll get it, sort of. Now ask it to reply in Tamil like a 20-year-old from Chennai. Watch it flail. Now try Sarvam. You'll see the difference. That gap — the *cultural and linguistic* gap — is where Indian AI will win.

> **Why should you care?** Because the companies hiring AI talent in India in 2027 won't just be Google and OpenAI. They'll be Sarvam, Krutrim, Fractal, Ola, Flipkart, Meesho, and ten startups that don't exist yet. Knowing this ecosystem gives you a hiring edge your classmates don't have.

## Watch: HuggingFace Hub tour + India AI snapshot

A 12-minute screencast walking through the HuggingFace hub and the Sarvam playground. Goal: you should be able to find any open model in under 30 seconds after watching this.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

Watch for:
- How to read a model card (license, size, language)
- The "Spaces" tab — try models in-browser, zero install
- The difference between "Instruct" and "Base" versions

## Lab: Three models, two tasks, one winner (pair-friendly)

40 minutes. Put three open models head-to-head on two realistic tasks. Works best in pairs — one drives, one observes, swap at the halfway mark.

> ⚠️ **If you get stuck**
> - *LM Arena's Direct Chat is rate-limited or the model dropdown is missing Qwen* → fall back to the "Arena (battle)" mode and keep hitting "new round" until Qwen is one of the two anonymous models, or open the Qwen chat directly at chat.qwen.ai. Note the substitution in your doc.
> - *Sarvam playground rejects your phone number / OTP doesn't arrive* → try an alternate email signup, or pair up with a classmate who's already in and screen-share. Don't skip Task B — the Indian-language comparison is the whole point.
> - *Your mother tongue's script isn't showing up properly (boxes/question marks)* → that's usually a font issue on your OS, not the model. Paste the output into a Google Doc — Docs renders Indic scripts reliably even when your browser doesn't.

1. Open LM Arena (`lmarena.ai`). Click "Direct Chat" and pick `qwen2.5-72b-instruct` from the dropdown.
2. Open Sarvam.ai playground in a second tab. Sign up with phone/email.
3. Open a third tab with any one of: DeepSeek chat, Kimi chat, or GLM chat.
4. **Task A (reasoning):** *"I have ₹50,000 for a 5-day trip. Goa, Manali, or Meghalaya? Pick one and give me a day-by-day budget breakdown."* Paste into all three.
5. **Task B (Indian language):** *"Write a 100-word WhatsApp apology to my mom in [your mother tongue] for not calling her in 2 weeks. Make it sound like a college student, not a greeting card."* Paste into all three.
6. Create a 1-page Google Doc with a 3×2 table: rows are models, columns are tasks. Paste outputs.
7. Write one sentence per cell: *"This was good / bad because…"*
8. Declare a winner per task at the bottom. Note whether the "winner" is the same for both tasks. (Spoiler: it usually isn't.)

**Artifact**: 1-page comparison doc. Submit as PDF via the dashboard.

## After class · ~30-45 min post-work

### Do (the assignment)

1. Open your Lab comparison doc (3×2 table: 3 models × 2 tasks).
2. Rank the 3 open models you tested per task — 1 = best, 3 = worst — and write a one-line justification per ranking.
3. Pick one of: Indian farmers / your college's alumni portal / a vernacular news reader. Write a short paragraph answering *"Which of these models would I ship for this use case, and why?"*
4. Keep the whole doc to one page. Export as PDF.
5. Submit via the dashboard before next class.

### Reflect (~5 min)

**Prompt:** *"If I had to bet my own ₹10,000 on one Indian AI company for the next 3 years, which one and why?"* A good reflection names a specific company (Sarvam, Krutrim, CoRover, or a startup you found today) and ties your bet to a concrete moat — language coverage, existing revenue, founder track record — rather than hype.

### Stretch (optional, for the curious)

- **Extra video**: TBD — instructor will pick based on class questions (likely a DeepSeek R1 or Qwen architecture walkthrough).
- **Extra read**: Sarvam's own blog on Indic tokenisation (https://www.sarvam.ai/) — why Devanagari eats more tokens than English and what they did about it.
- **Try**: Download Ollama (https://ollama.com/) and pull `qwen2.5:3b` to your laptop. Run it offline. Note the response speed vs the hosted API — you don't need this until Day 17, but previewing is useful.

## Quiz

Four questions on open vs closed weights, the Chinese family, the Indian family, and why open matters. Don't memorise company logos — memorise *why* each model exists.

## Assignment

Take the Lab doc and expand it. Rank the 3 open models you tested on both tasks (1 = best, 3 = worst). Add a short paragraph: *"If I were building an app for [pick: Indian farmers / my college's alumni portal / a vernacular news reader], which model would I use and why?"* Keep it to one page. This is the comparison you'd cite in a product manager interview.

## Discuss: Live session prompts

| Prompt | What a strong answer sounds like |
|---|---|
| If open models are almost as good and free — why does OpenAI still make billions? | Names at least two moats that aren't raw model quality: distribution (ChatGPT app), integration (Microsoft, enterprise), reliability/SLA, and the cost of running a 400B model yourself. "Free to download" ≠ "free to serve." |
| Sarvam or Krutrim: which bet is safer, and which is bolder? | Treats "safer" and "bolder" as different axes. Safer = narrower focus (Indian languages, existing revenue via Meesho). Bolder = full-stack (silicon + model + apps). Picks and defends, doesn't hedge. |
| Would you trust a Chinese open model with your startup's customer data? Why or why not? | Separates the *weights* (which you can inspect and run locally) from the *hosted API* (which you cannot). A strong answer says "yes if I self-host Qwen, no if I hit a chat.qwen.ai endpoint with user PII." |
| Does India *need* its own LLM, or is fine-tuning existing ones enough? | Distinguishes sovereignty (who controls the off-switch) from capability (does it work in Tamil). Acknowledges fine-tuning solves capability cheaper, but not sovereignty. |
| Which model surprised you most in the lab, and what does that tell you about benchmarks? | Names the specific model + the specific task where it over- or under-performed, and generalises to: "leaderboard rank isn't the same as 'good at my job.'" |

## References

### Pre-class primers
- [HuggingFace Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) — the live scoreboard for open models.
- [LM Arena](https://lmarena.ai/) — crowdsourced head-to-head model voting.

### Covered during class
- [Sarvam.ai](https://www.sarvam.ai/) — Indian-language specialist, Meesho case study.
- [BharatGPT (CoRover)](https://corover.ai/bharatgpt/) — powers Indian Railways' AskDISHA.
- [HuggingFace Model Hub](https://huggingface.co/models) — where open models live.

### Deep dives (post-class, if curious)
- [Qwen](https://qwenlm.github.io/) — Alibaba's open model family, strong multilingual + code.
- [DeepSeek](https://www.deepseek.com/) — R1 reasoning model, embarrassed SF on cost.
- [Kimi (Moonshot)](https://kimi.moonshot.cn/) — long-context champion.
- [GLM (Zhipu)](https://chatglm.cn/) — bilingual Chinese-English open family.
- [Phi (Microsoft)](https://huggingface.co/microsoft) — tiny models that punch up.
- [Gemma (Google)](https://ai.google.dev/gemma) — Google's open cousin to Gemini.
- [Krutrim](https://www.krutrim.ai/) — Ola's full-stack Indian AI bet.

### Other videos worth watching
- [Ollama](https://ollama.com/) — run open models locally; preview for Day 17.
