---
reading_time: 18 min
tldr: "Turn your PDFs into a RAG bot, store embeddings in pgvector, meet GraphRAG — and learn when to prompt vs retrieve vs fine-tune, plus vision in the loop for scans and screenshots."
tags: ["build", "technical"]
video: https://www.youtube.com/embed/T-D1OfcDW1M
lab: {"title": "Build a working RAG bot on your capstone PDFs (NotebookLM + LlamaIndex + pgvector)", "url": "https://notebooklm.google"}
prompt_of_the_day: "Act as a RAG architect. My corpus is {{corpus_description}} (size, formats, domain). Recommend: (1) chunk size + overlap, (2) embedding model, (3) vector store, (4) when I should switch to GraphRAG instead of chunk-based RAG. Justify each choice in one line."
tools_hands_on: [{"name": "NotebookLM", "url": "https://notebooklm.google"}, {"name": "LlamaIndex", "url": "https://docs.llamaindex.ai"}, {"name": "Neon pgvector", "url": "https://neon.com"}]
tools_demo: [{"name": "Neo4j AuraDB", "url": "https://neo4j.com/cloud/aura/"}, {"name": "Microsoft GraphRAG", "url": "https://github.com/microsoft/graphrag"}, {"name": "Graphify", "url": "https://github.com/graphify"}]
tools_reference: [{"name": "Chroma", "url": "https://trychroma.com"}, {"name": "Qdrant", "url": "https://qdrant.tech"}, {"name": "Pinecone", "url": "https://pinecone.io"}, {"name": "Sentence-Transformers", "url": "https://sbert.net"}, {"name": "HF MTEB embeddings leaderboard", "url": "https://huggingface.co/spaces/mteb/leaderboard"}, {"name": "Hugging Face — fine-tuning hub", "url": "https://huggingface.co/docs/transformers/training"}, {"name": "OpenAI — vision (multimodal)", "url": "https://platform.openai.com/docs/guides/images-vision"}]
resources: [{"name": "LlamaIndex + Ollama tutorial", "url": "https://docs.llamaindex.ai/en/stable/examples/llm/ollama/"}, {"name": "pgvector docs", "url": "https://github.com/pgvector/pgvector"}]
objective:
  topic: "Embeddings, RAG, GraphRAG, prompt-vs-RAG-vs-fine-tune, multimodal docs"
  tools: ["NotebookLM", "LlamaIndex", "Neon pgvector"]
  end_goal: "Ship a working RAG bot that answers 5 real questions from your own PDFs, plus a before/after from tuning one knob (chunk size, top-K, or embedder)."
---

## 🎯 Today's objective

**Topic.** Embeddings (coordinates for meaning), RAG (retrieve → augment → generate), when GraphRAG beats chunks — plus **when to prompt vs retrieve vs fine-tune**, and **vision** for scans and screenshots.

**Tools you'll use.** NotebookLM (zero-code), LlamaIndex (swap-in-swap-out framework), pgvector on Neon (production-shaped).

**End goal.** By the end of today you will have:
1. A RAG bot that answers 5 questions from *your own PDFs*.
2. A before/after from tuning one knob — chunk size, top-K, or embedder.
3. A clear mental line between when chunking is enough and when a knowledge graph would help.
4. A decision rule for **prompt vs RAG vs fine-tuning**, and when **vision** beats text-only pipelines.

---

### 🌍 Real-life anchor

**The picture.** **Prompt** = instructions you say once. **RAG** = open-book exam with your own photocopied chapters stapled in. **Fine-tuning** = sending someone to trade school so their *defaults* change — slow, costly, and wrong fix if the handbook updates weekly. **Vision** = the invigilator lets you bring a **photo** of the board, not just typed notes.

**Why it matches today.** That quartet is exactly how builders specialize an LLM without fooling themselves about which lever does what.

## ⏪ Pre-class · ~20 min

**Faculty note.** Budget ~2 minutes for the 🌍 *Real-life anchor* above — read it aloud or ask one volunteer to restate it in their own words — so the analogy lands before setup.

**Revision / context.** Yesterday (Day 17) you ran three prompt variants against a 10-row eval set and measured win rates in Langfuse. Today the eval skill transfers directly: your 5 PDF questions from pre-class are the new eval set, and we're comparing retrieval strategies instead of prompt variants. Keep your Langfuse account open — we'll trace RAG calls the same way.

Show up with PDFs in hand and a Neon project waiting — the lab only works if your corpus is real.

### Setup (10 min)
- [ ] Sign up free at https://neon.com — pick the free tier, create a project in the region nearest you (Mumbai / Singapore).
- [ ] Inside that project, enable the `vector` extension (Neon has it preinstalled; just toggle in the dashboard or run `CREATE EXTENSION vector;`).
- [ ] Open https://notebooklm.google and sign in with your Google account so you skip onboarding in class.

### Gather your corpus (7 min)
- [ ] Collect **3-5 real PDFs** you care about: lecture notes, a research paper, your college handbook, internship reports. Put them in one folder called `capstone-pdfs/`.
- [ ] Write down 5 actual questions you'd want an AI to answer from those PDFs — these become your eval set.

### Primer (3 min)
- [ ] Watch a short RAG explainer on YouTube — search "What is RAG LangChain 5 min" or "Retrieval Augmented Generation explained". Any crisp 3-5 min video works.
- [ ] Skim https://github.com/pgvector/pgvector README — just the intro, so `vector(384)` doesn't look scary tomorrow.

> 🧠 **Quick glossary for today**
> - **Embedding** = a vector of numbers that captures the meaning of a piece of text.
> - **Vector DB** = a database that stores embeddings and finds nearest neighbours fast (pgvector, Chroma, Qdrant).
> - **Cosine similarity** = the closeness score between two embeddings (−1 to 1; >0.8 is "very close").
> - **RAG** = Retrieval-Augmented Generation: ingest → retrieve → generate from *your* docs.
> - **Knowledge graph** = a database of entities (nodes) and relationships (edges) for multi-hop questions.
> - **Chunk** = a 300–800 token slice of a document with some overlap to its neighbour.
> - **Fine-tuning / adapter (e.g. LoRA)** = adjusting model weights (or a small adapter layer) on *your* labeled pairs or tasks so the model "defaults" to your style or schema — different from stuffing context at query time.

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Recap + hook | 5 min | Why the LLM doesn't know about *your* PDFs |
| Mini-lecture | 20 min | Embeddings, cosine similarity, RAG in 3 steps, when GraphRAG beats chunking |
| Live lab | 20 min | Upload capstone PDFs to NotebookLM + sketch a pgvector schema together |
| Q&A + discussion | 15 min | Which 5 questions failed, and was it chunking or retrieval? |

### In-class checkpoints

- **Live poll (LMS)** — Run the **dashboard Live poll** for today so counts match in-class discussion (same wording as the official cohort poll for this day).
- **Lab confidence (quick)** — After the live lab: fist-of-5 on shipping tonight's artifact (Zoom hands; not graded).
- **Cold-open**: instructor asks plain ChatGPT a question from their own college handbook; watches it hallucinate; asks "what does the model NOT know?"
- **Think-pair-share**: in 90 seconds, name one document you wish AI "knew" and the exact 5 questions you'd ask it.
- **Live embedding demo**: instructor embeds "Bengaluru traffic is awful" and "Public transit in Bangalore is a mess"; class guesses cosine similarity before the reveal.
- **Breakout**: in trios, decide for a capstone corpus — plain RAG, hierarchical chunks, or GraphRAG — and defend the call in 60 seconds.
- **Failure clinic**: one volunteer shares a RAG question that fumbled; class debates whether it's a chunking, retrieval, or generation bug.

### Read: Embeddings, RAG, and when graphs beat chunks

**Embeddings are coordinates for meaning.** Take any piece of text — a sentence, a paragraph, a whole doc — and an **embedding model** turns it into a list of numbers called a vector, usually 384, 768, or 1536 dimensions long. The magic property: sentences with similar meaning end up close in this high-dimensional space. "The cat sat on the mat" and "A feline rested on the rug" will be neighbours, even though they share almost no words. "Bengaluru traffic is awful" and "Public transit in Bangalore is a mess" will be near each other too.

The closeness metric is **cosine similarity**, a number between -1 and 1. Above 0.8 is "very close", around 0.5 is "loosely related", near 0 is "unrelated". This is how every modern search engine works under the hood — including Google, Spotify recommendations, and every AI chatbot that "remembers" your docs.

**Why embeddings beat keywords.** Keyword search asks "does this document contain these exact words?" Semantic search asks "is this document about the same *idea*?" A student searching "how to pay college fees online" should find a page titled "Tuition payment portal guide" — they share zero keywords but mean the same thing. Embeddings bridge that gap.

**RAG = Retrieval + Augmented Generation.** RAG is the pattern that powers 90% of production AI apps. Three steps:

1. **Ingest.** Chop your documents into chunks (typically 300–800 tokens each, with 10–20% overlap). Embed each chunk. Store `(chunk_text, embedding, metadata)` in a **vector database**.
2. **Retrieve.** When the user asks a question, embed the question. Find the top-K chunks nearest to it in vector space (K is usually 3–10).
3. **Generate.** Stuff those chunks into the LLM's context along with the question: "Given this context, answer the question." The LLM now answers from *your* data, not its training data.

That's the entire trick. Everything else is optimization.

**Prompting vs RAG vs fine-tuning — pick the smallest fix that works.** Students waste weeks on the wrong lever. Use this table before you touch a GPU:

| Lever | What you're doing | Reach for it when | Catch |
|-------|-------------------|-------------------|--------|
| **Prompting + context files** | Instructions, few-shots, CLAUDE.md-style rules | Output *shape* or *tone* is wrong; facts are generic; you can say the rule in a paragraph | Context window limits; does not magically know this week's 200-page handbook |
| **RAG (today's core)** | Retrieve chunks at query time, then generate | Facts live in **docs that change**; you need **citations**; corpus is too big to paste | Retrieval bugs (wrong chunk); latency; needs good chunking |
| **Fine-tuning / adapters** | Train weights on your dataset for a **stable mapping** | Classification with fixed labels; "always our JSON"; brand voice; *repeated* pattern cheap at inference | **Stale** when source docs change unless you retrain; does not replace citations |

**Default order:** try **prompt** → then **RAG** → then **fine-tune** only when the first two plateau *and* you have clean, labeled data. Fine-tuning is not a shortcut for "the model didn't read my PDF" — that's RAG. Day 17's eval habit is how you prove which lever moved the number.

**Chunking strategies — the unglamorous 80%.** The quality of RAG is mostly the quality of chunking.

- **Fixed-size chunking** — split every N tokens. Easy, dumb, often fine.
- **Sentence / paragraph chunking** — respect natural boundaries. Better recall on prose.
- **Semantic chunking** — split where meaning shifts (requires an extra embed step). Best quality, slowest to build.
- **Hierarchical chunking** — store both small chunks (for precision) and summaries of their parents (for context). Great for long documents.

Tip: always keep chunk **overlap** (the last ~15% of chunk N repeats as the first ~15% of chunk N+1) so facts that straddle a boundary aren't lost.

**Vector stores — where embeddings live.** Your options, from easiest to most production-ready:

- **NotebookLM** (Google) — fully managed, zero code. Upload PDFs, ask questions. Best 20-minute RAG on the planet.
- **Chroma** — open-source, runs on your laptop, Pythonic.
- **pgvector on Neon** — Postgres with a vector column. One database for both relational and vector data. Neon gives you a free serverless Postgres with pgvector preinstalled.
- **Qdrant / Pinecone / Weaviate** — dedicated managed vector DBs, great at billion-vector scale.

For a student capstone with 50–5000 docs, **Chroma** or **pgvector on Neon** is the sweet spot.

**Embedding models — not all equal.** `text-embedding-3-small` (OpenAI) is the workhorse default. `all-MiniLM-L6-v2` (384 dims) runs locally in milliseconds. `bge-large` and `nomic-embed-text` are strong open-source picks. Check the **MTEB leaderboard** on Hugging Face for fresh benchmarks. Rule: whatever embedder you used to ingest, you must use to query. Never mix models.

**When graphs beat chunks — GraphRAG intuition.** Chunk-based RAG breaks when the answer requires connecting facts across many documents. Example: "Which professors in the CSE department co-authored papers with Stanford researchers between 2020 and 2023?" No single chunk contains that answer — it lives in the *relationships* between entities.

**GraphRAG** (popularized by Microsoft) does this:

1. Run an LLM over your documents to extract entities (people, orgs, concepts) and relationships ("authored", "works at", "cites").
2. Store them in a **knowledge graph** — a database of nodes and edges — such as **Neo4j AuraDB** (free tier available).
3. Cluster the graph into communities and pre-summarize each community.
4. At query time, traverse the graph and feed both **chunks** and **community summaries** to the LLM.

GraphRAG shines for questions that are multi-hop ("A → B → C"), comparative ("who else is like X?"), or global ("what are the main themes across the corpus?"). It's overkill for simple FAQ lookup.

**Graphify** is a lightweight skill we use in this workshop to auto-extract knowledge graphs from any input — code, docs, papers, even images. You'll see it live today. The output: an HTML viewer + a JSON graph + an audit report. Great for turning messy PDFs into navigable structure.

**Multimodal inputs — when your "document" is pixels.** Text-only RAG assumes you can extract clean text. Real students bring **phone photos of boards**, **scanned forms**, and **screenshots of UIs** where OCR is messy.

Three patterns:

1. **OCR → then RAG** — run a serious OCR pass (or export "text" from the PDF tool) *before* chunking. Still your usual pipeline; quality depends on OCR.
2. **Caption → embed** — use a **vision model** (Gemini / GPT-4o-class) to describe each page or image, embed the *description* as the chunk. Good when layout matters more than exact words.
3. **Skip RAG for one-off** — "what does this single screenshot say?" often belongs in **one multimodal chat** with the image attached, not a vector database.

If NotebookLM or your chunker returns garbage on a PDF, check whether the file is **image-only pages** — that failure mode is vision/OCR, not "bad embeddings."

### Watch: NotebookLM to pgvector — RAG on increasing difficulty

Walkthrough starting with NotebookLM (5 minutes, zero code), then LlamaIndex + Ollama + Chroma (more control), then pgvector on Neon (production-shaped), and finally a GraphRAG demo in Neo4j.

https://www.youtube.com/embed/T-D1OfcDW1M

- NotebookLM handles 80% of student RAG use cases with zero setup.
- LlamaIndex gives you swap-in-swap-out control over chunker, embedder, retriever.
- pgvector = one DB for everything; cheap to run on Neon's free tier.
- Reach for graphs only when your questions span many docs.

### Lab: Build a RAG bot on your capstone PDFs

Budget 45–60 minutes. Pick whichever path matches your comfort level — all three count.

1. Collect 5–20 real PDFs for your capstone (textbook chapters, research papers, internal docs, lecture notes).
2. **Path A — NotebookLM:** go to notebooklm.google, create a new notebook, upload your PDFs. Ask it 5 questions from your assignment list. Note which it nailed and which it fumbled.
3. **Path B — LlamaIndex + Groq/HuggingFace + Chroma (cloud, no install):** use Claude/Cursor to scaffold a `SimpleDirectoryReader → VectorStoreIndex → query_engine` pipeline. Embeddings via HuggingFace Inference API free tier; generation via Groq. Storage in in-memory Chroma. You direct; it codes. (Only if your laptop has ≥ 8 GB RAM and you're curious, swap to Ollama's `nomic-embed-text` as a stretch.)
4. **Path C — pgvector on Neon:** create a free Neon project, enable the `vector` extension, create a `documents(id, content, embedding vector(384))` table. Have Claude generate the ingest + query SQL.
5. Write the 5 target questions down *before* you test — no moving the goalposts.
6. For each question, compare: did the answer cite the right source? Was it hallucinated? Was the retrieved chunk relevant?
7. Tune **one** knob: chunk size OR top-K OR embedder. Rerun. Was it better?
8. Optional: run **Graphify** or Microsoft GraphRAG on the same PDFs. Ask a multi-hop question. Did the graph version win?

> ⚠️ **If you get stuck**
> - *NotebookLM refuses your PDF as "unsupported" or strips content* → the PDF is probably scanned images; run it through an OCR step first (NotebookLM needs real text) or export pages as text.
> - *pgvector query returns nothing or wildly wrong chunks* → confirm ingest and query used the same embedder AND dimensions match your column type (`vector(384)` must match a 384-dim embedder like `all-MiniLM-L6-v2`).
> - *HuggingFace Inference API slow on large PDFs* → batch chunks in groups of 16–32 instead of one mega-call; use `sentence-transformers/all-MiniLM-L6-v2` (fast + free) over bigger embedders.

### Live discussion prompts

| Prompt | What a strong answer sounds like |
|---|---|
| Did NotebookLM surprise you — in a good or bad way? | Names a specific question it nailed or fumbled and hypothesizes why (chunking, citation, source weighting). |
| Which of your 5 questions failed, and was it a chunking problem or a retrieval problem? | Separates the two: did the right chunk exist AND get retrieved? Inspected the top-K before blaming generation. |
| Where in your capstone would a knowledge graph add real value over chunks? | Names a multi-hop, comparative, or global question that no single chunk could answer alone. |
| If embeddings are "coordinates for meaning", what would "coordinates for tone" look like? | Extends the analogy — sentiment axes, formality, persona — and admits where the metaphor breaks. |
| Would you trust a RAG bot to answer medical, legal, or academic questions? Under what conditions? | Names the guardrails they'd require: source citations, human sign-off, domain-specific evals, refusal on low confidence. |
| For your capstone, would prompting, RAG, or fine-tuning be the *wrong* first move — and why? | Picks one lever to *defer*, names a cheaper lever that should come first, cites a stale-data or citation requirement. |
| Where would vision (screenshots / scans) beat text-only chunking in your project? | Names a concrete user artifact (form photo, UI capture) and picks OCR vs caption-to-embed vs one-shot multimodal chat. |

---

## 📝 Post-class · ~2 hour focused block

Get a RAG bot answering 5 real questions from your own PDFs — no toy data, no demo corpus.

### 1. Immediate: ship the bot (~25 min)
- [ ] Pick your path: NotebookLM (easiest), LlamaIndex + Chroma (more control via https://trychroma.com), or pgvector on Neon (most production-shaped).
- [ ] Run all 5 of your pre-class questions. For each, paste: question, retrieved chunk(s), final answer.
- [ ] Tune **one** knob: chunk size (try 300 vs 800), top-K (try 3 vs 8), or swap embedder (e.g., `all-MiniLM-L6-v2` vs `bge-small-en` on HuggingFace). Record before/after.

### 2. Reflect (~10 min)

**Prompt:** *"Of my 5 questions, which broke the bot — and was the root cause chunking, retrieval, or generation?"* A strong answer separates the three layers: did the right chunk exist? Did it get retrieved in top-K? Did the model actually use it? Jot a few lines for your own record.

### 3. Quiz (~17 min)

Includes transfer scenarios + spaced recall from earlier days (~8+ items total). If a question feels easy, treat it as speed practice.

A few mental check-ins on the dashboard: What's the cosine similarity between two unrelated sentences, roughly? Why does chunk overlap matter? When would GraphRAG beat plain RAG — give one concrete capstone example? Why must ingest and query use the same embedder?

### 4. Submit the assignment (~5 min)

Post the NotebookLM link (or repo URL) plus your 5 Q&A pairs plus the one-knob before/after delta to the cohort channel.

**Peer or self-review:** One line (chat or DM): what changed after someone skimmed your artifact — or the biggest gap if you worked solo.

**Stretch (optional):** Pick one rubric row and over-ship it (extra example, tighter screenshot, or second iteration).


### 5. Deepen (optional, ~30 min)
- [ ] Try Graphify (`/graphify` in Claude Code) or Microsoft GraphRAG at https://github.com/microsoft/graphrag on the same PDFs. Ask one multi-hop question that chunk RAG fumbled.
- [ ] Explore Neo4j AuraDB free tier at https://neo4j.com/cloud/aura/ — peek at a sample graph.

### 6. Prep for Day 19 (~30-40 min — IMPORTANT, new content)

**Tomorrow is about leverage you can't unsee — context engineering.** Day 19: stop re-explaining your project every chat. Write one CLAUDE.md + AGENTS.md + 3 slash commands and your AI remembers your project forever.

- [ ] **Pick your harness**. Your options, lightest to heaviest: Google Antigravity (antigravity.google.com, web, free), Google AI Studio (aistudio.google.com, web), Google Code Assist (codeassist.google/, free VS Code plugin), Claude Code (claude.com/claude-code, CLI), Cursor (cursor.com, desktop app), or aider (aider.chat, OSS CLI). Install whichever fits your laptop.
- [ ] **Open your capstone folder.** If you haven't made one yet, create it now and run `git init` so the AI harness has a repo to read.
- [ ] **Skim** the Anthropic Claude Code docs at https://docs.claude.com/claude-code — especially the "Memory & CLAUDE.md" and "Slash commands" sections.
- [ ] **Read** the one-page AGENTS.md spec at https://agents.md. Shorter than this prep list.
- [ ] **Jot down the 3 things you re-explain to AI every chat** on your capstone — these become your first CLAUDE.md rules.

---

## 📚 Extra / additional references

### Short watches

- [NotebookLM → pgvector walkthrough](https://www.youtube.com/embed/T-D1OfcDW1M) — re-watch once you've built your own.

### Reading

- **Zero-code RAG**: [NotebookLM](https://notebooklm.google).
- **When to fine-tune vs RAG** (deeper): [Hugging Face — fine-tuning](https://huggingface.co/docs/transformers/training) — pair with today's table; most capstones stop at RAG + good prompts.
- **Frameworks**: [LlamaIndex](https://docs.llamaindex.ai), [LlamaIndex + Ollama tutorial](https://docs.llamaindex.ai/en/stable/examples/llm/ollama/).
- **Vector stores**: [Neon (pgvector)](https://neon.com), [pgvector docs](https://github.com/pgvector/pgvector), [Chroma](https://trychroma.com), [Qdrant](https://qdrant.tech), [Pinecone](https://pinecone.io).
- **Embedding models + leaderboard**: [Sentence-Transformers](https://sbert.net), [MTEB embeddings leaderboard](https://huggingface.co/spaces/mteb/leaderboard).

### Play

- **GraphRAG**: [Neo4j AuraDB](https://neo4j.com/cloud/aura/), [Microsoft GraphRAG](https://github.com/microsoft/graphrag), [Graphify](https://github.com/graphify).
