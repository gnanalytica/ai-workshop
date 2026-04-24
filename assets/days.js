// 30-day arc — titles and milestone days match `AI Workshop Curriculum Planner` (Sheet3.csv).
// Lesson copy: `content/day-NN.md` frontmatter `topic` should match `title` here per day.

export const DAYS = [
  // Week 1
  { n: 1, w: 1, title: "What AI is and is not, plus the AI already in everyday life" },
  { n: 2, w: 1, title: "Inside an LLM: tokens, weights, attention, memory" },
  { n: 3, w: 1, title: "Prompting Guide: CREATE, few-shot, chain-of-thought, structured output" },
  { n: 4, w: 1, title: "OpenSource Models and Indian Stack" },
  { n: 5, w: 1, title: "Grounded research with AI, Fast Vs Thinking vs Deep Research" },
  { n: 6, w: 1, title: "Prompt game & Capstone Milestone 1: ideathon, brainstorm, Research", checkpoint: "Capstone Milestone 1" },

  // Week 2
  { n: 7, w: 2, title: "Problem statements with Heilmeier, 5 Whys, How Might We" },
  { n: 8, w: 2, title: "Design thinking as a disciplined five-stage loop" },
  { n: 9, w: 2, title: "User interviews, The Mom Test, JTBD, listening for signal" },
  { n: 10, w: 2, title: "Systems thinking, leverage points, causal loops, SCQA pitch, MindMaps" },
  { n: 11, w: 2, title: "Capstone Milestone 2: Idea Lock, Features and Automations with AI", checkpoint: "Capstone Milestone 2" },

  // Week 3
  { n: 12, w: 3, title: "Text2Image" },
  { n: 13, w: 3, title: "Workflow automation, browser automation" },
  { n: 14, w: 3, title: "Making Presentation with AI" },
  { n: 15, w: 3, title: "Vibe Coding (Including Plan mode)" },
  { n: 16, w: 3, title: "Capstone Milestone 3: Presenation/Pitch/Protoype, Mini Demo", checkpoint: "Capstone Milestone 3" },

  // Week 4
  { n: 17, w: 4, title: "Git, GitHub, localhost, APIs" },
  { n: 18, w: 4, title: "Deployment with Vercel and Supabase (OpenCode)" },
  { n: 19, w: 4, title: "Context Engineering: Embeddings & RAG,  prompt vs retrieve vs fine-tune" },
  { n: 20, w: 4, title: "Context Engineering: CLAUDE.MD, AGENTS.MD Rules and Skills" },
  { n: 21, w: 4, title: "Capstone Milestone 4: Workspace Setup and First Deploy", checkpoint: "Capstone Milestone 4" },

  // Week 5
  { n: 22, w: 5, title: "Agentic AI: ReAct agents, tool use, LangGraph, MCP, Multi Agentic System" },
  { n: 23, w: 5, title: "Cost Estimation of AI: API costs, Tokens, Knowledge Graphs, Neo Clouds/GPUs with OpenSource Models" },
  { n: 24, w: 5, title: "Text2Audio, Text2Video" },
  { n: 25, w: 5, title: "Local LLMs, prompt patterns, eval habits, tracing" },
  { n: 26, w: 5, title: "Capstone Milestone 5: Add Agentic Frameworks and a chatbot to your project", checkpoint: "Capstone Milestone 5" },

  // Week 6
  { n: 27, w: 6, title: "AI Ethics, Safety, Guard rails and Red-teaming" },
  { n: 28, w: 6, title: "GEO (Generative Engine Optimization), Leaderboard, Benchmarking, Keepin up with AI" },
  { n: 29, w: 6, title: "Demo Day 1", checkpoint: "Demo Day 1" },
  { n: 30, w: 6, title: "Demo Day 2", checkpoint: "Demo Day 2" },
];

export const WEEK_TITLES = {
  1: "Foundations: AI, LLMs, prompts, open stack, research",
  2: "Problem & design: framing, interviews, systems, Milestone 2",
  3: "Build & present: image, automation, slides, vibe coding, Milestone 3",
  4: "Ship: Git, deploy, RAG, agent rules, Milestone 4",
  5: "Agents & scale: toolchains, cost, media, local models, Milestone 5",
  6: "Close: ethics, GEO, demo days",
};

export const WEEK_OUTCOMES = {
  1: "By end of Week 1 you can explain AI/LLMs, prompt well, use Indian/open stacks, and run grounded research.",
  2: "By end of Week 2 you can frame problems, run design and user research, system-map, and pass Milestone 2.",
  3: "By end of Week 3 you can create assets, automate workflows, present, vibe-code, and pass Milestone 3.",
  4: "By end of Week 4 you can use Git, deploy, build RAG/context workflows, and pass Milestone 4.",
  5: "By end of Week 5 you can run agentic stacks, estimate cost, work with local models, and pass Milestone 5.",
  6: "By end of Week 6 you can reason about safety/GEO and ship two demo days.",
};

/** Timeline markers (dashboard, timeline) — aligned with curriculum milestones. */
export const CHECKPOINTS = {
  6: { label: "Capstone Milestone 1", color: "#c3ff36" },
  11: { label: "Capstone Milestone 2", color: "#c3ff36" },
  16: { label: "Capstone Milestone 3", color: "#38bdf8" },
  21: { label: "Capstone Milestone 4", color: "#38bdf8" },
  26: { label: "Capstone Milestone 5", color: "#8b5cf6" },
  29: { label: "Demo Day 1", color: "#ff6b6b" },
  30: { label: "Demo Day 2", color: "#ff6b6b" },
};
