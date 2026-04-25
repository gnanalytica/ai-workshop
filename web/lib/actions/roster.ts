"use server";

import { z } from "zod";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail } from "./_helpers";

const updateStatusSchema = z.object({
  cohort_id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "waitlist", "cancelled"]),
});

export async function updateRegistrationStatus(input: z.infer<typeof updateStatusSchema>) {
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("roster.write", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("registrations")
        .update({ status: parsed.data.status })
        .eq("cohort_id", parsed.data.cohort_id)
        .eq("user_id", parsed.data.user_id)
        .select()
        .single(),
    "/admin/roster",
  );
}

const bulkSchema = z.object({
  cohort_id: z.string().uuid(),
  user_ids: z.array(z.string().uuid()).min(1).max(200),
  status: z.enum(["confirmed", "cancelled", "waitlist"]),
});

export async function bulkUpdateRegistrationStatus(input: z.infer<typeof bulkSchema>) {
  const parsed = bulkSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("roster.write", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("registrations")
        .update({ status: parsed.data.status })
        .eq("cohort_id", parsed.data.cohort_id)
        .in("user_id", parsed.data.user_ids)
        .select(),
    "/admin/roster",
  );
}
