---
reading_time: 16 min
tldr: "An LLM is extremely well-read autocomplete. Tokens, weights, attention — the three words that save you hours of confusion."
tags: ["foundations", "theory"]
video: https://www.youtube.com/embed/zjkBMFhNj_g
lab: {"title": "Tokenize everything: see how the model actually reads", "url": "https://tiktokenizer.vercel.app/"}
prompt_of_the_day: "Explain {{concept}} as if I'm a 2nd-year engineering student who's used ChatGPT but never looked under the hood. Use one analogy from hostel life."
tools_hands_on: [{"name": "Tiktokenizer", "url": "https://tiktokenizer.vercel.app/"}, {"name": "ChatGPT", "url": "https://chat.openai.com/"}, {"name": "Claude", "url": "https://claude.ai/"}]
tools_demo: [{"name": "3Blue1Brown Neural Networks", "url": "https://www.3blue1brown.com/topics/neural-networks"}, {"name": "Attention visualizer (bbycroft)", "url": "https://bbycroft.net/llm"}]
tools_reference: [{"name": "Karpathy — Intro to LLMs (1h)", "url": "https://www.youtube.com/watch?v=zjkBMFhNj_g"}, {"name": "Jay Alammar — Illustrated Transformer", "url": "https://jalammar.github.io/illustrated-transformer/"}]
resources: [{"title": "Attention is All You Need (the paper)", "url": "https://arxiv.org/abs/1706.03762"}]
objective:
  topic: "Inside an LLM — tokens, weights, attention"
  tools: ["Tiktokenizer", "ChatGPT", "Claude"]
  end_goal: "Walk away able to explain tokens, weights, and attention in your own words, with a tokenizer notebook of 5–10 strings that made you rethink how the model actually reads."
---

## 🎯 Today's objective

**Topic.** What's actually inside an LLM. No math, no jargon parade — just the three words (tokens, weights, attention) that unlock every AI conversation you'll have for the next 28 days.

**Tools you'll use.** Tiktokenizer (web, no install) as the playground. ChatGPT and Claude as the reference chatbots to compare behaviour against.

**End goal.** By the end of today you will have:
1. A tokenizer notebook with 5–10 strings, their token counts, and one surprise each.
2. A 150-word reflection titled *"Three things that surprised me about how LLMs see text."*
3. A working mental model of the **tokenise → weigh → attend → predict → repeat** loop — enough to stop nodding politely when someone says "context window."

> *Why this matters:* once you internalize these three words, every later topic (hallucination, pricing, context windows, fine-tuning) becomes a small adjustment to the same loop instead of a new mystery.

---

### 🌍 Real-life anchor

**The picture.** Phone autocomplete guesses the *next* word from what you already typed; you only notice when it is wrong. Reading a long WhatsApp fight, you mentally "look back" at the sentence that started the drama — some words get more weight than others.

**Why it matches today.** **Tokens** are the pieces the model reads; **attention** is which earlier pieces it leans on for the next guess; **weights** are the habits it learned from training — like autocomplete, but trained on the whole internet.

## ⏪ Pre-class · ~20 min

**Faculty note.** Budget ~2 minutes for the 🌍 *Real-life anchor* above — read it aloud or ask one volunteer to restate it in their own words — so the analogy lands before setup.

**Revision / context.** Yesterday you met AI in your daily life — Netflix recs, Maps ETAs, UPI fraud, WhatsApp auto-translation — and ran the same placement-mentor prompt through ChatGPT, Claude, and Gemini to feel three distinct personalities. You also separated *chatbot* (the app) from *LLM* (the brain). Today we open the box and explain *why* those three chatbots gave different answers to the same prompt. Keep your Day 1 "three brains" Google Doc handy — we reference it in class.

### Setup (if needed)

- [ ] No install. Just open https://tiktokenizer.vercel.app/ once to confirm it loads. That's our whole lab environment.

### Primer (~5 min)

- **Read**: Skim the glossary below. That's it.
- **Watch** (optional, 3 min): clip from Karpathy's "Intro to LLMs" where he explains tokens with a slider — https://www.youtube.com/watch?v=zjkBMFhNj_g (you'll come back for the full hour later).

### Bring to class

- [ ] Your Day 1 "three brains" Google Doc — we'll reference it.
- [ ] 3 random strings to tokenize: your full name, one emoji you use often, one Hindi/regional word. We'll throw them into the tokenizer together.

> 🧠 **Quick glossary for today**
> - **Token** = a chunk of text the model reads (roughly ¾ of a word).
> - **Weights** = the billions of numbers inside the model — the "brain" trained on the internet.
> - **Attention** = how the model picks which parts of your prompt matter for the next word.
> - **Context window** = how many tokens the model can see at once.
> - **Temperature** = a dial that controls how random the output is (0 = safe, 1 = creative).

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap Day 1 + hook | 5 min | "AI is autocomplete" — now let's see autocomplete from the inside |
| Mini-lecture | 20 min | Stack (AI→ML→DL→LLMs→Agents), tokens/weights/attention, temperature |
| Live lab | 20 min | Tokenize wild strings in Tiktokenizer; watch surprises live |
| Q&A + discussion | 15 min | What finally clicked? What's still murky? |

### In-class checkpoints

- **Live poll (LMS)** — Run the **dashboard Live poll** for today so counts match in-class discussion (same wording as the official cohort poll for this day).
- **Cold-open guess**: instructor types "I'm cooked" into Tiktokenizer. Class guesses how many tokens before the reveal. (It's 4.)
- **Think-pair-share**: in 90 seconds, try to explain "tokens" to your neighbour without using the word "word". Hardest 90 seconds of the day.
- **Live tokenizer poll**: everyone types their full name, their hostel mess's name, and one Hindi/regional word into Tiktokenizer. Share the most surprising token counts in chat.
- **Temperature demo**: instructor runs the same prompt at temperature 0, 0.5, 1, 1.5 — class predicts which one will go off the rails first.
- **One-line close**: "The thing that finally clicked today was ___."

### Read: The stack — from "AI" to the chatbot on your phone

Everybody says "AI" and means five different things. Let's fix that once and for all.

```
AI  (big umbrella: anything that mimics thinking)
 └── Machine Learning  (programs that learn from examples, not rules)
      └── Deep Learning  (ML using big neural networks)
           └── LLMs  (deep nets trained on text — ChatGPT, Claude, Gemini)
                └── Agents  (LLMs that take actions: search, click, code)
```

Think of it like your college:
- **AI** is the university.
- **ML** is the engineering department.
- **Deep Learning** is the CSE branch.
- **LLMs** are the AI/ML specialisation.
- **Agents** are the final-year students who actually *do* projects.

Each inner circle is more specific, more powerful, and newer. For the rest of this week we're zooming in on LLMs — the machine behind ChatGPT, Claude, Gemini, and every other chatbot you'll use.

### Read: Tokens, weights, attention — the three words that save you hours

Don't memorise. Just meet them. You'll see them everywhere for the next 29 days.

#### Tokens

A **token** is a chunk of text the model reads. Not a letter. Not exactly a word. Roughly 3–4 characters — about ¾ of an English word on average.

Examples (we'll check these live):

- `"Hello"` → 1 token
- `"Bengaluru"` → 3 tokens
- `"LOL"` → 1 token
- `"I'm cooked"` → 4 tokens
- `"Kadak"` → 2 tokens (the model hasn't seen it enough)
- Full resume ≈ 1,100 tokens
- A WhatsApp group rant from last Sunday ≈ 4,000 tokens

**Why you care**:
1. You pay per token (API pricing is always per 1K or per 1M tokens).
2. Long prompts are slow (more tokens = more time).
3. The **context window** is measured in tokens — exceed it, the model forgets the start of your prompt.

#### Weights

The **weights** are the numbers inside the model. Billions of them. Trained for months on trillions of tokens (basically the public internet + books + code).

Think of them as a giant mixing board with 175 billion knobs (GPT-3 had about 175B; modern models have 1T+). During training, those knobs got nudged until the model got really, really good at one task: **predict the next token**. That's it. That's the whole show.

After training, the weights are **frozen**. The model doesn't learn from your chat. Every new conversation starts with exactly the same brain.

#### Attention

The killer move inside transformers. When the model is about to predict the next token, **attention** is how it decides *which earlier tokens matter most*.

Think of reading this paragraph: when you hit the word "it" at the end, you automatically reach back to find what "it" refers to. Attention does that math explicitly — for every new token, it computes a weighted score across all previous tokens and focuses on the relevant ones.

That's why LLMs can handle "In the mess menu I shared earlier, which item has paneer?" — attention scrolls back to the mess menu part of your message and mostly ignores your rant about Wi-Fi.

#### The one-line summary

> **tokenise → weigh → attend → predict → repeat.**

That's the whole loop. Every chatbot you've ever used does exactly this, one token at a time, hundreds of times per response.

### Read: Why the same prompt gives different answers

Two reasons:

**1. Temperature.** A dial the developer sets between 0 and ~1.5. At temperature 0 the model always picks the single most likely next token. Boring but consistent — good for code, structured output, classification. At temperature 0.7 (the default for most chatbots) the model samples from the top few likely tokens with some randomness. At temperature 1.5+ it gets weird, sometimes gloriously, sometimes disastrously.

**2. Different weights.** ChatGPT, Claude, and Gemini read *roughly the same internet* during training, but they were trained differently — different data mixes, different reinforcement from humans, different system prompts. Three toppers, same syllabus, different essays.

That's why yesterday's "three brains" lab gave you three different answers to the same prompt. Same input, three different weight sets, three different personalities.

### Watch: Karpathy — "Intro to LLMs" (first 30 min today, rest this week)

Andrej Karpathy co-founded OpenAI and led AI at Tesla. This is still the clearest single intro on the internet. Watch the first 30 minutes in class; finish the rest this week.

https://www.youtube.com/embed/zjkBMFhNj_g

Watch for:
- The "two files" analogy (weights + run-code) — clicks the whole stack
- Why training costs millions of dollars but running is cheap
- The "dream" explanation of hallucination

### Lab: Tokenize everything (30 min)

Today's lab is web-only. No installs. Budget 30 min, optionally in pairs — one drives, one predicts before each reveal.

> ⚠️ **If you get stuck**
> - *Tiktokenizer shows `?` for Indic characters* — that's a font fallback, not the tokenizer. The count is still correct; copy the paragraph into Google Docs to verify the script renders.
> - *Dropdown doesn't have your model* — use `gpt-4o` as the default; tokenization is very similar across GPT-4-class models.
> - *Your full name tokenizes weirdly (e.g., 7 tokens)* — that's the model having never seen you before. Celebrate briefly.

1. Open **Tiktokenizer** — https://tiktokenizer.vercel.app/
2. In the model dropdown, pick `gpt-4o` (or `cl100k_base` — same family).
3. Type your full name. How many tokens? Screenshot it.
4. Type an emoji you use often (🔥 or 😂). 1 token? 2? 3? Note it.
5. Type one Hindi / Tamil / Bengali word in its native script. Compare vs its English spelling.
6. Type `"The mess food was kadak today yaar"`. Count tokens. Hypothesise why.
7. Paste in a 500-word paragraph from your college syllabus. Note the total.
8. Now switch the model dropdown to `Llama 3`. Tokenize the same paragraph. Why is the count different?
9. Final step — paste *"Roses are red, violets are"* and stop there. Read about `token-by-token` generation underneath.

**Artifact**: one Google Doc titled *"My tokenizer notebook"* with 5–10 strings, their token counts, and one sentence each on what surprised you.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| If an LLM is "just autocomplete," why does it *feel* like it understands you? | Distinguishes pattern-match from comprehension; mentions priors the model already holds from training; concedes there's a real illusion but names a specific failure mode that reveals the illusion. |
| How would you explain "tokens" to your parents in under 60 seconds? | Uses a concrete analogy (per-character SMS pricing, sliced loaf), avoids the word "LLM", and names one practical consequence ("that's why long questions are slower"). |
| The same prompt gave you different answers across ChatGPT, Claude, Gemini yesterday. What's ACTUALLY different between them? | Mentions both weights AND training choices (RLHF, data mix, system prompt). Bonus: mentions temperature as the controllable dial. |
| Why does "Bengaluru" tokenize into 3 tokens but "hello" into 1? | Training data frequency — common English words get one token; less common ones (including Indian place names) split into sub-words. Implication: non-English tokenizes less efficiently. |
| If weights are frozen after training, how does ChatGPT "remember" things you told it last week? | Separates *model weights* (frozen) from *memory layer* (app feature — Claude Projects, ChatGPT memory). The model doesn't learn; the app shovels prior context back in. |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate: extend your tokenizer notebook + write the 150 words (~25 min)

1. Open your tokenizer notebook from the lab.
2. Add three more strings: your most-used WhatsApp group name, a song lyric in your mother tongue, and one code snippet from any project you've touched.
3. Write a 150-word paragraph titled *"Three things that surprised me about how LLMs see text."*
4. Save the doc — you'll submit it in step 4.

### 2. Reflect (~10 min)

**Prompt:** *"Explain tokens to your parents in under 60 seconds. What analogy would you use?"* A good reflection drops the jargon completely, picks one familiar analogy (paying per SMS character, sliced bread, etc.), and doesn't sneak the word "LLM" back in. Jot a few lines for your own record.

### 3. Quiz (~17 min)

Includes transfer scenarios + spaced recall from earlier days (~8+ items total). If a question feels easy, treat it as speed practice.

Four quick ones on tokens, weights, attention, and the AI → ML → DL → LLM → Agents hierarchy. Available on the dashboard. Aim for 70%+ to feel solid going into tomorrow's tool landscape.

### 4. Submit the assignment (~5 min)

Submit your 150-word reflection + tokenizer notebook (PDF) via the dashboard **before next class**.

**Peer or self-review:** One line (chat or DM): what changed after someone skimmed your artifact — or the biggest gap if you worked solo.

**Stretch (optional):** Pick one rubric row and over-ship it (extra example, tighter screenshot, or second iteration).


### 5. Deepen (optional, ~30 min)

- **Extra video**: finish Karpathy's full hour at https://www.youtube.com/watch?v=zjkBMFhNj_g — especially the hallucination section.
- **Extra read**: Jay Alammar's illustrated transformer — https://jalammar.github.io/illustrated-transformer/ — beautiful, still the best visual explainer after 7 years.
- **Try**: open bbycroft.net/llm — a real-time 3D visualization of a running transformer. Watch attention happen token by token.

### 6. Prep for Day 3 (~35 min — important)

**Tomorrow we map the tool landscape.** Day 3 covers the 7 classes of AI tool every operator should know, closed vs open weights, and the Indian AI stack (Sarvam, BharatGPT, Krutrim). You'll do a live "tool audit" matching tasks from your life to tool classes.

- [ ] **Skim ahead**: browse https://lmarena.ai — try "Direct Chat" once (no login) to feel what it's like to vote between two models blind. Also skim https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard — notice how many top open models you've never heard of.
- [ ] **Think**: if today showed you weights are the "brain" — what does it mean for a model to be **open-weight** vs **closed-weight**? Bring your guess.
- [ ] **Set up**: have one product idea you'd build for an Indian user (farmer, parent, grandmother, small-shop owner) ready — we'll compare Sarvam vs Qwen live. Also have your mother tongue ready; you'll be typing in it.

---

## 📚 Extra / additional references

Optional deep-dives. Pick what interests you; skip what doesn't.

### Short watches

- [Karpathy — Intro to LLMs (1h)](https://www.youtube.com/watch?v=zjkBMFhNj_g) — the single clearest long explainer. First 30 min in class.
- [3Blue1Brown — Neural Networks series](https://www.3blue1brown.com/topics/neural-networks) — visual, beautiful intuition for what's inside an LLM.
- Finish the rest of Karpathy's video — it covers hallucination, training cost, and the jailbreak economy.

### Reading

- [Jay Alammar — Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) — the classic visual explainer.
- [Attention is All You Need](https://arxiv.org/abs/1706.03762) — the 2017 paper that started this whole era. Read the abstract + figure 1; skip the math.

### Play

- [Tiktokenizer](https://tiktokenizer.vercel.app/) — our lab playground. Come back and tokenize anything that confuses you.
- [bbycroft.net/llm](https://bbycroft.net/llm) — watch a transformer generate in 3D, token by token.
