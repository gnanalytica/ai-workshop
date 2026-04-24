---
day: 24
date: "2026-06-03"
weekday: "Wednesday"
week: 5
topic: "Text2Audio, Text2Video"
faculty:
  main: "Jayasaagar"
  support: "Sanjana"
reading_time: "10 min"
tldr: "Type a sentence, get a voice. Type a paragraph, get a 10-second video. Today you ship a 30-second pitch reel for your capstone — narrated in your own voice clone, with a HeyGen avatar and a Veo3 b-roll."
tags: ["multimedia", "audio", "video", "elevenlabs", "heygen"]
software: []
online_tools: ["HeyGen", "Higgsfield", "Veo3", "ElevenLabs"]
video: "https://www.youtube.com/embed/xHZ3kfzP6YY"
prompt_of_the_day: "Write a 30-second pitch script for my capstone aimed at first-year Indian college students. Plain English, one specific story, ends with a clear call to try it. Cap at 75 words."
tools_hands_on:
  - { name: "ElevenLabs", url: "https://elevenlabs.io/" }
  - { name: "HeyGen", url: "https://www.heygen.com/" }
  - { name: "Higgsfield", url: "https://higgsfield.ai/" }
  - { name: "Google Veo 3", url: "https://deepmind.google/models/veo/" }
tools_reference:
  - { name: "ElevenLabs voice cloning guide", url: "https://elevenlabs.io/docs/voices/voice-lab" }
  - { name: "HeyGen avatar tutorial", url: "https://www.heygen.com/learn" }
resources:
  - { title: "Higgsfield motion controls", url: "https://higgsfield.ai/" }
  - { title: "Synthesia vs HeyGen comparison", url: "https://www.synthesia.io/" }
lab: { title: "30-second pitch reel for your capstone", url: "https://elevenlabs.io/" }
objective:
  topic: "Text2Audio, Text2Video"
  tools: ["ElevenLabs", "HeyGen", "Higgsfield", "Veo 3"]
  end_goal: "A 30-second pitch reel: your script, your cloned voice, a HeyGen avatar or Veo3 b-roll, exported as MP4."
---

Demo Day is 6 days away. The teams that win are the ones whose 30-second clip travels — on WhatsApp, on LinkedIn, on a campus group. Today you build that clip.

## 🎯 Today's objective

**Topic.** Text2Audio, Text2Video.

**By end of class you will have:**
1. Cloned your own voice in ElevenLabs (or picked an Indian English voice) and rendered a 30s narration.
2. Generated either a HeyGen avatar reading the script, OR a Veo3/Higgsfield b-roll (8–10 sec).
3. Combined both into one MP4 you'd actually share.

> *Why this matters.* A working demo + a 30-sec reel is worth more than 10 slides. The reel travels while you sleep.

## ⏪ Pre-class · ~25 min

### Setup (required)

- [ ] ElevenLabs free tier account (10k chars/month is enough for today).
- [ ] HeyGen free trial account (1 minute of video per month).
- [ ] Google account for Veo 3 access (via Gemini Advanced or Vertex AI). Higgsfield as fallback.
- [ ] A 30-second clean voice recording of yourself reading any paragraph (for cloning).

### Primer (~10 min)

- **Watch:** "ElevenLabs voice clone in 60 seconds" — https://www.youtube.com/watch?v=xHZ3kfzP6YY
- **Skim:** HeyGen's avatar gallery. Note Indian-presenting avatars — useful for the campus audience.
- **Read:** Higgsfield's motion-control page. The *push-in*, *orbit*, *crash zoom* shots make AI video feel intentional.

### Bring to class

- [ ] A 30-second polished script of your capstone pitch (you wrote a draft in Day 23 prep — sharpen it).

> 🧠 **Quick glossary.** **TTS** = text-to-speech. **Voice clone** = TTS in *your* voice. **Avatar** = AI presenter — face + lip-sync. **B-roll** = supporting footage cut between presenter shots. **Veo 3 / Higgsfield** = state-of-the-art text-to-video as of mid-2026.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Why a reel beats slides | 5 min | Forwarding economics |
| Voice clone live demo | 15 min | Jayasaagar clones his voice in front of you |
| Avatar vs b-roll: when each wins | 10 min | Don't put a fake face where you should put a real product shot |
| Lab | 25 min | You build your reel |
| Share + react | 5 min |  |

### Choosing your shape

- **Avatar (HeyGen) reel** — you, but more confident. Good when your face/voice *is* the product (coaching, edtech).
- **B-roll (Veo3 / Higgsfield) reel** — narrated screen recordings + AI b-roll. Good when the *product* is the star.
- **Hybrid** — 5 sec avatar hook → 20 sec product demo with cloned-voice narration → 5 sec call to action.

### Indian-context shortcuts

- ElevenLabs *Multilingual v2* speaks Hindi, Tamil, Telugu, Bengali decently. Test your name pronunciation.
- HeyGen's "Aarav" and "Priya" avatars read better to Indian audiences than the default American set.
- Veo 3 prompt — add `"shot in Bengaluru"` or `"Mumbai street, monsoon, golden hour"` for grounded b-roll.

## 🧪 Lab: 30-second pitch reel

1. **Script** (5 min). Tighten yesterday's 75-word script. One specific user story, one clear CTA.
2. **Voice** (10 min). Upload 30s clean recording to ElevenLabs → Voice Lab → Instant Voice Clone. Generate the script as audio. Re-roll twice; pick the cleanest.
3. **Visuals** (10 min). Choose ONE: (a) HeyGen avatar reading your script, or (b) Three 8-sec Veo3/Higgsfield clips matching script beats.
4. **Edit** (5 min). Use CapCut or Descript: voiceover on top, visuals underneath, one bold caption per beat. Export 1080p MP4.
5. **Drop** the MP4 + a 1-line script in the cohort channel.

**Artifact.** A 30-second MP4 + the script that produced it. Both on the dashboard.

> ⚠️ **Ethics line.** Don't clone someone else's voice without consent. ElevenLabs requires consent verification — don't fake it.

## 📊 Live poll

**Which shape did you ship?** Avatar reel / B-roll reel / Hybrid / *Audio-only podcast cut* / *Couldn't finish*.

## 💬 Discuss

- Avatar uncanny-valley — at what point does the fake face hurt more than help?
- Where does a cloned voice feel honest, and where does it feel like a trick?
- One scene from your capstone you *wish* you could shoot but can't afford. Can Veo 3 fake it convincingly?

## ❓ Quiz

Short quiz on TTS vs voice clone, when avatars beat b-roll, and Veo 3 prompt structure. On your dashboard during class.

## 📝 Assignment · The shareable reel

**Brief.** Polish your reel and post it on **one** public surface (LinkedIn / Twitter / college WhatsApp group). Submit the public link.

**Submit.** Reel URL + posted link on dashboard before Day 25.

**Rubric.** Audio is clean (no robot tells) (4) · Visuals match the script beats (4) · Posted publicly with a real caption (2).

## 🔁 Prep for next class

Day 25 closes the eval loop: **Local LLMs, prompt patterns, eval habits, tracing**.

- [ ] Install **Ollama** and pull `llama3.1:8b` and `qwen2.5:7b`. Run `ollama run llama3.1:8b` and ask one question.
- [ ] Sign up for **LangSmith** (free tier).
- [ ] Bring two prompts from your capstone — one that works, one that misbehaves. We'll trace both.

## 📚 References

- [ElevenLabs — voice cloning](https://elevenlabs.io/docs/voices/voice-lab) — instant + professional clones.
- [HeyGen tutorials](https://www.heygen.com/learn) — avatar do's and don'ts.
- [Higgsfield](https://higgsfield.ai/) — motion controls that make AI video feel directed.
- [Google Veo 3](https://deepmind.google/models/veo/) — state of the art for short-form generative video.
