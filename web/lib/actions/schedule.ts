"use server";

import { z } from "zod";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail } from "./_helpers";

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
