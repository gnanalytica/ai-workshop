---
reading_time: 14 min
tldr: "AI listens, AI speaks, AI decks. You will ship a 5-slide pitch and a 30-second avatar intro for your capstone today."
tags: ["exposure", "tools"]
video: https://www.youtube.com/embed/KgRGp_MSqNs
lab: {"title": "5-slide deck + 30-second AI-avatar intro for your capstone", "url": "https://gamma.app"}
prompt_of_the_day: "Generate a 5-slide pitch deck for a student capstone: {{project_name}}. Slides: (1) problem — one real user in one sentence, (2) insight — why it has not been solved, (3) solution — how it works in 15 words, (4) demo moment — screenshot placeholder, (5) what I'll build in 4 weeks. Tone: confident, specific, no buzzwords. Audience: AI-curious college peers."
tools_hands_on: [{"name": "Otter", "url": "https://otter.ai"}, {"name": "Gamma", "url": "https://gamma.app"}, {"name": "ElevenLabs", "url": "https://elevenlabs.io"}]
tools_demo: [{"name": "HeyGen", "url": "https://heygen.com"}, {"name": "Whisper (OpenAI)", "url": "https://openai.com/research/whisper"}, {"name": "Napkin AI", "url": "https://napkin.ai"}]
tools_reference: [{"name": "Tome", "url": "https://tome.app"}, {"name": "Canva Magic Design", "url": "https://canva.com"}]
resources: [{"name": "Gamma templates", "url": "https://gamma.app"}, {"name": "ElevenLabs voice library", "url": "https://elevenlabs.io"}]
---

## Intro

Tomorrow you pitch a capstone idea to your peers in two minutes. Today you build the pitch materials and the voice to deliver it. Meetings, decks, voices, avatars — four categories that used to take a week. You will do all four in 45 minutes and still have time for dinner.

> 🧠 **Quick glossary**
> - **Whisper** = OpenAI's open-source speech-to-text model; free, private, runs locally.
> - **Deck-gen** = AI tools (Gamma, Tome) that turn a paragraph into a structured slide deck.
> - **Voice cloning** = generating unlimited speech in a voice from ~30 seconds of reference audio (ElevenLabs).
> - **AI avatar** = a photorealistic talking head synced to generated speech (HeyGen).
> - **Speaker notes** = the off-slide text you say aloud — where detail lives, not on the slide.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Four categories that used to take a week — done in one hour |
| Mini-lecture | 20 min | Otter/Whisper, Gamma + Napkin, ElevenLabs, HeyGen — when and why |
| Live lab     | 20 min | Build a 5-slide deck + record a 30-second AI-avatar intro |
| Q&A + discussion | 15 min | Voice, face, trust — should pitches be labeled as AI? |

**Before class** (~10 min): have a one-paragraph description of your capstone idea ready to feed Otter/Gamma.
**After class** (~30 min tonight): post your 5-slide deck PDF + 30-second MP4 + one-line self-review to the cohort channel.

### In-class moments (minute-by-minute)

- **00:05 — 60-second cold-open pitch**: unmute and pitch your capstone to the person on your left in one breath. No slides, no tools. We are baselining your talking voice before the machines enter.
- **00:15 — Think-pair-share**: in 90 seconds, trade one-paragraph capstone descriptions with a partner and each identify the one sentence that is the real "insight" — the thing a slide-gen tool should anchor on. Most paragraphs have exactly one.
- **00:30 — Live Gamma demo + vote**: I paste one volunteer's paragraph into Gamma on screen. Before it finishes, cohort votes in chat on how many of the 5 slides will violate the "one idea per slide" rule. We count afterward.
- **00:45 — Uncanny-valley debate**: two volunteers play their HeyGen avatars. Cohort votes: "ship it to LinkedIn" or "dial it back." Debate for 3 minutes on where the line lives for student pitches.

## Before class · ~20 min pre-work

### Setup (if needed)
- [ ] Create free accounts on [Otter](https://otter.ai), [Gamma](https://gamma.app), [ElevenLabs](https://elevenlabs.io), and [HeyGen](https://heygen.com) — all four gate output behind email verify.
- [ ] Test your laptop mic by recording a 10-second voice note. ElevenLabs cloning needs clean audio.

### Primer (~5 min)
- **Read**: Skim [Gamma templates](https://gamma.app) — notice how outlines, not slides, drive the layout. You will write an outline tonight, not slides.
- **Watch** (optional): A 3–5 minute demo from the [ElevenLabs voice library](https://elevenlabs.io) showing a voice clone generated from 30 seconds of reference audio.

### Bring to class
- [ ] A one-paragraph description of your capstone idea — the kind you would say to a friend, not a professor. Otter and Gamma both eat paragraphs.
- [ ] Headphones, so voice-synth playback does not wake the hostel.

## Read: Talk, listen, present — all automated

**Transcription: Whisper vs Otter, open vs closed.** The baseline has shifted. In 2026, transcribing any meeting or lecture is effectively free and surprisingly accurate, even in Indian English with code-mixing. Two paths:

| Path | Tool | Strength | Catch |
|------|------|----------|-------|
| Closed SaaS | Otter.ai | Real-time in meetings, auto-summary, speaker labels, action items | Free tier caps minutes per month |
| Open source | Whisper (OpenAI, MIT license) | Free forever, runs locally, private | You run it yourself on Colab or Mac |

Otter is the default for class notes and team meetings. It records, transcribes live, labels speakers, and emits a summary with action items at the end — perfect for group project calls or interviews you conduct for your capstone. Whisper is the power-user path: a single Python command, or drop a file into a Colab notebook, and you get a transcript that rivals paid services. Use Whisper when the audio is sensitive (your interview subject's privacy, a confidential professor chat, a draft you do not want uploaded anywhere).

**Deck-gen: the real speedup in education work.** Gamma, Tome, Beautiful.ai, Decktopus, Plus AI, SlidesGPT — a cluttered category, and all of them are good enough. We teach Gamma because (a) the free tier is generous, (b) its output feels closer to Pitch/Notion than PowerPoint, and (c) it supports one-click export to PPTX and PDF. Feed Gamma a paragraph, and it structures it into slides with layout, images, and speaker notes. The shift in mindset: stop thinking in slides, start thinking in outlines. Write what you want to say, let Gamma decide where the slide breaks go. Then edit.

**Slide design truths that still matter.** AI can generate slides that look professional; it cannot make a bad argument good. Rules:

- One idea per slide. If two ideas share a slide, split them.
- Six words per bullet, max. More words and nobody reads.
- One image per slide. Let it do the emotional work.
- Use speaker notes, not on-slide text, for the details you want to say aloud.
- Numbers beat adjectives. "30% faster" is stronger than "much faster".

**Diagrams from text: Napkin AI.** A hidden gem. Paste a paragraph, Napkin suggests diagrams — flowcharts, funnels, matrices. Drop the best one into your deck. Used well, one Napkin diagram replaces three bullet points.

**Voice synthesis: ElevenLabs.** You can now clone a voice from 30 seconds of audio and generate unlimited speech in it. Ethical rules first: only clone your own voice, or get explicit consent before cloning anyone else's. With that out of the way: ElevenLabs is the best free-tier voice tool in 2026. Use it to narrate your deck, voice an explainer video, or (today) deliver your 30-second capstone intro without recording ten takes. Tips: add punctuation where you want pauses, use capital letters sparingly for emphasis, pick a voice that matches your content (a calm analytical voice for a technical capstone, a warm storytelling voice for a social-impact one).

**AI avatars: HeyGen and friends.** An AI avatar is a photorealistic talking head synced to generated speech. You upload a 2-minute video of yourself (or pick a stock avatar), paste a script, and get a video where "you" say the script. In 2026 the quality is good enough for LinkedIn; it is not yet good enough for broadcast TV. Use cases for a student: pitch intros, LinkedIn explainers, multilingual versions of the same video (record once in English, HeyGen dubs into Hindi, Tamil, Kannada with lipsync). Disclose when you use it.

**The honest meeting stack.** If you do one project meeting per week and transcribe it, by Week 4 you will have a searchable archive of every decision your team made. Combine that with a weekly 10-minute Claude Project summary of "what did we decide this week?" and your team's memory compounds. Teams that do not do this lose 30% of their prior decisions by Week 4. We have seen it every cohort.

**Privacy once more.** Never transcribe a conversation without telling the other people. This is both ethics and, in many jurisdictions, the law. Say it at the top of the call: "I am recording and transcribing this for my notes; let me know if you'd rather I didn't."

## Watch: From blank page to pitch deck in 8 minutes

A live run where we take a one-paragraph capstone idea, generate a deck in Gamma, replace the default diagrams with Napkin, and record a 30-second intro with an ElevenLabs voice and a HeyGen avatar. The whole pipeline, no cuts.

https://www.youtube.com/embed/KgRGp_MSqNs

- Notice the outline-first workflow, never slide-first.
- Watch how Napkin's diagram replaces a wall of bullets.
- See the moment the HeyGen avatar crosses into uncanny — and how to dial it back.

## Lab: Deck + avatar intro

Time: 45 minutes. Artifact: 5-slide deck (PDF) + 30-second MP4.

1. Open https://otter.ai. Record yourself talking for 2 minutes about your capstone idea as if explaining it to a friend. Let Otter transcribe and summarize.
2. Copy Otter's summary. Open https://gamma.app. Click **Generate → from text**. Paste the summary plus today's prompt-of-the-day.
3. Let Gamma produce a draft. Edit it down to exactly 5 slides, one idea each. Enforce the six-words-per-bullet rule.
4. Open https://napkin.ai. For your "solution" slide, paste your solution paragraph and pick one generated diagram. Drop it into Gamma.
5. Write a 90-word script for a 30-second intro. Keep it conversational. Read it aloud once to test rhythm.
6. Open https://elevenlabs.io. Paste the script, pick a voice that matches your tone, generate. Download the MP3.
7. Open https://heygen.com. Pick a stock avatar (or upload yourself if you have consent for yourself, which you do). Paste the same script OR upload the ElevenLabs MP3 as the audio track. Generate a 30-second video.
8. Export Gamma to PDF. Post deck PDF + avatar MP4 to the cohort channel with the tag `#day09-pitch`.

> ⚠️ **If you get stuck**
> - *Gamma generates 11 slides instead of 5* → don't manually delete until you fix the outline. Re-prompt with "compress into exactly 5 slides, one idea each, max 6 words per bullet"; the structure problem is in your input paragraph.
> - *ElevenLabs voice sounds robotic or rushes the punchlines* → add punctuation where you want pauses (commas and periods, even ungrammatical ones), break long sentences into two, and pick a different voice model — "Adam" and "Rachel" handle Indian-English phrasing poorly; try less-default voices.
> - *HeyGen free-tier rejects your upload or caps video length* → skip the custom avatar, pick a stock avatar, and feed it the ElevenLabs MP3 as the audio track. The pitch does not need your face; it needs your idea on time.

## After class · ~30-45 min post-work

### Do (the assignment)
1. Lock your 5-slide Gamma deck — one idea per slide, max six words per bullet — and export as PDF.
2. Record a 30-second avatar or ElevenLabs-voiced intro and export as MP4.
3. Write a one-line self-review: "the weakest slide is slide X because…" — be specific.
4. Submit all three to the cohort Slack channel before 11 pm with the tag `#day09-pitch`.

### Reflect (~5 min)
Prompt: *What did the Otter transcript reveal about how you actually talk about your idea?* A good reflection quotes one verbatim phrase — a filler, a hedge, or a surprisingly confident claim — and names the sentence you will cut before tomorrow's ideathon. The transcript is the cheapest feedback you will get all week; do not waste it.

### Stretch (optional, for the curious)
- **Extra video**: A [HeyGen](https://heygen.com) demo on multilingual dubbing — record once in English, ship in Hindi/Tamil/Kannada with lipsync.
- **Extra read**: The [Whisper (OpenAI)](https://openai.com/research/whisper) research page — know when to run transcription locally for privacy.
- **Try**: Generate the same deck in [Tome](https://tome.app) or [Canva Magic Design](https://canva.com) from the same paragraph. Notice which tool's defaults survive your edits.

## Quiz

Four checks. Which tool would you pick for transcribing a private interview with a professor about a sensitive research topic? What is the single most common mistake in AI-generated decks (hint: a layout rule)? When is it okay to clone a voice in ElevenLabs? What should you always say at the start of a meeting you are recording?

## Assignment

Post to the cohort Slack:

1. Your 5-slide deck as a PDF.
2. Your 30-second AI-avatar (or ElevenLabs-voiced) intro as an MP4.
3. A one-line self-review: "the weakest slide is slide X because…".

This is your final warm-up before tomorrow. Your deck is not locked yet — after the ideathon you will likely rebuild slide 5. That is fine.

## Discuss: Voice, face, and trust

| Prompt | What a strong answer sounds like |
|---|---|
| Did your AI voice feel like you, like a stranger, or like a polished version of you? | Describes a specific phoneme, pause, or emotional register that did or did not transfer. Takes a position on whether "polished you" is still you for the purposes of a pitch. |
| Was the avatar video helpful, or did it feel dishonest? | Weighs the production value against the audience's reasonable expectations. Strong answers name the channel (LinkedIn vs. demo day vs. cold email) because the honesty bar moves with context. |
| Should AI-generated pitches be labeled at cohort demo day? What is the norm we want? | Proposes a concrete rule (a tag, a disclosure line, a time threshold) rather than "it depends." Anticipates the edge case — what about a deck written with AI but delivered live by a human? |
| Which one of today's tools will you still use in a year? | Names one tool and a specific recurring workflow where it saves you ≥2 hours per week. Also names one tool you think will be absorbed into a bigger suite and become irrelevant. |
| What did Otter's transcript reveal about how you talk about your own idea? | Quotes one verbatim phrase you actually used (filler, hedge, confident claim) and what it exposed about your conviction. Names the sentence you will cut from your pitch tomorrow. |

## References

### Pre-class primers
- [Gamma templates](https://gamma.app) — outline-first thinking, not slide-first.
- [ElevenLabs voice library](https://elevenlabs.io) — pick a voice that matches your content's tone.

### Covered during class
- [Otter](https://otter.ai), [Gamma](https://gamma.app), [ElevenLabs](https://elevenlabs.io) — hands-on transcription, deck-gen, voice.
- [HeyGen](https://heygen.com), [Whisper (OpenAI)](https://openai.com/research/whisper), [Napkin AI](https://napkin.ai) — demoed for avatars, private transcription, and text-to-diagram.

### Deep dives (post-class)
- [Tome](https://tome.app) — an alternative deck-gen with a different default aesthetic.
- [Canva Magic Design](https://canva.com) — when you need brand-kit consistency on top of AI output.
