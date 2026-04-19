---
reading_time: 14 min
tldr: "Run a real LLM on your own laptop with zero cloud, zero cost, and zero data leaving your machine."
tags: ["llms", "ai", "concepts"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Install Ollama and chat with three models", "url": "https://ollama.com/"}
prompt_of_the_day: "You are a local model with no internet. Given this text: {{text}}, give me a 3-bullet summary and flag anything you are unsure about."
resources: [{"title": "Ollama", "url": "https://ollama.com/"}, {"title": "Open WebUI", "url": "https://openwebui.com/"}, {"title": "Ollama model library", "url": "https://ollama.com/library"}]
---

## Intro

Today your laptop becomes an AI server. You'll install Ollama, pull three different open models, and chat with them through a polished browser UI — all offline. This matters more than it sounds: privacy, cost, and the freedom to tinker all come from here.

## Read: What "local" actually means

When you use ChatGPT, your text travels to OpenAI's servers, gets processed on thousand-dollar GPUs, and comes back. Free while free, fine for homework, terrible for a leaked offer letter or a client's private data. A local model inverts that: the weights sit on your disk, inference happens on your CPU or GPU, and nothing leaves the machine. The tradeoff is speed and smarts — but for many real tasks, the gap is smaller than you'd think.

### The three reasons local matters

- Privacy. Your notes, your code, your chats — none of it trains anyone else's model or sits in anyone else's logs.
- Cost. Once you've downloaded the weights, every query is free forever. No per-token pricing.
- Offline. Plane, train, campus outage, remote village — your AI works.

There's a fourth, subtler reason: understanding. When you see how slowly a 3B-parameter model streams tokens on your laptop, you feel scaling laws in your fingertips. That intuition is worth the hour.

### The model zoo, briefly

Every week someone releases a new open model. Here's the 2026 landscape, simplified.

| Model family | Size range | Best for | Made by |
|---|---|---|---|
| Llama 3.2 | 1B / 3B | Fast chat, small devices | Meta |
| Qwen 3 | 4B / 8B / 32B | Coding, reasoning, multilingual | Alibaba |
| Mistral | 7B | Balanced general chat | Mistral AI |
| Gemma 3 | 2B / 9B / 27B | Safe, instruction-tuned | Google |
| Phi 4 | 4B / 14B | Punches above weight on reasoning | Microsoft |

You do not need to memorize this. The rule of thumb: pick a size that fits your RAM. 3B-class models run happily on 8GB laptops. 7B-class models want 16GB. 30B+ wants a beefy GPU or serious patience.

### Ollama, in one paragraph

Ollama is the simplest way to run local LLMs. It's free, open source, and ships as a desktop app on macOS, Windows, and Linux. Install it once, and you get a background service that can download any supported model by name and expose it as a chat. It's the Docker of LLMs — a clean runtime for weights.

### Open WebUI — putting a face on Ollama

Ollama itself is minimal. Open WebUI is a free browser-based frontend that makes it feel like ChatGPT: multi-turn chats, saved conversations, model-switching, document upload, even basic RAG. You run it locally with one installer. It talks to Ollama under the hood.

```
Read this, don't type it

[ Your browser ]  <-->  [ Open WebUI on localhost:3000 ]
                              |
                              v
                       [ Ollama service ]
                              |
                              v
                  [ Model weights on your disk ]
```

All traffic stays on your machine. The network tab in your browser will show zero external requests.

### Cloud vs. local, honestly

| Aspect | Cloud (ChatGPT/Claude) | Local (Ollama) |
|---|---|---|
| Smarts | Frontier, very high | Small to medium |
| Speed | Fast (big GPUs) | Depends on your laptop |
| Privacy | Data leaves your machine | Nothing leaves |
| Cost | Per-token or subscription | One-time download, free forever |
| Offline | No | Yes |
| Setup | None | 10 minutes today |

Neither is "better." They're different tools. A seasoned builder uses both: frontier for hard reasoning, local for privacy-sensitive or high-volume work.

## Watch: Ollama in five minutes

A walkthrough of installing Ollama, pulling a model, and chatting through Open WebUI. Watch for the part where the presenter unplugs their Wi-Fi mid-chat — the model keeps answering.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Notice how small the install actually is.
- Watch the first token appear after the model loads into RAM.
- Observe the RAM usage climb when a bigger model loads.

## Lab: Three models, one laptop

You'll install Ollama, pull three models, and compare them side by side.

1. Go to https://ollama.com/ and download the Ollama desktop app for your OS. Install it. Launch it. You'll see a small icon in your menu bar or system tray — that's the service running.
2. Open the Ollama app window. In the model picker, type `llama3.2:3b` and click download. Wait 2–5 minutes (it's ~2GB). This is a small, fast Meta model.
3. Pull two more: `qwen3:4b` and `mistral:7b`. While these download, move to step 4.
4. Open WebUI. The easiest path: open the Ollama app, go to the built-in chat window. If you want the fuller experience, visit https://openwebui.com/ and follow their "one-click install" that connects to your local Ollama. Either works for today.
5. Chat with Llama 3.2 3B first. Ask: "Summarize the French Revolution in 3 bullets, aimed at a college student." Note the speed and quality.
6. Switch to Qwen 3 4B using the model dropdown. Ask the exact same question. Switch to Mistral 7B. Same question. You now have a three-way comparison — paste all three answers into a Google Doc. Which sounded smartest? Which was fastest?
7. Turn off your Wi-Fi. Ask any of the three to help you outline a placement resume. Notice it still works. That's the whole point.
8. Paste today's prompt-of-the-day into the largest model you pulled, with a paragraph from your own notes or a news article as `{{text}}`. Save the output.

If a model feels painfully slow, pick a smaller one — speed matters more than the last 10% of quality for this week.

## Quiz

A short quiz on local inference. Expect questions on why you'd prefer local over cloud, what "7B" refers to, what Ollama and Open WebUI each do, and one scenario question asking you to pick the right tool for the job. Trust the privacy/cost/offline framing.

## Assignment

Record a 60-second screen capture (Loom, QuickTime, or phone camera pointed at your laptop) showing you ask the same question to two different local models and getting different answers. Upload to the class channel with a one-sentence verdict on which model you'd keep and why.

## Discuss: Local first, cloud when needed

- Which of the three models surprised you most — was it the biggest, or a smaller one?
- What's one task you currently do in ChatGPT that you'd rather run locally, and why?
- Running a 7B model felt slow. What would you trade for that speed — quality, privacy, or cost?
- Have you ever pasted something into ChatGPT that you wish you hadn't? What would a local setup change about that behavior?
- If open models keep getting better every 3 months, what changes for big AI labs like OpenAI?
