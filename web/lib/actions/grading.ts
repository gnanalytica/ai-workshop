"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk, type ActionResult } from "./_helpers";

const gradeSchema = z.object({
  submission_id: z.string().uuid(),
  score: z.number().min(0).max(100),
  feedback: z.string().max(5000).optional(),
});

export async function gradeSubmission(input: z.infer<typeof gradeSchema>): Promise<ActionResult> {
  const parsed = gradeSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { error } = await sb.rpc("rpc_grade_submission", {
    p_submission: parsed.data.submission_id,
    p_score: parsed.data.score,
    p_feedback: parsed.data.feedback ?? null,
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath("/faculty/review");
  return actionOk();
}
