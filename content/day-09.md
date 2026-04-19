---
reading_time: 14 min
tldr: "AI listens, AI speaks, AI decks. You will ship a 5-slide pitch and a 30-second avatar intro for your capstone today."
tags: ["exposure", "tools"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "5-slide deck + 30-second AI-avatar intro for your capstone", "url": "https://gamma.app"}
prompt_of_the_day: "Generate a 5-slide pitch deck for a student capstone: {{project_name}}. Slides: (1) problem — one real user in one sentence, (2) insight — why it has not been solved, (3) solution — how it works in 15 words, (4) demo moment — screenshot placeholder, (5) what I'll build in 4 weeks. Tone: confident, specific, no buzzwords. Audience: AI-curious college peers."
tools_hands_on: [{"name": "Otter", "url": "https://otter.ai"}, {"name": "Gamma", "url": "https://gamma.app"}, {"name": "ElevenLabs", "url": "https://elevenlabs.io"}]
tools_demo: [{"name": "HeyGen", "url": "https://heygen.com"}, {"name": "Whisper (OpenAI)", "url": "https://openai.com/research/whisper"}, {"name": "Napkin AI", "url": "https://napkin.ai"}]
tools_reference: [{"name": "Tome", "url": "https://tome.app"}, {"name": "Canva Magic Design", "url": "https://canva.com"}]
resources: [{"name": "Gamma templates", "url": "https://gamma.app"}, {"name": "ElevenLabs voice library", "url": "https://elevenlabs.io"}]
---

## Intro

Tomorrow you pitch a capstone idea to your peers in two minutes. Today you build the pitch materials and the voice to deliver it. Meetings, decks, voices, avatars — four categories that used to take a week. You will do all four in 45 minutes and still have time for dinner.

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

https://www.youtube.com/embed/VIDEO_ID <!-- TODO: replace video -->

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

## Quiz

Four checks. Which tool would you pick for transcribing a private interview with a professor about a sensitive research topic? What is the single most common mistake in AI-generated decks (hint: a layout rule)? When is it okay to clone a voice in ElevenLabs? What should you always say at the start of a meeting you are recording?

## Assignment

Post to the cohort Slack:

1. Your 5-slide deck as a PDF.
2. Your 30-second AI-avatar (or ElevenLabs-voiced) intro as an MP4.
3. A one-line self-review: "the weakest slide is slide X because…".

This is your final warm-up before tomorrow. Your deck is not locked yet — after the ideathon you will likely rebuild slide 5. That is fine.

## Discuss: Voice, face, and trust

- Did your AI voice feel like you, like a stranger, or like a polished version of you?
- Was the avatar video helpful, or did it feel dishonest?
- Should AI-generated pitches be labeled at cohort demo day? What is the norm we want?
- Which one of today's tools will you still use in a year?
- What did Otter's transcript reveal about how you talk about your own idea?
