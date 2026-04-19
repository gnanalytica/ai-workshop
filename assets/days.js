export const DAYS = [
  // Week 1 — Foundations
  { n: 1,  w: 1, title: "What AI is + inside an LLM" },
  { n: 2,  w: 1, title: "Open-model landscape + Indian AI" },
  { n: 3,  w: 1, title: "Prompts + context engineering intro" },
  { n: 4,  w: 1, title: "Ethics + AI failures workshop" },
  { n: 5,  w: 1, title: "Workshop: AI wins show-and-tell" },

  // Week 2 — Exposure → Capstone kickoff
  { n: 6,  w: 2, title: "Chat as thinking partner" },
  { n: 7,  w: 2, title: "Research: Perplexity + NotebookLM + Deep Research" },
  { n: 8,  w: 2, title: "Creativity: images + video" },
  { n: 9,  w: 2, title: "Meetings, presentations + voice" },
  { n: 10, w: 2, title: "Ideathon 1 + Capstone kickoff", checkpoint: "Capstone kickoff" },

  // Week 3 — Think & Tell applied to YOUR capstone
  { n: 11, w: 3, title: "Vague → crisp problem statement" },
  { n: 12, w: 3, title: "Design thinking — the real version" },
  { n: 13, w: 3, title: "User empathy + interviews" },
  { n: 14, w: 3, title: "Systems thinking + storytelling + pitch" },
  { n: 15, w: 3, title: "Design sprint + locked 1-page spec", checkpoint: "Locked spec" },

  // Week 4 — Dev + AI Build
  { n: 16, w: 4, title: "GitHub + localhost + APIs" },
  { n: 17, w: 4, title: "Run LLMs locally + prompting deeper + evals" },
  { n: 18, w: 4, title: "Embeddings + RAG + knowledge graphs" },
  { n: 19, w: 4, title: "Context engineering: CLAUDE.md + AGENTS.md + evals" },
  { n: 20, w: 4, title: "APIs, data, automation (n8n) + browser agents" },

  // Week 5 — Build, Ship, Agentic
  { n: 21, w: 5, title: "Vibe-code your capstone v0", checkpoint: "v0 prototype" },
  { n: 22, w: 5, title: "Deploy + cost math + UX for AI + GEO" },
  { n: 23, w: 5, title: "Agents + MCP + LangGraph + CrewAI" },
  { n: 24, w: 5, title: "Multi-agent + Swarms + Skills + Plugins" },
  { n: 25, w: 5, title: "Ideathon 2 + Mini-Demo Day", checkpoint: "Mini-demo" },

  // Week 6 — Launch (light theory, heavy capstone)
  { n: 26, w: 6, title: "Ethics + Risks workshop" },
  { n: 27, w: 6, title: "AI benchmarks: how to read leaderboards" },
  { n: 28, w: 6, title: "How to keep up with AI" },
  { n: 29, w: 6, title: "Demo rehearsal + showcase polish" },
  { n: 30, w: 6, title: "Demo Day — live panel", checkpoint: "Final demo" },
];

export const WEEK_TITLES = {
  1: "Foundations",
  2: "Exposure → Capstone kickoff",
  3: "Think & Tell · applied to your capstone",
  4: "Dev + AI Build",
  5: "Build, Ship, Agentic",
  6: "Launch — light theory, heavy capstone",
};

export const WEEK_OUTCOMES = {
  1: "By end of Week 1 you know what AI is, how it works, and where it breaks.",
  2: "By end of Week 2 you've used every flavor of AI tool — and you've locked in your capstone.",
  3: "By end of Week 3 you have a 1-page spec + wireframes of the capstone you'll build.",
  4: "By end of Week 4 you can direct AI to build real things and reason about them.",
  5: "By end of Week 5 your capstone v0 is live and you've seen the agentic horizon.",
  6: "By end of Week 6 your capstone is polished, demoed, and live on your showcase.",
};

export const CHECKPOINTS = {
  10: { label: "Capstone kickoff", color: "#c3ff36" },
  15: { label: "Locked spec",       color: "#c3ff36" },
  21: { label: "v0 prototype",      color: "#38bdf8" },
  25: { label: "Mini-demo",         color: "#8b5cf6" },
  30: { label: "Final demo",        color: "#ff6b6b" },
};
