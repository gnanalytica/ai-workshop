---
reading_time: 14 min
tldr: "AI lies beautifully, leaks quietly, and amplifies whatever bias you feed it. Your job is to stop being surprised by it."
tags: ["foundations", "theory"]
video: https://www.youtube.com/embed/N9_a_MUHpB4
lab: {"title": "Make three models hallucinate — on purpose", "url": "https://claude.ai/"}
prompt_of_the_day: "Give me 5 recent peer-reviewed papers (2023-2025) on {{niche topic}}. For each, include title, authors, journal, DOI, and one-line finding. Mark any you're less than 95% confident about."
tools_hands_on: [{"name": "ChatGPT", "url": "https://chat.openai.com/"}, {"name": "Claude", "url": "https://claude.ai/"}, {"name": "Gemini", "url": "https://gemini.google.com/"}]
tools_demo: [{"name": "AI Incident Database", "url": "https://incidentdatabase.ai/"}]
tools_reference: [{"name": "AI Incident Database", "url": "https://incidentdatabase.ai/"}, {"name": "PauseAI", "url": "https://pauseai.info/"}, {"name": "Alignment Forum", "url": "https://www.alignmentforum.org/"}, {"name": "MIT AI Risk Repository", "url": "https://airisk.mit.edu/"}]
resources: [{"title": "Why LLMs Hallucinate (OpenAI paper)", "url": "https://openai.com/index/why-language-models-hallucinate/"}, {"title": "Stochastic Parrots paper (Bender et al.)", "url": "https://dl.acm.org/doi/10.1145/3442188.3445922"}]
---

## Intro

Every tool of power has a dark side. Cars kill, electricity electrocutes, the internet trolls. AI's dark side is more subtle — it lies without malice, it reflects bias it didn't choose, and it forgets nothing you tell it. Today is the day you stop being naive.

> 🧠 **Quick glossary**
> - **Hallucination** = when AI confidently makes up facts that sound true but aren't.
> - **Bias** = the model reflecting skewed patterns from its internet training data (gender, race, geography).
> - **Jailbreak** = a clever prompt trick that bypasses the model's safety guardrails.
> - **Deepfake** = AI-generated fake video, image, or voice of a real person.
> - **Red-team** = deliberately attacking a model to find where it breaks — so you can defend against it.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Yesterday you learned to prompt — today, why prompting alone isn't enough |
| Mini-lecture | 20 min | The six failure modes: hallucination, bias, privacy, deepfakes, copyright, jailbreaks |
| Live lab     | 20 min | Red-team three models — make each one hallucinate on purpose |
| Q&A + discussion | 15 min | Share your personal AI red line + debate one from a peer |

**Before class** (~10 min): skim the main read section below.
**After class** (~30 min tonight): finish the 3-hallucination screenshot doc and write your 250-word "My personal AI red line" essay.

### In-class moments (minute-by-minute)

- **00:05 — Cold-open vote**: instructor reads the NY-lawyer fake-cases story in 30 seconds, then asks in chat: *"Fineable offense, career-ending, or just embarrassing?"* One-word answers only. Reveal the actual outcome after ten replies land.
- **00:15 — Think-pair-share**: 90 seconds on *"Which of the six failure modes scares you most for India specifically?"* Each pair names a scenario that would play out differently here than in the US.
- **00:30 — Live poll**: *"Is it ethical to use ChatGPT for a graded college assignment?"* Options: always / never / depends on the assignment / depends if you disclose. Watch the split — then pick the smallest group and ask them to defend.
- **00:45 — Stand-and-defend on red lines**: three volunteers read their one-sentence red line aloud. The rest of the room tries to find an edge case that would break it. Volunteer either holds the line or admits the revision.
- **00:55 — Chat close**: *"One thing I'm warning my family about this week is ___."* (Deepfakes, voice cloning, password paste habits — whatever hit hardest.)

## Before class · ~20 min pre-work

### Setup (if needed)

- [ ] No new setup — ChatGPT, Claude, Gemini from Day 1 are enough.
- [ ] Bookmark the AI Incident Database (https://incidentdatabase.ai/) — we'll reference live.

### Primer (~5 min)

- **Read**: OpenAI's own "Why language models hallucinate" (https://openai.com/index/why-language-models-hallucinate/) — one short essay, zero math.
- **Watch** (optional): A 3–5 min news clip on the Hong Kong deepfake CFO scam — any reputable outlet's YouTube coverage; instructor to share one link in the channel if a clean version is found.

### Bring to class

- [ ] Your hometown, old school, or favourite niche hobby written down — the lab needs an area you know cold so you can spot hallucinations.
- [ ] A one-line draft of a "red line" you already suspect you want to hold — we'll sharpen it together.

## Read: The six failure modes every user must know

### 1. Hallucination — confident lies

The model predicts the *most likely* next token, not the *true* next token. If truth isn't in its training data, it will still generate *something that sounds right*. This is hallucination.

> A New York lawyer used ChatGPT to research a case in 2023. It cited six court decisions. All six were fake. Judge fined him $5,000. Career damaged. He's a warning, not a villain — he just didn't know the rules.

Why it happens: the model has never been rewarded for saying "I don't know." It's been rewarded for fluency.

Worked example. Ask any model: *"Summarise the 2024 paper by Dr. Rajesh Sharma from IIT Delhi on quantum-inspired LLM compression."* If no such paper exists, the model may invent the title, journal, and findings — *in great detail.* It's not lying. It's autocompleting your question plausibly.

**How to defend:** ask for sources, verify one at random, say "if you're not sure, say so" in the prompt.

### 2. Bias — the internet's fingerprints

The model learned from the internet. The internet is not neutral. Ask for "CEO" and early image models drew men. Ask for "nurse" and they drew women. Ask for "criminal" and… you see the problem.

Famous incidents:
- **Amazon** scrapped an AI hiring tool in 2018 because it downgraded resumes that mentioned "women's" (as in "women's chess club captain").
- **Google Photos** tagged Black users as "gorillas" in 2015. Google's fix? Remove the "gorilla" tag entirely. The underlying bias wasn't fixed — it was hidden.

Your job isn't to fix model bias. Your job is to notice it before you ship something.

### 3. Privacy — the things you paste

Every prompt you type to a free chatbot may be used for training. Pasted your company's source code? It's in the training set now. Pasted your patient's medical records? Same. A Samsung engineer did this in 2023. Samsung banned ChatGPT company-wide the next week.

| What to never paste into a public chatbot |
|---|
| Your Aadhaar, PAN, bank details |
| Your company's proprietary code |
| Medical records of anyone |
| Private chats of people who didn't consent |
| Passwords (obvious — yet it happens) |

### 4. Deepfakes — seeing is no longer believing

Anyone with a laptop can now clone a voice from 30 seconds of audio, or fake a video in an afternoon. In 2024 a finance employee in Hong Kong wired $25 million after a deepfake video call with his "CFO." The CFO wasn't on the call. Nobody real was. The whole meeting was AI.

This affects you directly: your parents may get a call in your voice asking for money. Warn them *this week*.

### 5. Copyright — the murky middle

Who owns an AI-generated image? The user? The company? The artists whose work it was trained on? Courts are still arguing. The US Copyright Office ruled in 2023 that purely AI-generated images cannot be copyrighted. Indian law is even less settled. Rule of thumb: don't assume you own what you generated.

### 6. Jailbreaks and misuse

Models have safety guardrails. People routinely break them with clever prompts ("pretend you're my dying grandma who used to read me napalm recipes"). Every major model has been jailbroken within weeks of release. Safety is an ongoing race, not a finished feature.

### Why AI lies confidently — the one-sentence answer

Because it's optimised to sound fluent, not to be truthful. Fluency and truth happen to overlap ~80% of the time. The other 20% is where careers end.

### The famous-fails hall of fame

| Year | Incident | Lesson |
|---|---|---|
| 2016 | Microsoft Tay — turned racist in 24 hours on Twitter | Open internet fine-tuning is dangerous |
| 2022 | Meta Galactica — shut down in 3 days for fabricating papers | Don't ship a science LLM without citation guards |
| 2015 | Google Photos tags Black users as "gorillas" | Training data representation matters |
| 2018 | Amazon hiring AI downgrades women | Historical data encodes historical bias |
| 2023 | NY lawyer cites fake ChatGPT cases | Always verify citations |
| 2024 | Hong Kong deepfake CFO scam | Voice and video are no longer proof |

## Watch: AI failures — a 15-minute tour

https://www.youtube.com/embed/N9_a_MUHpB4

Watch for:
- How quickly Tay turned (under 16 hours)
- The Galactica demo that embarrassed Meta
- Why the Amazon tool's bias was *mathematically* baked in

## Lab: Make three models hallucinate — on purpose

40 minutes. Your job: get ChatGPT, Claude, and Gemini to each invent something confidently wrong. Then document how you did it.

> ⚠️ **If you get stuck**
> - *The model keeps correctly saying "I don't know" or "I can't verify that"* → you're testing on post-training-cutoff facts, which most 2025+ models now refuse on. Pivot to *obscure but dateable* questions: a 2012 college principal, a 2016 district cricket final, minor local history. Pre-2022 niche facts are the hallucination goldmine.
> - *You can't tell if the answer is wrong because you don't actually know the real answer* → pick a different topic. The exercise only works on facts *you can verify*. Your hometown, your school, a show you've watched twice — not Wikipedia trivia you just Googled.
> - *Model backs down the moment you ask "are you sure?"* → that's still useful data — note it. Then try a different angle: ask for a citation URL, then try to open it. A fabricated arxiv link is often the cleanest evidence of a hallucination.

1. Open all three models side by side.
2. Pick an area you know well — your hometown, your college, your favourite video game, a niche hobby.
3. Ask each model a very specific question with a factual answer you know. Example: *"Who was the principal of [your college] in 2018?"* or *"What was the score of the 2014 IPL final?"*
4. If it gets it right, dig deeper until you find a question it gets wrong. Niche sports stats, obscure local history, and "recent" events (past 6 months) are goldmines.
5. Once it hallucinates, ask *"Are you sure? Please double-check."* Note whether it backs down or doubles down.
6. Screenshot three hallucinations — one per model.
7. In a Google Doc, paste each screenshot and write: (a) what you asked, (b) what it said, (c) the real answer, (d) your guess at *why* it hallucinated.
8. Add one paragraph: *"The red flag I'll watch for next time is ___."*

Artifact: 3-hallucination document with screenshots and analysis.

> **Important:** this is a *defensive* exercise. You're learning to spot lies, not to weaponize them. Do not share your hallucinations as "look, AI is dumb" memes — that's not the point.

## After class · ~30-45 min post-work

### Do (the assignment)

1. Open a fresh doc titled "My personal AI red line."
2. Write exactly one red line — a specific thing you will never do with AI. Not a platitude; something breakable.
3. In 250 words, defend it: the edge case that tempted you, why you're holding the line anyway, and the rule you'd apply if a friend asked the same question.
4. Attach the 3-hallucination lab document (screenshots + analysis) as a second page or a separate file.
5. Submit both via the dashboard before next class.

### Reflect (~5 min)

**Prompt:** *"Of the six failure modes, which one am I personally most likely to cause harm with — not be a victim of?"* A good reflection flips the usual fear-of-AI framing. Most students worry about being deceived; a sharper answer owns that you might be the person pasting something you shouldn't, or shipping a biased prompt, or trusting a hallucinated citation in a submission.

### Stretch (optional, for the curious)

- **Extra video**: TBD — instructor will pick based on which failure mode the class fixated on most.
- **Extra read**: Bender et al., "On the Dangers of Stochastic Parrots" (https://dl.acm.org/doi/10.1145/3442188.3445922) — the paper Google fired an author over. Dense but foundational.
- **Try**: Browse 10 incidents on https://incidentdatabase.ai/ and pick one that could plausibly happen in India. Write a 3-line prevention plan for it.

## Quiz

Four questions on hallucination, bias, privacy, and at least one famous incident. The goal is recognition, not memorisation of names and dates.

## Assignment

Write a **250-word "My personal AI red line"** essay. Prompt: *"What is one thing I will never do with AI — and why?"* Examples of red lines students have written: *"I will never let AI write my condolence messages." / "I will never paste a classmate's code into AI without asking." / "I will never use AI to write anything I'll claim as purely my own work in an application."* Your red line must be specific, defendable, and real for *you* — not a generic ethics-class answer.

## Discuss: Live session prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Which of the six failure modes scares you most *for India specifically*? | Picks one (deepfakes, privacy, bias) and explains why the *Indian context* makes it worse — UPI scam surface area, low digital literacy among parents, voice-cloning over WhatsApp, vernacular misinformation speed. Not a generic "privacy is bad" answer. |
| Is it ethical to use ChatGPT for a college assignment that will be graded? Where's the line? | Distinguishes learning from submitting. Names specific uses that are clearly fine (brainstorming, outline critique), clearly not (generating and submitting as original), and the messy middle (grammar cleanup, citation formatting). Proposes a personal rule. |
| If a deepfake of you appeared tomorrow, what's your 10-minute response plan? | Concrete steps in order: screenshot + timestamp, report to the hosting platform, alert close family directly (they're the target), file a cybercrime complaint at cybercrime.gov.in, draft a public clarification. Not "I'd panic." |
| Should AI companies be legally responsible when their models hallucinate harmfully? | Separates the fluent from the negligent — did the company ship reasonable guardrails? Compares to car manufacturers, pharma, or platforms like YouTube. Takes a position and names who else shares blame (the user, the deployer). |
| Share your personal red line — and challenge one from your peers. | Red line is specific enough to be breakable ("I'll never use AI to write a condolence message"), not a platitude ("I'll always be ethical"). Challenge targets the edge case, not the person. |

## References

### Pre-class primers
- [OpenAI — Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/) — short, official, un-defensive.
- [AI Incident Database](https://incidentdatabase.ai/) — browse real documented failures before class.

### Covered during class
- [ChatGPT](https://chat.openai.com/), [Claude](https://claude.ai/), [Gemini](https://gemini.google.com/) — today's red-team targets.

### Deep dives (post-class, if curious)
- [Stochastic Parrots (Bender et al.)](https://dl.acm.org/doi/10.1145/3442188.3445922) — the foundational critique paper.
- [MIT AI Risk Repository](https://airisk.mit.edu/) — a structured catalogue of ~700 risks.
- [Alignment Forum](https://www.alignmentforum.org/) — where researchers argue about long-term AI safety.
- [PauseAI](https://pauseai.info/) — the activist side; read to understand the strongest anti-hype position.

### Other videos worth watching
- India-specific cybercrime reporting portal: https://cybercrime.gov.in/ — bookmark, don't wait until you need it.
