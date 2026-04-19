---
reading_time: 15 min
tldr: "Turn your PDFs into a RAG bot, store embeddings in pgvector, and meet GraphRAG — when graphs beat chunks."
tags: ["build", "technical"]
video: https://www.youtube.com/embed/T-D1OfcDW1M
lab: {"title": "Build a working RAG bot on your capstone PDFs (NotebookLM + LlamaIndex + pgvector)", "url": "https://notebooklm.google"}
prompt_of_the_day: "Act as a RAG architect. My corpus is {{corpus_description}} (size, formats, domain). Recommend: (1) chunk size + overlap, (2) embedding model, (3) vector store, (4) when I should switch to GraphRAG instead of chunk-based RAG. Justify each choice in one line."
tools_hands_on: [{"name": "NotebookLM", "url": "https://notebooklm.google"}, {"name": "LlamaIndex", "url": "https://docs.llamaindex.ai"}, {"name": "Neon pgvector", "url": "https://neon.com"}]
tools_demo: [{"name": "Neo4j AuraDB", "url": "https://neo4j.com/cloud/aura/"}, {"name": "Microsoft GraphRAG", "url": "https://github.com/microsoft/graphrag"}, {"name": "Graphify", "url": "https://github.com/graphify"}]
tools_reference: [{"name": "Chroma", "url": "https://trychroma.com"}, {"name": "Qdrant", "url": "https://qdrant.tech"}, {"name": "Pinecone", "url": "https://pinecone.io"}, {"name": "Sentence-Transformers", "url": "https://sbert.net"}, {"name": "HF MTEB embeddings leaderboard", "url": "https://huggingface.co/spaces/mteb/leaderboard"}]
resources: [{"name": "LlamaIndex + Ollama tutorial", "url": "https://docs.llamaindex.ai/en/stable/examples/llm/ollama/"}, {"name": "pgvector docs", "url": "https://github.com/pgvector/pgvector"}]
---

## Intro

An LLM alone knows a lot about the world but nothing about *your* world — your PDFs, your notes, your company docs. Today we fix that. You'll learn embeddings (coordinates for meaning), build a RAG bot on your own documents, and meet GraphRAG — the technique that beats chunking when your data has structure.

## Read: Embeddings, RAG, and when graphs beat chunks

**Embeddings are coordinates for meaning.** Take any piece of text — a sentence, a paragraph, a whole doc — and an **embedding model** turns it into a list of numbers called a vector, usually 384, 768, or 1536 dimensions long. The magic property: sentences with similar meaning end up close in this high-dimensional space. "The cat sat on the mat" and "A feline rested on the rug" will be neighbours, even though they share almost no words. "Bengaluru traffic is awful" and "Public transit in Bangalore is a mess" will be near each other too.

The closeness metric is **cosine similarity**, a number between -1 and 1. Above 0.8 is "very close", around 0.5 is "loosely related", near 0 is "unrelated". This is how every modern search engine works under the hood — including Google, Spotify recommendations, and every AI chatbot that "remembers" your docs.

**Why embeddings beat keywords.** Keyword search asks "does this document contain these exact words?" Semantic search asks "is this document about the same *idea*?" A student searching "how to pay college fees online" should find a page titled "Tuition payment portal guide" — they share zero keywords but mean the same thing. Embeddings bridge that gap.

**RAG = Retrieval + Augmented Generation.** RAG is the pattern that powers 90% of production AI apps. Three steps:

1. **Ingest.** Chop your documents into chunks (typically 300–800 tokens each, with 10–20% overlap). Embed each chunk. Store `(chunk_text, embedding, metadata)` in a **vector database**.
2. **Retrieve.** When the user asks a question, embed the question. Find the top-K chunks nearest to it in vector space (K is usually 3–10).
3. **Generate.** Stuff those chunks into the LLM's context along with the question: "Given this context, answer the question." The LLM now answers from *your* data, not its training data.

That's the entire trick. Everything else is optimization.

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

## Watch: NotebookLM to pgvector — RAG on increasing difficulty

Walkthrough starting with NotebookLM (5 minutes, zero code), then LlamaIndex + Ollama + Chroma (more control), then pgvector on Neon (production-shaped), and finally a GraphRAG demo in Neo4j.

https://www.youtube.com/embed/T-D1OfcDW1M

- NotebookLM handles 80% of student RAG use cases with zero setup.
- LlamaIndex gives you swap-in-swap-out control over chunker, embedder, retriever.
- pgvector = one DB for everything; cheap to run on Neon's free tier.
- Reach for graphs only when your questions span many docs.

## Lab: Build a RAG bot on your capstone PDFs

Budget 45–60 minutes. Pick whichever path matches your comfort level — all three count.

1. Collect 5–20 real PDFs for your capstone (textbook chapters, research papers, internal docs, lecture notes).
2. **Path A — NotebookLM:** go to notebooklm.google, create a new notebook, upload your PDFs. Ask it 5 questions from your assignment list. Note which it nailed and which it fumbled.
3. **Path B — LlamaIndex + Ollama + Chroma:** use Claude/Cursor to scaffold a `SimpleDirectoryReader → VectorStoreIndex → query_engine` pipeline. You direct; it codes.
4. **Path C — pgvector on Neon:** create a free Neon project, enable the `vector` extension, create a `documents(id, content, embedding vector(384))` table. Have Claude generate the ingest + query SQL.
5. Write the 5 target questions down *before* you test — no moving the goalposts.
6. For each question, compare: did the answer cite the right source? Was it hallucinated? Was the retrieved chunk relevant?
7. Tune **one** knob: chunk size OR top-K OR embedder. Rerun. Was it better?
8. Optional: run **Graphify** or Microsoft GraphRAG on the same PDFs. Ask a multi-hop question. Did the graph version win?

## Quiz

A few mental check-ins: What's the cosine similarity between two unrelated sentences, roughly? Why does chunk overlap matter? When would GraphRAG beat plain RAG — give one concrete capstone example? Why must ingest and query use the same embedder?

## Assignment

Ship a **working RAG bot** that answers **5 questions** about your capstone domain from your own PDFs. For each question, paste: the question, the retrieved chunk(s), and the final answer. Tune at least one parameter (chunk size, top-K, or embedder) and show a before/after. Post the repo or NotebookLM link in the cohort channel.

## Discuss: Chunks, graphs, and what your corpus needs

- Did NotebookLM surprise you — in a good or bad way?
- Which of your 5 questions failed, and was it a chunking problem or a retrieval problem?
- Where in your capstone would a knowledge graph add real value over chunks?
- If embeddings are "coordinates for meaning", what would "coordinates for tone" look like?
- Would you trust a RAG bot to answer medical, legal, or academic questions? Under what conditions?
