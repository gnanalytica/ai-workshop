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

1. Open LM Arena (`lmarena.ai`). Click "Direct Chat" and pick `qwen2.5-72b-instruct` from the dropdown.
2. Open Sarvam.ai playground in a second tab. Sign up with phone/email.
3. Open a third tab with any one of: DeepSeek chat, Kimi chat, or GLM chat.
4. **Task A (reasoning):** *"I have ₹50,000 for a 5-day trip. Goa, Manali, or Meghalaya? Pick one and give me a day-by-day budget breakdown."* Paste into all three.
5. **Task B (Indian language):** *"Write a 100-word WhatsApp apology to my mom in [your mother tongue] for not calling her in 2 weeks. Make it sound like a college student, not a greeting card."* Paste into all three.
6. Create a 1-page Google Doc with a 3×2 table: rows are models, columns are tasks. Paste outputs.
7. Write one sentence per cell: *"This was good / bad because…"*
8. Declare a winner per task at the bottom. Note whether the "winner" is the same for both tasks. (Spoiler: it usually isn't.)

**Artifact**: 1-page comparison doc. Submit as PDF via the dashboard.

## Quiz

Four questions on open vs closed weights, the Chinese family, the Indian family, and why open matters. Don't memorise company logos — memorise *why* each model exists.

## Assignment

Take the Lab doc and expand it. Rank the 3 open models you tested on both tasks (1 = best, 3 = worst). Add a short paragraph: *"If I were building an app for [pick: Indian farmers / my college's alumni portal / a vernacular news reader], which model would I use and why?"* Keep it to one page. This is the comparison you'd cite in a product manager interview.

## Discuss: Live session prompts

- If open models are almost as good and free — why does OpenAI still make billions?
- Sarvam or Krutrim: which bet is safer, and which is bolder?
- Would you trust a Chinese open model with your startup's customer data? Why or why not?
- Does India *need* its own LLM, or is fine-tuning existing ones enough?
- Which model surprised you most in the lab, and what does that tell you about benchmarks?
