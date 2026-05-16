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

function isAnswered(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/** Submits + scores via SECURITY DEFINER RPC; answers are hidden from clients. */
export async function submitQuiz(input: z.infer<typeof submitSchema>) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();

  // Every question is mandatory — refuse the attempt if any question is
  // missing an answer. We compare against the question ordinals on the quiz
  // so a client that skips a question can't sneak through with a partial map.
  const { data: questions } = await sb
    .from("quiz_questions")
    .select("ordinal")
    .eq("quiz_id", parsed.data.quiz_id);
  const ordinals = ((questions ?? []) as Array<{ ordinal: number }>).map((q) => q.ordinal);
  const unanswered = ordinals.filter((o) => !isAnswered(parsed.data.answers[String(o)]));
  if (unanswered.length > 0) {
    return actionFail(
      `Answer every question before submitting (${unanswered.length} unanswered).`,
    );
  }

  const { data, error } = await sb.rpc("rpc_submit_quiz_attempt", {
    p_quiz: parsed.data.quiz_id,
    p_answers: parsed.data.answers,
  } as never);
  if (error) return actionFail(error.message);
  revalidatePath(`/day/${parsed.data.day_number}`);
  return actionOk<{ score: number }>({ score: Number(data ?? 0) });
}

