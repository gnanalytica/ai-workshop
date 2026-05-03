"use server";

import { z } from "zod";
import { requireCapability } from "@/lib/auth/requireCapability";
import { broadcastToCohort } from "@/lib/realtime/broadcast";
import { withSupabase, actionFail } from "./_helpers";

const createSchema = z.object({
  cohort_id: z.string().uuid(),
  day_number: z.number().int().min(1).max(60).optional(),
  question: z.string().min(3).max(280),
  options: z.array(z.string().min(1).max(80)).min(2).max(8),
  duration_minutes: z.number().int().min(1).max(60 * 24 * 7).optional(),
  kind: z.enum(["poll", "pulse"]).default("poll"),
});

export async function createPoll(input: z.input<typeof createSchema>) {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  const result = await withSupabase(async (sb) => {
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
        kind: parsed.data.kind,
      } as never)
      .select()
      .single();
  }, "/admin/polls");
  if (result.ok) await broadcastToCohort(parsed.data.cohort_id, "poll");
  return result;
}

const closeSchema = z.object({ poll_id: z.string().uuid(), cohort_id: z.string().uuid() });
export async function closePoll(input: z.infer<typeof closeSchema>) {
  const parsed = closeSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("content.write", parsed.data.cohort_id);
  const result = await withSupabase(
    (sb) =>
      sb
        .from("polls")
        .update({ closed_at: new Date().toISOString() })
        .eq("id", parsed.data.poll_id)
        .select()
        .single(),
    "/admin/polls",
  );
  if (result.ok) await broadcastToCohort(parsed.data.cohort_id, "poll");
  return result;
}

const voteSchema = z.object({ poll_id: z.string().uuid(), choice: z.string().min(1).max(80) });
export async function castVote(input: z.infer<typeof voteSchema>) {
  const parsed = voteSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const result = await withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("poll_votes")
      .upsert({ poll_id: parsed.data.poll_id, user_id: user.user.id, choice: parsed.data.choice })
      .select("poll_id, polls!inner(cohort_id)")
      .single();
  }, "/dashboard");
  if (result.ok) {
    const row = result.data as unknown as { polls?: { cohort_id?: string } | null } | null;
    const cohortId = row?.polls?.cohort_id ?? null;
    if (cohortId) await broadcastToCohort(cohortId, "poll");
  }
  return result;
}
