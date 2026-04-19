---
reading_time: 14 min
tags: ["ai", "llms", "prompting", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Prompt battles: five styles on one classification task", "url": "https://python.langchain.com/docs/"}
resources: [{"title": "LangChain Python docs", "url": "https://python.langchain.com/docs/"}, {"title": "HuggingFace Transformers", "url": "https://huggingface.co/docs/transformers/"}, {"title": "Ollama", "url": "https://ollama.com/"}]
---

## Intro

"Prompt engineering" is a goofy name for a real skill: constructing inputs so a statistical text predictor behaves like a tool. Today we treat it like engineering — with evals, not vibes. You'll run the same task through five prompt styles and measure which wins.

## Read: Prompting as a craft

### The core reframe

A prompt is not a command. It's a **conditioning context**. The model sees your prompt and continues it with whatever tokens are statistically plausible given the training data. Every word in your prompt pushes the probability distribution over next tokens.

That leads to three rules that sound obvious but people violate constantly:

1. **Specificity beats politeness.** "You are an expert" is noise; "Output must be valid JSON matching this schema: {...}" changes the distribution.
2. **Examples beat explanations.** The model learned from examples; it's much better at pattern-matching them than at following abstract instructions.
3. **Format the output you want.** If you want JSON, show JSON. If you want bullets, show bullets. Ask for "a reply" and you'll get an essay.

### The five prompting styles

You'll use all of these this week. Know when to reach for each.

#### 1. Zero-shot

Just ask. Works when the task is common in training data.

```
Classify the sentiment of this review as positive, negative, or neutral:
"The phone is okay but battery dies fast."
```

#### 2. Few-shot

Give 2–8 examples in the prompt. The gold standard for classification, extraction, and format-following.

```
Review: "Loved it, highly recommend." → positive
Review: "Terrible. Fell apart in a week." → negative
Review: "It's fine, nothing special." → neutral
Review: "The phone is okay but battery dies fast." →
```

#### 3. Chain-of-thought (CoT)

Ask the model to think step-by-step before answering. Especially useful for math and multi-hop reasoning. Smaller models benefit the most.

```
Question: A shop had 23 apples. They sold 15 and got 8 more. How many now?
Let's think step by step.
```

Modern "reasoning" models (DeepSeek R1, Qwen-QwQ, OpenAI o-series, Anthropic Sonnet extended-thinking) bake CoT into the model; you don't need to prompt for it.

#### 4. Role / system-prompt

Set behavior with a system message. Useful for tone, persona, constraints.

```
System: You are a terse senior engineer. Reply in at most 3 sentences.
     Never use marketing language. If unsure, say "I don't know."
User: How should I deploy a Python API?
```

#### 5. Structured output

Demand JSON / XML / a specific schema. This is what you use in production.

```
Respond ONLY with JSON matching this schema:
{"sentiment": "positive|negative|neutral", "confidence": 0.0-1.0, "reason": "string"}
No prose. No markdown. Just JSON.
```

Most modern models (OpenAI, Anthropic, Ollama via `format=json`) support enforced JSON modes — use them when available.

### Prompting anti-patterns

- **"Do not hallucinate."** The model has no concept of hallucination. This line is a no-op.
- **"You are an expert in X."** Mild lift. Don't rely on it.
- **Long preambles.** Every token costs latency and money. Be surgical.
- **Instructions buried after context.** Models weight the start and the end of the prompt more heavily. Put critical instructions at the end.
- **Vague "be helpful."** Define helpful in measurable terms.

### Temperature and sampling

- `temperature=0` → deterministic-ish; pick the most likely token every time. Use for extraction, classification, code.
- `temperature=0.7` → creative, variable. Use for brainstorming, drafting.
- `top_p=0.9` (nucleus sampling) → sample from the top tokens covering 90% probability mass.
- `max_tokens` → always set a cap. Runaway outputs are the most common cause of surprise bills.

### Worked example: prompting a small local model to extract invoices

A 7B model, without structure, will write a friendly paragraph. With few-shot + JSON mode, it becomes a reliable extractor.

```python
import ollama, json

PROMPT = """Extract invoice fields as JSON. Examples:

Text: "Invoice #A-101 from Acme, total Rs 12,400, due 2026-05-01."
Output: {"invoice_id":"A-101","vendor":"Acme","total":12400,"currency":"INR","due":"2026-05-01"}

Text: "Bill #7788 Microsoft USD 99.00 15 June 2026"
Output: {"invoice_id":"7788","vendor":"Microsoft","total":99.0,"currency":"USD","due":"2026-06-15"}

Text: "{input}"
Output:"""

def extract(text):
    r = ollama.chat(
        model="llama3.2:3b",
        messages=[{"role": "user", "content": PROMPT.format(input=text)}],
        format="json",
        options={"temperature": 0},
    )
    return json.loads(r["message"]["content"])

print(extract("Invoice INV-0042 from Zomato, INR 580, due 10 May 2026"))
```

The difference between this working and not working is not the model — it's the prompt shape.

### Evaluating prompts

Never compare prompts by vibes. Build a tiny eval set (10–50 items), define a metric (exact match, JSON validity, a second LLM judge), and run both candidates through it. The winning prompt is the one with higher score, full stop.

## Watch: A prompting masterclass

Pick a recent, credible walkthrough — OpenAI's or Anthropic's own prompting guides have video versions; DeepLearning.AI has short courses with Andrew Ng.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace with DeepLearning.AI prompting course or similar -->

- Note the difference between a system message and user message.
- Watch how few-shot examples are chosen.
- Pay attention to structured-output patterns.

## Lab: Prompt battles on a real classification task

You'll compare 5 prompt styles on the same task and score them.

1. Make sure Ollama is running and `llama3.2:3b` (or another small model) is pulled.
2. Download or create a dataset: 30 short customer reviews hand-labeled as positive/negative/neutral. Quick option: grab 30 lines from a public movie review CSV; re-label them yourself in a spreadsheet.
3. In a Python script `prompt_battle.py`, install: `pip install ollama pandas`.
4. Write a function `score(predictions, gold)` returning accuracy.
5. Implement five prompt functions: `zero_shot`, `few_shot` (with 3 in-prompt examples), `cot` ("Let's think step by step. Then answer with one word."), `role` (system message framing an expert labeler), `json_structured` (force JSON with sentiment + confidence).
6. Run each on your 30 reviews with `temperature=0`. Record outputs.
7. For non-JSON responses, parse the last word or use a regex. Count how often parsing fails.
8. Produce a table: prompt style × accuracy × parse-failure rate × avg tokens used.
9. Swap the model to `qwen3:8b` or `mistral:7b`. Re-run. Does the ranking of prompt styles change?
10. Write a one-paragraph conclusion: which prompt won, and why does that make sense given what you know about the model?

Budget 60 minutes.

## Quiz

Quiz covers: when few-shot beats zero-shot, what temperature does, why "don't hallucinate" doesn't work, the right way to demand JSON, and the role of system messages. Pull directly from the lab.

## Assignment

Pick a real task from your life — classifying your emails, labeling Jira tickets, extracting events from group-chat messages. Write `prompt-brief.md` containing: the task, one golden example input+output, a zero-shot prompt, a few-shot prompt with 3 examples, and a one-paragraph plan for how you'd build a 20-item eval set. Do not implement — just design.

## Discuss: Prompt engineering, for real

- Is prompt engineering a "real job" or a transient skill? Argue for a timeline.
- If reasoning models (o-series, R1, QwQ, extended-thinking) bake CoT in, what prompting styles become obsolete? Which ones become more important?
- When is it worth paying 2× latency for CoT vs. shipping fast with zero-shot?
- A teammate says "I tried it, it works." How do you convince them to build an eval set without sounding pedantic?
- Does the same prompt that works on Claude work on a local 7B? Where does it break?
