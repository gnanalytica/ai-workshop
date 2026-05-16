"use server";

import { z } from "zod";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail } from "./_helpers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

const createSchema = z.object({
  assignment_id: z.string().uuid(),
  cohort_id: z.string().uuid(),
});

/**
 * Create a starter rubric for an assignment that has none. Inserts a 3-band
 * placeholder template scaled to 10 pts and links it via assignments.rubric_id.
 * The admin then refines it via the RubricEditor on the same page.
 *
 * Idempotent guard: if the assignment already has a rubric_id, we no-op and
 * return success.
 */
export async function createRubricForAssignment(
  input: z.infer<typeof createSchema>,
) {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  const sb = await getSupabaseServer();

  // Pull the assignment (also confirms it belongs to this cohort) and bail
  // early if a rubric is already attached.
  const { data: asg, error: asgErr } = await sb
    .from("assignments")
    .select("id, cohort_id, title, day_number, kind, rubric_id")
    .eq("id", parsed.data.assignment_id)
    .eq("cohort_id", parsed.data.cohort_id)
    .maybeSingle();
  if (asgErr || !asg) return actionFail("Assignment not found");
  if (asg.rubric_id) return { ok: true as const, data: { rubric_id: asg.rubric_id } };

  const starter = {
    criteria: [
      {
        key: "completeness",
        name: "Completeness",
        max: 3,
        anchors: {
          "0": "Nothing submitted.",
          "1": "Major sections missing.",
          "2": "Most parts present, one or two gaps.",
          "3": "All required parts present.",
        },
      },
      {
        key: "depth",
        name: "Depth / quality",
        max: 4,
        anchors: {
          "0": "No engagement with the prompt.",
          "1": "Surface-level — feels rushed or AI-paraphrased.",
          "2": "Some real thinking, several weak spots.",
          "3": "Solid engagement, a few rough edges.",
          "4": "Rigorous, specific, evidence-backed.",
        },
      },
      {
        key: "evidence",
        name: "Evidence",
        max: 3,
        anchors: {
          "0": "Claims only, no examples.",
          "1": "One vague example.",
          "2": "A couple of concrete examples / quotes.",
          "3": "Specific examples / quotes throughout, tied to claims.",
        },
      },
    ],
    scale_max: 10,
    auto_grade_hints: {
      red_flags: ["LLM-generated boilerplate without specifics"],
      evidence_required: ["assignment-specific artefacts"],
    },
  };

  const title = `Day ${asg.day_number} · ${asg.kind} · ${asg.title}`.slice(0, 200);

  const { data: rubric, error: rubricErr } = await sb
    .from("rubric_templates")
    .insert({ title, criteria: starter })
    .select("id")
    .single();
  if (rubricErr || !rubric)
    return actionFail(rubricErr?.message ?? "Could not create rubric");

  const { error: linkErr } = await sb
    .from("assignments")
    .update({ rubric_id: rubric.id })
    .eq("id", asg.id);
  if (linkErr) return actionFail(linkErr.message);

  // Revalidate both the editor route and the curriculum route so badges and
  // editor reflect the new rubric.
  revalidatePath(
    `/admin/cohorts/${parsed.data.cohort_id}/content/assignment/${asg.id}`,
  );
  revalidatePath(`/admin/cohorts/${parsed.data.cohort_id}/curriculum`);
  return { ok: true as const, data: { rubric_id: rubric.id } };
}
