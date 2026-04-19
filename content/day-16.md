---
reading_time: 14 min
tags: ["ai", "llms", "theory"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Tokenization surprises with tiktoken and HuggingFace", "url": "https://github.com/openai/tiktoken"}
resources: [{"title": "HuggingFace Transformers docs", "url": "https://huggingface.co/docs/transformers/"}, {"title": "Anthropic Transformer Circuits", "url": "https://transformer-circuits.pub/"}, {"title": "3Blue1Brown Neural Networks", "url": "https://www.3blue1brown.com/topics/neural-networks"}]
---

## Intro

Yesterday we said an LLM predicts the next token. Today we open the box: what's a token, what are the "weights" that everyone talks about, and what does attention actually compute? You don't need to derive the math — you need a mental model that lets you debug real systems.

## Read: Tokens, weights, attention

### Tokens: the atoms the model sees

Models don't see characters or words. They see **tokens**: integer IDs that index into a learned vocabulary (typically 32k–200k entries). A tokenizer splits strings into subword pieces using algorithms like **BPE** (byte-pair encoding) or **SentencePiece**. Common subwords become single tokens; rare words get split.

```python
import tiktoken
enc = tiktoken.get_encoding("cl100k_base")  # GPT-4 family
print(enc.encode("Hello, world!"))
# [9906, 11, 1917, 0]
print(enc.encode("Bengaluru"))
# Splits into multiple tokens — rare word
```

Things that surprise people:

- **Whitespace matters.** `" Paris"` and `"Paris"` are often different tokens.
- **Non-English is expensive.** Hindi, Tamil, Mandarin, Arabic take 2–4× more tokens per character than English. That's a direct cost and latency hit.
- **Numbers are weird.** `"1234"` might be one token or four. This is why LLMs struggle with digit-level arithmetic.
- **Code is dense.** Most programming tokens are well-represented, which is partly why coding works so well.

| String | GPT-4o tokens | Llama 3 tokens |
|---|---|---|
| "Hello" | 1 | 1 |
| "नमस्ते" | ~5 | ~4 |
| "antidisestablishmentarianism" | 6 | 5 |
| "1234567890" | 4 | varies |
| A 1-page PDF of English | ~500 | ~500 |

Every "context window" (8k, 128k, 1M) is measured in tokens. Your Hindi prompt hitting a 128k window is effectively only 30–60k characters.

### Weights: what training produces

The "model" is just a huge pile of floating-point numbers — the **weights** or **parameters** — arranged in matrices. A 7B model has 7 billion of them. Each weight starts as a random number. Training nudges each one slightly so that, across trillions of training tokens, the model's next-token predictions match what actually came next in the data.

That's it. There is no symbolic database, no facts table, no rule engine. Whatever the model "knows" is baked into those numbers. Storage-wise:

| Model | Params | Size (fp16) | Size (4-bit) | Fits on |
|---|---|---|---|---|
| Llama 3.2 3B | 3B | ~6 GB | ~2 GB | phone, laptop |
| Llama 3.1 8B | 8B | ~16 GB | ~5 GB | 8GB GPU, M-series Mac |
| Qwen 3 14B | 14B | ~28 GB | ~9 GB | 16GB GPU |
| Llama 3.1 70B | 70B | ~140 GB | ~40 GB | 2x 24GB GPU, M-Ultra |
| DeepSeek V3 / Llama 4 MoE | 200B+ | 400GB+ | 100GB+ | server cluster |

Quantization (going from 16-bit to 4-bit) is a near-free compression — you lose a sliver of quality but cut memory by ~4×. You'll use 4-bit models tomorrow.

### The forward pass: embed, attend, predict

When you send a prompt, this happens for every token position, in parallel:

1. **Embed**: look up each token ID in a matrix; get a vector (typically 2048–8192 dimensions).
2. **Attend**: in each transformer layer, every token computes a weighted average of the other tokens' vectors. The weights come from learned `Q`, `K`, `V` projections — each token asks "who in this sequence is relevant to me?" and mixes their info in.
3. **MLP**: a small feed-forward network transforms each vector independently.
4. Stack this ~30–80 times (that's "layers" or "depth").
5. **Unembed**: project the final vector onto the vocabulary; softmax to get probabilities.

Attention is the key invention (the 2017 "Attention Is All You Need" paper). Before it, RNNs processed tokens sequentially, forgot early context, and couldn't parallelize. Attention lets every token see every other token in one shot.

> Mental model: attention is a **soft, learned dictionary lookup** happening dozens of times per layer per token. The model is essentially asking "given what I've seen so far, which past tokens should I reweight?"

### Why this explains so much

- **Context windows are quadratic** in sequence length — doubling context quadruples attention cost. That's why 1M-token contexts are a research and infra feat.
- **In-context learning works** because attention can "retrieve" relevant examples from the prompt itself.
- **Training data leaks.** If a fact appears many times in training, the weights encode it strongly. If it appears once, the model will guess.

### Worked example: walk through "The cat sat on the"

Tokens: `[The, cat, sat, on, the]`. Each gets embedded into a vector. In layer 1's attention, when processing `the` (position 5), the model learns that `cat` and `sat` are relevant and mixes in their features. After 32 layers of this, the final vector at position 5 is rich with context. Unembed it → probabilities across vocab. `mat` wins (training data is saturated with this cliché). The sampler picks it. New sequence: `[The, cat, sat, on, the, mat]`. Repeat.

Nothing magical. Lots of linear algebra, done fast on GPUs.

## Watch: 3Blue1Brown on transformers

Grant Sanderson's visual explanations are unmatched. His "But what is a GPT?" and "Attention in transformers" videos will lock in today's reading.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace with 3Blue1Brown GPT / attention video -->

- Focus on the geometric picture of the embedding space.
- Note how `Q @ K.T` produces the attention pattern.
- Notice the "unembedding" step — the final matmul back to vocab.

## Lab: Poke the tokenizer

You're going to tokenize strings with two different tokenizers and discover where they disagree.

1. Make a fresh folder, create a venv: `python -m venv .venv && source .venv/bin/activate`.
2. `pip install tiktoken transformers sentencepiece`.
3. Create `tok_lab.py`. Load two tokenizers:
   ```python
   import tiktoken
   from transformers import AutoTokenizer
   gpt = tiktoken.get_encoding("cl100k_base")
   llama = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")
   # If gated, use "NousResearch/Meta-Llama-3.1-8B" or any open mirror.
   ```
4. Define a list of test strings that mixes English, Hindi/Tamil/your-mother-tongue, emoji (`"🙂🫠🫥"`), code (`"def f(x): return x**2"`), URLs, and numbers (`"1234567890"`, `"9.11 vs 9.9"`).
5. For each string, print: character count, GPT token count, Llama token count, and the list of decoded tokens. Eyeball the splits.
6. Build a bar chart with `matplotlib` comparing token counts across tokenizers for each string.
7. Try a paragraph of English vs the same paragraph translated into your mother tongue. Record the token ratio.
8. Answer in comments: (a) which tokenizer is cheaper for your language? (b) what happened to emoji? (c) did `"9.11"` and `"9.9"` tokenize symmetrically?
9. Commit `tok_lab.py` and a screenshot of the chart.

Budget 40 minutes.

## Quiz

Quick quiz. Expect questions on: what a token is, why context windows are measured in tokens not characters, what attention computes, what a "weight" is, and why 4-bit quantization works. No math required, just the mental model.

## Assignment

Extend the lab: write `tokenization-report.md` answering in 300–500 words — if you were building a multilingual chatbot for a college with English + two regional languages, how would token costs shape your architecture choices (model selection, pricing, summarization vs full-context)? Include at least one concrete number from your lab.

## Discuss: Where tokens bite you

- Why are there no "characters" in an LLM's world? What implications does that have for asking it to reverse a string?
- If a 70B model is 140GB in fp16, how do people run it on a single GPU? What gets sacrificed?
- Attention is O(n²) in sequence length. Name two engineering tricks you'd expect labs to use to push context to 1M tokens.
- A startup claims their model is "better at Hindi." What evidence would actually convince you, beyond vibes?
- Does understanding the architecture change how you prompt? Why or why not?
