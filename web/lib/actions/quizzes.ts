"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const submitSchema = z.object({
  quiz_id: z.string().uuid(),
  answers: z.record(z.string(), z.unknown()),
  day_number: z.number().int().min(1).max(60),
});

/** Submits + scores via SECURITY DEFINER RPC; answers are hidden from clients. */
export async function submitQuiz(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data, error } = await sb.rpc("rpc_submit_quiz_attempt", {
    p_quiz: parsed.data.quiz_id,
    p_answers: parsed.data.answers,
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath(`/day/${parsed.data.day_number}`);
  return actionOk<{ score: number }>({ score: Number(data ?? 0) });
}
