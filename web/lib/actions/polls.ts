"use server";

import { z } from "zod";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail } from "./_helpers";

const createSchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int().min(1).max(60).optional(),
  question: z.string().min(3).max(280),
  options: z.array(z.string().min(1).max(80)).min(2).max(8),
  duration_minutes: z.number().int().min(1).max(60 * 24 * 7).optional(),
});

export async function createPoll(input: z.infer<typeof createSchema>) {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    const closes_at =
      parsed.data.duration_minutes != null
        ? new Date(Date.now() + parsed.data.duration_minutes * 60_000).toISOString()
        : null;
    return sb
      .from("polls")
      .insert({
        cohort_id: parsed.data.cohort_id,
        day_number: parsed.data.day_number ?? null,
        question: parsed.data.question,
        options: parsed.data.options.map((label, i) => ({ id: String(i + 1), label })),
        created_by: user.user?.id ?? null,
        closes_at,
      } as never)
      .select()
      .single();
  }, "/admin/polls");
}

const closeSchema = z.object({ poll_id: z.string().uuid(), cohort_id: z.string().uuid() });
export async function closePoll(input: z.infer<typeof closeSchema>) {
  const parsed = closeSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  return withSupabase(
    (sb) =>
      sb
        .from("polls")
        .update({ closed_at: new Date().toISOString() })
        .eq("id", parsed.data.poll_id)
        .select()
        .single(),
    "/admin/polls",
  );
}

const voteSchema = z.object({ poll_id: z.string().uuid(), choice: z.string().min(1).max(80) });
export async function castVote(input: z.infer<typeof voteSchema>) {
  const parsed = voteSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("poll_votes")
      .upsert({ poll_id: parsed.data.poll_id, user_id: user.user.id, choice: parsed.data.choice })
      .select()
      .single();
  }, "/dashboard");
}
