---
day: 2
date: "2026-05-04"
weekday: "Monday"
week: 1
topic: "Inside an LLM: tokens, weights, attention, memory"
faculty:
  main: "Sanjana"
  support: "Raunak"
reading_time: "12 min"
tldr: "Open the box. Words become tokens, tokens become numbers, numbers slide through weights, attention decides which tokens stare at which. By end of class you'll tokenize your own name and explain why 'bank' isn't always 'bank'."
tags: ["foundations", "internals", "tokens"]
software: ["Python", "transformers", "tokenizers"]
online_tools: ["Token Visualizer", "TikTokenizer"]
video: "https://www.youtube.com/embed/wjZofJX0v4M"
prompt_of_the_day: "Explain to a JEE-prep student in 5 lines why an LLM treats 'Bengaluru' as multiple tokens but 'the' as one — using the analogy of a Hindi-English code-switched WhatsApp message."
tools_hands_on:
  - { name: "TikTokenizer", url: "https://tiktokenizer.vercel.app/" }
  - { name: "OpenAI Tokenizer", url: "https://platform.openai.com/tokenizer" }
  - { name: "Hugging Face Tokenizer Playground", url: "https://huggingface.co/spaces/Xenova/the-tokenizer-playground" }
tools_reference:
  - { name: "3Blue1Brown — But what is a GPT?", url: "https://www.youtube.com/watch?v=wjZofJX0v4M" }
  - { name: "Jay Alammar — Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/" }
resources:
  - { title: "Karpathy — Let's build the GPT tokenizer", url: "https://www.youtube.com/watch?v=zduSFxRajkE" }
  - { title: "Hugging Face — Transformers Quickstart", url: "https://huggingface.co/docs/transformers/quicktour" }
lab: { title: "Tokenize your own life", url: "https://tiktokenizer.vercel.app/" }
objective:
  topic: "Inside an LLM: tokens, weights, attention, memory"
  tools: ["TikTokenizer", "transformers", "Hugging Face"]
  end_goal: "A one-page note explaining tokens → embeddings → attention → output, anchored in your own name, your hostel address, and one Hinglish sentence."
---

Yesterday you used four chatbots. Today you crack one open. The goal isn't to build a transformer from scratch — it's to lose the magic. Once you see *tokens*, the rest of the course makes sense.

## 🎯 Today's objective

**Topic.** Inside an LLM: tokens, weights, attention, memory.

**By end of class you will have:**
1. Tokenized your full name, your college email, and one Hinglish sentence in three different tokenizers.
2. Explained — in your own words — why `"chai"` is one token but `"masaledar"` is three.
3. A working mental model of how attention picks out *which* word matters in *"Ravi paid Ramesh on UPI"*.

> *Why this matters.* Every cost, latency, hallucination, and context-window limit you'll hit in Week 3 traces back to tokens. Get this floor right.

## ⏪ Pre-class · ~25 min

### Setup (required)

- [ ] Confirm **Python 3.10+** runs on your laptop (`python --version`).
- [ ] `pip install transformers tokenizers` in a fresh virtualenv.
- [ ] Open https://tiktokenizer.vercel.app/ and bookmark.

### Primer (~10 min)

- **Watch:** 3Blue1Brown's "But what is a GPT?" first 8 minutes — https://www.youtube.com/watch?v=wjZofJX0v4M
- **Skim:** Jay Alammar's *Illustrated Transformer* — just the diagrams.

### Bring to class

- [ ] One sentence in **English**, one in **your mother tongue**, one in **Hinglish**.
- [ ] A guess: how many tokens is *"Bengaluru Metropolitan Transport Corporation"*?

> 🧠 **Quick glossary.** **Token** = sub-word chunk the model actually sees. **Embedding** = token turned into a vector of numbers. **Attention** = mechanism that weighs which tokens matter for each prediction. **Weights** = the trillions of numbers learned during training. **Context window** = how many tokens fit in one chat.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + tokenizer demo | 10 min | Tokenize "Swiggy delivered my biryani" live |
| Mini-lecture: tokens → embeddings | 15 min | Why numbers, not letters |
| Mini-lecture: attention in plain English | 15 min | "Ravi paid Ramesh" — who paid? |
| Live lab: 3 tokenizers, 3 sentences | 15 min | English vs Tamil vs Hinglish |
| Discussion + Q&A | 5 min | |

### The four moving parts

1. **Tokens.** GPT-4 sees ~100k unique tokens. English words are usually 1 token, Indian-language words split into 3–8.
2. **Embeddings.** Each token becomes a 1,500-dim vector. Words with similar meanings sit close (`king ≈ queen + male`).
3. **Attention.** For each token, the model asks "which earlier tokens should I look at most?" — that's how it knows *paid* connects to *Ravi*, not *Ramesh*.
4. **Weights & memory.** Weights are frozen after training. Memory inside one chat is just the visible context window — there is no hidden notebook.

## 🧪 Lab: Tokenize your own life

1. Open **TikTokenizer** (GPT-4 model) in one tab and **HF Tokenizer Playground** (BERT) in another.
2. Paste these three lines and screenshot the token counts for each:
   - `"My name is <your full name> and I study at <your college>."`
   - One sentence in your mother tongue.
   - `"Bhai aaj mess mein paneer tha but cold tha yaar."`
3. Run this Python snippet and paste the output to your Doc:
   ```python
   from transformers import AutoTokenizer
   tok = AutoTokenizer.from_pretrained("gpt2")
   print(tok.tokenize("Bengaluru Metropolitan Transport Corporation"))
   ```
4. Compare token counts across the three tools. Note where Indic scripts blow up.
5. Write **3 sentences** explaining: *why does my mother-tongue sentence cost 4× more tokens than the English one?*

**Artifact.** One Google Doc with 3 screenshots + token counts + your 3-sentence answer. Drop the link in the cohort channel.

## 📊 Live poll

**Which costs more tokens to send to GPT-4?** (a) 100 words English (b) 100 words Hindi in Devanagari (c) 100 words Hinglish in Roman script (d) Same, tokens are tokens.

## 💬 Discuss

- If Hindi costs 4× more tokens, what does that mean for an Indian startup's API bill?
- Why do you think emoji are sometimes 1 token, sometimes 4?
- Where would a smarter Indic tokenizer change which products are buildable in India?

## ❓ Quiz

Short quiz on tokens vs words, what attention does, and where memory lives. Open it from your dashboard when your instructor unlocks it.

## 📝 Assignment · Tokens in your stack

**Brief.** Pick **one app you use daily** (Swiggy, Flipkart, ICICI iMobile, Instagram). Imagine its support chatbot runs on GPT-4. In **200 words**: (a) one user message in your mother tongue, (b) the token count from TikTokenizer, (c) one design decision the team must make because of that cost. Be specific — not "they should optimize."

**Submit.** Paste on dashboard before next class.

**Rubric.** Specificity (4) · Cost reasoning (4) · Token evidence (2).

## 🔁 Prep for next class

Day 3 is the **CREATE prompting framework** — few-shot, chain-of-thought, structured output. The day you stop *asking* and start *directing* AI.

- [ ] Save 3 of your worst recent prompts (the ones that got mid answers) in a Doc.
- [ ] Read the OpenAI prompt engineering guide intro — https://platform.openai.com/docs/guides/prompt-engineering
- [ ] Sign up for **OpenAI Playground** and **Google AI Studio**.

## 📚 References

- [3Blue1Brown — But what is a GPT? (27 min)](https://www.youtube.com/watch?v=wjZofJX0v4M) — visuals you'll never forget.
- [Karpathy — Let's build the GPT tokenizer (2 hr)](https://www.youtube.com/watch?v=zduSFxRajkE) — go deep when you're ready.
- [Jay Alammar — Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) — the canonical diagrams.
- [Hugging Face — Transformers quickstart](https://huggingface.co/docs/transformers/quicktour) — what you'll actually use.
