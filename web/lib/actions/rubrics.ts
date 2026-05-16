"use server";

import { z } from "zod";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail } from "./_helpers";

const criterionSchema = z.object({
  key: z.string().min(1).max(80),
  name: z.string().min(1).max(160),
  max: z.number().int().min(1).max(20),
  anchors: z.record(z.string(), z.string().max(800)),
});

const updateRubricSchema = z.object({
  rubric_id: z.string().uuid(),
  cohort_id: z.string().uuid(),
  title: z.string().min(2).max(200).optional(),
  criteria: z.array(criterionSchema).min(1).max(20),
  auto_grade_hints: z
    .object({
      red_flags: z.array(z.string().max(200)).max(20).optional(),
      evidence_required: z.array(z.string().max(200)).max(20).optional(),
    })
    .optional(),
});

/**
 * Update a rubric_templates row in place. cohort_id is used only for the
 * capability check — rubrics are global (one template can in theory be reused
 * across cohorts), but every edit point in the UI lives under a specific
 * cohort, so we gate on the editor's cohort context.
 */
export async function updateRubric(input: z.infer<typeof updateRubricSchema>) {
  const parsed = updateRubricSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);

  const scaleMax = parsed.data.criteria.reduce((s, c) => s + c.max, 0);
  const payload: Record<string, unknown> = {
    criteria: {
      criteria: parsed.data.criteria,
      scale_max: scaleMax,
      ...(parsed.data.auto_grade_hints
        ? { auto_grade_hints: parsed.data.auto_grade_hints }
        : {}),
    },
  };
  if (parsed.data.title) payload.title = parsed.data.title;

  return withSupabase(
    (sb) =>
      sb
        .from("rubric_templates")
        .update(payload)
        .eq("id", parsed.data.rubric_id)
        .select()
        .single(),
    `/admin/cohorts/${parsed.data.cohort_id}/curriculum`,
  );
}
