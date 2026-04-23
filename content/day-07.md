---
reading_time: 16 min
tldr: "Google gives you links. AI research tools give you a grounded answer with citations you can actually trust."
tags: ["exposure", "tools"]
video: https://www.youtube.com/embed/EOmgC3-hznM
lab: {"title": "Ship a 1-page research brief on your capstone domain", "url": "https://www.perplexity.ai"}
prompt_of_the_day: "Act as a senior analyst. Produce a research brief on {{topic}} for a capstone feasibility review. Structure: (1) problem in one paragraph, (2) 5 recent developments (last 18 months) with citations, (3) 3 existing solutions + their gaps, (4) 3 open questions worth a student project, (5) my 60-second verdict. Cite every factual claim inline."
tools_hands_on: [{"name": "Perplexity", "url": "https://www.perplexity.ai"}, {"name": "NotebookLM", "url": "https://notebooklm.google.com"}, {"name": "Gemini Deep Research", "url": "https://gemini.google.com"}]
tools_demo: [{"name": "NotebookLM Audio Overview", "url": "https://notebooklm.google.com"}]
tools_reference: [{"name": "Elicit", "url": "https://elicit.com"}, {"name": "Consensus", "url": "https://consensus.app"}, {"name": "SciSpace", "url": "https://scispace.com"}, {"name": "Research Rabbit", "url": "https://researchrabbit.ai"}, {"name": "Connected Papers", "url": "https://www.connectedpapers.com"}, {"name": "Scholarcy", "url": "https://www.scholarcy.com"}]
resources: [{"name": "Perplexity Pro Search docs", "url": "https://www.perplexity.ai"}, {"name": "NotebookLM help", "url": "https://notebooklm.google.com"}]
objective:
  topic: "Grounded research with Perplexity, NotebookLM, Deep Research, citation checks"
  tools: ["Perplexity", "NotebookLM", "Gemini Deep Research"]
  end_goal: "Ship a 1-page `brief-<topic>.md` on your capstone domain with 5+ inline citations, a NotebookLM Audio Overview, and one 'I almost quoted this…' moment where a citation didn't hold up."
---

## 🎯 Today's objective

**Topic.** Grounded research with Perplexity, NotebookLM, Deep Research, citation checks

**Tools you'll use.** Perplexity (quick-draw), NotebookLM (private index over your own sources), Gemini Deep Research (long agent run).

**End goal.** By the end of today you will have:
1. A 1-page Markdown research brief on your capstone domain with 5+ inline citations.
2. A NotebookLM Audio Overview of your 5 sources.
3. One honest "I almost quoted this…" sentence where you had to drop or rewrite a claim after clicking the citation.

> *Why this matters:* Your capstone feasibility hinges on what's already been tried. Today you stop guessing and start citing.

---

### 🌍 Real-life anchor

**The picture.** A librarian hands you photocopied pages with call numbers in the margin. A storyteller at a party gives you a gripping version with no footnotes. Both are "answers" — only one holds up when your professor asks "where did you get that?"

**Why it matches today.** Perplexity / NotebookLM / Deep Research sit on the **librarian** side: claims you can trace back to a source.

## ⏪ Pre-class · ~20 min

**Faculty note.** Budget ~2 minutes for the 🌍 *Real-life anchor* above — read it aloud or ask one volunteer to restate it in their own words — so the analogy lands before setup.

**Revision / context.** Yesterday (Day 6) you built your Claude Project Jarvis — resume, transcript, 5 capstone ideas, the custom Jarvis prompt baked in — and ran the 3-model (Claude/ChatGPT/Gemini) comparison that proved context beats a blank chat. Today you give Jarvis a library card: grounded sources you can actually trust. Keep Jarvis open in one tab — after you produce the brief, you'll feed it back into the project so every future capstone chat has those citations in context.

### Setup (required)

- [ ] Sign in at [Perplexity](https://www.perplexity.ai) and [NotebookLM](https://notebooklm.google.com) with your Google account.
- [ ] Confirm [Gemini](https://gemini.google.com) shows the **Deep Research** toggle in your account (it is behind a free-tier flag for some regions).

### Primer (~5 min)

- **Read**: The [Perplexity Pro Search docs](https://www.perplexity.ai) — a 3-minute scan of what Pro Search, Focus, and Sources actually mean. You want the vocabulary before class.
- **Watch** (optional): Any 3–5 minute NotebookLM walkthrough showing an Audio Overview generating — the [NotebookLM help](https://notebooklm.google.com) hub links to current demos.

### Bring to class

- [ ] One capstone domain written as a single-line problem statement (e.g., "hostel mess menu feedback is invisible to the mess committee").
- [ ] 2–3 URLs, PDFs, or YouTube links related to that domain — raw material you will drop into NotebookLM.

> 🧠 **Quick glossary**
> - **Grounding** = every sentence the model writes must map back to a retrieved source (no invented facts).
> - **Citations** = the little [1][2][3] markers you should always click to verify.
> - **Pro Search / Deep Research** = multi-step agent runs that decompose a question into sub-queries and synthesize.
> - **Hallucination** = the model stating something false with confidence. Use the 4-step check.
> - **Audio Overview** = NotebookLM's auto-generated podcast with two AI hosts discussing your sources.

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Keyword search vs grounded answer — why Google is not enough |
| Mini-lecture | 20 min | Perplexity + NotebookLM + Deep Research — when to use which |
| Live lab     | 20 min | Ship a 1-page research brief on your capstone domain |
| Q&A + discussion | 15 min | Trusting the machine — citations, disagreements, dropped claims |

### In-class checkpoints

- **Live poll (LMS)** — Run the **dashboard Live poll** for today so counts match in-class discussion (same wording as the official cohort poll for this day).
- **Raise-a-finger vote**: "In the last month, how many times did you click past page 1 of Google?" Zero, one, or more — we map the room's search habits.
- **Think-pair-share**: in 90 seconds, each person names one factual claim they once quoted from ChatGPT without checking. Confess out loud; we set the tone for citation discipline.
- **Live citation audit**: I drop a Perplexity answer on screen with four citations. Cohort clicks each in parallel — we vote thumbs up/down on whether the source actually supports the claim.
- **Breakout of three**: each trio runs the DIY Deep Research pattern (5 sub-questions → 5 searches → synthesis) on one capstone question. One team reports back what the synthesis caught that single-shot search missed.

### Read: Search is dead. Long live grounded research.

For twenty years, research meant: Google, click ten blue links, skim ten tabs, take notes. The bottleneck was not finding information; it was synthesizing it. In 2026 that synthesis step is free.

**Keyword search vs AI search.** A keyword search returns documents that contain your words. An AI search reads those documents and writes you an answer. The difference matters because most of your questions are not "find me the document"; they are "tell me what is going on". A student Googling "best battery chemistry for campus solar cart" gets ads and old blog posts. The same student on Perplexity gets a 400-word synthesis of LiFePO4 vs NMC tradeoffs with six citations from 2025 papers and one from a Reddit thread flagged as anecdotal.

**Grounding and citations: the only thing separating research from hallucination.** A grounded model cannot invent a claim; every sentence must map to a retrieved source. The user interface shows the little [1][2][3] markers. Click them. Always click them. About 10% of the time the source does not actually say what the model claims; that is your signal to rewrite the claim or drop it. Treat citations as evidence, not decoration.

### Read: The three research tools you need, and when

| Tool | Best for | Output | Watch out for |
|------|----------|--------|---------------|
| Perplexity | Fast web-grounded Q&A, news, comparisons | Paragraph + inline cites | Free tier Pro Search limit |
| NotebookLM | Synthesizing your own PDFs, papers, YouTube links | Mind maps, FAQs, audio podcasts | Only your uploaded sources |
| Gemini Deep Research | Multi-hour agent runs over 100+ sources | 10–20 page report | Slow, use for big questions |

Perplexity is your quick-draw. Type a question, get a sourced answer in 10 seconds. Enable **Pro Search** (2–3 free runs/day) for harder questions; it plans sub-queries, searches each, and synthesizes. Enable **Deep Research** for the big one-hour crawl.

NotebookLM is Google's underrated weapon. Upload up to 50 sources (PDFs, YouTube URLs, pasted text, Google Docs). It builds a private index you can ask, and refuses to answer from outside those sources. This is perfect for a literature review: upload 10 papers, ask "what is the consensus view on <X> and who disagrees?" — every answer is grounded in the exact source and paragraph. It also generates **audio overviews** (two AI hosts discussing your sources in podcast form, excellent for commute listening) and **mind maps** that give you an at-a-glance structure.

Gemini Deep Research is the heaviest hitter. You give it a prompt, it plans a research agenda (30–60 steps), shows you the plan, you edit it, and then it runs for 10–20 minutes crawling the open web. The output is a long structured report. Use this once or twice a week, not ten times a day.

### Read: Deep Research methodology and the hallucination check

**How these agents actually work.** Good multi-step research is four loops: (1) clarify the question, (2) decompose into sub-questions, (3) search and read each sub-question, (4) synthesize and flag contradictions. You can do this yourself with plain Perplexity if you follow the pattern manually. Ask the model first: "What are the 5 sub-questions I should answer before answering this?" Then send each sub-question as its own Perplexity query. Then ask a final model to synthesize. This DIY version beats single-shot search for almost every real research question and works on any free tier.

**Hallucination checklist.** Before you quote a fact in your brief: (1) Click the citation. (2) Confirm the source exists and is reputable. (3) Confirm the source actually says what the model claims. (4) Check the date — AI tools sometimes quote 2019 articles as if current. (5) For medical, legal, or financial claims, cross-verify on a second tool.

**Academic tools for later.** Elicit and Consensus specialize in peer-reviewed papers. SciSpace and Scholarcy summarize papers. Research Rabbit and Connected Papers build visual citation graphs — paste one paper, see its neighborhood. These are niche but amazing when you need them; bookmark for the literature-review stage of your capstone in Week 3.

### Watch: NotebookLM generates a podcast from your notes

A short demo where we drop a 30-page PDF on campus placement trends into NotebookLM and it produces a 9-minute podcast with two AI hosts, a mind map, and a study guide — in 90 seconds.

https://www.youtube.com/embed/EOmgC3-hznM

- Notice that the hosts actually disagree at 4:20; grounded models surface tension.
- Watch how the mind map reorganizes your doc by theme, not page order.
- See how clicking a claim jumps to the exact source sentence.

### Lab: Research brief on your capstone domain

Time: 45 minutes. Artifact: a 1-page Markdown brief with 5+ citations.

1. Pick one capstone domain you are curious about (hostel food logistics, DSA interview prep, campus event discovery, lab-report automation — anything). Write a one-line problem statement.
2. Open https://www.perplexity.ai. Turn on **Pro Search**. Paste today's prompt-of-the-day with `{{topic}}` filled in. Save the response.
3. From the Perplexity answer, pick the 5 most relevant citations. Download those sources as PDFs, or copy their URLs.
4. Open https://notebooklm.google.com. Create a new notebook called "capstone-<your-topic>". Add the 5 sources.
5. In NotebookLM, ask: "What do these sources agree on? Where do they disagree? What is missing?" Save the answer.
6. Generate an **Audio Overview** of the notebook. Listen while you do the next step.
7. Open https://gemini.google.com and toggle on **Deep Research**. Submit a refined version of your question. Let it run in the background.
8. Combine the Perplexity answer, the NotebookLM synthesis, and the Deep Research excerpts into a single 1-page Markdown brief. Every factual claim must carry a citation. Save as `brief-<topic>.md`.

> ⚠️ **If you get stuck**
> - *Perplexity Pro Search hits the daily free-tier cap mid-lab* → switch to plain Perplexity for follow-up sub-queries, or run the same question on Gemini with grounding on; save Pro Search for the single hardest question.
> - *NotebookLM keeps citing only one of your five sources* → your other sources are probably too similar or too short; swap in one contrasting source (a critical blog post, a competing paper) and re-ask — it forces the model to triangulate.
> - *A citation link 404s or paywalls* → do not quote the claim. Either find a second source that makes the same point, or rewrite the sentence as "one 2025 Perplexity synthesis suggested X" and flag it as unverified in your brief.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Did any of your tools disagree on a factual claim? Which did you believe and why? | Quotes both claims verbatim, names the sources behind each, and describes the tiebreaker you used (recency, publisher credibility, whether the source actually says what was claimed). "I just went with Perplexity" is not enough. |
| When is it okay to skip clicking citations, and when is it negligent? | Draws a line based on stakes (casual curiosity vs. capstone brief vs. medical/legal/financial). Mentions at least one failure mode you personally hit today when you skipped a click. |
| Did the audio overview change how you understood your own sources? | Points to a specific moment in the podcast (disagreement, emphasis, reframe) that reorganized your take. If it did not change anything, explains why — maybe your sources were too aligned. |
| Which capstone ideas got stronger after the research, and which got killed? | Names one idea whose scope got smaller and sharper, and one that dies because research showed it is solved, saturated, or unfundable for a student. Shows you updated your priors. |
| Is AI search replacing Google for you yet, or are you still hedging? | Honest about the hedge: identifies the query types where Google still wins (navigational, local, very recent niche) and the ones that permanently moved. No all-or-nothing declarations. |

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action: lock the brief + audio overview (~45 min)

1. Finalize `brief-<topic>.md` — one page, with at least 5 inline citations, every factual claim linked.
2. Generate and share the NotebookLM Audio Overview link (or record a 30-second voice note reacting to it).
3. Add one "I almost quoted this…" sentence naming a claim you had to drop or rewrite after clicking the citation.

### 2. Reflect (~10 min)

*Where did a citation not actually support the claim above it, and what did you do?* A good reflection quotes the model's sentence verbatim, quotes the source's actual words, and describes the exact decision — rewrite, drop, or find a second source. If you never hit that moment, you probably did not click enough links; go back and click five more.

### 3. Quiz (~17 min)

Includes transfer scenarios + spaced recall from earlier days (~8+ items total). If a question feels easy, treat it as speed practice.

Four questions on the dashboard. What is the difference between Perplexity Pro Search and Deep Research? Why does NotebookLM refuse to answer from the open web, and when is that a feature rather than a bug? What are the four steps of the hallucination check? And which of today's tools would you use to map the 30 most-cited papers around a niche research question?

### 4. Submit (~5 min)

Post to the cohort channel before 11 pm:

1. Your 1-page `brief-<topic>.md` with at least 5 inline citations.
2. The NotebookLM audio overview link (or a 30-second voice note reacting to it).
3. One sentence: "I almost quoted this, then clicked the citation and found…" — show us one claim you had to drop or rewrite.

**Peer or self-review:** One line (chat or DM): what changed after someone skimmed your artifact — or the biggest gap if you worked solo.

**Stretch (optional):** Pick one rubric row and over-ship it (extra example, tighter screenshot, or second iteration).

### 5. Deepen (optional, ~30 min)

- **Extra read**: Try [Consensus](https://consensus.app) or [Elicit](https://elicit.com) on the single research question you cared most about today. Notice how the "yes/no/mixed" summary differs from a Perplexity paragraph.
- **Try**: Paste your single best source into [Research Rabbit](https://researchrabbit.ai) or [Connected Papers](https://www.connectedpapers.com) and explore its citation neighborhood. Bookmark two new papers you did not know existed.

### 6. Prep for Day 8 (~30-40 min — important)

**Tomorrow pixels become free.** Day 8 is image + video generation — Nano Banana (Imagen via AI Studio), Adobe Firefly, Kling AI — plus the six-slot image prompt template (subject, action, setting, style, composition, modifiers). You'll ship a 2:3 print-ready poster and a 10-second MP4 for your capstone. Day 10's ideathon is coming; your pitch deserves to look real.

- [ ] **Skim ahead**: the [Firefly user guide](https://firefly.adobe.com) intro on prompt structure — subject, style, composition. Same vocabulary you'll use tomorrow.
- [ ] **Think**: lock a capstone **working title** (one or two words) and pick **two color hex codes** for the poster palette. Pre-deciding saves you from dithering mid-lab.
- [ ] **Set up**: sign in at [Google AI Studio](https://aistudio.google.com) so Nano Banana loads without a sign-up wall; create accounts on [Adobe Firefly](https://firefly.adobe.com) and [Kling AI](https://klingai.com) — both gate generation behind email verify.

---

## 📚 Extra / additional references

Optional deep-dives. Pick what interests you; skip what doesn't.

### Short watches

- [NotebookLM generates a podcast from your notes](https://www.youtube.com/embed/EOmgC3-hznM) — the class demo at 1.5x.

### Reading

- [Perplexity Pro Search docs](https://www.perplexity.ai) — the vocabulary of Pro Search, Focus, Sources.
- [NotebookLM help](https://notebooklm.google.com) — how Audio Overviews and source-grounding work.
- [Elicit](https://elicit.com) — structured answers across peer-reviewed papers.
- [Consensus](https://consensus.app) — yes/no/mixed synthesis for scientific claims.
- [SciSpace](https://scispace.com), [Scholarcy](https://www.scholarcy.com) — paper summarization when PDFs pile up.

### Play

- [Perplexity](https://www.perplexity.ai) — quick-draw grounded answers.
- [NotebookLM](https://notebooklm.google.com) — private index over your own sources, plus audio overviews.
- [Gemini Deep Research](https://gemini.google.com) — the long agent run over 100+ sources.
- [Research Rabbit](https://researchrabbit.ai), [Connected Papers](https://www.connectedpapers.com) — visual citation graphs for literature review.
