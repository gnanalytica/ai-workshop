---
day: 12
date: "2026-05-18"
weekday: "Monday"
week: 3
topic: "Text2Image — Stable Diffusion, ChatGPT Images, Nano Banana, Adobe Firefly"
faculty:
  main: "Jayasaagar"
  support: "Sanjana"
reading_time: "10 min"
tldr: "Four image models, one prompt, very different outputs. Today you learn the prompt grammar that actually works (subject + style + lighting + camera + negatives), then ship the hero image your capstone needs."
tags: ["image-gen", "diffusion", "creative"]
software: []
online_tools: ["Stable Diffusion", "ChatGPT Images", "Nano Banana", "Adobe Firefly"]
video: "https://www.youtube.com/embed/1CIpzeNxIhU"
prompt_of_the_day: "A young Indian student in a hostel room at 2 AM, lit only by laptop glow, focused expression, papers scattered. Cinematic photography, 35mm lens, shallow depth of field, warm rim light from a desk lamp, photorealistic, hyperdetailed. Negative: cartoon, low-res, extra fingers, text, watermark."
tools_hands_on:
  - { name: "Adobe Firefly", url: "https://firefly.adobe.com/" }
  - { name: "ChatGPT Images", url: "https://chat.openai.com/" }
  - { name: "Stable Diffusion (Hugging Face)", url: "https://huggingface.co/spaces/stabilityai/stable-diffusion" }
  - { name: "Nano Banana (Gemini)", url: "https://gemini.google.com/" }
tools_reference:
  - { name: "Stability AI — model card", url: "https://stability.ai/" }
  - { name: "Lexica — prompt library", url: "https://lexica.art/" }
resources:
  - { title: "Computerphile — How Stable Diffusion works (15 min)", url: "https://www.youtube.com/watch?v=1CIpzeNxIhU" }
  - { title: "OpenArt — prompt book", url: "https://openart.ai/promptbook" }
  - { title: "Adobe — Firefly prompt guide", url: "https://helpx.adobe.com/firefly/get-set-up/learn-the-basics/prompts.html" }
lab: { title: "Same prompt × four image models", url: "https://firefly.adobe.com/" }
objective:
  topic: "Generate, compare, and iterate images across four leading T2I models"
  tools: ["Stable Diffusion", "ChatGPT Images", "Nano Banana", "Adobe Firefly"]
  end_goal: "One hero image for your capstone, generated across all 4 tools, with a written prompt-engineering note explaining your final pick."
---

Welcome to Week 3. After two weeks of words, today you make pixels. The same diffusion idea — start from noise, denoise toward the prompt — sits behind all four tools. The differences are in training data, safety filters, and how they interpret your words.

## 🎯 Today's objective

**Topic.** Text-to-image generation across four major models. Prompt grammar, negative prompts, and iteration.

**By end of class you will have:**
1. Run the same image prompt on Stable Diffusion, ChatGPT Images, Nano Banana, and Adobe Firefly.
2. A working prompt grammar: *subject + style + lighting + camera + composition + negative*.
3. One polished hero image you'll actually use in your capstone deck.

> *Why this matters.* Demo Day decks live or die by their hero image. Generic ones get scrolled. Specific ones get screenshot.

## ⏪ Pre-class · ~20 min

### Setup (required)

- [ ] Free **Adobe Firefly** account (uses your Adobe ID).
- [ ] **Gemini** account for Nano Banana, **ChatGPT** for image gen, and a **Hugging Face** account for hosted SD.
- [ ] Optional: GPU laptop → install AUTOMATIC1111 / ComfyUI overnight.

### Primer (~10 min)

- **Watch:** Computerphile, *How Stable Diffusion Works* (15 min) — https://www.youtube.com/watch?v=1CIpzeNxIhU
- **Skim:** OpenArt prompt book — https://openart.ai/promptbook (pick one style page).

### Bring to class

- [ ] 3 image briefs from your capstone: hero shot, illustration, icon.
- [ ] One reference image you'd love to "match the vibe of" (no copyright drama — say a Diwali street photo from Unsplash).

> 🧠 **Quick glossary.** **Diffusion** = denoise from random noise toward a target. **CFG** = how strongly the model obeys your prompt. **Seed** = the starting noise; same seed + same prompt = same image. **Negative prompt** = what NOT to include. **LoRA** = a small style/character add-on weight.

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Diffusion in 1 slide | 10 min | Noise → denoise, why CFG matters |
| The 6-part prompt grammar | 15 min | Worked example: chai-wallah at dawn |
| Lab: same prompt × 4 tools | 25 min | Compare outputs |
| Iteration round | 15 min | Reroll, refine, narrow |
| Show & critique | 15 min | 5 hero images on screen |

### The 6-part prompt grammar

1. **Subject.** Who/what, in 5 words.
2. **Style.** Photorealistic / oil painting / Studio Ghibli / flat illustration.
3. **Lighting.** Golden hour / rim light / overcast / neon.
4. **Camera.** 35mm / wide-angle / macro / overhead drone.
5. **Composition.** Rule of thirds / centred / negative space on right.
6. **Negative.** "no text, no watermark, no extra fingers, no low-res."

## 🧪 Lab: Same prompt × four models

1. **Write your prompt** using all 6 parts. Save it.
2. **Run on all 4 tools.** Same prompt, default settings. Save outputs as `sd.png`, `chatgpt.png`, `nano.png`, `firefly.png`.
3. **Compare on:** prompt fidelity, photorealism, hand/face quality, content-policy blocks.
4. **Iterate (3 rounds).** Pick your best tool. Tweak: lighting → camera → negatives. Save each iteration.
5. **Final pick.** One image. Note the seed and the final prompt verbatim.

**Artifact.** A Google Doc with: original prompt, 4 first-pass images side-by-side, your 3 iterations, and the final hero with prompt + seed + tool. Drop link on dashboard.

> ⚠️ **Content policy.** Firefly is the strictest, ChatGPT next, Nano middle, SD loosest. If one blocks you, the others may not. Document the blocks.

## 📊 Live poll

**Which tool gave your best first-pass result?** Stable Diffusion / ChatGPT Images / Nano Banana / Adobe Firefly / They were all bad. Instructor opens this mid-lab.

## 💬 Discuss

- Which tool understood "Indian context" best (clothing, faces, streets)? Which was Western-default?
- Where did the negative prompt earn its keep?
- Is your final image one you'd put in a placement portfolio? If not, what's missing?

## ❓ Quiz

Short quiz on diffusion in one line, what CFG and seed do, and the 6-part prompt grammar. Opens on dashboard.

## 📝 Assignment · Three capstone images

**Brief.** Generate **3 polished images** for your capstone: (1) hero, (2) feature illustration, (3) app icon or logo. Use whichever tool wins per image — but use at least 2 different tools across the three. Keep all prompts + seeds.

**Submit.** Dashboard. Single PDF or Notion page.

**Rubric.** Image quality (4) · Prompt discipline (4) · Tool-fit reasoning (2).

## 🔁 Prep for next class

Day 13 is **Workflow + browser automation** with **n8n, Zapier, Firecrawl**. Sandeep + Harshith.

- [ ] Free accounts on **n8n.cloud** and **Zapier**.
- [ ] Sign up for **Firecrawl** (free tier).
- [ ] List 2 boring tasks in your week (form-filling, screenshot-collecting, tracking deadlines). One of them gets automated tomorrow.

## 📚 References

- [Computerphile — Stable Diffusion (15 min)](https://www.youtube.com/watch?v=1CIpzeNxIhU) — clearest mental model.
- [OpenArt prompt book](https://openart.ai/promptbook) — borrowable grammar.
- [Lexica](https://lexica.art/) — search prompts by image.
- [Firefly prompt guide](https://helpx.adobe.com/firefly/get-set-up/learn-the-basics/prompts.html) — official, useful for commercial use.
