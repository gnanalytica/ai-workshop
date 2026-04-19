---
reading_time: 14 min
tldr: "RAG lets AI answer questions about YOUR stuff — notes, PDFs, docs — without retraining anything."
tags: ["rag", "embeddings", "ai"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Build a Q&A bot over your lecture notes with NotebookLM", "url": "https://notebooklm.google.com/"}
prompt_of_the_day: "Answer ONLY using the context below. If the answer is not in the context, say 'not in the provided notes.' Cite the source file and page.\n\nContext: {{context}}\n\nQuestion: {{question}}"
resources: [{"title": "NotebookLM", "url": "https://notebooklm.google.com/"}, {"title": "Open WebUI (local RAG)", "url": "https://openwebui.com/"}, {"title": "HuggingFace Chat", "url": "https://huggingface.co/chat/"}]
---

## Intro

Yesterday you saw text become coordinates. Today you put those coordinates to work. RAG — Retrieval-Augmented Generation — is how ChatGPT-like apps answer questions about your specific documents without ever retraining the model. By tonight you'll have a Q&A bot over your own lecture notes.

## Read: Giving AI your stuff

A frozen LLM knows what was on the internet up to its training cutoff. It does not know your lecture notes, your startup's internal docs, or your syllabus for this semester. It also doesn't know last week's news. So how does "chat with your PDF" work? RAG.

### The core idea in one line

Before the model answers, we retrieve the relevant chunks of your documents and paste them into the prompt. The model then generates an answer grounded in those chunks, not its memory.

```
Read this, don't type it

 user question  ->  search your docs (via embeddings)  ->  top 3 chunks
                                                                |
                                                                v
                                      [ question + top 3 chunks ] -> LLM -> answer with sources
```

That's the whole pattern. "Retrieval" (find relevant text) + "Augmented" (stuff it into the prompt) + "Generation" (the LLM writes the answer).

### Why not just paste the whole PDF?

Two reasons.

- Context windows are finite. A 128K-token window sounds huge but a 300-page textbook plus all your notes blows past it.
- Accuracy drops in huge contexts. Models get distracted by irrelevant material. Feeding 3 relevant chunks beats feeding 300 random pages, even if both fit.

### The RAG pipeline, step by step

You'll see this pipeline in every RAG product on earth, from NotebookLM to enterprise search.

| Step | What happens | Analogy |
|---|---|---|
| 1. Chunk | Split documents into ~500-word pieces | Cut a book into flashcards |
| 2. Embed | Turn each chunk into a vector | Assign each flashcard coordinates |
| 3. Store | Put vectors in a vector database | Drop flashcards onto a meaning map |
| 4. Retrieve | Embed the user's question, find nearest chunks | "Which flashcards sit nearest this question?" |
| 5. Augment | Paste top chunks into the prompt | Hand the model those flashcards |
| 6. Generate | LLM writes an answer grounded in the chunks | The model reads the flashcards, then writes |

Every RAG system is some version of these six steps. The rest is UX and infrastructure.

### Why RAG beats "just fine-tune the model"

Fine-tuning — retraining a model on your data — is expensive, slow, and leaks information. RAG is cheaper, faster, and lets you update your data anytime without touching the model.

| Aspect | Fine-tuning | RAG |
|---|---|---|
| Cost | High | Low |
| Speed to update | Days | Seconds (just re-embed new docs) |
| Accuracy on your data | Good | Excellent (uses exact passages) |
| Citation / sourcing | Hard | Built-in (chunks have filenames) |
| Privacy | Risky | Docs stay in your vector DB |

For 95% of "chat with your docs" use cases, RAG wins.

### Common failure modes

- Bad chunking. Splitting mid-sentence breaks meaning. Fix: chunk by paragraph or sliding window.
- Wrong embedding model. Different embedding models have different strengths. Keep query and document embeddings in the same model.
- Model ignores the context. Fix: the prompt-of-the-day pattern — "answer ONLY using context below; if missing, say so."
- Irrelevant top chunks. Fix: increase the number of retrieved chunks, or add a reranker (a second model that sorts chunks by quality).

### NotebookLM: RAG with zero code

Google's NotebookLM is a free, polished RAG product. Upload PDFs, slides, YouTube transcripts, or pasted text. Ask questions. Get cited, source-linked answers. It is the fastest possible demo of what you're building toward. Under the hood, it runs the six-step pipeline above — you just don't see the plumbing.

## Watch: RAG end to end

A clear walkthrough of the full RAG pipeline with a running example — upload a PDF, watch it chunk, see embeddings go into a store, watch retrieval fire, then the final generation. No code heavy.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Notice how chunking choices affect answer quality.
- Watch where the citations come from in the final output.
- Observe the prompt template stuffing chunks in at the end.

## Lab: Turn your lecture notes into a Q&A bot

Two paths: zero-code with NotebookLM, and lightly-local with Open WebUI. Do the first, and if time permits, the second.

1. Collect 3–5 documents from your semester. PDFs of lecture notes, course slides, a syllabus, your own Google Docs exported as PDF — whatever's real. Aim for 50–200 pages total.
2. Open https://notebooklm.google.com/ and sign in with Google. Click "New notebook."
3. Upload your documents as sources. Wait for NotebookLM to process (it chunks and embeds in the background).
4. Ask a hard, specific question — something you'd normally scroll through a PDF to find. Example: "According to my operating systems notes, what's the difference between a semaphore and a mutex? Cite the slide." Notice every sentence in the answer links back to the source.
5. Ask an out-of-scope question: "What's the weather in Bengaluru?" Confirm NotebookLM refuses or says not available. That's the grounding working.
6. Use the "Audio Overview" feature to generate a podcast of your notes. This is RAG + TTS — beautiful demo to show friends.
7. Open https://openwebui.com/ (the one you installed Day 16). Create a new chat, click the paperclip, upload one of your PDFs. Ask the same questions. Compare NotebookLM vs. local Open WebUI. Which cited better? Which was faster?
8. Paste today's prompt-of-the-day into any chat LLM. Fill `{{context}}` with a paragraph from your notes and `{{question}}` with something specific. Notice how the grounded pattern forces honest answers.

## Quiz

Four questions: what RAG stands for, why we don't just paste whole PDFs, which step uses embeddings, and one scenario asking when fine-tuning beats RAG (hint: almost never, unless you need new behaviors vs. new knowledge).

## Assignment

Build a NotebookLM notebook for your capstone. Upload anything relevant — research, course docs, competitor apps' landing pages saved as PDF. Ask it 5 questions you'll actually need answered to build on Day 21. Screenshot the Q&A and submit.

## Discuss: Grounded AI

- Which felt more trustworthy — NotebookLM or Open WebUI — and why?
- Where did your RAG setup mess up? What would you change?
- RAG cites sources. ChatGPT (without browsing) doesn't. How does that change how you'd use each?
- What docs would you NEVER want to upload to a cloud RAG? What does that tell you about local RAG?
- How would your capstone change if you had a RAG system over every document your target users care about?
