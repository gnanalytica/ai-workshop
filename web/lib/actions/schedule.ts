"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail, actionOk } from "./_helpers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { addWorkingDays, isWeekdayISO } from "@/lib/calendar";

const WORKSHOP_DAYS = 30;

const createCohortSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, digits, hyphens only"),
  name: z.string().trim().min(3).max(120),
  starts_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .refine(isWeekdayISO, { message: "Start date must be a weekday (Mon–Fri)" }),
  status: z.enum(["draft", "live", "archived"]).default("draft"),
});

export async function createCohort(input: z.infer<typeof createCohortSchema>) {
  const parsed = createCohortSchema.safeParse(input);
  if (!parsed.success) {
    return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  await requireCapability("schedule.write");

  const ends_on = addWorkingDays(parsed.data.starts_on, WORKSHOP_DAYS);

  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("cohorts")
    .insert({ ...parsed.data, ends_on })
    .select("id, slug, name, status, starts_on, ends_on")
    .single();
  if (error) return actionFail(error.message);

  // Seed the 30 cohort_days using the existing SECURITY DEFINER RPC.
  const cohortId = (data as { id: string }).id;
  const { error: seedErr } = await sb.rpc("seed_curriculum_for", { p_cohort: cohortId } as never);
  if (seedErr) return actionFail(`Created but seed failed: ${seedErr.message}`);

  revalidatePath("/admin/schedule");
  return actionOk(data);
}

const deleteCohortSchema = z.object({ cohort_id: z.string().uuid() });

export async function deleteCohort(input: z.infer<typeof deleteCohortSchema>) {
  const parsed = deleteCohortSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("schedule.write");

  const sb = await getSupabaseServer();

  // Refuse to delete a cohort that already has confirmed registrations or
  // faculty assignments — admin should archive in that case, not delete.
  const [reg, fac] = await Promise.all([
    sb
      .from("registrations")
      .select("user_id", { count: "exact", head: true })
      .eq("cohort_id", parsed.data.cohort_id),
    sb
      .from("cohort_faculty")
      .select("user_id", { count: "exact", head: true })
      .eq("cohort_id", parsed.data.cohort_id),
  ]);
  const regCount = reg.count ?? 0;
  const facCount = fac.count ?? 0;
  if (regCount > 0 || facCount > 0) {
    return actionFail(
      `Cohort has ${regCount} student(s) and ${facCount} faculty assignment(s). Archive it instead of deleting.`,
    );
  }

  const { error } = await sb.from("cohorts").delete().eq("id", parsed.data.cohort_id);
  if (error) return actionFail(error.message);

  revalidatePath("/admin/schedule");
  return actionOk();
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
