"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { withSupabase, actionFail } from "./_helpers";

const submitSchema = z.object({
  quiz_id: z.string().uuid(),
  answers: z.record(z.string(), z.unknown()),
  day_number: z.number().int().min(1).max(60),
});

/**
 * Submit a quiz attempt. Score computation happens client-side from
 * quiz_questions answers — RLS limits read of correct answers anyway, so for
 * v1 we trust the client and persist the submission. A future migration can
 * move scoring server-side via a SECURITY DEFINER RPC.
 */
export async function submitQuiz(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const result = await withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("quiz_attempts")
      .upsert({
        quiz_id: parsed.data.quiz_id,
        user_id: user.user.id,
        answers: parsed.data.answers,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();
  });
  revalidatePath(`/day/${parsed.data.day_number}`);
  return result;
}
