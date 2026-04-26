"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
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
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");

  const { data: row, error } = await sb
    .from("submissions")
    .upsert({
      assignment_id: parsed.data.assignment_id,
      user_id: user.user.id,
      body: parsed.data.body,
      attachments: parsed.data.attachments,
      status: "submitted",
    })
    .select("id")
    .single();
  if (error || !row) return actionFail(error?.message ?? "Failed");

  // Fire-and-forget AI grade. Failures are logged but don't block the submit.
  void runAIGrade(row.id, parsed.data.assignment_id);

  return actionOk(row);
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

const overrideSchema = z.object({
  submission_id: z.string().uuid(),
  score: z.number().min(0).max(100).optional(),
  feedback_md: z.string().max(20_000).optional(),
});

export async function overrideGrade(input: z.infer<typeof overrideSchema>) {
  const parsed = overrideSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");

  const patch: Record<string, unknown> = {
    human_reviewed_at: new Date().toISOString(),
    human_reviewer_id: user.user.id,
    status: "graded",
  };
  if (parsed.data.score !== undefined) patch.score = parsed.data.score;
  if (parsed.data.feedback_md !== undefined) patch.feedback_md = parsed.data.feedback_md;

  const { error } = await sb
    .from("submissions")
    .update(patch)
    .eq("id", parsed.data.submission_id);
  if (error) return actionFail(error.message);
  revalidatePath("/faculty/review");
  return actionOk();
}

async function runAIGrade(submissionId: string, assignmentId: string) {
  try {
    const sb = await getSupabaseServer();
    const [{ data: assignment }, { data: submission }] = await Promise.all([
      sb
        .from("assignments")
        .select("title, body_md, rubric_id, rubric_templates(criteria)")
        .eq("id", assignmentId)
        .maybeSingle(),
      sb
        .from("submissions")
        .select("body, attachments")
        .eq("id", submissionId)
        .maybeSingle(),
    ]);
    if (!assignment || !submission?.body) return;

    type RubricCriteria = { name: string; weight?: number; description?: string };
    const rubricRaw = ((assignment as unknown) as { rubric_templates: { criteria: unknown } | null })
      ?.rubric_templates?.criteria;
    const criteria = Array.isArray(rubricRaw) ? (rubricRaw as RubricCriteria[]) : null;

    const result = await gradeWithAI({
      assignmentTitle: (assignment as { title: string }).title,
      assignmentBody: (assignment as { body_md: string | null }).body_md,
      rubricCriteria: criteria,
      studentBody: submission.body,
      attachments: (submission.attachments as { name: string; url: string }[] | null) ?? null,
    });
    if (!result) return;

    await sb
      .from("submissions")
      .update({
        ai_graded: true,
        ai_score: result.score,
        ai_feedback_md: result.feedback_md,
        ai_strengths: result.strengths,
        ai_weaknesses: result.weaknesses,
        ai_graded_at: new Date().toISOString(),
        score: result.score,
        feedback_md: result.feedback_md,
        status: "graded",
        graded_at: new Date().toISOString(),
      })
      .eq("id", submissionId);
  } catch (err) {
    console.error("[runAIGrade] failed", err);
  }
}
