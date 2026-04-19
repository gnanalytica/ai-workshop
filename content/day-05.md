---
reading_time: 10 min
tldr: "Generate an image, brainstorm a story, design a poster — all in a browser, all free. Today you make something nobody else has made before."
tags: ["use", "creativity", "consumer"]
video: https://www.youtube.com/embed/SaVeQKF2JLE
lab: {"title": "Design a hostel event poster with AI", "url": "https://labs.google/fx/tools/image-fx"}
prompt_of_the_day: "A {{style, e.g. vibrant flat-illustration}} poster for {{event name}}, a {{event type}} at an Indian college hostel. Mood: {{mood}}. Key visual: {{main element}}. Colour palette: {{colours}}. Include space at the top for a title. Avoid: text in the image (I'll add text separately), realistic faces, clutter."
resources: [{"title": "ImageFX (Google)", "url": "https://labs.google/fx/tools/image-fx"}, {"title": "Adobe Firefly", "url": "https://firefly.adobe.com/"}, {"title": "Stable Diffusion Web", "url": "https://stablediffusionweb.com/"}, {"title": "DALL-E via ChatGPT", "url": "https://chat.openai.com/"}, {"title": "Canva", "url": "https://www.canva.com/"}]
---

## Intro

Today you become a one-person creative studio. You'll generate images, brainstorm a story arc, and build a hostel event poster — no Photoshop, no design skills, no budget. The "wow" moment today hits hard: the first time an AI generates an image from your words, you'll smile involuntarily.

## Read: Making stuff with AI

Creativity with AI is not "press button, get art". It's a back-and-forth where your taste is the real skill. AI is the hands; you're the director. The better you describe what's in your head, the closer the output.

### Image generation: the four free tools worth knowing

| Tool | Strength | Free tier | URL |
|------|----------|-----------|-----|
| ImageFX (Google) | Photorealistic + illustration, very fast | Generous free | `labs.google/fx/tools/image-fx` |
| Adobe Firefly | Safe for commercial use, good on text-in-image | 25 credits/month free | `firefly.adobe.com` |
| DALL-E in ChatGPT | Best at following complex instructions | A few free/day | `chat.openai.com` |
| Stable Diffusion Web | Style variety, community models | Free with waits | `stablediffusionweb.com` |

For most students: **start with ImageFX**. Sign in with Google, type, get 4 images in 10 seconds.

### How to write an image prompt that doesn't look AI-generic

An image prompt has five slots. Fill each.

1. **Subject** — what is the picture *of*? ("a student on a rooftop")
2. **Action / scene** — what's happening? ("looking at a city skyline at dusk")
3. **Style** — what's the visual language? ("flat vector illustration, muted pastels")
4. **Mood / light** — feeling? ("warm, nostalgic, golden hour")
5. **Details to avoid** — ("no text, no realistic faces, no clutter")

**Bad prompt:** "cool poster for hostel event"

**Good prompt:**
```
Copy and paste this prompt:

A flat vector illustration of a college student DJ-ing on a rooftop, silhouettes of friends dancing in the foreground, Bangalore skyline at sunset in the background. Style: retro risograph print, two-tone pink and teal, slightly grainy texture. Mood: fun, late-night, freshers vibe. Leave empty space at the top for a title. No text, no realistic faces, no watermarks.
```

That gives you four poster-ready images to choose from.

### Brainstorming and story arcs

Images are flashy but the quiet superpower is ideation. Use AI as a brainstorm partner you can't exhaust.

```
Copy and paste this prompt:

I'm planning a 2-minute skit for our college cultural night. Theme: engineering student vs. placement season. Give me:
- 5 possible story arcs (1 line each)
- For the one I'll pick, 3 act structure, 4 characters with quirks, and 2 punchline lines.
Keep it grounded in Indian campus culture — references to 8 AM classes, Maggi at 2 AM, attendance shortage, etc.
```

You now have a skit in 90 seconds. Whether you actually use it — your call.

### The combo move: text + image together

Generate a moodboard, then a story, then poster art, all from the same concept. Example: you're hosting a "Retro Bollywood Night" in the hostel.

1. **Moodboard prompt:** "9 image moodboard references for 1970s Bollywood aesthetic — fonts, colours, costumes, iconic props."
2. **Tagline prompt:** "20 catchy taglines under 8 words for a hostel 'Retro Bollywood Night', mixing Hindi and English playfully."
3. **Poster prompt:** Pick your favourite tagline and moodboard reference, feed both into ImageFX.

Three prompts, one aesthetic direction. That's how designers actually work, minus the design degree.

### The "wow" trick of the day

After you generate an image, download it, then upload it back into ChatGPT or Claude with the prompt: *"Describe this image in extreme detail as if you were writing a prompt to recreate it."* You now have a reusable prompt for that exact style. Steal your own successful outputs.

### What AI images still can't do well

- **Text inside images** — most tools butcher text. Add text in Canva afterwards.
- **Hands** — still weird sometimes. Prefer silhouettes or hidden hands.
- **Specific faces** (celebrities, you) — don't try to generate real people.
- **Consistent characters across multiple images** — hard on free tools.

Rule: AI generates the background, mood, and composition. You add the text and final polish in Canva. That's the winning workflow for posters.

## Watch: Poster-to-print with AI in under 15 minutes

A walkthrough of generating a poster in ImageFX, cleaning it up, and adding text in Canva.

https://www.youtube.com/embed/SaVeQKF2JLE
<!-- TODO: replace video -->

- Notice how the presenter iterates — they regenerate 5–6 times before picking one.
- Watch them explicitly avoid generating text inside the image.
- See the final Canva step where everything gets tied together.

## Lab: Your hostel event poster

You'll end with a finished poster you can actually put on the hostel notice board or in a WhatsApp group.

1. Pick any event — real or imagined. Hostel freshers, dorm movie night, study-group launch, inter-year cricket match, fest after-party. Write one line describing the vibe.
2. Go to `https://labs.google/fx/tools/image-fx` and sign in. Write a 5-slot prompt (subject, scene, style, mood, avoid). Generate 4 images.
3. Not happy? Change ONE slot (usually style or mood) and regenerate. Iterate 3–4 times.
4. Download your favourite image. No text in it yet — that's intentional.
5. In ChatGPT or Claude, ask for 15 event taglines under 8 words each. Pick your favourite.
6. Open `https://www.canva.com/`, create a new poster, upload your image as background, add the tagline, event date, and venue on top. Use Canva's free fonts.
7. Bonus "wow" step: upload your final poster back into ChatGPT and ask *"What would make this poster 20% better?"* Apply one suggestion.
8. Export as PNG. Post in the class group.

**Victory condition:** one poster PNG, actually usable, posted in the class group.

## Quiz

Four questions: the five slots of an image prompt, why you add text in Canva not in the image, one thing AI images fail at, and what "iteration" means in this context.

## Assignment

Submit your final poster PNG plus the original AI-generated background (both). Add one line: what did you change between your first generation and your final one? If you used the poster for a real event, tell us.

## Discuss: AI art, taste, and the creativity question

- If AI made the image and you wrote the prompt, who's the "artist"?
- Share one prompt that failed hilariously — what did AI do instead?
- Is using AI images for a college magazine ethically different from a paid commercial project?
- Did iterating feel like creating, or like shopping? Both are valid answers.
- What's one creative thing you'd never let AI touch, and why?
