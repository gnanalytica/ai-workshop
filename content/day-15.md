---
reading_time: 14 min
tldr: "An LLM is a next-word guesser trained on the internet. Today you learn the mental model without a single equation."
tags: ["ai", "llms", "mental-model"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Peek inside an LLM with visualizers", "url": "https://huggingface.co/chat/"}
prompt_of_the_day: "Explain {{concept}} using only analogies a 12-year-old would understand. Then give one example where the analogy breaks down."
resources: [{"title": "3Blue1Brown: Neural Networks", "url": "https://www.3blue1brown.com/topics/neural-networks"}, {"title": "Karpathy: Intro to LLMs", "url": "https://www.youtube.com/watch?v=zjkBMFhNj_g"}, {"title": "HuggingFace Chat", "url": "https://huggingface.co/chat/"}]
---

## Intro

Today we pop the hood. Not to teach you linear algebra — you don't need it to ship — but to give you the mental model that makes every other Build-week concept click. By the end you'll confidently tell a friend what an LLM really is, why it hallucinates, and why "bigger" was the surprise of the decade.

## Read: What an LLM actually is

At its core, a large language model is a very, very good autocomplete. That's not a joke or a dumbing-down. It is literally the training objective: given some text, predict the next small piece of text. Do that a few trillion times on the whole internet and the thing that falls out is unreasonably useful.

Three ideas unlock everything: tokens, weights, and attention. We'll take them one at a time using toys you already know.

### Tokens: the Lego bricks of language

A model does not see words. It sees tokens — short fragments of text, usually 3 to 5 characters long. "Unbelievable" might split into `un`, `believ`, `able`. The sentence "I love placement prep" might become 5 tokens. Think of tokens as Lego bricks: the model snaps them together one at a time.

```
Read this, don't type it

"I'm prepping for TCS"  ->  [ "I" "'m" " prep" "ping" " for" " T" "CS" ]
                              ^
                              7 tokens, roughly one per Lego brick
```

Every request you send and every word the model writes back gets measured in tokens. That's what "context window" and "pricing per million tokens" refer to. When people say GPT-4 has a 128K context window, they mean it can hold ~128,000 Lego bricks in mind at once. Enough for roughly 300 pages.

### Weights: frozen intuition

After training, the model is just a giant pile of numbers — the weights. A small model has a few billion of them; a large one has hundreds of billions. You can think of weights as frozen intuitions. During training, the model read the internet, guessed next tokens, got graded, and nudged its numbers to do better next time. Trillions of nudges later, the numbers encode something remarkable: a working sense of grammar, facts, style, code, sarcasm, and a lot of human common sense.

Weights are read-only once shipped. When you "chat" with a model, you are not teaching it. You are giving it a prompt, and it runs that prompt through its frozen intuitions to produce the most probable next token, then the next, then the next.

### Attention: the spotlight

Here's the breakthrough from 2017 that made ChatGPT possible. When predicting the next token, the model doesn't weigh all prior tokens equally. It uses attention — a learned spotlight that decides which earlier tokens matter most right now. In the sentence "The trophy didn't fit in the suitcase because it was too big," attention learns that "it" points to "trophy," not "suitcase." That's what lets models stay coherent across paragraphs.

```
Read this, don't type it

The    trophy   didn't   fit ... because    it    was too big
              ^^^^^^                         |
              the spotlight shines back here when generating "it"
```

No one programmed that rule. The model figured it out from patterns in text. That's why we say these models "learned" — nobody sat down and typed grammar rules.

### Why bigger got weirdly smarter

The big surprise of the last five years: if you scale up the weights, the data, and the compute together, new abilities just pop out. Small models can't reason through multi-step math. Medium ones can, a bit. Large ones can write a coherent business plan. This is called emergence, and it is mostly empirical — researchers noticed it and are still catching up on why.

| Model size | Rough capability |
|---|---|
| ~1B params | Good autocomplete, weak reasoning |
| ~8B params | Solid chat, simple tasks |
| ~70B params | Strong reasoning, code, summarization |
| ~400B+ params | Frontier — PhD-level in many domains |

You'll run a small local model tomorrow. It will feel dumber than ChatGPT. That's not a bug; that's the scaling law in action.

### Why hallucinations happen

If the model is guessing the most probable next token, and the probable next token after "The president of India in 2027 is ___" looks like a name, it will confidently invent one. The model has no internal "I don't know" flag unless we train one in. Hallucinations are not the model lying. They are the model being a probability machine asked to produce text. The fix is not "tell it not to lie." The fix is to give it real sources at the moment of answering — which is exactly what RAG does on Day 19.

### The whole picture in one image

```
Read this, don't type it

Your prompt -> tokens -> [ weights + attention ] -> next token
                                                        |
                                                        v
                        loops back, one token at a time, until done
```

That is the entire magic trick. Everything else — chat history, system prompts, tools, RAG — is scaffolding around this loop.

## Watch: A gentle pop-the-hood tour

Andrej Karpathy, who helped build GPT at OpenAI and Tesla's self-driving system, has an hour-long "Intro to LLMs" talk that is the single best explainer on the internet. If you watch one technical video all workshop, make it this one.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Notice his description of the model as "a zip file of the internet."
- Watch for his "two-stage training" mental model: pretraining, then fine-tuning.
- Pay attention to the part about hallucinations — it'll make Day 19 click.

## Lab: See the guess happen

No code. Just click around.

1. Open HuggingFace Chat: https://huggingface.co/chat/. Log in with a free account if asked.
2. In the model picker, select a small model (like Llama 3.2 3B) and ask it: "Complete this sentence: The capital of France is". Watch the answer stream, token by token. That pause-and-flow is the next-token loop happening in real time.
3. Now switch to a large frontier model in the picker (like the biggest Llama or Mistral available). Ask the exact same question. Notice the tone, speed, and confidence difference.
4. Paste this into the small model: "Tell me about the 2027 cricket World Cup final." Save the answer. Now paste the same question into the big model. Compare — which one hallucinated more? Which one hedged? This is emergence you can feel.
5. Open https://bbycroft.net/llm (a free browser visualizer). Click through the layers. You'll see tokens enter on the left and probabilities roll out on the right. Don't worry about understanding every layer — just watch the flow.
6. Paste today's prompt-of-the-day into any chat. Ask it to explain "attention" as if you were 12. Save the best analogy you get. Bring it to the discussion.
7. Ask a model: "What is your context window in tokens, roughly how many pages of text is that, and when do you start forgetting the start of our conversation?" Record the answer.

## Quiz

Expect four quick checks: what a token is, what weights store, what attention does, and why hallucinations happen. One question will ask which of four statements about LLMs is myth versus fact. Trust the mental model, not the mystique.

## Assignment

Write a 150-word explanation of "what an LLM is" in your own voice, for a non-technical friend. No jargon. Use at least two analogies. Post it in the class channel and react to two classmates' posts with one sentence of constructive feedback each.

## Discuss: Mental models that actually land

- Which analogy from today — Lego bricks, spotlight, frozen intuition, zip file of the internet — clicked hardest for you?
- Now that you know hallucinations are inevitable, how does that change how you use AI day-to-day?
- Small models are free and private but "dumber." Where in your life would you trade smarts for privacy?
- If weights are frozen after training, how does ChatGPT "remember" things you told it earlier in the chat?
- What's one thing you still don't get? Bring it to the live session — no shame, only gain.
