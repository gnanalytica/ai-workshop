---
reading_time: 14 min
tldr: "AI is already running your life — Netflix picks, Maps routes, UPI fraud flags, WhatsApp translations. Today you notice it. Tomorrow we open the box."
tags: ["foundations", "kickoff"]
video: https://www.youtube.com/embed/iR2O2GPbB0E
lab: {"title": "Same prompt, three brains", "url": "https://chat.openai.com/"}
prompt_of_the_day: "You are my {{subject}} TA. Explain {{topic}} to a 3rd-year college student in 5 bullets, one analogy from hostel life, and one mistake students usually make."
tools_hands_on: [{"name": "ChatGPT", "url": "https://chat.openai.com/"}, {"name": "Claude", "url": "https://claude.ai/"}, {"name": "Gemini", "url": "https://gemini.google.com/"}]
tools_demo: []
tools_reference: [{"name": "IBM — What are LLMs?", "url": "https://www.youtube.com/watch?v=iR2O2GPbB0E"}, {"name": "DeepMind AlphaFold", "url": "https://deepmind.google/technologies/alphafold/"}]
resources: [{"title": "Ethan Mollick — One Useful Thing", "url": "https://www.oneusefulthing.org/"}]
objective:
  topic: "What AI is and is not, plus the AI already in everyday life"
  tools: ["ChatGPT", "Claude", "Gemini"]
  end_goal: "Walk away with an honest Day-0 baseline: a 150-word reflection on what surprised you + side-by-side feel for how three chatbots differ."
---

## 🎯 Today's objective

**Topic.** What AI is and is not, plus the AI already in everyday life

**Tools you'll use.** ChatGPT, Claude, Gemini — the three big consumer chat tools. Free tiers are enough.

**End goal.** By the end of today you will have:
1. Used all three top chatbots side-by-side on the same prompt and felt their personality differences.
2. Written a 150-word honest reflection as your Day-0 baseline (no AI help).
3. A clear mental line between *chatbot* and *AI*, and between "AI is" and "AI isn't."

> *Why this matters:* Day 30 you demo something *you* built with AI. That transformation only feels real if you capture your honest baseline today.

---

### 🌍 Real-life anchor

**The picture.** Maps picks a route from traffic patterns; your bank flags a weird charge; photo search finds "beach" without you tagging photos. You did not call any of that "AI" — but it is the same family of idea: software that updates from examples.

**Why it matches today.** We are naming what you already live inside, then meeting the chat-shaped version of it (ChatGPT, Claude, Gemini) so the rest of the month has a floor.

## ⏪ Pre-class · ~20 min

**Faculty note.** Budget ~2 minutes for the 🌍 *Real-life anchor* above — read it aloud or ask one volunteer to restate it in their own words — so the analogy lands before setup.

**Revision / context.** This is Day 1 — there is no prior session to revise. Instead: take 2 minutes to notice the AI already in your pocket (photo search, voice typing, spam filter, Spotify mix). That noticing *is* the revision.

### Setup (required)

- [ ] Create free accounts on **ChatGPT**, **Claude**, and **Gemini** using your college email. Free tiers cover today.
- [ ] Laptop + stable internet + one browser window with three tabs ready.

### Primer (~5 min)

- **Watch (optional)**: IBM's "What are Large Language Models?" (7 min) — https://www.youtube.com/watch?v=iR2O2GPbB0E. Same video we use in class; pre-watching lets you ask sharper questions.
- **Read**: Pick any recent post on Ethan Mollick's https://www.oneusefulthing.org/. Goal is to see how a working practitioner talks about AI weekly. You don't need to understand every reference.

### Bring to class

- [ ] A short "test question" from your own life you want to ask all three chatbots — a placement worry, a study problem, a hostel dilemma. *Not* a riddle.
- [ ] Your laptop, three browser tabs ready.

> 🧠 **Quick glossary to pre-load**
> - **AI** = umbrella term for any system mimicking a thinking task.
> - **LLM** (Large Language Model) = AI trained on text. ChatGPT, Claude, Gemini are LLMs.
> - **Chatbot** = the app wrapper around an LLM.
> - **Hallucination** = AI confidently making up facts. More on this in Day 4.
> - **Prompt** = whatever you type to the AI.

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Welcome + course tour | 10 min | 30-day roadmap + what demo day looks like |
| Mini-lecture: What AI is vs isn't + AI in real life | 20 min | The 5+5 split + 10 real examples |
| Live lab: 3 tools, 1 prompt | 15 min | Task 1 together, you finish the rest |
| Q&A + discussion | 15 min | Bring questions and observations |

### In-class checkpoints

- **Live poll (LMS)** — Run the **dashboard Live poll** for today so counts match in-class discussion (same wording as the official cohort poll for this day).
- **Fist-of-5 on AI confidence**: on camera, hold up 1–5 fingers for "how confident am I I actually understand what's inside ChatGPT." Instructor calls on one 5 and one 1 for a sentence each. Sets the honesty baseline.
- **Spot-the-AI round**: in chat, each student drops *one* place AI showed up in their day yesterday that they didn't label as AI at the time. Instructor reads the three most surprising.
- **Live poll**: "Which felt most human: ChatGPT / Claude / Gemini / 'they all felt the same'?" Watch the bars, call out the shock, ask one voter on each side to defend their pick.
- **Pick-a-corner debate**: "AI is overhyped" — agree / disagree / unsure. Two volunteers per side, 45 seconds each. Instructor keeps time hard.
- **One-line close**: every student drops one sentence in chat: *"The thing I'll remember from today is ___."* No editing, no deleting.

### Read (in class, with the lecture)

#### Welcome — the next 30 days

**Your mission on Day 30**: demo a thing *you* built with AI. Not a slide about AI. A live thing.

| Week | Theme | What you walk away with |
|---|---|---|
| 1 · Foundations | What AI is, what's inside it, which tool fits which job | A mental model + a prompt library + a personal AI stack |
| 2 · Exposure | Hands-on with every flavor of AI tool | Your capstone problem picked |
| 3 · Think & Tell | Design thinking for your capstone | A 1-page spec + wireframes |
| 4 · Dev + AI Build | GitHub, RAG, local models, context engineering | Confidence to direct AI to build things for you |
| 5 · Build, Ship, Agentic | Vibe-coding, deploying, agents, swarms | A live URL of your capstone v0 |
| 6 · Launch | Ethics, benchmarks, polish, demo | A shipped capstone, a certificate, a portfolio page |

Two checkpoints: **Day 10** — you lock in the problem you'll build. **Day 30** — you demo.

#### What AI **is** ✓

1. **A pattern machine.** It saw trillions of sentences, articles, and codebases and now finishes *your* sentences by matching patterns.
2. **A brilliant, under-slept intern.** Fast, creative, knows a little about everything, occasionally makes things up with total confidence.
3. **A force multiplier.** You can now do in 1 hour what used to take 1 week — if you know how to direct it.
4. **Already everywhere.** Maps, Netflix, UPI fraud detection, Gmail spam, Instagram feed — AI has been shipping to you for a decade.
5. **Stateless by default.** Every chat starts fresh unless the app gives it memory (ChatGPT memory, Claude Projects, etc.).

#### What AI **isn't** ✗

1. **Not conscious.** No feelings, no awareness, no desires.
2. **Not always right.** Confidently wrong 15–30% of the time depending on the task. This is *hallucination*. Always verify on anything that matters.
3. **Not thinking like you do.** It predicts the next word. That's math, not reasoning.
4. **Not a replacement for judgment.** Can draft your SOP; shouldn't pick your career. Can help diagnose a bug; shouldn't sign off on medical decisions.
5. **Not a search engine.** Search finds things that exist. AI *generates* things that sound right. Huge difference — especially for citations.

#### AI in real life — 10 examples already in your pocket

**Consumer:** (1) Netflix/YouTube/Spotify recommendations, (2) Google Maps ETAs + rerouting, (3) Google Photos face + object search, (4) WhatsApp/Instagram translations + auto-captions, (5) Siri/Alexa/Google Assistant.

**Enterprise:** (6) UPI/card fraud detection (HDFC, ICICI, Paytm), (7) Flipkart/Amazon/Myntra recommendations, (8) Gmail spam + smart compose.

**Science:** (9) AlphaFold — solved a 50-year-old protein-folding problem in 2020.

**Creative:** (10) DALL-E / Midjourney / Suno / ElevenLabs — image, music, voice.

**The point:** you were never "starting" with AI today. You've been a user since middle school. Today you start *directing* it.

### Watch (in class, 7 min)

IBM's "What are Large Language Models?" — https://www.youtube.com/embed/iR2O2GPbB0E

Watch for:
- The analogy that unlocks why LLMs feel smart.
- Why "large" is doing more work than "language" in the name.
- One honest limitation Martin Keen names that half the internet ignores.

### Lab · Same prompt, three brains (30 min, pair activity works great)

Three AI tools. One prompt. Spot the personality differences.

> ⚠️ **If you get stuck**
> - *Claude or Gemini asks for a phone number / isn't available in your region* → try a different Google account or use Gemini-in-Search sidebar; if Claude blocks, run a second ChatGPT with "be more creative" framing and note the blocker in your doc.
> - *All three answers look suspiciously similar* → you gave too generic a prompt. Add specifics ("7.8 CGPA", "CSE", "Bengaluru") and re-run.
> - *One site won't load on college Wi-Fi* → mobile hotspot for just that tab.

1. Open all three chat tools. Sign up with your college email if needed.
2. Copy this prompt: *"You are my college placement mentor. I'm a 3rd-year CSE student with a 7.8 CGPA and one internship at a startup. List the 5 highest-leverage things I should do in the next 90 days."*
3. Paste into ChatGPT. Save to a Google Doc under "ChatGPT".
4. Same prompt into Claude. Save under "Claude".
5. Same prompt into Gemini. Save under "Gemini".
6. Compare on three axes: **specificity, tone, length.** Which felt most *useful*? Which felt most *generic*?
7. Write one line at the bottom: *"The model that understood me best was ___ because ___."*

**Artifact**: one Google Doc with three answers + your take. Drop the share link in the cohort channel.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Which of the three models *felt* most human — and why? | Specific model + named behaviour ("Claude hedged before answering") + a guess at why. Not "vibes." |
| Name one place AI has been in your life that you never labelled "AI." | Concrete example + one sentence on what the model's doing under the hood. |
| Name one task you'd still trust a human over any AI for. Defend it. | Concrete task (not "creativity") + concrete reason tied to judgment, stakes, or accountability. |
| Would you rather have today's AI in 2015, or 2015's smartphones in 2025? | Pick one, defend with opportunity cost. |
| If AI is wrong 20% of the time, where in your life is that *already* acceptable, and where is it absolutely not? | Two specific zones + a clear line on what decides it (stakes, reversibility, verifiability). |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate: capture your Day-0 baseline (~20 min)

1. Open a blank text file or Notion page titled **"Day 1 — What surprised me about AI today."**
2. Write **150 words in one paragraph**. **No AI assistance** — this is your honest Day-0 baseline. We'll compare against Day 30.
3. Focus on one specific surprise — a tool behaviour, a tone shift between models, a moment you caught yourself thinking "it actually got me" — not a general "AI is cool" take.
4. Save as `.txt`, `.md`, or export Notion to PDF.

### 2. Reflect (~10 min)

**Prompt:** *"Which of the three models felt most like 'talking to a person' — and what did that tell me about my own biases?"* A good reflection names the specific behaviour that triggered the feeling (hedging, emoji use, follow-up questions) and admits what it reveals about what you expect from a "smart" tool even when you know it's autocomplete. Jot a few lines; keep them for your own record.

### 3. Quiz (~17 min)

Includes transfer scenarios + spaced recall from earlier days (~8+ items total). If a question feels easy, treat it as speed practice.

On the dashboard: day material plus a short scenario and a look-back item from earlier in the arc. Don't overthink — it catches wobbles, not rankings.

### 4. Submit the assignment (~5 min)

Submit your 150-word reflection via the cohort dashboard **before the next class**. One paragraph. No AI-assisted writing. The goal isn't a great essay — it's capturing your honest baseline so Day 30 feels like a transformation, not a memory.

**Peer or self-review:** One line (chat or DM): what changed after someone skimmed your artifact — or the biggest gap if you worked solo.

**Stretch (optional):** Pick one rubric row and over-ship it (extra example, tighter screenshot, or second iteration).


### 5. Deepen (optional, ~30 min)

- **Open Google Photos** and type three non-obvious queries ("red", "laughing", "whiteboard"). Notice what it gets right and misses. Same kind of model family as image tools across the industry.
- **Skim a recent Flipkart or Meesho engineering blog** on recommendations — Indian-scale AI, written by Indian engineers.

### 6. Prep for Day 2 (~40 min — important)

**Tomorrow we open the box.** Day 2 is about how LLMs actually work: tokens, weights, attention. The three words that save you hours once you internalize them.

- [ ] **Skim ahead**: Jay Alammar's "The Illustrated Transformer" intro (just the first section, ~10 min). Link: https://jalammar.github.io/illustrated-transformer/. Don't try to understand it all — skim for vibes.
- [ ] **Think**: why might a model treat "bank" in *"river bank"* differently from *"bank account"*? Bring your guess to Day 2.
- [ ] **Set up**: have today's Google Doc with all three chatbot answers open tomorrow — we'll reference them in Day 2's discussion on why the tools differ.

---

## 📚 Extra / additional references

Optional deep-dives. Pick what interests you; skip what doesn't.

### Short watches

- [IBM — What are LLMs? (7 min)](https://www.youtube.com/watch?v=iR2O2GPbB0E) — the single clearest short explainer.
- [DeepMind — AlphaFold explainer](https://deepmind.google/technologies/alphafold/) — what AI looks like when it's *not* a chatbot.
- Any 3Blue1Brown video on neural networks (YouTube) — beautiful visual intuition for what's inside an LLM.

### Reading

- [Ethan Mollick — One Useful Thing](https://www.oneusefulthing.org/) — a working practitioner's weekly take on AI.
- [Flipkart/Meesho engineering blogs](https://blog.flipkart.net/) — Indian-scale AI, written by Indian engineers.
- [Google Maps — how ETAs work](https://blog.google/products/maps/) — search "ETA" to see how much AI is baked into a "simple" route.

### Play

- Open Google Photos, search by vibes ("laughing", "sunset", "handwritten"). That's a vision model at work.
- Long-press any voice note in WhatsApp → get the transcript. Notice which languages it handles well.
- Ask Siri / Google Assistant something deliberately ambiguous. Watch which of the four trench-coat models (speech recognition, intent classification, LLM, TTS) breaks.

### If you're hungry for a rabbit hole

- Karpathy's "Intro to Large Language Models" (YouTube, 1 hr) — the video most engineers quote. Heavier than Day 1 needs, but you'll come back to it around Week 3.
- Anthropic's "Core Views on AI Safety" blog post — a thoughtful practitioner framing for where risks actually are.
