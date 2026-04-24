---
day: 4
date: "2026-05-06"
weekday: "Wednesday"
week: 1
topic: "OpenSource Models and the Indian Stack"
faculty:
  main: "Sanjana"
  support: "Harshith"
reading_time: "12 min"
tldr: "ChatGPT isn't the only model. Today you meet Sarvam (built for Indic), Mistral, Qwen, LLaMA, DeepSeek — pull one from Hugging Face, run it locally or on a free GPU, and feel the difference between closed and open."
tags: ["open-source", "indian-stack", "huggingface"]
software: ["Python", "transformers", "huggingface_hub"]
online_tools: ["Sarvam AI", "Mistral AI", "Hugging Face", "Qwen", "LLama", "DeepSeek"]
video: "https://www.youtube.com/embed/zjkBMFhNj_g"
prompt_of_the_day: "Translate this Swiggy delivery instruction from Hinglish to crisp Tamil for a Chennai partner: 'Bhaiya gate ke andar mat aana, chowkidar ko bag de dena, paneer wala alag bag mein hai.'"
tools_hands_on:
  - { name: "Hugging Face", url: "https://huggingface.co/models" }
  - { name: "Sarvam AI Playground", url: "https://www.sarvam.ai/" }
  - { name: "Mistral Le Chat", url: "https://chat.mistral.ai/" }
  - { name: "Qwen Chat", url: "https://chat.qwen.ai/" }
  - { name: "DeepSeek Chat", url: "https://chat.deepseek.com/" }
  - { name: "Google Colab (free GPU)", url: "https://colab.research.google.com/" }
tools_reference:
  - { name: "Open LLM Leaderboard", url: "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard" }
  - { name: "Sarvam-1 model card", url: "https://huggingface.co/sarvamai/sarvam-1" }
resources:
  - { title: "Hugging Face — Models 101", url: "https://huggingface.co/docs/hub/models" }
  - { title: "Ollama — run LLMs locally", url: "https://ollama.com/" }
  - { title: "AI Bharat — IndicNLP", url: "https://ai4bharat.iitm.ac.in/" }
lab: { title: "Three models, one Indic task", url: "https://www.sarvam.ai/" }
objective:
  topic: "OpenSource Models and the Indian Stack"
  tools: ["Hugging Face", "Sarvam", "Mistral", "Colab"]
  end_goal: "A short comparison of one closed model (ChatGPT) vs. two open models (one Indic, one global) on the same Indic-language task — with a recommendation."
---

Yesterday you mastered prompting. Today you mastery-test **which model** to point those prompts at. Closed APIs are easy — but `gpt-4o` doesn't speak Bhojpuri, charges per token, and your data sits on someone else's server. Time to see what else is on the shelf.

## 🎯 Today's objective

**Topic.** OpenSource Models and the Indian Stack.

**By end of class you will have:**
1. Browsed the Hugging Face hub and downloaded one model card without panicking.
2. Run **Sarvam-1** (or another Indic model) on a real Hindi/Tamil/Telugu task.
3. Compared one closed model (ChatGPT) vs. two open models on the same Indic prompt.
4. A clear answer to *"when would my future startup ditch the OpenAI API?"*

> *Why this matters.* If you build for India, the customer is going to type in Devanagari, Tamil, or Hinglish. Closed models charge 4× the tokens to mishandle that. Sarvam, IndicBERT, and Qwen change the math.

## ⏪ Pre-class · ~25 min

### Setup (required)

- [ ] Create a free **Hugging Face** account and generate a read token.
- [ ] Open a free **Google Colab** notebook (no local GPU? Colab gives you a T4 free).
- [ ] Optional: install **Ollama** (https://ollama.com/) for local models.

### Primer (~10 min)

- **Watch:** Yannic Kilcher's "What is Hugging Face?" (8 min) or any short HF Hub overview.
- **Read:** the Sarvam-1 model card on Hugging Face.

### Bring to class

- [ ] One sentence in your **mother tongue** + its English meaning.
- [ ] One *use case* you wish was native to your language (parent-WhatsApp summariser, JEE-doubt solver in Marathi, hostel mess complaint in Tamil).

> 🧠 **Quick glossary.** **Open-weight** = model weights are downloadable; you can run/fine-tune. **Closed model** = API only (GPT-4, Claude). **Indic model** = trained heavily on Indian languages. **Quantization** = shrink a model so it fits on smaller GPUs. **Inference** = running the model.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Why open-source matters | 10 min | Cost, privacy, language fit |
| Tour of HF Hub | 10 min | Filters, model cards, leaderboards |
| The Indian stack | 15 min | Sarvam, AI4Bharat, Krutrim, Ola |
| Lab: 3 models on 1 Indic prompt | 20 min | Live |
| Discussion + Q&A | 5 min | |

### The shelf, simplified

- **Closed API titans.** GPT-4, Claude, Gemini — best raw quality, English-first, paid.
- **Global open weights.** **LLaMA 3** (Meta), **Mistral**, **Qwen** (Alibaba), **DeepSeek** — strong, free to download.
- **Indian stack.** **Sarvam-1** (22B, 10 Indic languages), **AI4Bharat IndicTrans2**, **Krutrim**, **Hanooman**, **Bhashini** APIs.
- **Tiny but useful.** **Phi-3-mini**, **Gemma-2-2B** — run on your laptop.

## 🧪 Lab: Three models, one Indic task

1. Pick **one task** in your mother tongue: a 4-line WhatsApp message to your dad explaining your placement situation, OR translate a Swiggy delivery note.
2. Run it on **ChatGPT** (free tier).
3. Run the same prompt on **Sarvam Playground** (https://www.sarvam.ai/).
4. Run it on **Mistral Le Chat** *or* **Qwen Chat**.
5. (Bonus) In Colab, run this snippet:
   ```python
   from transformers import pipeline
   pipe = pipeline("text-generation", model="sarvamai/sarvam-1", device_map="auto")
   print(pipe("मेरा नाम", max_new_tokens=50)[0]["generated_text"])
   ```
6. Score each on **fluency**, **cultural fit**, **factual correctness** (1–5).
7. Write 3 sentences: *for this task, I'd ship with model X because…*

**Artifact.** Google Doc with task, 3 outputs, score table, and recommendation. Share link in cohort channel.

## 📊 Live poll

**For an Indic-language WhatsApp bot serving Tier-2 cities, which would you ship with?** (a) GPT-4 (b) Claude (c) Sarvam-1 (d) Mistral (e) Qwen (f) Build hybrid.

## 💬 Discuss

- Where did Sarvam *win* and where did it *lose* against ChatGPT?
- If your fintech startup must keep customer data on Indian soil, what changes in your stack?
- Why do open weights matter for a 2nd-year student in Tier-3 college, today?

## ❓ Quiz

Short quiz on closed vs open, where Sarvam is trained, and what a model card tells you. Open from your dashboard when unlocked.

## 📝 Assignment · Pick your stack

**Brief.** Imagine you're founding a startup serving farmers in your home state. In **250 words**: (a) the language(s) the product speaks, (b) one closed + one open model you'd combine, (c) one decision driven by cost, one by privacy, one by language quality. No vague "we'll use AI" — name models and explain trade-offs.

**Submit.** Paste on dashboard before next class.

**Rubric.** Stack specificity (4) · Trade-off clarity (4) · Indian-context realism (2).

## 🔁 Prep for next class

Day 5 is **grounded research with AI** — Fast vs Thinking vs Deep Research, NotebookLM, Perplexity. The day you stop trusting AI's first answer.

- [ ] Sign up free on **Perplexity** and **NotebookLM**.
- [ ] Drop one PDF you actually need to read (textbook chapter, paper, hostel rule book) into NotebookLM.
- [ ] Bring 2 questions you've Googled in the last week and *didn't* find a good answer to.

## 📚 References

- [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) — keep an eye on it monthly.
- [Sarvam-1 model card](https://huggingface.co/sarvamai/sarvam-1) — built in Bengaluru for Indic.
- [AI4Bharat](https://ai4bharat.iitm.ac.in/) — IIT Madras' open Indic NLP work.
- [Ollama](https://ollama.com/) — easiest way to run LLaMA/Mistral/Qwen on your laptop.
