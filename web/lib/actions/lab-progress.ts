"use server";

import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";

export type LabStatus = "not_started" | "in_progress" | "done";

/**
 * Upsert a single lab/checkbox state for the signed-in student.
 * Primary key on lab_progress is (user_id, cohort_id, day_number, lab_id).
 */
export async function setLabStep(input: {
  cohortId: string;
  dayNumber: number;
  labId: string;
  status: LabStatus;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "not signed in" };
  const sb = await getSupabaseServer();
  const { error } = await sb
    .from("lab_progress")
    .upsert(
      {
        user_id: session.id,
        cohort_id: input.cohortId,
        day_number: input.dayNumber,
        lab_id: input.labId,
        status: input.status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,cohort_id,day_number,lab_id" },
    );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
