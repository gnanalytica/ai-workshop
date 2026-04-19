---
reading_time: 10 min
tldr: "Turn a 20-page PDF into a 5-slide summary and 10 practice questions before your next chai break. NotebookLM is your new study buddy."
tags: ["use", "study", "productivity"]
video: https://www.youtube.com/embed/d8JkYJ5JQHk
lab: {"title": "From 20-page PDF to 5-slide deck + quiz", "url": "https://notebooklm.google.com/"}
prompt_of_the_day: "You are a patient tutor. Explain {{topic}} as if I'm a 2nd-year engineering student who just missed the class. Give me: 1) the one-line intuition, 2) the formal definition, 3) a worked example with numbers, 4) three practice questions — don't solve them yet."
resources: [{"title": "NotebookLM", "url": "https://notebooklm.google.com/"}, {"title": "ChatGPT", "url": "https://chat.openai.com/"}, {"title": "Claude", "url": "https://claude.ai/"}, {"title": "Khanmigo", "url": "https://www.khanmigo.ai/"}]
---

## Intro

Today we make AI your study partner — the kind that never gets tired, never judges you for asking "but why?", and can quiz you at 2 AM. By the end of the lab, you'll have turned a terrifying 20-page reading into a 5-slide summary and 10 practice questions, in under 30 minutes. You'll also learn the one tool most students haven't discovered yet: NotebookLM.

## Read: The AI study stack

Studying with AI is not "ask it the answer". That's cheating yourself. Studying with AI is compression, translation, and drill. Three moves — and each has a best tool.

### Move 1 — Compress: turn long into short

Upload your lecture notes, a research paper, or a chapter PDF into an AI. Ask for layered summaries: a 1-line version, a 5-bullet version, and a 1-page version. Different depths for different moments — revising on the bus vs revising the night before.

**Best tool:** **NotebookLM** by Google (`https://notebooklm.google.com/`). You can upload up to 50 sources per notebook — PDFs, Google Docs, YouTube transcripts, websites — and ask questions that cite which source the answer came from. It is free and underrated.

Example prompt for a lecture PDF:

```
Copy and paste this prompt:

Summarise the uploaded notes in three versions:
1) A single tweet (under 200 chars) capturing the main idea.
2) 7 bullet points I can memorise for a viva.
3) A 1-page study sheet with a short intuition per concept, and one formula or code snippet per concept if relevant.
```

### Move 2 — Translate: turn jargon into intuition

Half of studying is figuring out what the textbook *meant*. AI is exceptional at this. The trick is to ask for multiple explanations at different levels.

```
Copy and paste this prompt:

Explain {{topic, e.g. Kalman filters}} three times:
- Once to a 12-year-old using a food or cricket analogy.
- Once to a 2nd-year engineering student with the key formula.
- Once to someone preparing for a PhD interview, with nuance and edge cases.
```

The "explain it at 3 levels" move is the single best study prompt ever written. Steal it.

### Move 3 — Drill: turn reading into retention

Passive reading is a lie. You don't remember what you don't retrieve. AI makes retrieval practice painless — it can generate flashcards, MCQs, short-answer questions, and even a mock viva.

```
Copy and paste this prompt:

From the uploaded notes, generate:
- 10 flashcards (Q on one line, A on next).
- 5 MCQs with 4 options each, and mark the correct one only at the very end.
- 3 "trap" questions — things students commonly get wrong on exams about this topic.
- 1 open-ended viva question where I have to reason, not recall.
Then quiz me one at a time. Wait for my answer before revealing the correct one.
```

That last line is magic — "wait for my answer before revealing" turns a chat into an interactive tutor.

### Picking the right tool for the job

| Task | Best tool | Why |
|------|-----------|-----|
| Upload 50 PDFs, ask cross-document questions | NotebookLM | Cites sources, multi-doc |
| Deep single-document chat | Claude | Handles long context, clean writing |
| Quick explanations, image-based questions | ChatGPT | Great multimodal, fast |
| Math homework walkthrough | ChatGPT or Khanmigo | Step-by-step reasoning |
| "Fetch + cite" current info (recent papers) | Perplexity | Always shows links |

### The "wow" moment: NotebookLM's audio overview

Inside NotebookLM, after you upload sources, click **Audio Overview**. In about 5 minutes it generates a podcast — two AI hosts chatting about *your notes*, complete with banter. Put it on during your commute. It is genuinely, unreasonably good for revision. Nobody tells first-years about this. Now you know.

### Honesty check: what AI still gets wrong

- Dates, citations, and specific numbers — always verify.
- Niche Indian-syllabus or professor-specific content — it may invent.
- Math with long multi-step calculations — ask it to show every step and sanity-check.

Rule: use AI to *understand*. Use your own brain to *verify*. Use your own effort to *retain*.

## Watch: NotebookLM for students

A short demo of uploading a PDF, asking smart questions, and using audio overview. Worth every minute.

https://www.youtube.com/embed/d8JkYJ5JQHk
<!-- TODO: replace video -->

- Notice how answers include citations to the exact page of the source.
- Watch the audio overview feature — the "wow" moment of the day.
- See how the presenter asks follow-up questions instead of re-prompting.

## Lab: 20-page PDF → 5-slide summary + 10 practice questions

You'll end with a Google Slide deck and a flashcard list you can actually use for your next test.

1. Pick a 15–25 page PDF from one of your current courses (or a paper you've been avoiding). If nothing comes to mind, download any chapter from NCERT or your college's shared drive.
2. Open `https://notebooklm.google.com/`, sign in with Google, and create a new notebook. Upload your PDF as a source.
3. In the chat, ask: *"Give me a 5-slide outline summarising this entire document. Each slide should have a title and 3 bullets. Cite which page each point is from."*
4. Copy the outline into a new Google Slide deck (free at `slides.google.com`). One slide per section. Use Gemini-in-Slides if available, or just paste text.
5. Back in NotebookLM, ask: *"Generate 10 practice questions — mix of 5 MCQs and 5 short-answer. Don't reveal answers yet. Quiz me one at a time."*
6. Actually answer 5 of them. See how you score. (This is the point of the whole lab.)
7. Try the Audio Overview feature. Listen to 2 minutes of it.
8. Export/screenshot your slide deck and the quiz chat.

**Victory condition:** a 5-slide deck + a chat where you actually attempted 5 questions + you experienced the audio overview at least once.

## Quiz

Four short questions on when to use NotebookLM vs ChatGPT, what "explain at 3 levels" does, why retrieval beats re-reading, and one thing AI reliably gets wrong.

## Assignment

Share a screenshot of your 5-slide deck + your quiz score (be honest — even 2/5 is fine, we want the attempt). Add one line: which course will you use this workflow for this semester?

## Discuss: AI and studying — line between help and crutch

- Where's the line between "AI helped me understand" and "AI did it for me"?
- Did the audio overview feel like a real podcast? Would you actually listen?
- Has anyone caught AI giving a confidently wrong answer about your syllabus? Share.
- If your professor banned AI, how much of today's workflow could you still do ethically?
- What's one subject you'd never trust AI with, and why?
