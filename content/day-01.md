---
reading_time: 12 min
tldr: "AI is already running your life — Netflix picks, Maps routes, UPI fraud flags, WhatsApp translations. Today you notice it. Tomorrow we open the box."
tags: ["foundations", "kickoff"]
video: https://www.youtube.com/embed/iR2O2GPbB0E
lab: {"title": "Same prompt, three brains", "url": "https://chat.openai.com/"}
prompt_of_the_day: "You are my {{subject}} TA. Explain {{topic}} to a 3rd-year college student in 5 bullets, one analogy from hostel life, and one mistake students usually make."
tools_hands_on: [{"name": "ChatGPT", "url": "https://chat.openai.com/"}, {"name": "Claude", "url": "https://claude.ai/"}, {"name": "Gemini", "url": "https://gemini.google.com/"}]
tools_demo: []
tools_reference: [{"name": "IBM — What are LLMs?", "url": "https://www.youtube.com/watch?v=iR2O2GPbB0E"}, {"name": "DeepMind AlphaFold", "url": "https://deepmind.google/technologies/alphafold/"}]
resources: [{"title": "Ethan Mollick — One Useful Thing", "url": "https://www.oneusefulthing.org/"}]
---

## Intro

Pause for a second. You think today is the day you "learn AI." It isn't. AI has been running your life for years — you just never noticed.

- Netflix knows you'll watch that next episode before you do.
- Google Maps rerouted you around a jam you couldn't see.
- HDFC's fraud system blocked the ₹40k swipe in Bangkok you didn't make.
- Flipkart sold you the cable that was *"frequently bought together"* with your charger.
- Google Photos tagged your grandmother across 12 years of blurry pictures.
- WhatsApp translated your cousin's Hindi voice note into English when you long-pressed.

That's AI. Not the chatbot — the *invisible* AI. The chatbot just made it visible.

The next 30 days are about closing one specific gap: you've *used* AI every day; you've never *directed* it. By Day 30, you will have built and demoed your own AI-powered thing. Let's go.

> 🧠 **Quick glossary**
> - **AI** = the umbrella term for any system that mimics a thinking task.
> - **LLM** (Large Language Model) = AI trained on text. ChatGPT, Claude, Gemini are LLMs.
> - **Chatbot** = the app wrapper around an LLM (e.g., the ChatGPT website wraps the GPT model).
> - **Hallucination** = when AI confidently makes up facts. More on this Day 4 and across the workshop.
> - **Prompt** = whatever you type to the AI. Day 4 is a whole session on this.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Welcome + course tour | 10 min | Roadmap + what demo day looks like |
| Mini-lecture: What AI is vs isn't + AI in real life | 20 min | The 5+5 split + 10 real examples |
| Live lab: 3 tools, 1 prompt | 15 min | We do task 1 together, you finish the rest |
| Q&A + discussion | 15 min | Bring questions and observations |

**Before class** (10 min): skim the 30-day roadmap table below so you know where we're going.
**After class** (~30 min tonight): finish the 3-chatbot lab + write your 150-word reflection.

### In-class moments (minute-by-minute)

- **00:05 — Fist-of-5 on AI confidence**: on camera, hold up 1–5 fingers for "how confident am I I actually understand what's inside ChatGPT." Instructor calls on one 5 and one 1 for a sentence each. Sets the honesty baseline.
- **00:15 — Spot-the-AI round**: in chat, each student drops *one* place AI showed up in their day yesterday that they didn't label as AI at the time. Instructor reads the three most surprising.
- **00:30 — Live poll**: launch a poll — *"Which felt most human: ChatGPT / Claude / Gemini / 'they all felt the same'?"* Watch the bars move, call out whichever option shocks you, ask one voter on each side to defend their pick.
- **00:45 — Pick-a-corner debate**: "AI is overhyped" — agree (left side of Zoom gallery), disagree (right side), unsure (middle). Two volunteers per side, 45 seconds each, no slides. Instructor keeps time hard.
- **00:55 — One-line close**: every student drops one sentence in chat: *"The thing I'll remember from today is ___."* No editing, no deleting.

## Before class · ~20 min pre-work

### Setup (if needed)

- [ ] Create free accounts on ChatGPT, Claude, and Gemini using your college email (all three free tiers are enough for today).
- [ ] Spend 2 minutes scrolling your phone noticing anything you've used in the last week that's *probably* AI (photo search, voice typing, spam filter, Spotify mix, Swiggy recommendation). Make a mental list.

### Primer (~5 min)

- **Watch** (optional): IBM's "What are Large Language Models?" (7 min) — https://www.youtube.com/watch?v=iR2O2GPbB0E — same video we use in class, pre-watching lets you ask sharper questions.
- **Read**: Ethan Mollick's most recent post at https://www.oneusefulthing.org/ — pick any one. Goal is to see how a working practitioner talks about AI weekly. You don't have to understand every reference.

### Bring to class

- [ ] A short "test question" from your own life you want to ask all three chatbots (a placement worry, a study problem, a hostel dilemma — not a riddle).
- [ ] Laptop + stable internet + one browser window with three tabs ready.

## Read: Welcome — here's what the next 30 days look like

**Your mission on day 30**: stand on a stage (or Google Meet) and demo a thing *you* built with AI. Not a slide about AI. A live thing.

Here's how we get there:

| Week | Theme | What you walk away with |
|---|---|---|
| 1 · Foundations | What AI is, what's inside it, which tool fits which job | A mental model + a prompt library + a personal AI stack |
| 2 · Exposure | Hands-on with every flavor of AI tool | Your capstone problem picked |
| 3 · Think & Tell | Design thinking for your capstone | A 1-page spec + wireframes of what you'll build |
| 4 · Dev + AI Build | GitHub, RAG, local models, context engineering | Confidence to direct AI to build things for you |
| 5 · Build, Ship, Agentic | Vibe-coding, deploying, agents, swarms | A live URL of your capstone v0 |
| 6 · Launch | Ethics, benchmarks, polish, demo | A shipped capstone, a certificate, a portfolio page |

Two checkpoints you'll hear a lot about:
- **Day 10** — you lock in the one problem you'll build.
- **Day 30** — you demo it live.

Everything in between is scaffolding to get you there.

## Read: What AI is — and what AI isn't

Half your peers will quote Elon Musk about AI destroying the world. The other half will claim AI wrote an entire Flipkart clone for them in 2 hours. Both are lying (or confused). Here's the actual shape.

### What AI **is** ✓

1. **A pattern machine.** It saw trillions of sentences, articles, and codebases, and now finishes *your* sentences by matching patterns — including ones you haven't explicitly given it.
2. **A brilliant, under-slept intern.** Fast, creative, knows a little about everything, occasionally makes things up with total confidence.
3. **A force multiplier.** You can now do in 1 hour what used to take 1 week — if you know how to direct it.
4. **Already everywhere.** Maps, Netflix, UPI fraud detection, Gmail spam, Instagram feed ranking — AI has been shipping to you for a decade.
5. **Stateless by default.** Every chat starts fresh. It does not remember you unless the app specifically gives it memory (ChatGPT memory, Claude Projects, etc.).

### What AI **isn't** ✗

1. **Not conscious.** No feelings, no awareness, no desires. It doesn't "want" anything. Charming responses are patterns, not personhood.
2. **Not always right.** Current models are confidently wrong 15–30% of the time depending on the task. This is called *hallucination*. Always verify on anything that matters.
3. **Not thinking like you do.** It predicts the next word. That's math, not reasoning. Sometimes the math *looks* like reasoning. That's useful, not deep.
4. **Not a human replacement for judgment.** It can draft your SOP but shouldn't pick your career. It can help diagnose a bug but shouldn't sign off on medical decisions.
5. **Not a search engine.** Search finds things that exist. AI *generates* things that sound right. Huge difference — especially when you ask for citations.

## Read: AI in real life — 10 examples already in your pocket

Before we talk about ChatGPT, let's respect the AI that's been quietly doing work for you. Here's the landscape by category.

### Consumer AI (the stuff on your phone)

1. **Netflix / YouTube / Spotify recommendations** — a model ranks 100,000 titles every time you open the app, based on your last 50 clicks + what "people like you" watched.
2. **Google Maps ETAs + rerouting** — combines real-time traffic, historical patterns, and your route to predict when you'll arrive. The shortcut it suggested this morning? That was AI.
3. **Google Photos face + object search** — type "beach 2019" and it finds the photos. That's a vision model trained on billions of images.
4. **WhatsApp / Instagram translations + auto-captions** — long-press a voice note, get the transcript. Long-press a Spanish Reel, get English subs. Both are AI models running in milliseconds.
5. **Voice assistants** — Siri, Alexa, Google Assistant. Speech → text → LLM → text → speech. Four models in a trench coat.

### Enterprise AI (the stuff making companies money)

6. **UPI / card fraud detection** — HDFC, ICICI, Paytm all run AI models on every transaction. The one that blocks a suspicious swipe before you even notice is an anomaly-detection model running in under 50ms.
7. **Flipkart / Amazon / Myntra recommendations** — "Customers also bought," "Inspired by your browsing" — every one of those shelves is an AI model choosing from crores of products.
8. **Gmail spam + smart compose** — your inbox is 97% spam-free because of a filter trained on billions of messages. The "did you mean to say..." is the same family of model as ChatGPT.

### Science AI (the stuff changing what humans can do)

9. **AlphaFold (DeepMind)** — predicts the 3D shape of proteins. Solved a 50-year-old biology problem in 2020. Already accelerating drug discovery for malaria, TB, and antibiotic resistance — diseases that matter in India.

### Creative AI (the new stuff)

10. **DALL-E / Midjourney / Suno / ElevenLabs** — image generators, music generators, voice cloners. The Instagram Reel with the "AI cover" of an old song? That was Suno. The ad voice that sounds uncannily real? Probably ElevenLabs.

**The point:** you were never "starting" with AI today. You've been a user since middle school. Today you start *directing* it.

> *Tomorrow we open the box — how LLMs actually work. Tokens, weights, attention: the three words that save you hours.*

## Watch: IBM's "What are Large Language Models?" (7 min)

IBM's Martin Keen draws on a whiteboard and explains LLMs without a single buzzword. If you want just one video on Day 1, this is it. Short, clear, no hype.

https://www.youtube.com/embed/iR2O2GPbB0E

Watch for:
- The analogy that unlocks why LLMs feel smart
- Why "large" is doing more work than "language" in the name
- One honest limitation he names that half the internet ignores

## Lab: Same prompt, three brains (30 min, optionally in pairs)

Three AI tools. One prompt. Spot the personality differences. Works great as a pair activity — one person drives, one observes, swap halfway.

> ⚠️ **If you get stuck**
> - *Claude or Gemini asks for a phone number / isn't available in your region* → sign in with a different Google account or use the Gemini-in-Google-Search sidebar; if Claude still blocks, skip to a second ChatGPT run with temperature nudged via "be more creative" phrasing and note the blocker in your doc.
> - *All three answers look suspiciously similar* → you probably gave a very generic prompt. Add one specific detail ("7.8 CGPA", "CSE", "Bengaluru") and re-run — personality gaps show up when there's something to personalise to.
> - *One of the sites won't load on your college Wi-Fi* → switch to mobile hotspot for just that tab. Some campus firewalls block one chatbot but not the others.

1. Open all three chat tools from the "Hands-on" box above. Sign up with your college email if needed — free tiers are enough.
2. Copy this prompt exactly: *"You are my college placement mentor. I'm a 3rd-year CSE student with a 7.8 CGPA and one internship at a startup. List the 5 highest-leverage things I should do in the next 90 days."*
3. Paste into ChatGPT. Save the reply in a Google Doc labelled "ChatGPT".
4. Same prompt into Claude. Save under "Claude".
5. Same prompt into Gemini. Save under "Gemini".
6. Compare the three replies on three axes: **specificity, tone, length.** Which felt most *useful*? Which felt most *generic*?
7. Write one line at the bottom: *"The model that understood me best was ___ because ___."*

**Artifact**: one Google Doc with three answers + your take. Drop the share link in the cohort channel.

## After class · ~30-45 min post-work

### Do (the assignment)

1. Open a blank text file or Notion page titled "Day 1 — What surprised me about AI today."
2. Write 150 words in one paragraph. No AI assistance — this is your honest Day 0 baseline.
3. Focus on one specific surprise — a tool behaviour, a tone shift between models, a moment you caught yourself thinking "it actually got me" — not a general "AI is cool" take.
4. Save as `.txt`, `.md`, or export Notion to PDF.
5. Submit via the cohort dashboard before the next class.

### Reflect (~5 min)

**Prompt:** *"Which of the three models felt most like 'talking to a person' — and what did that tell me about my own biases?"* A good reflection names the specific behaviour that triggered the feeling (hedging, emoji use, follow-up questions) and admits what it reveals about what you expect from a "smart" tool — even when you know it's autocomplete.

### Stretch (optional, for the curious)

- **Extra watch**: Any DeepMind AlphaFold explainer on YouTube — see what AI looks like when it's *not* a chatbot.
- **Extra try**: Open your Google Photos search bar and type three non-obvious queries ("red", "laughing", "whiteboard"). Notice what it gets right and what it misses. That's the same kind of model family powering image tools across the industry.

## Quiz

Four quick questions on what's AI / what's not, real-world examples you just met, and the difference between a "chatbot" and the "model" behind it. Don't overthink. The quiz is here to catch wobbles, not rank you.

## Assignment

Write a 150-word reflection titled *"What surprised me about AI today."* One paragraph. **No AI-assisted writing** (we'll know — you'll know). Submit as a text file or Notion page via the dashboard.

The goal isn't a great essay. It's capturing your honest baseline so Day 30 feels like a transformation, not a memory.

## Discuss: Live session prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Which of the three models *felt* most human to you — and why do you think that is? | Specific model name + a named behaviour ("Claude hedged before answering", "Gemini kept citing links") + a guess at why (training style / system prompt / personality choices). Not just "vibes." |
| Name one place AI has been in your life for years that you never labelled "AI" until today. | A concrete example (Google Maps rerouting, Gmail spam filter, Instagram feed ranking) with one sentence on what the model is actually doing under the hood. Shows you saw past the "chatbot = AI" shortcut. |
| Name one task you'd still trust a human over any AI for, and defend it. | A concrete task (not "creativity") + a concrete reason tied to judgment, stakes, or accountability — e.g., "picking which grandparent goes into hospice care; AI has no skin in the game." |
| Would you rather have today's AI in 2015 or 2015's smartphones in 2025? | Picks one and defends with opportunity cost — what would you have done between 2015 and 2025 with current AI? Or, what would you *lose* giving up today's smartphones? |
| If AI is wrong 20% of the time, where in your life is that *already* acceptable, and where is it absolutely not? | Two specific zones with a clear line between them. "Brainstorming gift ideas: fine. Drug dosage for my dog: never." Shows awareness that stakes, reversibility, and verifiability decide the line. |

## References

### Pre-class primers
- [IBM: What are LLMs? (7 min)](https://www.youtube.com/watch?v=iR2O2GPbB0E) — the single clearest short explainer.
- [Ethan Mollick — One Useful Thing](https://www.oneusefulthing.org/) — how a working practitioner talks about AI weekly.

### Covered during class
- [ChatGPT](https://chat.openai.com/), [Claude](https://claude.ai/), [Gemini](https://gemini.google.com/) — the three chat tools in today's lab.

### Deep dives (post-class, if curious)
- [DeepMind AlphaFold](https://deepmind.google/technologies/alphafold/) — what AI looks like when it's solving biology, not writing tweets.
- [Google Maps — how ETAs work](https://blog.google/products/maps/) — search "ETA" on the Maps blog to see how much AI is baked into a "simple" route.

### Other reads worth a bookmark
- Any Flipkart/Meesho engineering blog post on recommendations — Indian-scale AI, written by Indian engineers, free.
