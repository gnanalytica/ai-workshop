"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { requireCapability } from "@/lib/auth/requireCapability";

export interface PollResultRow {
  choice: string;
  label: string;
  votes: number;
}

/**
 * Fetch the per-choice tally for a single poll. Lazy-loaded by the polls
 * explorer when an admin expands a row.
 */
export async function fetchPollResults(
  pollId: string,
): Promise<{ ok: true; rows: PollResultRow[] } | { ok: false; error: string }> {
  const sb = await getSupabaseServer();
  const { data: poll } = await sb
    .from("polls")
    .select("cohort_id")
    .eq("id", pollId)
    .maybeSingle();
  if (!poll) return { ok: false, error: "poll not found" };
  await requireCapability("content.write", (poll as { cohort_id: string }).cohort_id);
  const { data, error } = await (sb.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data: Array<{ choice: string; label: string; votes: number }> | null;
    error: { message: string } | null;
  }>)("rpc_poll_results", { p_poll: pollId });
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    rows: (data ?? []).map((r) => ({
      choice: r.choice,
      label: r.label,
      votes: Number(r.votes ?? 0),
    })),
  };
}
