---
reading_time: 14 min
tldr: "Pixels are free now. Today you generate a poster and a ten-second video for your capstone pitch."
tags: ["exposure", "tools"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Ship 1 poster + 1 ten-second video for your capstone", "url": "https://aistudio.google.com"}
prompt_of_the_day: "Design a poster for a student project called {{project_name}} that solves {{problem}} for {{audience}}. Style: clean, modern, Indian campus aesthetic, 2026 techno-optimist. Composition: hero object center, minimal text, one bold tagline. Palette: {{two colors}}. Format: 2:3 portrait, print-ready."
tools_hands_on: [{"name": "Nano Banana (Google Imagen via AI Studio)", "url": "https://aistudio.google.com"}, {"name": "Adobe Firefly", "url": "https://firefly.adobe.com"}, {"name": "Kling AI", "url": "https://klingai.com"}]
tools_demo: [{"name": "Ideogram", "url": "https://ideogram.ai"}, {"name": "Runway", "url": "https://runwayml.com"}, {"name": "Midjourney", "url": "https://midjourney.com"}]
tools_reference: [{"name": "Pika", "url": "https://pika.art"}, {"name": "Canva Magic Studio", "url": "https://canva.com"}]
resources: [{"name": "Google AI Studio", "url": "https://aistudio.google.com"}, {"name": "Firefly user guide", "url": "https://firefly.adobe.com"}]
---

## Intro

Pixels used to be expensive. Designers charged for posters, film crews charged for videos, and a 10-second animation cost a weekend. Today you will make both in 45 minutes, for the capstone idea you have been sharpening. Day 10 is the ideathon; your pitch deserves to look real.

## Read: Diffusion, prompts, and the state of video in 2026

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

**The 2026 image-tool landscape.**

| Tool | Strength | Weak at | Best use |
|------|----------|---------|----------|
| Nano Banana (Imagen in AI Studio) | Photorealism, character consistency, edit-by-reference | Stylized art | Capstone product shots, Indian faces and contexts |
| Firefly | Commercially safe (trained on licensed data) | Less edgy | Anything you will publish or submit |
| Ideogram | Perfect text inside images | Photorealism | Posters, logos, memes with words |
| Midjourney | Aesthetics and vibe | Speed, text | Mood boards |

For this cohort we lean on **Nano Banana** (via Google AI Studio) because it is free, very good at Indian faces and environments, and excellent at edit-by-reference — you can upload a photo of your hostel and generate consistent variations. Firefly is our fallback for anything that must be commercially safe (your resume header, LinkedIn banner, a submitted project).

**Video generation in 2026.** We finally crossed the "useful" line. Kling, Veo 3, Runway Gen-4, Pika 2, Wan and Higgsfield all produce 5–10 second clips with believable motion, physics, and (on some) synchronized audio. Free tiers give you a handful of credits per day — enough for a pitch. Rules that still hold:

- Keep clips short. 5–10 seconds looks great; 30 seconds looks cursed.
- Describe motion explicitly: "camera slowly pushes in", "leaves flutter left to right", "subject turns head 30 degrees". Models default to static.
- Start from an image when you can. Text-to-video is lottery; image-to-video is direction.
- Consistency across shots is still hard. Use the same reference image for every clip in a sequence.

**Ethics and safety.** Three red lines: do not generate real people without consent (your friend's face, a professor, a celebrity), do not generate images of minors in any suggestive context ever, and label AI-generated media as AI-generated when you share it. Most platforms already embed invisible C2PA provenance tags, but you should label it anyway. For a student capstone this almost never bites, but the habit matters.

**Copyright in India, briefly.** As of 2026, purely AI-generated output is not copyrightable on its own; human creative input (your prompt, your edits, your selection) is what makes it protectable. For a capstone or portfolio, you own the creative direction; do not claim you manually drew what the model made.

## Watch: Prompt-to-pixel, same idea across four tools

A speedrun where we take one capstone idea — "a mobile lab-report scanner for chemistry students" — and generate a poster in Nano Banana, Firefly, Ideogram, and Midjourney with the same prompt. Watch which tool nails which slot.

https://www.youtube.com/embed/VIDEO_ID <!-- TODO: replace video -->

- Notice which tool gets the Indian hostel context right without being told.
- See how Ideogram wins the text-rendering slot instantly.
- Watch the Midjourney output: beautiful, but does it say anything?

## Lab: Poster + 10-second video for your capstone

Time: 45 minutes. Artifact: one poster image + one short video, posted to the cohort showcase.

1. Open https://aistudio.google.com and select Nano Banana / Imagen. Paste today's prompt-of-the-day with `{{project_name}}`, `{{problem}}`, `{{audience}}`, and two colors filled in for your capstone idea.
2. Generate 4 variations. Pick the best. Use the **edit** feature to fix one thing (add a tagline, swap a color, remove clutter).
3. Open https://firefly.adobe.com. Re-run the same prompt there. Compare. Keep whichever is stronger as your final poster. Export as PNG, 2:3.
4. Still on your poster, if you need crisp text on the image, paste the prompt into https://ideogram.ai and use its output for the typography layer. Composite in Canva if needed.
5. Open https://klingai.com and sign in with the free tier. Upload your poster as a reference image.
6. Prompt the video model: "Camera slowly pushes in on the hero object. Gentle parallax. Soft ambient motion in background. 10 seconds, 16:9." Generate.
7. If Kling credits run out, fall back to https://runwayml.com or https://pika.art free tier.
8. Export the 10-second MP4. Post poster + video to the cohort showcase with a one-line capstone tagline.

## Quiz

Three checks. In one sentence, what is a diffusion model doing? Which tool would you trust for a commercially safe LinkedIn banner, and why not Midjourney? What is the single prompt change that most reliably improves a mediocre video — a fancier adjective, an explicit camera motion, or a longer clip?

## Assignment

Post to the cohort showcase:

1. Your final poster PNG.
2. Your 10-second MP4.
3. A one-line tagline for your capstone. No essay — let the visual sell it.

This is your daily artifact. It is also a preview of your Friday ideathon pitch.

## Discuss: Taste, speed, and slop

- Did any of your generations feel generic? What was missing from the prompt?
- Which tool's aesthetic felt most "you"?
- Did you label your output as AI-generated when posting? Why or why not?
- When pixels are free, what becomes scarce — taste, distribution, or honesty?
- Would you pay a human designer for this poster now? At what price?
