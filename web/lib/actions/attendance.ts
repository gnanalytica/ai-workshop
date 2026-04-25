"use server";

import { z } from "zod";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk, type ActionResult } from "./_helpers";
import { revalidatePath } from "next/cache";

const markSchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int().min(1).max(60),
  user_id: z.string().uuid(),
  status: z.enum(["present", "absent", "late", "excused"]),
});

export async function markAttendance(input: z.infer<typeof markSchema>): Promise<ActionResult> {
  const parsed = markSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");

  // Cap is checked inside rpc_mark_attendance but we surface a friendlier
  // error if the user is missing the capability outright.
  const sb = await getSupabaseServer();
  const { error } = await sb.rpc("rpc_mark_attendance", {
    p_cohort: parsed.data.cohort_id,
    p_day: parsed.data.day_number,
    p_user: parsed.data.user_id,
    p_status: parsed.data.status,
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/attendance");
  revalidatePath("/faculty");
  return actionOk();
}

const selfSchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int().min(1).max(60),
});

export async function selfCheckIn(input: z.infer<typeof selfSchema>): Promise<ActionResult> {
  const parsed = selfSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("attendance.self", parsed.data.cohort_id);
  const sb = await getSupabaseServer();
  const { error } = await sb.rpc("rpc_self_check_in", {
    p_cohort: parsed.data.cohort_id,
    p_day: parsed.data.day_number,
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath(`/day/${parsed.data.day_number}`);
  return actionOk();
}
