"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSupabaseServer } from "@/lib/supabase/server";
import { gradeWithAI } from "@/lib/ai/grade";
import { withSupabase, actionFail, actionOk } from "./_helpers";
import {
  MIN_SUBMISSION_WORDS,
  MAX_SUBMISSION_WORDS,
  countWords,
} from "@/lib/submissions/word-count";

const linkSchema = z.object({
  label: z.string().min(1).max(120),
  url: z.string().url(),
});

const submitSchema = z.object({
  assignment_id: z.string().uuid(),
  body: z.string().min(1).max(50_000),
  links: z.array(linkSchema).max(10).default([]),
  group_name: z.string().trim().min(1).max(120).optional(),
});

async function upsertSubmission(
  input: z.infer<typeof submitSchema>,
  status: "draft" | "submitted",
) {
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };

    // Real submits (not drafts) get the full validation. Drafts can save WIP
    // freely — students should be able to checkpoint short notes without
    // hitting the word-count gate.
    if (status === "submitted") {
      const words = countWords(input.body);
      if (words < MIN_SUBMISSION_WORDS) {
        return {
          data: null,
          error: {
            message: `Submission must be at least ${MIN_SUBMISSION_WORDS} words (currently ${words}).`,
          },
        };
      }
      if (words > MAX_SUBMISSION_WORDS) {
        return {
          data: null,
          error: {
            message: `Submission must be at most ${MAX_SUBMISSION_WORDS} words (currently ${words}).`,
          },
        };
      }
      const { data: a } = await sb
        .from("assignments")
        .select("is_group_project")
        .eq("id", input.assignment_id)
        .maybeSingle();
      const isGroup = !!(a as { is_group_project?: boolean } | null)?.is_group_project;
      if (isGroup && !input.group_name) {
        return { data: null, error: { message: "Group name is required for this assignment" } };
      }
    }

    return sb
      .from("submissions")
      .upsert(
        {
          assignment_id: input.assignment_id,
          user_id: user.user.id,
          body: input.body,
          links: input.links,
          group_name: input.group_name ?? null,
          status,
        },
        // PK is `id` (uuid); the dedup key is the unique constraint on
        // (assignment_id, user_id). Without onConflict, supabase-js falls
        // back to PK-conflict and the second submit by the same user fails
        // with `submissions_assignment_id_user_id_key` duplicate-key error.
        { onConflict: "assignment_id,user_id" },
      )
      .select()
      .single();
  });
}

export async function submitAssignment(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return upsertSubmission(parsed.data, "submitted");
}

export async function saveDraft(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return upsertSubmission(parsed.data, "draft");
}

export async function revalidateDayPage(day: number) {
  revalidatePath(`/day/${day}`);
}

// -----------------------------------------------------------------------------
// Staff grading actions (admin only, gated by grading.write:cohort).
// Faculty are review-only.
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
    .select("title, body_md, rubric_id, kind, auto_grade, rubric_templates(criteria)")
    .eq("id", parsed.data.assignment_id)
    .maybeSingle();
  if (!assignment) return { ok: false, error: "Assignment not found" };

  // Capstones (and any other auto_grade=false assignments) are admin-only
  // manual review — never AI graded.
  if ((assignment as { auto_grade?: boolean }).auto_grade === false) {
    return { ok: false, error: "This assignment is manual-grade only" };
  }

  type RubricCriteria = { name: string; weight?: number; description?: string };
  const rubricRaw = ((assignment as unknown) as { rubric_templates: { criteria: unknown } | null })
    ?.rubric_templates?.criteria;
  const criteria = Array.isArray(rubricRaw) ? (rubricRaw as RubricCriteria[]) : null;

  // Re-grade everything that hasn't been published yet (status='submitted'
  // OR ai_graded but not human_reviewed). Skip already-published rows.
  const { data: subs } = await sb
    .from("submissions")
    .select("id, body, links, ai_graded, human_reviewed_at, status")
    .eq("assignment_id", parsed.data.assignment_id)
    .or("status.eq.submitted,and(ai_graded.eq.true,human_reviewed_at.is.null)");

  let graded = 0, failed = 0, skipped = 0;
  for (const s of (subs ?? []) as Array<{ id: string; body: string | null; links: { label: string; url: string }[] | null }>) {
    if (!s.body) { skipped++; continue; }
    const result = await gradeWithAI({
      assignmentTitle: (assignment as { title: string }).title,
      assignmentBody: (assignment as { body_md: string | null }).body_md,
      rubricCriteria: criteria,
      studentBody: s.body,
      links: s.links ?? null,
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
