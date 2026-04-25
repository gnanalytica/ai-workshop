---
day: 19
date: "2026-05-27"
weekday: "Wednesday"
week: 4
topic: "Context Engineering — Embeddings & RAG; prompt vs retrieve vs fine-tune"
faculty:
  main: "Sanjana"
  support: "Sandeep"
reading_time: "14 min"
tldr: "LLMs don't know your data. Three ways to fix that: better prompts, retrieval (RAG), or fine-tuning. Today we make the *right* choice for the right job, and build a working RAG pipeline over a real document — your college's exam handbook."
tags: ["embeddings", "rag", "vector-db", "context"]
software: ["LangChain", "Chroma", "sentence-transformers", "Pinecone", "pgvector"]
online_tools: ["ChatGPT", "Hugging Face", "Gemini"]
video: "https://www.youtube.com/embed/T-D1OfcDW1M"
prompt_of_the_day: "Given this 40-page college exam handbook, answer the student's question in 3 sentences citing the page numbers I retrieved. If the answer isn't in the retrieved context, reply 'Not in handbook' — do NOT use general knowledge. Question: <user query>. Context: <top-k chunks>."
tools_hands_on:
  - { name: "LangChain (Python)", url: "https://www.langchain.com/" }
  - { name: "Chroma", url: "https://www.trychroma.com/" }
  - { name: "sentence-transformers", url: "https://www.sbert.net/" }
  - { name: "Hugging Face", url: "https://huggingface.co/" }
  - { name: "Gemini API", url: "https://ai.google.dev/" }
tools_reference:
  - { name: "Pinecone — What is RAG", url: "https://www.pinecone.io/learn/retrieval-augmented-generation/" }
  - { name: "pgvector", url: "https://github.com/pgvector/pgvector" }
resources:
  - { title: "Karpathy — Intro to LLMs (1h)", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g" }
  - { title: "Lilian Weng — LLM-powered agents", url: "https://lilianweng.github.io/posts/2023-06-23-agent/" }
lab: { title: "RAG over your college handbook", url: "https://www.trychroma.com/" }
objective:
  topic: "Embeddings, RAG, and the prompt-vs-retrieve-vs-fine-tune choice"
  tools: ["LangChain", "Chroma", "sentence-transformers", "Gemini"]
  end_goal: "A working RAG pipeline that ingests a PDF, embeds chunks, and answers questions with citations — refusing to answer when the document doesn't contain the info."
---

You've spent two weeks impressed that ChatGPT *seems* to know everything. Today is the trick behind making it know **your** stuff — your handbook, your codebase, your meeting notes. The pattern is **R**etrieval-**A**ugmented **G**eneration, and once you grok it you stop fine-tuning models you didn't need to.

## 🎯 Today's objective

**Topic.** Context Engineering: Embeddings & RAG; prompt vs retrieve vs fine-tune.

**By end of class you will have:**
1. Built a **vector index** of your college's exam handbook (or any PDF you bring).
2. Run **top-k retrieval** with sentence-transformers + Chroma.
3. Wired retrieved chunks into a Gemini (or ChatGPT) prompt and gotten cited answers.
4. A clear rule for when to **prompt**, when to **retrieve**, when to **fine-tune**.

> *Why this matters.* Most "AI startups" are RAG with a UI. After today you can build that core in one sitting.

## ⏪ Pre-class · ~30 min

### Setup (required)

- [ ] Python 3.10+, virtualenv, then `pip install langchain langchain-community chromadb sentence-transformers pypdf google-generativeai`
- [ ] **Gemini API key** (free) — https://aistudio.google.com/apikey
- [ ] **Hugging Face** account.
- [ ] One PDF you care about: college exam handbook, hostel rules, your own notes (5–50 pages).

### Primer (~10 min)

- **Read:** Pinecone's *What is RAG* — https://www.pinecone.io/learn/retrieval-augmented-generation/
- **Watch:** Any 6-min "Embeddings explained visually" video.

### Bring to class

- [ ] Three real questions about your PDF that the LLM *shouldn't* be able to answer without it.

> 🧠 **Quick glossary.** **Embedding** = a vector (list of numbers) representing meaning. **Vector DB** = stores embeddings, finds nearest neighbours fast. **Chunk** = a slice of source text (e.g., 500 tokens). **Top-k** = retrieve the k most similar chunks to a query. **RAG** = retrieve relevant chunks → stuff into prompt → LLM answers using them. **Fine-tune** = adjust the model's weights with new data (expensive, last resort).

## 🎥 In-class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Three ways to inject knowledge | 15 min | Prompt vs RAG vs fine-tune decision tree |
| Embeddings, visualised | 10 min | "King − man + woman = queen" + a 2D plot |
| Live build: ingest → embed → query | 25 min | LangChain + Chroma + sentence-transformers |
| Wire to Gemini with citations | 10 min | Prompt template + refusal behaviour |
| Poll + Q&A | 10 min |   |

### Decision tree

| Need | Use |
|---|---|
| Change tone/format of answers | **Prompt** |
| Add facts the model didn't see in training | **Retrieve (RAG)** |
| Bake a new skill / domain style deeply | **Fine-tune** |
| Need fresh info that changes daily | **Retrieve** |
| Have only 50 examples | Prompt → RAG. *Not* fine-tune. |

### Why retrieve before you fine-tune

- Cheaper. Faster. Updatable in seconds (just re-index).
- No model drift, no training infra, no leaked data risk.
- Works with *any* base model. Swap GPT for Gemini in one line.

## 🧪 Lab: RAG over your handbook

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import google.generativeai as genai, os

# 1. Load + chunk
docs = PyPDFLoader("handbook.pdf").load()
chunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50).split_documents(docs)

# 2. Embed + index
emb = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db = Chroma.from_documents(chunks, emb, persist_directory="./store")

# 3. Retrieve
q = "What is the re-evaluation deadline for end-sem papers?"
hits = db.similarity_search(q, k=3)
context = "\n---\n".join(f"[p.{h.metadata.get('page')}] {h.page_content}" for h in hits)

# 4. Generate with citations
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-2.5-flash")
prompt = f"""Answer in 3 sentences citing page numbers from the context.
If the answer isn't in the context, reply exactly 'Not in handbook'.
Context:\n{context}\n\nQuestion: {q}"""
print(model.generate_content(prompt).text)
```

1. Drop your PDF in the working directory as `handbook.pdf`.
2. Run the script. Confirm citations.
3. Ask one of your three pre-class questions. Confirm it cites pages.
4. Ask a question whose answer is *not* in the PDF (e.g., "Who won IPL 2024?"). Confirm the model says **"Not in handbook."**
5. Increase `k` from 3 to 8. Does the answer change? Why?

**Artifact.** A GitHub gist with: your script, your 3 questions, the model's answers, and one paragraph on what surprised you.

## 📊 Live poll

**For *your* capstone, the right tool is:** Better prompt only / RAG / Fine-tune / Mix of prompt + RAG / Don't know yet.

## 💬 Discuss

- Embeddings put "Bengaluru" close to "Mumbai" but far from "samosa". Why does that property make retrieval work?
- Your retrieval returned 3 chunks. One was irrelevant. What knobs would you turn first — chunk size, k, embedding model, or query rewriting?
- Where would Pinecone or pgvector beat Chroma in production?

## ❓ Quiz

Short quiz on embedding intuition, top-k retrieval, and the prompt/retrieve/fine-tune choice. Open it on your dashboard.

## 📝 Assignment · RAG over your own corpus

**Brief.** Pick a corpus that matters to you — your notes for one subject, 10 of your college's announcement PDFs, your hostel's mess menu archive. Build a tiny RAG pipeline. Demonstrate **3 questions answered correctly with citations** and **1 question correctly refused**.

**Submit.** GitHub gist or repo + a 90-second Loom showing the 4 questions on the dashboard.

**Rubric.** Pipeline runs end-to-end (4) · Citations are correct page/chunk (3) · Refusal behaviour works on out-of-corpus questions (3).

## 🔁 Prep for next class

Day 20 deepens this into **production-grade context engineering** (longer-context tricks, hybrid search, reranking).

- [ ] Skim Lilian Weng's *Agents* post — https://lilianweng.github.io/posts/2023-06-23-agent/
- [ ] Keep your Day-19 vector store on disk — we'll iterate on it.
- [ ] Bring one *failure case* from today's lab where retrieval got the wrong chunks. We'll debug live.

## 📚 References

- [Pinecone — What is RAG](https://www.pinecone.io/learn/retrieval-augmented-generation/) — clearest 10-min read.
- [LangChain RAG tutorial](https://python.langchain.com/docs/tutorials/rag/)
- [pgvector](https://github.com/pgvector/pgvector) — when you outgrow Chroma and want it inside Postgres/Supabase.
- [Hugging Face — sentence-transformers](https://www.sbert.net/)
- [Karpathy — Intro to LLMs (1h)](https://www.youtube.com/watch?v=zjkBMFhNj_g) — the "embeddings as meaning" intuition.
