"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSupabaseServer } from "@/lib/supabase/server";
import { gradeWithAI } from "@/lib/ai/grade";
import { withSupabase, actionFail, actionOk } from "./_helpers";

const submitSchema = z.object({
  assignment_id: z.string().uuid(),
  body: z.string().min(1).max(50_000),
  attachments: z.array(z.object({ name: z.string(), url: z.string().url() })).max(10).default([]),
});

export async function submitAssignment(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("submissions")
      .upsert({
        assignment_id: parsed.data.assignment_id,
        user_id: user.user.id,
        body: parsed.data.body,
        attachments: parsed.data.attachments,
        status: "submitted",
      })
      .select()
      .single();
  });
}

export async function saveDraft(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("submissions")
      .upsert({
        assignment_id: parsed.data.assignment_id,
        user_id: user.user.id,
        body: parsed.data.body,
        attachments: parsed.data.attachments,
        status: "draft",
      })
      .select()
      .single();
  });
}

export async function revalidateDayPage(day: number) {
  revalidatePath(`/day/${day}`);
}

// -----------------------------------------------------------------------------
// Staff grading actions (admin / trainer / tech_support, gated by
// grading.write:cohort). Faculty are read-only.
// -----------------------------------------------------------------------------

const batchSchema = z.object({ assignment_id: z.string().uuid() });

export interface BatchGradeResult {
  ok: true;
  graded: number;
  failed: number;
  skipped: number;
}

export async function batchGradeAssignment(
  input: z.infer<typeof batchSchema>,
): Promise<{ ok: true; data: { graded: number; failed: number; skipped: number } } | { ok: false; error: string }> {
  const parsed = batchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  await requireCapability("grading.write:cohort");

  const sb = await getSupabaseServer();
  const { data: assignment } = await sb
    .from("assignments")
    .select("title, body_md, rubric_id, rubric_templates(criteria)")
    .eq("id", parsed.data.assignment_id)
    .maybeSingle();
  if (!assignment) return { ok: false, error: "Assignment not found" };

  type RubricCriteria = { name: string; weight?: number; description?: string };
  const rubricRaw = ((assignment as unknown) as { rubric_templates: { criteria: unknown } | null })
    ?.rubric_templates?.criteria;
  const criteria = Array.isArray(rubricRaw) ? (rubricRaw as RubricCriteria[]) : null;

  // Re-grade everything that hasn't been published yet (status='submitted'
  // OR ai_graded but not human_reviewed). Skip already-published rows.
  const { data: subs } = await sb
    .from("submissions")
    .select("id, body, attachments, ai_graded, human_reviewed_at, status")
    .eq("assignment_id", parsed.data.assignment_id)
    .or("status.eq.submitted,and(ai_graded.eq.true,human_reviewed_at.is.null)");

  let graded = 0, failed = 0, skipped = 0;
  for (const s of (subs ?? []) as Array<{ id: string; body: string | null; attachments: { name: string; url: string }[] | null }>) {
    if (!s.body) { skipped++; continue; }
    const result = await gradeWithAI({
      assignmentTitle: (assignment as { title: string }).title,
      assignmentBody: (assignment as { body_md: string | null }).body_md,
      rubricCriteria: criteria,
      studentBody: s.body,
      attachments: s.attachments ?? null,
    });
    if (!result) { failed++; continue; }
    const { error } = await sb
      .from("submissions")
      .update({
        ai_graded: true,
        ai_score: result.score,
        ai_feedback_md: result.feedback_md,
        ai_strengths: result.strengths,
        ai_weaknesses: result.weaknesses,
        ai_graded_at: new Date().toISOString(),
      })
      .eq("id", s.id);
    if (error) { failed++; continue; }
    graded++;
  }

  revalidatePath("/admin/cohorts", "layout");
  return { ok: true, data: { graded, failed, skipped } };
}

const publishSchema = z.object({
  submission_id: z.string().uuid(),
  score: z.number().min(0).max(100).optional(),
  feedback_md: z.string().max(20_000).optional(),
});

/**
 * Publish a grade to the student. Defaults to copying ai_score / ai_feedback_md
 * onto the canonical score / feedback_md columns; explicit score+feedback_md
 * args override those (i.e., manual edit before publish).
 */
export async function publishGrade(input: z.infer<typeof publishSchema>) {
  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("grading.write:cohort");

  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");

  const { data: row } = await sb
    .from("submissions")
    .select("ai_score, ai_feedback_md")
    .eq("id", parsed.data.submission_id)
    .maybeSingle();
  if (!row) return actionFail("Submission not found");

  const score = parsed.data.score ?? (row as { ai_score: number | null }).ai_score;
  const feedback = parsed.data.feedback_md ?? (row as { ai_feedback_md: string | null }).ai_feedback_md;
  if (score === null || score === undefined) return actionFail("No score to publish");

  const { error } = await sb
    .from("submissions")
    .update({
      score,
      feedback_md: feedback,
      status: "graded",
      graded_at: new Date().toISOString(),
      graded_by: user.user.id,
      human_reviewed_at: new Date().toISOString(),
      human_reviewer_id: user.user.id,
    })
    .eq("id", parsed.data.submission_id);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/cohorts", "layout");
  revalidatePath("/faculty/pod");
  return actionOk();
}

export async function manualGrade(input: {
  submission_id: string;
  score: number;
  feedback_md?: string;
}) {
  return publishGrade(input);
}
