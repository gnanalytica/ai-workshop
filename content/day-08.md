---
reading_time: 14 min
tldr: "Pixels are free now. Today you generate a poster and a ten-second video for your capstone pitch."
tags: ["exposure", "tools"]
video: https://www.youtube.com/embed/5deYUaqwreo
lab: {"title": "Ship 1 poster + 1 ten-second video for your capstone", "url": "https://aistudio.google.com"}
prompt_of_the_day: "Design a poster for a student project called {{project_name}} that solves {{problem}} for {{audience}}. Style: clean, modern, Indian campus aesthetic, 2026 techno-optimist. Composition: hero object center, minimal text, one bold tagline. Palette: {{two colors}}. Format: 2:3 portrait, print-ready."
tools_hands_on: [{"name": "Nano Banana (Google Imagen via AI Studio)", "url": "https://aistudio.google.com"}, {"name": "Adobe Firefly", "url": "https://firefly.adobe.com"}, {"name": "Kling AI", "url": "https://klingai.com"}]
tools_demo: [{"name": "Ideogram", "url": "https://ideogram.ai"}, {"name": "Runway", "url": "https://runwayml.com"}, {"name": "Midjourney", "url": "https://midjourney.com"}]
tools_reference: [{"name": "Pika", "url": "https://pika.art"}, {"name": "Canva Magic Studio", "url": "https://canva.com"}]
resources: [{"name": "Google AI Studio", "url": "https://aistudio.google.com"}, {"name": "Firefly user guide", "url": "https://firefly.adobe.com"}]
objective:
  topic: "Image + video generation — diffusion, the six-slot prompt, and the 2026 tool landscape"
  tools: ["Nano Banana (Imagen)", "Adobe Firefly", "Kling AI"]
  end_goal: "Ship a print-ready 2:3 poster PNG and a 10-second MP4 for your capstone, plus a one-line tagline that makes a stranger understand what you're building."
---

## 🎯 Today's objective

**Topic.** Diffusion models, the six-slot image prompt, and the 2026 image + video tool stack — Nano Banana for photoreal, Firefly for commercial-safe, Kling for short video.

**Tools you'll use.** Nano Banana (Imagen via Google AI Studio), Adobe Firefly, Kling AI. Ideogram, Runway, Midjourney demoed for contrast.

**End goal.** By the end of today you will have:
1. A print-ready 2:3 poster PNG for your capstone.
2. A 10-second MP4 with one deliberate motion.
3. A one-line tagline (under 10 words) that a stranger can understand cold.

> *Why this matters:* Day 10 is the ideathon pitch. A poster + 10-second clip + tagline is a better warm-up than any slide deck.

---

## ⏪ Pre-class · ~20 min

**Revision / context.** Yesterday (Day 7) you built your first grounded research brief — Perplexity Pro Search for breadth, NotebookLM's private index + Audio Overview for depth, Gemini Deep Research for the long crawl — and you learned the 4-step hallucination check (click the citation; confirm source; confirm claim; check the date). That discipline transfers directly: today's "click every citation" becomes "specify every slot". A generic poster is a hallucinated poster — the model filled in gaps you didn't. The six-slot template is tonight's grounding.

### Setup (required)

- [ ] Sign in at [Google AI Studio](https://aistudio.google.com) so Nano Banana / Imagen loads without a sign-up wall.
- [ ] Create free accounts on [Adobe Firefly](https://firefly.adobe.com) and [Kling AI](https://klingai.com) — both gate generation behind email verify.

### Primer (~5 min)

- **Read**: The [Firefly user guide](https://firefly.adobe.com) intro on prompt structure — subject, style, composition. Same vocabulary we use for the six-slot template.
- **Watch** (optional): A 3–5 minute image-to-video walkthrough on Kling or [Pika](https://pika.art) so text-to-video vs image-to-video is not abstract when class starts.

### Bring to class

- [ ] A locked capstone working title — one or two words, even if it changes later.
- [ ] Two color hex codes (or named colors) you want on your poster, picked before class so you do not dither mid-lab.

> 🧠 **Quick glossary**
> - **Diffusion** = the model starts from pure noise and denoises step by step, guided by your prompt, until an image appears.
> - **Negative prompt** = a field where you list what you do NOT want (e.g., "no text, no extra fingers").
> - **Image-to-video** = start from a still image instead of plain text — far more controllable than text-to-video.
> - **C2PA** = invisible provenance tags most platforms embed to mark AI-generated media.
> - **Edit-by-reference** = upload a photo and generate consistent variations from it (Nano Banana's superpower).

---

## 🎥 During class · 60 min live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Pixels are free — so what becomes scarce? |
| Mini-lecture | 20 min | Diffusion intuition + the six-slot image prompt + 2026 tool landscape |
| Live lab     | 20 min | Ship 1 poster (Nano Banana / Firefly) + 1 ten-second video (Kling) |
| Q&A + discussion | 15 min | Taste, slop, and labeling AI-generated media |

### In-class moments (minute-by-minute)

- **00:05 — One-line cold open**: type your capstone tagline into the chat in under 10 words. We read three at random and guess what the product is — if we cannot guess, your tagline is the first problem.
- **00:15 — Think-pair-share**: in 90 seconds, swap prompts with a neighbor. Each person rewrites the other's prompt using the six-slot template (subject, action, setting, style, composition, modifiers). Notice how many adjectives get replaced by nouns.
- **00:30 — Live generation demo**: I run one cohort member's prompt through Nano Banana and Firefly side by side on screen. We vote on which won and why — the loser's prompt gets one surgical fix live.
- **00:45 — Stand-up critique**: three volunteers hold up their draft poster on camera for 30 seconds each. Cohort shouts out one thing that works and one thing to cut. No compliments without a specific noun.

### Read: Diffusion, prompts, and the state of video in 2026

**A one-paragraph mental model of diffusion.** Most modern image generators are diffusion models. During training, the model sees millions of image-caption pairs and learns to turn clear images into noise, step by step. To generate, it runs the process in reverse: start from pure noise, denoise one step at a time, guided by your text prompt, until a coherent image emerges. You do not need the math. You need the intuition: the model is a sculptor removing noise until your prompt appears. Your prompt is the chisel. Video models do the same trick across time — they denoise frames that are consistent with each other.

**What good image prompts look like.** Six slots, every time.

| Slot | Example |
|------|---------|
| Subject | "A jute tote bag full of mess-hall tiffins" |
| Action / state | "sitting on a wooden bench" |
| Setting | "late-evening NITK hostel corridor, warm tungsten lights" |
| Style | "editorial photograph, 50mm, shallow depth of field" |
| Composition | "subject center, negative space top, 2:3 portrait" |
| Modifiers | "film grain, natural shadows, no text" |

Short prompts produce generic images. Long prompts with specific nouns produce distinctive images. The mistake beginners make is adjectives; the fix is nouns. "Beautiful" is weaker than "brass tiffin, steam". "Cinematic" is weaker than "golden hour, 85mm, Kodak Portra 400".

**Negative prompts and iteration.** Every serious tool has a negative prompt field: list what you do not want. "no text, no watermark, no extra fingers, no distorted faces" catches 90% of junk. Iterate: the first image is a draft. Use in-tool editing (Firefly's generative fill, Nano Banana's reference-image edits) instead of re-rolling from scratch.

### Read: The 2026 image-tool landscape

| Tool | Strength | Weak at | Best use |
|------|----------|---------|----------|
| Nano Banana (Imagen in AI Studio) | Photorealism, character consistency, edit-by-reference | Stylized art | Capstone product shots, Indian faces and contexts |
| Firefly | Commercially safe (trained on licensed data) | Less edgy | Anything you will publish or submit |
| Ideogram | Perfect text inside images | Photorealism | Posters, logos, memes with words |
| Midjourney | Aesthetics and vibe | Speed, text | Mood boards |

For this cohort we lean on **Nano Banana** (via Google AI Studio) because it is free, very good at Indian faces and environments, and excellent at edit-by-reference — you can upload a photo of your hostel and generate consistent variations. Firefly is our fallback for anything that must be commercially safe (your resume header, LinkedIn banner, a submitted project).

### Read: Video generation in 2026

We finally crossed the "useful" line. Kling, Veo 3, Runway Gen-4, Pika 2, Wan and Higgsfield all produce 5–10 second clips with believable motion, physics, and (on some) synchronized audio. Free tiers give you a handful of credits per day — enough for a pitch. Rules that still hold:

- Keep clips short. 5–10 seconds looks great; 30 seconds looks cursed.
- Describe motion explicitly: "camera slowly pushes in", "leaves flutter left to right", "subject turns head 30 degrees". Models default to static.
- Start from an image when you can. Text-to-video is lottery; image-to-video is direction.
- Consistency across shots is still hard. Use the same reference image for every clip in a sequence.

**Ethics and safety.** Three red lines: do not generate real people without consent (your friend's face, a professor, a celebrity), do not generate images of minors in any suggestive context ever, and label AI-generated media as AI-generated when you share it. Most platforms already embed invisible C2PA provenance tags, but you should label it anyway. For a student capstone this almost never bites, but the habit matters.

**Copyright in India, briefly.** As of 2026, purely AI-generated output is not copyrightable on its own; human creative input (your prompt, your edits, your selection) is what makes it protectable. For a capstone or portfolio, you own the creative direction; do not claim you manually drew what the model made.

### Watch: Prompt-to-pixel, same idea across four tools

A speedrun where we take one capstone idea — "a mobile lab-report scanner for chemistry students" — and generate a poster in Nano Banana, Firefly, Ideogram, and Midjourney with the same prompt. Watch which tool nails which slot.

https://www.youtube.com/embed/5deYUaqwreo

- Notice which tool gets the Indian hostel context right without being told.
- See how Ideogram wins the text-rendering slot instantly.
- Watch the Midjourney output: beautiful, but does it say anything?

### Lab: Poster + 10-second video for your capstone

Time: 45 minutes. Artifact: one poster image + one short video, posted to the cohort showcase.

1. Open https://aistudio.google.com and select Nano Banana / Imagen. Paste today's prompt-of-the-day with `{{project_name}}`, `{{problem}}`, `{{audience}}`, and two colors filled in for your capstone idea.
2. Generate 4 variations. Pick the best. Use the **edit** feature to fix one thing (add a tagline, swap a color, remove clutter).
3. Open https://firefly.adobe.com. Re-run the same prompt there. Compare. Keep whichever is stronger as your final poster. Export as PNG, 2:3.
4. Still on your poster, if you need crisp text on the image, paste the prompt into https://ideogram.ai and use its output for the typography layer. Composite in Canva if needed.
5. Open https://klingai.com and sign in with the free tier. Upload your poster as a reference image.
6. Prompt the video model: "Camera slowly pushes in on the hero object. Gentle parallax. Soft ambient motion in background. 10 seconds, 16:9." Generate.
7. If Kling credits run out, fall back to https://runwayml.com or https://pika.art free tier.
8. Export the 10-second MP4. Post poster + video to the cohort showcase with a one-line capstone tagline.

> ⚠️ **If you get stuck**
> - *Every poster comes out looking generic or stock-photo-ish* → you have too many adjectives and not enough nouns. Replace "beautiful modern" with "brass tiffin, hostel corridor, 50mm, golden hour" and specify composition (center, 2:3, negative space top).
> - *Kling / Runway / Pika daily credits are exhausted* → fall back to image-to-video on the other tool you have not tried yet, or generate a subtle motion GIF from your poster in Canva Magic Studio. A 5-second clip with one deliberate motion beats a 10-second lottery.
> - *Text on the poster comes out garbled* → stop asking Nano Banana or Firefly to render words. Export the image text-free, then composite the tagline in Canva, or regenerate just the text layer in Ideogram.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Did any of your generations feel generic? What was missing from the prompt? | Diagnoses against the six slots (subject, action, setting, style, composition, modifiers). Names the specific slot you under-specified and the noun you should have used instead of an adjective. |
| Which tool's aesthetic felt most "you"? | Ties taste to a concrete output attribute — color palette, framing, realism vs. illustration, attitude toward Indian contexts. Not "vibes" but features. |
| Did you label your output as AI-generated when posting? Why or why not? | Takes a position and names the audience cost/benefit. If not, explains under what conditions you would. Acknowledges C2PA tags exist regardless. |
| When pixels are free, what becomes scarce — taste, distribution, or honesty? | Picks one and defends it with a real example from today's lab or your feed. Strong answers resist "all of the above" and commit to the one that constrains you personally. |
| Would you pay a human designer for this poster now? At what price? | Gives a number and a scenario (portfolio, investor pitch, client work). Shows you understand what the AI did NOT do — art direction, iteration with you in the room, brand consistency. |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action: lock poster + video + tagline (~45 min)

1. Finalize your poster PNG (2:3, print-ready) in Nano Banana or Firefly, with text composited in Canva or Ideogram if needed.
2. Export your 10-second MP4 from Kling, Runway, or Pika — one deliberate motion, no lottery.
3. Write a one-line tagline (under 10 words) that would make a stranger understand your capstone.

### 2. Reflect (~10 min)

*Which of the six prompt slots did you under-specify, and how did that show up in the image?* A good reflection picks one slot (setting, composition, modifiers…) and names the specific noun you should have used instead of an adjective — "brass tiffin on wooden bench" vs "beautiful Indian object". Shows you can debug a prompt, not just generate one.

### 3. Quiz (~15 min)

Three checks on the dashboard. In one sentence, what is a diffusion model doing? Which tool would you trust for a commercially safe LinkedIn banner, and why not Midjourney? What is the single prompt change that most reliably improves a mediocre video — a fancier adjective, an explicit camera motion, or a longer clip?

### 4. Submit (~5 min)

Post to the cohort showcase with `#day08-showcase` before 11 pm:

1. Your final poster PNG.
2. Your 10-second MP4.
3. A one-line tagline for your capstone. No essay — let the visual sell it.

This is your daily artifact. It is also a preview of your Friday ideathon pitch.

### 5. Deepen (optional, ~30 min)

- **Extra video**: Any 5-minute [Runway](https://runwayml.com) Gen-4 or [Midjourney](https://midjourney.com) prompt-craft walkthrough — watch how a pro iterates, never accepting the first roll.
- **Extra read**: The [Ideogram](https://ideogram.ai) docs on text-in-image — the one thing Nano Banana still garbles.
- **Try**: Regenerate your poster in [Canva Magic Studio](https://canva.com) using the same prompt plus a brand kit. Notice what "production-ready" adds vs raw Firefly.

### 6. Prep for Day 9 (~30-40 min — important)

**Tomorrow the pitch gets a voice and a structure.** Day 9 is AI that listens, speaks, and presents — Otter/Whisper for transcription, Gamma for deck-gen, Napkin AI for diagrams, ElevenLabs for voice, HeyGen for avatars. You'll ship a 5-slide deck PDF plus a 30-second AI-avatar or ElevenLabs-voiced MP4 for your capstone. Today's six-slot template reappears as outline → slide, paragraph → narration.

- [ ] **Skim ahead**: [Gamma templates](https://gamma.app) — notice how outlines, not slides, drive layout. Tomorrow you write an outline, not slides.
- [ ] **Think**: a one-paragraph description of your capstone idea — the kind you would say to a friend, not a professor. Gamma and Otter both eat paragraphs; draft one tonight.
- [ ] **Set up**: create free accounts on [Otter](https://otter.ai), [Gamma](https://gamma.app), [ElevenLabs](https://elevenlabs.io), and [HeyGen](https://heygen.com) — all four gate output behind email verify. Test your laptop mic by recording a 10-second voice note (ElevenLabs cloning needs clean audio). Have headphones ready.

---

## 📚 Extra / additional references

Optional deep-dives. Pick what interests you; skip what doesn't.

### Short watches

- [Prompt-to-pixel across four tools](https://www.youtube.com/embed/5deYUaqwreo) — the class speedrun at 1.5x.

### Reading

- [Google AI Studio](https://aistudio.google.com) — where Nano Banana / Imagen lives.
- [Firefly user guide](https://firefly.adobe.com) — prompt-structure vocabulary and commercial-safety notes.
- [Ideogram](https://ideogram.ai) — docs on text-in-image, the one thing Nano Banana still garbles.

### Play

- [Nano Banana (AI Studio)](https://aistudio.google.com), [Adobe Firefly](https://firefly.adobe.com), [Kling AI](https://klingai.com) — the hands-on stack.
- [Ideogram](https://ideogram.ai), [Runway](https://runwayml.com), [Midjourney](https://midjourney.com) — demoed for contrast.
- [Pika](https://pika.art) — fallback image-to-video when Kling credits die.
- [Canva Magic Studio](https://canva.com) — compositing text and brand kits on top of AI-generated hero images.
