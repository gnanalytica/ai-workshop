import { generateText, Output, gateway } from "ai";
import { z } from "zod";

export interface AIGradeInput {
  assignmentTitle: string;
  assignmentBody: string | null;
  rubricCriteria?: { name: string; weight?: number; description?: string }[] | null;
  studentBody: string;
  attachments?: { name: string; url: string }[] | null;
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
      model: gateway("anthropic/claude-sonnet-4.6"),
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
  const rubric = i.rubricCriteria?.length
    ? `\n\nRubric criteria:\n${i.rubricCriteria
        .map((c) => `- ${c.name}${c.weight ? ` (weight ${c.weight})` : ""}${c.description ? `: ${c.description}` : ""}`)
        .join("\n")}`
    : "";
  const attachments = i.attachments?.length
    ? `\n\nAttachments referenced: ${i.attachments.map((a) => a.name).join(", ")}`
    : "";
  const promptBody = i.assignmentBody ? `\n\nAssignment description:\n${i.assignmentBody}` : "";
  return `Assignment: ${i.assignmentTitle}${promptBody}${rubric}${attachments}

---

Student submission:

${i.studentBody}

---

Score this submission and return JSON matching the required schema.`;
}
