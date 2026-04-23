export const DAYS = [
  // Week 1 — Foundations
  { n: 1,  w: 1, title: "Notice AI Around You" },
  { n: 2,  w: 1, title: "See How Models Read" },
  { n: 3,  w: 1, title: "Pick the Right AI Tool" },
  { n: 4,  w: 1, title: "Write Prompts That Work" },
  { n: 5,  w: 1, title: "Build Your AI Stack" },

  // Week 2 — Applied tools + opportunity discovery
  { n: 6,  w: 2, title: "Pick the Right Brain" },
  { n: 7,  w: 2, title: "Research Without Getting Fooled" },
  { n: 8,  w: 2, title: "Make Your First AI Poster" },
  { n: 9,  w: 2, title: "Make AI Speak for You" },
  { n: 10, w: 2, title: "Choose Your Capstone", checkpoint: "Capstone kickoff" },

  // Week 3 — Problem framing + user validation
  { n: 11, w: 3, title: "Sharpen the Problem" },
  { n: 12, w: 3, title: "Think Like a Designer" },
  { n: 13, w: 3, title: "Ask Better Questions" },
  { n: 14, w: 3, title: "Map the System, Tell the Story" },
  { n: 15, w: 3, title: "Sprint to a Spec", checkpoint: "Locked spec" },

  // Week 4 — Build foundations (data, retrieval, eval, automation)
  { n: 16, w: 4, title: "Understand the Plumbing" },
  { n: 17, w: 4, title: "Compare Models Like a Builder" },
  { n: 18, w: 4, title: "Teach AI Your Documents" },
  { n: 19, w: 4, title: "Make AI Remember Your Project" },
  { n: 20, w: 4, title: "Automate One Boring Task" },

  // Week 5 — Prototype, deploy, orchestrate
  { n: 21, w: 5, title: "Build Your First Prototype", checkpoint: "v0 prototype" },
  { n: 22, w: 5, title: "Publish It and Price It" },
  { n: 23, w: 5, title: "Give AI Tools and a Goal" },
  { n: 24, w: 5, title: "Split One Agent into Two" },
  { n: 25, w: 5, title: "Demo, Get Feedback, Improve", checkpoint: "Mini-demo" },

  // Week 6 — Launch, demo, and career continuation
  { n: 26, w: 6, title: "Safety-Check Your Capstone" },
  { n: 27, w: 6, title: "Choose Models With Receipts" },
  { n: 28, w: 6, title: "Build Your Learning Habit" },
  { n: 29, w: 6, title: "Rehearse Until It's Easy" },
  { n: 30, w: 6, title: "Launch Your Capstone", checkpoint: "Final demo" },
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
