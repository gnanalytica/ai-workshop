"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail, actionOk } from "./_helpers";
import { getSupabaseServer } from "@/lib/supabase/server";

const createCohortSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(3)
      .max(60)
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, digits, hyphens only"),
    name: z.string().trim().min(3).max(120),
    starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
    ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
    status: z.enum(["draft", "live", "archived"]).default("draft"),
  })
  .refine((v) => v.ends_on >= v.starts_on, {
    path: ["ends_on"],
    message: "End date must be on or after start",
  });

export async function createCohort(input: z.infer<typeof createCohortSchema>) {
  const parsed = createCohortSchema.safeParse(input);
  if (!parsed.success) {
    return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  await requireCapability("schedule.write");

  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("cohorts")
    .insert(parsed.data)
    .select("id, slug, name, status")
    .single();
  if (error) return actionFail(error.message);

  // Seed the 30 cohort_days using the existing SECURITY DEFINER RPC.
  const cohortId = (data as { id: string }).id;
  const { error: seedErr } = await sb.rpc("seed_curriculum_for", { p_cohort: cohortId } as never);
  if (seedErr) return actionFail(`Created but seed failed: ${seedErr.message}`);

  revalidatePath("/admin/schedule");
  return actionOk(data);
}

const updateDaySchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int().min(1).max(60),
  is_unlocked: z.boolean().optional(),
  live_session_at: z.string().datetime().nullable().optional(),
  meet_link: z.string().url().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  title: z.string().max(200).optional(),
});

export async function updateCohortDay(input: z.infer<typeof updateDaySchema>) {
  const parsed = updateDaySchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("schedule.write", parsed.data.cohort_id);
  const { cohort_id, day_number, ...patch } = parsed.data;
  return withSupabase(
    (sb) =>
      sb
        .from("cohort_days")
        .update(patch)
        .eq("cohort_id", cohort_id)
        .eq("day_number", day_number)
        .select()
        .single(),
    ["/admin/schedule", "/dashboard"],
  );
}

const toggleSchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int(),
  is_unlocked: z.boolean(),
});

export async function setDayUnlocked(input: z.infer<typeof toggleSchema>) {
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("schedule.write", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("cohort_days")
        .update({ is_unlocked: parsed.data.is_unlocked })
        .eq("cohort_id", parsed.data.cohort_id)
        .eq("day_number", parsed.data.day_number)
        .select()
        .single(),
    ["/admin/schedule", "/dashboard"],
  );
}
