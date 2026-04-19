---
reading_time: 14 min
tldr: "RAG = retrieval + generation. Grounded answers, lower hallucinations, domain adaptation without training."
tags: ["ai", "rag", "hands-on", "llms"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Tiny RAG over local PDFs with LlamaIndex + Ollama", "url": "https://docs.llamaindex.ai/"}
resources: [{"title": "LlamaIndex docs", "url": "https://docs.llamaindex.ai/"}, {"title": "LangChain docs", "url": "https://python.langchain.com/docs/"}, {"title": "Chroma docs", "url": "https://docs.trychroma.com/"}, {"title": "Ollama", "url": "https://ollama.com/"}]
---

## Intro

RAG — Retrieval-Augmented Generation — is the most common production AI pattern, period. It's how you keep LLMs factual, current, and grounded in your own data without retraining. Today you'll build one end-to-end, on a laptop, with open-source tools, answering questions about PDFs you pick.

## Read: RAG from scratch

### What RAG actually is

RAG is a pipeline, not a product. The pattern in three lines:

1. **Retrieve**: fetch relevant chunks from your corpus using the user's query.
2. **Augment**: stuff those chunks into the LLM's prompt.
3. **Generate**: have the LLM answer the question using that context.

```
User question
     │
     ▼
[Embed query] ──► [Vector DB] ──► top-k chunks
                                       │
                                       ▼
                          [Build prompt: system + context + question]
                                       │
                                       ▼
                                    [LLM]
                                       │
                                       ▼
                                    Answer
```

The LLM doesn't need to "know" anything about your data. At inference, you paste the relevant bits into its context window. Done well, this kills hallucination (the model has the actual text) and keeps answers current (swap in fresher docs, no retraining).

### The minimum viable RAG

```python
import ollama
from sentence_transformers import SentenceTransformer
import chromadb

emb = SentenceTransformer("BAAI/bge-small-en-v1.5")
client = chromadb.PersistentClient("./rag-store")
col = client.get_or_create_collection("docs")

# assume col was populated with chunks earlier

def rag_answer(question, k=4):
    qv = emb.encode(question).tolist()
    hits = col.query(query_embeddings=[qv], n_results=k)
    context = "\n\n---\n\n".join(hits["documents"][0])
    prompt = f"""Answer using ONLY the context below. If the answer is
not present, say "I don't know."

Context:
{context}

Question: {question}
Answer:"""
    r = ollama.chat(model="llama3.1:8b",
                    messages=[{"role": "user", "content": prompt}],
                    options={"temperature": 0})
    return r["message"]["content"]
```

Twenty lines. Real RAG. Everything else is refinement.

### Where RAG goes wrong

Real RAG systems fail in predictable places. Know them.

| Failure | Symptom | Fix |
|---|---|---|
| Bad chunking | Relevant info split across chunks | Chunk by structure; larger overlap |
| Bad retrieval | Top-k misses the right chunk | Hybrid search, re-ranking, query rewriting |
| Stuffed context | Model ignores middle of prompt | Fewer, better chunks; "lost in the middle" |
| No source attribution | Can't verify answers | Return citations with each answer |
| Stale index | User asks about new data not yet indexed | Incremental re-indexing |
| "I don't know" ignored | Model hallucinates anyway | Better prompt, smaller k, grounding checks |

"Lost in the middle" is a real phenomenon — long contexts cause models to pay more attention to the beginning and end than the middle. Keep your retrieved context tight: 4–8 good chunks beats 30 mediocre ones.

### Re-ranking

Initial vector retrieval is "dumb" (pure cosine). A **re-ranker** takes the top 20–50 vector hits and uses a smaller cross-encoder model (e.g., `BAAI/bge-reranker-v2-m3`) to score each `(query, chunk)` pair with full attention. Way more accurate — and cheap enough to run on CPU for 20 items.

Typical prod pipeline: retrieve top 30 → re-rank → keep top 5 → generate.

### LlamaIndex vs LangChain vs rolling your own

- **LlamaIndex** — focused on RAG. Best default for document-over-LLM use cases. Rich connectors, built-in evaluation.
- **LangChain** — broader, covers agents, tools, chains. Good for complex orchestration. Heavier abstraction.
- **Your own 80-line Python** — fine for prototypes. Total control.

For today we'll use LlamaIndex because it hides the boring parts (loaders, chunkers, query engines) without hiding the interesting parts.

### Evaluating RAG

You cannot improve what you don't measure. Minimum eval:

1. Write 10–30 Q&A pairs by hand. Each is `(question, expected_answer, source_chunk_id)`.
2. Metrics:
   - **Retrieval hit rate**: did the right chunk appear in top-k?
   - **Answer correctness**: did the generated answer match expected? Judge with a second LLM if automation is needed.
   - **Faithfulness**: does every claim in the answer appear in the retrieved context?
3. Re-run evals whenever you change the chunker, embedding model, LLM, or prompt.

Tools: LlamaIndex has `Evaluator` classes; `ragas` is a popular open-source eval framework.

### Worked example: the "resume RAG"

A student built this in one evening: 200 job descriptions from company career pages → chunked → embedded → queried by their own resume bullets. Each query returned the top 5 JDs closest to that skill, with a generated one-line match explanation. It surfaced 3 jobs they'd have missed via keyword search. Whole thing: ~150 lines, local models, zero API cost.

## Watch: RAG walkthrough

Find a current, tool-agnostic RAG explainer — Jerry Liu from LlamaIndex and Harrison Chase from LangChain both have good talks on YouTube. Alternately, a "build RAG in 100 lines" live-code video.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace with a recent RAG walkthrough -->

- Note the retrieve / augment / generate split.
- Watch how chunking decisions are justified.
- Pay attention to eval — a lot of "RAG talks" skip it. The good ones don't.

## Lab: Tiny RAG over your PDFs

Build a working RAG pipeline over a folder of real PDFs using LlamaIndex + Ollama + Chroma. All local, no API keys.

1. Make sure Ollama has a chat model (`llama3.1:8b` or `qwen3:8b`) and an embedding model (`ollama pull nomic-embed-text`).
2. Collect 3–10 real PDFs: lecture slides, a research paper, a product manual, your college's policy docs. Put them in `./data/`.
3. Install: `pip install llama-index llama-index-llms-ollama llama-index-embeddings-ollama llama-index-vector-stores-chroma chromadb pypdf`.
4. Create `build_index.py`:
   ```python
   from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext, Settings
   from llama_index.llms.ollama import Ollama
   from llama_index.embeddings.ollama import OllamaEmbedding
   from llama_index.vector_stores.chroma import ChromaVectorStore
   import chromadb

   Settings.llm = Ollama(model="llama3.1:8b", request_timeout=120)
   Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text")

   docs = SimpleDirectoryReader("./data").load_data()
   client = chromadb.PersistentClient("./rag-chroma")
   col = client.get_or_create_collection("pdfs")
   vs = ChromaVectorStore(chroma_collection=col)
   storage = StorageContext.from_defaults(vector_store=vs)
   index = VectorStoreIndex.from_documents(docs, storage_context=storage)
   print("Indexed.")
   ```
5. Run it. Watch it chunk and embed. First run may be slow (minutes).
6. Create `ask.py` that loads the same collection and exposes a query engine:
   ```python
   qe = index.as_query_engine(similarity_top_k=4, response_mode="compact")
   print(qe.query(input("Q: ")))
   ```
7. Hand-write 5 Q&A pairs from your PDFs with expected answers and page numbers.
8. Run each question through your RAG. Record: did it answer correctly? Did it cite the right section?
9. Tune: change `similarity_top_k` to 2 and 8. Change chunk size in `Settings` (try `chunk_size=512` then `1024`). Re-run your 5 Qs each time. Keep a scoreboard.
10. Write `rag-results.md` with your eval table, your best configuration, and one failure case with commentary on why it failed.

Budget 75 minutes.

## Quiz

Quiz on: the three steps of RAG, why hallucination drops with grounded context, what a re-ranker does, the lost-in-the-middle effect, and how to pick `top_k`. Directly from the lab.

## Assignment

Take your RAG from the lab and add **source attribution**: every answer should include the PDF filename and page number it came from. LlamaIndex exposes source nodes via `response.source_nodes`. Commit the updated `ask.py` and a `rag-citations.md` doc showing three cited answers. If any answer has no valid source, the system should say "I don't know." No hallucinated citations.

## Discuss: RAG in the real world

- If you had 1M documents and one GPU, what would change in your pipeline?
- When does fine-tuning beat RAG? (We'll go deeper tomorrow — form a hypothesis now.)
- Your RAG says "I don't know" 30% of the time. Is that good or bad?
- How do you handle PDFs with tables, images, and scanned pages? Where does this pipeline break?
- Users ask the same 20 questions 80% of the time. What's a cheap way to exploit that?
