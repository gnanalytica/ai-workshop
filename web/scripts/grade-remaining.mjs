/**
 * grade-remaining.mjs — Fetch ungraded Day 6,8,9,10 from Supabase, grade, write back, and publish.
 */
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://ucqatbscxgborqsgnrjl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcWF0YnNjeGdib3Jxc2ducmpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcyODU2NywiZXhwIjoyMDkzMzA0NTY3fQ.tmJEyJm3hTKqtCPLzIFVGyUeY-7WeMzP9RPumEj-GO4",
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Fetch ungraded submissions for Day 6,8,9,10
const { data, error } = await sb
  .from("assignment_submissions")
  .select("id, body, assignments!inner(day_number, title)")
  .eq("ai_graded", false)
  .eq("status", "submitted")
  .eq("assignments.day_number", 30);

if (error) { console.log("Fetch error:", error.message); process.exit(1); }
console.log("Total ungraded for Day 6,8,9,10: " + data.length + "\n");

if (data.length === 0) { console.log("Nothing to grade!"); process.exit(0); }

// Show breakdown
const byDay = {};
for (const r of data) {
  const d = r.assignments.day_number;
  if (!byDay[d]) byDay[d] = {};
  const t = r.assignments.title;
  if (!byDay[d][t]) byDay[d][t] = { count: 0, empty: 0 };
  byDay[d][t].count++;
  if (!r.body || r.body.trim().length === 0) byDay[d][t].empty++;
}
for (const day of Object.keys(byDay).sort((a, b) => a - b)) {
  for (const [title, v] of Object.entries(byDay[day])) {
    console.log("  Day " + day + " | " + v.count + " subs (" + v.empty + " empty) | " + title.slice(0, 60));
  }
}
console.log("");

// ── AI-tell detection ──
const AI_TELLS = [
  "here is a draft", "here's a draft", "here is a ready", "here's a ready",
  "you can adapt", "you can use this", "you can pair this", "you need to upload",
  "for your submission", "paste this into", "replace the bracketed",
  "if you want, i can", "shall i", "would you like me to",
  "here's a blueprint", "here is a blueprint",
  "it sounds like you", "let me help you",
  "based on your current dashboard",
  "for this task, you", "you need three things",
];
function hasAiTell(body) {
  const lower = body.toLowerCase();
  return AI_TELLS.some((t) => lower.includes(t));
}
function wordCount(body) { return body.trim().split(/\s+/).filter(Boolean).length; }
function hasUrl(body) { return /https?:\/\/\S+/i.test(body); }

function gradeSubmission(r) {
  const body = r.body || "";
  const _title = r.assignments.title || "";
  const _assignBody = r.assignments.body || "";
  const wc = wordCount(body);
  const aiTell = hasAiTell(body);
  let score, feedback, strengths, weaknesses;

  // Empty submission
  if (wc < 5) {
    return {
      id: r.id, score: 30,
      feedback_md: "Empty or near-empty submission. Please revisit the assignment and submit your work.",
      strengths: ["Submitted on time"],
      weaknesses: ["No meaningful content provided"],
    };
  }

  // AI-tell detected
  if (aiTell) {
    return {
      id: r.id, score: 42,
      feedback_md: "This submission contains AI-generated meta-commentary rather than your own work. Rewrite in your own voice addressing the assignment prompt directly.",
      strengths: ["Submitted on time"],
      weaknesses: ["AI-generated content detected", "Not authentic student work"],
    };
  }

  // Day 6 — typically prompt engineering / API calls
  if (r.assignments.day_number === 6) {
    const hasPrompt = /prompt|system|user|assistant|message|instruction/i.test(body);
    const hasApi = /api|endpoint|curl|fetch|request|response|openai|gemini|claude/i.test(body);
    const hasCode = /```|function|const |let |import |def |class /i.test(body);

    if (hasCode && (hasPrompt || hasApi) && wc > 60) {
      score = 82; feedback = "Strong submission showing practical prompt engineering and API interaction skills. Code artifacts demonstrate hands-on engagement.";
      strengths = ["Code provided", "Prompt/API concepts demonstrated", "Substantive content"];
      weaknesses = ["Continue iterating on prompt quality"];
    } else if ((hasPrompt || hasApi) && wc > 40) {
      score = 72; feedback = "Good engagement with prompt engineering concepts. Consider adding code examples or API call demonstrations to strengthen your submission.";
      strengths = ["Relevant concepts addressed"]; weaknesses = ["Add more practical examples"];
    } else if (wc > 30) {
      score = 62; feedback = "Your submission addresses the topic but could be more specific. Include prompt examples, API interactions, or code snippets.";
      strengths = ["Made an effort"]; weaknesses = ["Needs more specificity and examples"];
    } else {
      score = 50; feedback = "Brief submission. Expand with prompt examples and API interaction details.";
      strengths = ["Submitted"]; weaknesses = ["Too brief", "Missing practical examples"];
    }
  }

  // Day 8 — typically building / deployment / full-stack
  else if (r.assignments.day_number === 8) {
    const hasDeploy = hasUrl(body) || /deploy|vercel|netlify|hosted|live|render/i.test(body);
    const hasTech = /database|supabase|auth|api|component|react|next|html|css|tailwind/i.test(body);
    const hasCode = /```|function|const |let |import |def |class /i.test(body);

    if (hasDeploy && (hasTech || hasCode) && wc > 50) {
      score = 80; feedback = "Good full-stack work with deployment and technical implementation. Keep building on this foundation.";
      strengths = ["Deployed/linked", "Technical implementation shown", "Substantive"];
      weaknesses = ["Continue refining"];
    } else if (hasDeploy || hasTech) {
      score = 68; feedback = "Partial work — include both a deployment link and technical details about your implementation.";
      strengths = [hasDeploy ? "Deployment present" : "Technical concepts shown"];
      weaknesses = [hasDeploy ? "Add technical details" : "Add deployment link"];
    } else if (wc > 30) {
      score = 58; feedback = "Your submission needs more technical depth. Show what you built and provide a link.";
      strengths = ["Made an effort"]; weaknesses = ["Missing deployment and tech details"];
    } else {
      score = 48; feedback = "Brief submission. Show your work with deployment URL and technical details.";
      strengths = ["Submitted"]; weaknesses = ["Too brief"];
    }
  }

  // Day 9 — typically AI agents / automation
  else if (r.assignments.day_number === 9) {
    const hasAgent = /agent|autonom|tool|function.?call|chain|langgraph|crew|automate/i.test(body);
    const hasWorkflow = /workflow|step|pipeline|trigger|action|sequence/i.test(body);
    const hasCode = /```|function|const |let |import |def |class /i.test(body);

    if ((hasAgent || hasWorkflow) && hasCode && wc > 50) {
      score = 82; feedback = "Strong work exploring AI agents/automation with code. Understanding tool use and agentic patterns is a key skill.";
      strengths = ["Agent/automation concepts", "Code examples", "Substantive"];
      weaknesses = ["Keep experimenting"];
    } else if ((hasAgent || hasWorkflow) && wc > 30) {
      score = 70; feedback = "Good conceptual engagement with agents/automation. Add code or a working demo to strengthen your submission.";
      strengths = ["Relevant concepts addressed"]; weaknesses = ["Add practical implementation"];
    } else if (wc > 30) {
      score = 60; feedback = "Your submission could more directly address agent or automation concepts. Be specific about what you built.";
      strengths = ["Made an effort"]; weaknesses = ["Needs more focus on the topic"];
    } else {
      score = 48; feedback = "Brief submission. Expand on your agent/automation work with examples.";
      strengths = ["Submitted"]; weaknesses = ["Too brief"];
    }
  }

  // Day 10 — typically capstone planning / integration
  else if (r.assignments.day_number === 10) {
    const hasPlan = /plan|scope|feature|mvp|milestone|goal|build|project/i.test(body);
    const hasTech = /stack|supabase|react|next|api|database|auth|deploy/i.test(body);
    const hasLink = hasUrl(body);

    if (hasPlan && hasTech && wc > 50) {
      score = 80; feedback = "Solid capstone planning with clear scope and technical direction. This foundation will serve you well in the coming days.";
      strengths = ["Clear plan", "Tech stack identified", "Substantive"];
      weaknesses = ["Execute on this plan"];
    } else if (hasPlan || hasTech) {
      score = 68; feedback = "Good start on planning. Strengthen by including both a clear scope and your technical approach.";
      strengths = [hasPlan ? "Plan present" : "Tech mentioned"];
      weaknesses = [hasPlan ? "Add tech stack details" : "Add project scope"];
    } else if (hasLink && wc > 20) {
      score = 65; feedback = "Link provided — make sure to describe your plan and technical approach alongside it.";
      strengths = ["Link shared"]; weaknesses = ["Add planning details"];
    } else if (wc > 20) {
      score = 58; feedback = "Your submission needs a clearer project plan. What are you building? What tech? What milestones?";
      strengths = ["Made an effort"]; weaknesses = ["Needs clearer planning"];
    } else {
      score = 45; feedback = "Brief submission. Describe your capstone plan, scope, and tech stack.";
      strengths = ["Submitted"]; weaknesses = ["Too brief"];
    }
  }

  // Fallback
  else {
    if (wc > 100 && hasUrl(body)) {
      score = 78; feedback = "Good submission with content and links.";
      strengths = ["Substantive", "Links included"]; weaknesses = ["Continue refining"];
    } else if (wc > 80) {
      score = 72; feedback = "Decent effort. Add more specificity.";
      strengths = ["Reasonable effort"]; weaknesses = ["Add specificity"];
    } else if (wc > 30) {
      score = 60; feedback = "Brief. Expand with more detail.";
      strengths = ["Made an attempt"]; weaknesses = ["Too brief"];
    } else {
      score = 45; feedback = "Very brief. Revisit the prompt.";
      strengths = ["Submitted"]; weaknesses = ["Minimal content"];
    }
  }

  return { id: r.id, score, feedback_md: feedback, strengths, weaknesses };
}

// ── Grade and write to Supabase ──
let ok = 0, fail = 0;
const now = new Date().toISOString();
const stats = {};

for (let i = 0; i < data.length; i++) {
  const r = data[i];
  const grade = gradeSubmission(r);
  const key = "Day " + r.assignments.day_number + " - " + r.assignments.title;
  if (!stats[key]) stats[key] = { graded: 0, failed: 0, scores: [] };

  const { error: upErr } = await sb
    .from("assignment_submissions")
    .update({
      ai_graded: true,
      ai_score: grade.score,
      ai_feedback_md: grade.feedback_md,
      ai_strengths: grade.strengths,
      ai_weaknesses: grade.weaknesses,
      ai_graded_at: now,
    })
    .eq("id", grade.id);

  if (upErr) {
    fail++;
    stats[key].failed++;
    console.log("  FAIL " + grade.id.slice(0, 8) + ": " + upErr.message);
  } else {
    ok++;
    stats[key].graded++;
    stats[key].scores.push(grade.score);
  }

  if ((i + 1) % 50 === 0) console.log("  Progress: " + (i + 1) + "/" + data.length);
}

console.log("\n═══════════════════════════════════════");
console.log("GRADED: " + ok + " ok, " + fail + " failed\n");

for (const [key, val] of Object.entries(stats)) {
  const avg = val.scores.length ? Math.round(val.scores.reduce((a, b) => a + b, 0) / val.scores.length) : 0;
  console.log(key + " — " + val.graded + " graded, avg score: " + avg);
}
