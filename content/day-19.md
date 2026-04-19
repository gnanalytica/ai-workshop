---
reading_time: 14 min
tldr: "Embeddings turn words into directions in space. That's what makes search, memory, and RAG work."
tags: ["ai", "embeddings", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Semantic search over your own markdown notes", "url": "https://www.sbert.net/"}
resources: [{"title": "Sentence-Transformers", "url": "https://www.sbert.net/"}, {"title": "Chroma docs", "url": "https://docs.trychroma.com/"}, {"title": "HuggingFace model hub", "url": "https://huggingface.co/"}]
---

## Intro

Before we get to RAG tomorrow, we need one more primitive: embeddings. An embedding is how you teach a computer that "king" and "monarch" are related while "king" and "stapler" are not. Today you'll turn your own notes into a searchable vector space.

## Read: Embeddings and semantic search

### What is an embedding

An embedding is a **vector** (a list of numbers, typically 384–3072 dimensions) that represents a piece of text. Texts with similar meaning land near each other in this high-dimensional space. The magic: the vector is produced by a neural network trained specifically so that semantic similarity ≈ cosine similarity of the vectors.

```python
from sentence_transformers import SentenceTransformer
m = SentenceTransformer("BAAI/bge-small-en-v1.5")
v = m.encode("The cat sat on the mat.")
print(v.shape)  # (384,)
```

That's one embedding. Generate one for every chunk in your corpus, store them, and now you can do **semantic search**: encode the query into the same space, find the nearest vectors, return the corresponding text.

### Why this beats keyword search

Keyword search (BM25, Elasticsearch, `grep`) only matches literal tokens. Try:

- Query: `"how do I cancel my subscription"`
- Document: `"To terminate your recurring plan, visit account settings."`

Zero keyword overlap. BM25 fails. An embedding model places both in the same neighborhood because it was trained to understand paraphrase.

| | Keyword (BM25) | Embeddings |
|---|---|---|
| Handles synonyms | No | Yes |
| Handles typos | Poor | Good |
| Multilingual query→docs | No | Yes, with multilingual model |
| Exact match of IDs/names | Great | Worse |
| Cost | ~free, CPU | Needs a model |
| Explainable | Yes (term overlap) | Hard to explain |

In production, you typically combine both ("hybrid search"). We'll keep it simple today and only do vector search.

### The embedding-model landscape (2026)

| Model | Dim | Size | Notes |
|---|---|---|---|
| `bge-small-en-v1.5` | 384 | ~130MB | Great English baseline |
| `bge-m3` | 1024 | ~1GB | Multilingual, long-context |
| `nomic-embed-text-v1.5` | 768 | ~500MB | Open, strong |
| `gte-large-en-v1.5` | 1024 | ~600MB | High-quality English |
| `e5-mistral-7b-instruct` | 4096 | 14GB | SOTA, heavy |
| OpenAI `text-embedding-3-small` / `3-large` | 1536/3072 | API | Commercial baseline |
| Cohere `embed-v3` / Voyage | varies | API | Strong commercial alternatives |

Dimensions don't equal quality — a well-trained 384-dim model often beats a poorly-trained 1024-dim one on your task. Always evaluate on your data.

### Cosine similarity in one line

```python
import numpy as np
def cos(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

Values range roughly from -1 (opposite) to 1 (identical). In practice, related pieces of text score around 0.6–0.9. Unrelated text sits around 0.0–0.3.

### Vector databases

Once you have thousands or millions of vectors, brute-force cosine gets slow. Vector DBs use **approximate nearest neighbor** (ANN) indexes — HNSW, IVF, ScaNN — to return top-k matches in milliseconds.

- **Chroma** — dev-friendly, local-first, Python-native. We'll use it today.
- **FAISS** — Meta's library, blazing fast, lower-level.
- **Qdrant / Weaviate / Milvus** — production-grade open-source servers.
- **pgvector** — embed vectors inside Postgres. Best choice if you already run Postgres.
- **Pinecone / Turbopuffer** — managed services.

For <100k documents on your laptop, pgvector or Chroma are both fine. Don't over-engineer.

### Chunking: the underrated decision

You rarely embed whole documents — they're too long and too semantically diverse. You chunk them first, typically into 200–800 token pieces with some overlap (10–20%). Chunk boundaries matter:

- **Fixed-size** chunks: easiest, often fine.
- **Sentence-aware** or **markdown-heading-aware**: better semantic coherence.
- **Recursive** splitters (LangChain, LlamaIndex): respect structure, fall back to size.

Bad chunking is the #1 reason RAG systems perform poorly. We'll revisit tomorrow.

### Worked example: searching 500 markdown notes

```python
import os, glob
from sentence_transformers import SentenceTransformer
import chromadb

client = chromadb.PersistentClient(path="./chroma-notes")
col = client.get_or_create_collection("notes")
model = SentenceTransformer("BAAI/bge-small-en-v1.5")

docs, ids = [], []
for i, p in enumerate(glob.glob("notes/**/*.md", recursive=True)):
    text = open(p).read()
    # naive: one chunk per file; real systems split into 500-token windows
    docs.append(text[:2000])
    ids.append(p)

embs = model.encode(docs, show_progress_bar=True).tolist()
col.add(ids=ids, documents=docs, embeddings=embs)

q = "how did I structure my resume last year?"
qv = model.encode(q).tolist()
print(col.query(query_embeddings=[qv], n_results=5)["ids"])
```

That's a semantic search engine over your life in ~20 lines.

## Watch: Embeddings, visualized

Look for a good explainer on vector spaces and embeddings — Jay Alammar's illustrated guide or a 3Blue1Brown word2vec-style video both build the right intuition.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace with an embeddings explainer video -->

- Note the "king - man + woman ≈ queen" intuition for word vectors.
- See how sentence embeddings aggregate token vectors.
- Watch discussions of dimensionality and why 384 dims is "enough."

## Lab: Semantic search over your own notes

You'll build a tiny CLI that searches your personal notes by meaning.

1. Gather ~50–200 markdown files you actually have — lecture notes, journal, project READMEs, whatever. If you don't have enough, clone 2–3 GitHub repos and point at their docs.
2. Set up: `pip install sentence-transformers chromadb tqdm`.
3. Write `index.py`: walk a folder, read each `.md`, chunk each file into ~500-character windows with 50-character overlap. Store `(chunk_id, filepath, text)`.
4. Load `BAAI/bge-small-en-v1.5`. Encode all chunks. Upsert into a Chroma persistent collection.
5. Write `search.py`: takes a CLI arg as query, encodes it, runs `collection.query(n_results=5)`, prints top results with filepath, similarity score, and a 200-char snippet.
6. Run 5 queries you actually care about. Example: `python search.py "how I set up my Linux dotfiles"`.
7. Now compare to naive `grep -r`: for each of the 5 queries, note where grep finds nothing useful but semantic search finds the right note (or vice versa).
8. Swap the embedding model to `bge-m3` (multilingual). Re-index. Try a query in a non-English language against your English notes — does it still find things?
9. Try a bad chunking strategy (500 chars with 0 overlap vs 2000 chars with 0 overlap). Observe which gives better top-1 hits.
10. Commit `index.py`, `search.py`, and `search-results.md` with your five query comparisons.

Budget 60 minutes.

## Quiz

Quiz covers: what an embedding is, cosine similarity intuition, when keyword search beats semantic search, why chunking matters, and what a vector DB does under the hood. All drawn from today's reading and lab.

## Assignment

Extend your search CLI with a `--hybrid` flag that also runs a simple keyword match (Python `in`, lowercased) and merges the rankings. Ship it as `search_hybrid.py`. In `hybrid-notes.md`, write 150 words on three queries where hybrid beats pure-vector and three where pure-vector wins. Concrete examples, not theory.

## Discuss: What embeddings don't solve

- If embeddings capture "meaning," why do they still struggle with negation ("not safe" vs "safe")?
- You have 10M documents. Would you pick Chroma, pgvector, Qdrant, or Pinecone? What decides?
- Multilingual embeddings map Hindi and English into the same space. Does that mean a model trained only on English docs can serve Hindi queries well? Test your intuition.
- Embedding models get updated every 6 months. What does that do to your existing vector index?
- Someone claims "embeddings are solved." Where does that claim break?
