---
reading_time: 14 min
tags: ["ai", "llms", "fine-tuning", "rag", "prompting"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Three approaches, one task: prompting vs RAG vs LoRA fine-tune", "url": "https://github.com/unslothai/unsloth"}
resources: [{"title": "Unsloth", "url": "https://github.com/unslothai/unsloth"}, {"title": "HuggingFace Transformers", "url": "https://huggingface.co/docs/transformers/"}, {"title": "LlamaIndex docs", "url": "https://docs.llamaindex.ai/"}, {"title": "Ollama", "url": "https://ollama.com/"}]
---

## Intro

You now have three hammers: prompting, RAG, fine-tuning. Most teams pick the wrong one for the wrong reason ("we need to fine-tune because we have data"). Today we disentangle when each wins, and you'll solve the same problem three ways to feel the tradeoffs in your fingers.

## Read: Fine-tuning vs prompting vs RAG

### The decision framework

Before reaching for any technique, ask: **am I trying to change what the model knows, or how it behaves?**

| Goal | Best technique |
|---|---|
| Inject new factual knowledge (product docs, internal data) | **RAG** |
| Keep answers current (yesterday's data) | **RAG** |
| Change tone, format, or style consistently | Prompting → then fine-tuning if budget allows |
| Teach a new narrow task (classify, extract, route) | Fine-tuning (or strong few-shot) |
| Make a small model behave like a bigger one on a task | Fine-tuning (distillation) |
| Reduce latency/cost of a task you've prototyped with prompting | Fine-tuning a small model |
| Handle a novel domain (obscure language, proprietary jargon) | Fine-tune + RAG together |

Two myths to kill up front:

1. **"We need to fine-tune to use our data."** No. RAG is almost always better for knowledge injection. Fine-tuning changes behavior, not memorized facts (which decay and are hard to update).
2. **"Prompting is temporary, real engineers fine-tune."** Top production systems are ~80% prompting + RAG, ~20% fine-tuning. Prompting is permanent.

### Fine-tuning, concretely

Fine-tuning starts from a base model and continues training on your examples. Three flavors:

- **Full fine-tune**: update every weight. Expensive (a 7B model full-tune is hours on an A100), needs careful hyperparameters, easy to "catastrophically forget" the base capabilities.
- **LoRA / QLoRA** (Low-Rank Adaptation): freeze the base model, train tiny adapter matrices that sit alongside. ~0.1–1% of the parameters. Same behavior lift as full fine-tune for most tasks, runs on consumer GPUs, adapters are ~10–200MB.
- **DPO / ORPO / Preference tuning**: train the model to prefer "good" responses over "bad" ones (replaces the old RLHF step for many teams). Needs a dataset of chosen/rejected pairs.

In 2026, **QLoRA with Unsloth** is the default for small teams. Unsloth patches HuggingFace Transformers to 2–5× speed up training on a single consumer GPU. A 7B-param QLoRA on 1k examples takes ~1 hour on an RTX 4090.

### Cost-benefit table

| Technique | Setup time | Data needed | Compute | Latency at serve time | When to pick |
|---|---|---|---|---|---|
| Prompt only | minutes | 0–20 examples | none | base | Always first |
| Few-shot | minutes | 2–8 examples | none | base + context | Classification, extraction |
| RAG | hours | corpus of docs | CPU or small GPU | base + retrieval | Knowledge grounding |
| LoRA fine-tune | 1–8 hours | 500–5000 examples | 1 consumer GPU | base | Narrow task, want small model |
| Full fine-tune | days | 10k+ examples | multi-GPU | base | Rare, domain-specific |
| Continued pretraining | weeks | 100M+ tokens | cluster | base | Almost never for app teams |

**Default order of operations**: zero-shot → few-shot → RAG → fine-tune. Don't skip ahead.

### When fine-tuning actually wins

Reasonable fine-tune candidates:

- You have a repeatable, narrow task (e.g., "classify this ticket into one of 40 internal categories"). Prompting hits 88%; fine-tuning hits 96%.
- You're distilling: you've been paying for GPT-5 and a fine-tuned 3B model would be 100× cheaper at acceptable quality.
- You need a specific output format that prompting can't lock down.
- You need to bake in style (e.g., customer-service voice) that's expensive to prompt every turn.

Bad fine-tune candidates:

- You want the model to "know" your docs. Use RAG.
- You have 50 examples total. Not enough.
- The task is still being defined. Fine-tuning freezes decisions.

### Unsloth + TinyLlama: the quick path

```python
# pip install unsloth
from unsloth import FastLanguageModel
import torch
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset

model, tok = FastLanguageModel.from_pretrained(
    "unsloth/tinyllama-chat-bnb-4bit",
    max_seq_length=2048, load_in_4bit=True)
model = FastLanguageModel.get_peft_model(
    model, r=16, lora_alpha=16,
    target_modules=["q_proj","k_proj","v_proj","o_proj"])

ds = load_dataset("json", data_files="train.jsonl", split="train")

trainer = SFTTrainer(
    model=model, tokenizer=tok, train_dataset=ds,
    dataset_text_field="text", max_seq_length=2048,
    args=TrainingArguments(
        per_device_train_batch_size=2, gradient_accumulation_steps=4,
        max_steps=200, learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(), bf16=torch.cuda.is_bf16_supported(),
        output_dir="out"))
trainer.train()
model.save_pretrained_gguf("out-gguf", tok)  # drop into Ollama
```

That's a full fine-tune run. Under 50 lines, plus your dataset.

### Hybrid is usually the answer

Real systems mix all three:

- Fine-tune a small model for the common case (fast, cheap).
- RAG for grounding in current data.
- Prompting for edge cases and orchestration.
- Route requests: "simple → local fine-tuned 3B, complex → hosted frontier."

This is what 2026 production "AI" looks like — not a single magic model, but a pipeline of cheap and smart pieces.

## Watch: Fine-tuning demystified

Look for a recent end-to-end LoRA fine-tuning walkthrough — Unsloth's own tutorials, HuggingFace courses, or a Daniel Han conference talk.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace with an Unsloth / LoRA walkthrough -->

- Focus on the data-preparation step; it dominates outcomes.
- Watch how training loss curves are read.
- Note when they recommend fine-tuning vs sticking with prompting.

## Lab: One task, three approaches

You'll solve a single task three ways and compare. The task: classify short support messages into one of 5 categories (billing, bug, feature-request, account, other). You can use any other narrow classification task you actually care about.

1. Build a dataset: 100 labeled examples (80 train, 20 test). Hand-label them in a CSV. Seriously — do not generate them with an LLM; you need honest data. Save as `train.jsonl` and `test.jsonl` with `{"text": "...", "label": "..."}`.
2. **Approach A — plain prompting.** In `a_prompt.py`, write a zero-shot and a few-shot prompt (3 examples). Use Ollama with `llama3.2:3b` or similar. Run the 20-item test set. Record accuracy.
3. **Approach B — RAG-ish.** In `b_rag.py`, embed all 80 training examples with sentence-transformers into Chroma. For each test item, retrieve the 5 nearest training examples, inject them as dynamic few-shot in the prompt. Re-run. Record accuracy. (This is "dynamic few-shot," a form of RAG for classification.)
4. **Approach C — LoRA fine-tune.** On Google Colab (free T4 is enough) or a local GPU, install Unsloth and run a QLoRA on TinyLlama or Llama 3.2 1B using the 80-example training set. Format each example as `"Text: {text}\nLabel: {label}"`. Train ~200 steps. Export to GGUF and pull into Ollama: `ollama create my-tuned -f Modelfile`. Run the 20 test items. Record accuracy.
5. Build a comparison table: approach × accuracy × setup time (minutes) × inference latency × model size on disk × GPU required.
6. Pick a winner for this task and size. Justify in 2 paragraphs.
7. Bonus: combine B + C — dynamic few-shot on top of your fine-tuned model. Usually best-of-both.
8. Commit `a_prompt.py`, `b_rag.py`, the Colab notebook or training script for C, the `Modelfile`, and `three-approaches.md` with your table and conclusions.

Budget 90–120 minutes (mostly fine-tune training).

## Quiz

Quiz on: which technique to pick for "I want the model to know our FAQ," what LoRA does structurally, when full fine-tune is worth it, how data size changes the decision, and the typical order of operations (prompt → RAG → fine-tune). No trick questions.

## Assignment

Write `my-decision-framework.md` (400–600 words). Given a specific hypothetical brief — "build an assistant that answers questions about our 50-page employee handbook in a formal tone, low-latency, under $50/month infra budget, 200 queries/day" — walk through which combination of prompting / RAG / fine-tuning you'd use and why. Be concrete: name the model, the embedding approach, whether you'd fine-tune, and the guardrails.

## Discuss: Picking the right hammer

- A teammate insists "we have to fine-tune because our data is proprietary." What's your response?
- Under what conditions does a 3B fine-tuned model beat a 70B general model?
- "Fine-tuning destroys general capability." When is that a feature, not a bug?
- If frontier closed models keep getting cheaper, does fine-tuning open-weights still pay off in 2027?
- Your team is three people. You have six months. One production app. Which of the three techniques would you invest the most engineering time in, and why?
