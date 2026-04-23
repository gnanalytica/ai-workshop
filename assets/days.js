export const DAYS = [
  // Week 1 — Foundations
  { n: 1,  w: 1, title: "What AI is + where it's used in real life" },
  { n: 2,  w: 1, title: "Inside an LLM: tokens + attention" },
  { n: 3,  w: 1, title: "Tool selection playbook — which AI tool for which job" },
  { n: 4,  w: 1, title: "Prompting fundamentals + context basics" },
  { n: 5,  w: 1, title: "Workshop: AI wins show-and-tell" },

  // Week 2 — Applied tools + opportunity discovery
  { n: 6,  w: 2, title: "Chat as thinking partner" },
  { n: 7,  w: 2, title: "Research: Perplexity + NotebookLM + Deep Research" },
  { n: 8,  w: 2, title: "Creativity: images + video" },
  { n: 9,  w: 2, title: "Meetings, presentations + voice" },
  { n: 10, w: 2, title: "Ideathon 1 + Capstone kickoff", checkpoint: "Capstone kickoff" },

  // Week 3 — Problem framing + user validation
  { n: 11, w: 3, title: "Vague → crisp problem statement" },
  { n: 12, w: 3, title: "Design thinking — the real version" },
  { n: 13, w: 3, title: "User empathy + interviews" },
  { n: 14, w: 3, title: "System map + pitch narrative" },
  { n: 15, w: 3, title: "Design sprint + locked 1-page spec", checkpoint: "Locked spec" },

  // Week 4 — Build foundations (data, retrieval, eval, automation)
  { n: 16, w: 4, title: "Build setup: GitHub + localhost + APIs" },
  { n: 17, w: 4, title: "Prompt iteration + evaluation loops" },
  { n: 18, w: 4, title: "Embeddings + RAG foundations" },
  { n: 19, w: 4, title: "Context engineering: CLAUDE.md + AGENTS.md + evals" },
  { n: 20, w: 4, title: "RAG tuning + GraphRAG decisioning" },

  // Week 5 — Prototype, deploy, orchestrate
  { n: 21, w: 5, title: "Vibe-code your capstone v0", checkpoint: "v0 prototype" },
  { n: 22, w: 5, title: "Ship: deploy, cost, UX, discoverability" },
  { n: 23, w: 5, title: "API/data automation + browser agents" },
  { n: 24, w: 5, title: "Agent foundations + MCP + multi-agent delegation lab" },
  { n: 25, w: 5, title: "Ideathon 2 + Mini-Demo Day", checkpoint: "Mini-demo" },

  // Week 6 — Launch, demo, and career continuation
  { n: 26, w: 6, title: "Safety red-team + ethics workshop" },
  { n: 27, w: 6, title: "Benchmark literacy + model selection" },
  { n: 28, w: 6, title: "Personal AI learning system" },
  { n: 29, w: 6, title: "Demo rehearsal + story polish" },
  { n: 30, w: 6, title: "Demo Day — live panel", checkpoint: "Final demo" },
];

export const WEEK_TITLES = {
  1: "Foundations",
  2: "Applied tools + opportunity discovery",
  3: "Problem framing + user validation",
  4: "Build foundations (data, retrieval, eval, automation)",
  5: "Prototype, deploy, orchestrate",
  6: "Launch, demo, and career continuation",
};

export const WEEK_OUTCOMES = {
  1: "By end of Week 1 you know what AI is, how it works, and where it breaks.",
  2: "By end of Week 2 you can pick the right AI workflow quickly and lock your capstone opportunity.",
  3: "By end of Week 3 you have a validated problem, clear users, and a locked 1-page capstone spec.",
  4: "By end of Week 4 you can evaluate prompts, build retrieval systems, and automate real workflows.",
  5: "By end of Week 5 your capstone v0 is live and your first agentic workflow is running.",
  6: "By end of Week 6 your capstone is safety-checked, benchmarked, polished, and demo-ready.",
};

export const CHECKPOINTS = {
  10: { label: "Capstone kickoff", color: "#c3ff36" },
  15: { label: "Locked spec",       color: "#c3ff36" },
  21: { label: "v0 prototype",      color: "#38bdf8" },
  25: { label: "Mini-demo",         color: "#8b5cf6" },
  30: { label: "Final demo",        color: "#ff6b6b" },
};
