import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Model id is centralized so a future swap (or per-assignment override)
// only needs to touch one place. Gemini 2.5 Flash via the project-owned
// GOOGLE_GENERATIVE_AI_API_KEY — same key already used for help chat.
// Cheaper than Sonnet by ~10× and well within Flash's competence band
// for rubric-based reflection grading.
const GRADING_MODEL_ID = "gemini-2.5-flash";

// Matches the rubric_templates.criteria jsonb shape: each criterion carries a
// point ceiling (`max`) and a 0..max ladder of anchor descriptions. `weight`/
// `description` are kept optional for any legacy rows that used the old shape.
export interface AIRubricCriterion {
  key?: string;
  name: string;
  max?: number;
  anchors?: Record<string, string>;
  weight?: number;
  description?: string;
}

export interface AIGradeInput {
  assignmentTitle: string;
  assignmentBody: string | null;
  rubricCriteria?: AIRubricCriterion[] | null;
  // Total points the rubric criteria sum to (jsonb `scale_max`, usually 10).
  // The 0-100 score is the rubric total rescaled to a percentage.
  rubricScaleMax?: number | null;
  studentBody: string;
  links?: { label: string; url: string }[] | null;
}

export interface AIGradeResult {
  score: number;
  feedback_md: string;
  strengths: string[];
  weaknesses: string[];
}

const GradeSchema = z.object({
  score: z.number().min(0).max(100),
  feedback_md: z.string().min(1),
  strengths: z.array(z.string()).max(5),
  weaknesses: z.array(z.string()).max(5),
});

const SYSTEM = `You are a thoughtful teaching assistant in a 30-day AI workshop.
Grade student submissions on a 0-100 scale. Default to encouragement; reserve
sub-60 scores for clearly incomplete or off-topic work. Feedback should be
specific, actionable, and friendly — 3-6 short paragraphs in markdown. List
2-4 concrete strengths and 1-3 concrete improvement areas.

Be especially generous with effort and learning growth. The score reflects
quality of the submitted work against the prompt, not the student's general
capability. Never reveal model identity or that you are AI.`;

export async function gradeWithAI(input: AIGradeInput): Promise<AIGradeResult | null> {
  try {
    const prompt = buildPrompt(input);
    const { experimental_output } = await generateText({
      model: google(GRADING_MODEL_ID),
      system: SYSTEM,
      prompt,
      experimental_output: Output.object({ schema: GradeSchema }),
    });
    return experimental_output ?? null;
  } catch (err) {
    console.error("[ai/grade] failed", err);
    return null;
  }
}

function buildPrompt(i: AIGradeInput): string {
  // Render each criterion with its point ceiling and the full anchor ladder so
  // the model grades against the same descriptive levels a human would. Falls
  // back to the legacy name/weight/description form for any row missing anchors.
  const rubric = i.rubricCriteria?.length
    ? (() => {
        const total =
          (i.rubricScaleMax ??
            i.rubricCriteria!.reduce((s, c) => s + (c.max ?? 0), 0)) ||
          null;
        const lines = i.rubricCriteria!.map((c) => {
          const cap = typeof c.max === "number" ? ` (max ${c.max} pts)` : c.weight ? ` (weight ${c.weight})` : "";
          const anchorLadder =
            c.anchors && Object.keys(c.anchors).length
              ? "\n" +
                Object.entries(c.anchors)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([pts, desc]) => `    ${pts}: ${desc}`)
                  .join("\n")
              : c.description
                ? `: ${c.description}`
                : "";
          return `- ${c.name}${cap}${anchorLadder}`;
        });
        const header = total
          ? `\n\nRubric (score the work against these criteria; they sum to ${total} points, which you then rescale to 0-100):`
          : `\n\nRubric criteria:`;
        return `${header}\n${lines.join("\n")}`;
      })()
    : "";
  const links = i.links?.length
    ? `\n\nLinks the student attached:\n${i.links.map((l) => `- ${l.label}: ${l.url}`).join("\n")}`
    : "";
  const promptBody = i.assignmentBody ? `\n\nAssignment description:\n${i.assignmentBody}` : "";
  return `Assignment: ${i.assignmentTitle}${promptBody}${rubric}${links}

---

Student submission:

${i.studentBody}

---

Score this submission and return JSON matching the required schema.`;
}
