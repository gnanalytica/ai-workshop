---
reading_time: 14 min
tldr: "Google gives you links. AI research tools give you a grounded answer with citations you can actually trust."
tags: ["exposure", "tools"]
video: https://www.youtube.com/embed/EOmgC3-hznM
lab: {"title": "Ship a 1-page research brief on your capstone domain", "url": "https://www.perplexity.ai"}
prompt_of_the_day: "Act as a senior analyst. Produce a research brief on {{topic}} for a capstone feasibility review. Structure: (1) problem in one paragraph, (2) 5 recent developments (last 18 months) with citations, (3) 3 existing solutions + their gaps, (4) 3 open questions worth a student project, (5) my 60-second verdict. Cite every factual claim inline."
tools_hands_on: [{"name": "Perplexity", "url": "https://www.perplexity.ai"}, {"name": "NotebookLM", "url": "https://notebooklm.google.com"}, {"name": "Gemini Deep Research", "url": "https://gemini.google.com"}]
tools_demo: [{"name": "NotebookLM Audio Overview", "url": "https://notebooklm.google.com"}]
tools_reference: [{"name": "Elicit", "url": "https://elicit.com"}, {"name": "Consensus", "url": "https://consensus.app"}, {"name": "SciSpace", "url": "https://scispace.com"}, {"name": "Research Rabbit", "url": "https://researchrabbit.ai"}, {"name": "Connected Papers", "url": "https://www.connectedpapers.com"}, {"name": "Scholarcy", "url": "https://www.scholarcy.com"}]
resources: [{"name": "Perplexity Pro Search docs", "url": "https://www.perplexity.ai"}, {"name": "NotebookLM help", "url": "https://notebooklm.google.com"}]
---

## Intro

Yesterday you built a thinking partner. Today you give it a library card. By the end of today, you will never again start a capstone idea with a raw Google search. You will start with a research brief, grounded in citations, that took you 20 minutes instead of two afternoons.

> 🧠 **Quick glossary**
> - **Grounding** = every sentence the model writes must map back to a retrieved source (no invented facts).
> - **Citations** = the little [1][2][3] markers you should always click to verify.
> - **Pro Search / Deep Research** = multi-step agent runs that decompose a question into sub-queries and synthesize.
> - **Hallucination** = the model stating something false with confidence. Use the 4-step check.
> - **Audio Overview** = NotebookLM's auto-generated podcast with two AI hosts discussing your sources.

### Today's 1-hour live session

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min  | Keyword search vs grounded answer — why Google is not enough |
| Mini-lecture | 20 min | Perplexity + NotebookLM + Deep Research — when to use which |
| Live lab     | 20 min | Ship a 1-page research brief on your capstone domain |
| Q&A + discussion | 15 min | Trusting the machine — citations, disagreements, dropped claims |

**Before class** (~10 min): pick one capstone domain and write a one-line problem statement.
**After class** (~30 min tonight): finalize `brief-<topic>.md` with 5+ inline citations and post the NotebookLM audio overview to the cohort channel.

## Read: Search is dead. Long live grounded research.

For twenty years, research meant: Google, click ten blue links, skim ten tabs, take notes. The bottleneck was not finding information; it was synthesizing it. In 2026 that synthesis step is free.

**Keyword search vs AI search.** A keyword search returns documents that contain your words. An AI search reads those documents and writes you an answer. The difference matters because most of your questions are not "find me the document"; they are "tell me what is going on". A student Googling "best battery chemistry for campus solar cart" gets ads and old blog posts. The same student on Perplexity gets a 400-word synthesis of LiFePO4 vs NMC tradeoffs with six citations from 2025 papers and one from a Reddit thread flagged as anecdotal.

**Grounding and citations: the only thing separating research from hallucination.** A grounded model cannot invent a claim; every sentence must map to a retrieved source. The user interface shows the little [1][2][3] markers. Click them. Always click them. About 10% of the time the source does not actually say what the model claims; that is your signal to rewrite the claim or drop it. Treat citations as evidence, not decoration.

**The three research tools you need, and when.**

| Tool | Best for | Output | Watch out for |
|------|----------|--------|---------------|
| Perplexity | Fast web-grounded Q&A, news, comparisons | Paragraph + inline cites | Free tier Pro Search limit |
| NotebookLM | Synthesizing your own PDFs, papers, YouTube links | Mind maps, FAQs, audio podcasts | Only your uploaded sources |
| Gemini Deep Research | Multi-hour agent runs over 100+ sources | 10–20 page report | Slow, use for big questions |

Perplexity is your quick-draw. Type a question, get a sourced answer in 10 seconds. Enable **Pro Search** (2–3 free runs/day) for harder questions; it plans sub-queries, searches each, and synthesizes. Enable **Deep Research** for the big one-hour crawl.

NotebookLM is Google's underrated weapon. Upload up to 50 sources (PDFs, YouTube URLs, pasted text, Google Docs). It builds a private index you can ask, and refuses to answer from outside those sources. This is perfect for a literature review: upload 10 papers, ask "what is the consensus view on <X> and who disagrees?" — every answer is grounded in the exact source and paragraph. It also generates **audio overviews** (two AI hosts discussing your sources in podcast form, excellent for commute listening) and **mind maps** that give you an at-a-glance structure.

Gemini Deep Research is the heaviest hitter. You give it a prompt, it plans a research agenda (30–60 steps), shows you the plan, you edit it, and then it runs for 10–20 minutes crawling the open web. The output is a long structured report. Use this once or twice a week, not ten times a day.

**Deep Research methodology: how these agents actually work.** Good multi-step research is four loops: (1) clarify the question, (2) decompose into sub-questions, (3) search and read each sub-question, (4) synthesize and flag contradictions. You can do this yourself with plain Perplexity if you follow the pattern manually. Ask the model first: "What are the 5 sub-questions I should answer before answering this?" Then send each sub-question as its own Perplexity query. Then ask a final model to synthesize. This DIY version beats single-shot search for almost every real research question and works on any free tier.

**Hallucination checklist.** Before you quote a fact in your brief: (1) Click the citation. (2) Confirm the source exists and is reputable. (3) Confirm the source actually says what the model claims. (4) Check the date — AI tools sometimes quote 2019 articles as if current. (5) For medical, legal, or financial claims, cross-verify on a second tool.

**Academic tools for later.** Elicit and Consensus specialize in peer-reviewed papers. SciSpace and Scholarcy summarize papers. Research Rabbit and Connected Papers build visual citation graphs — paste one paper, see its neighborhood. These are niche but amazing when you need them; bookmark for the literature-review stage of your capstone in Week 3.

## Watch: NotebookLM generates a podcast from your notes

A short demo where we drop a 30-page PDF on campus placement trends into NotebookLM and it produces a 9-minute podcast with two AI hosts, a mind map, and a study guide — in 90 seconds.

https://www.youtube.com/embed/EOmgC3-hznM

- Notice that the hosts actually disagree at 4:20; grounded models surface tension.
- Watch how the mind map reorganizes your doc by theme, not page order.
- See how clicking a claim jumps to the exact source sentence.

## Lab: Research brief on your capstone domain

Time: 45 minutes. Artifact: a 1-page Markdown brief with 5+ citations.

1. Pick one capstone domain you are curious about (hostel food logistics, DSA interview prep, campus event discovery, lab-report automation — anything). Write a one-line problem statement.
2. Open https://www.perplexity.ai. Turn on **Pro Search**. Paste today's prompt-of-the-day with `{{topic}}` filled in. Save the response.
3. From the Perplexity answer, pick the 5 most relevant citations. Download those sources as PDFs, or copy their URLs.
4. Open https://notebooklm.google.com. Create a new notebook called "capstone-<your-topic>". Add the 5 sources.
5. In NotebookLM, ask: "What do these sources agree on? Where do they disagree? What is missing?" Save the answer.
6. Generate an **Audio Overview** of the notebook. Listen while you do the next step.
7. Open https://gemini.google.com and toggle on **Deep Research**. Submit a refined version of your question. Let it run in the background.
8. Combine the Perplexity answer, the NotebookLM synthesis, and the Deep Research excerpts into a single 1-page Markdown brief. Every factual claim must carry a citation. Save as `brief-<topic>.md`.

## Quiz

Four questions to check the reflex. What is the difference between Perplexity Pro Search and Deep Research? Why does NotebookLM refuse to answer from the open web, and when is that a feature rather than a bug? What are the four steps of the hallucination check? And which of today's tools would you use to map the 30 most-cited papers around a niche research question?

## Assignment

Post to the cohort channel:

1. Your 1-page `brief-<topic>.md` with at least 5 inline citations.
2. The NotebookLM audio overview link (or a 30-second voice note reacting to it).
3. One sentence: "I almost quoted this, then clicked the citation and found…" — show us one claim you had to drop or rewrite.

## Discuss: Trusting the machine

- Did any of your tools disagree on a factual claim? Which did you believe and why?
- When is it okay to skip clicking citations, and when is it negligent?
- Did the audio overview change how you understood your own sources?
- Which capstone ideas got stronger after the research, and which got killed?
- Is AI search replacing Google for you yet, or are you still hedging?
