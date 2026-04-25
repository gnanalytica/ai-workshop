import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface PollOption { id: string; label: string }
export interface PollSummary {
  id: string;
  cohort_id: string;
  day_number: number | null;
  question: string;
  options: PollOption[];
  opened_at: string;
  closed_at: string | null;
  vote_count: number;
}

export const listPolls = cache(async (cohortId: string): Promise<PollSummary[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("polls")
    .select("id, cohort_id, day_number, question, options, opened_at, closed_at, poll_votes(count)")
    .eq("cohort_id", cohortId)
    .order("opened_at", { ascending: false });
  return ((data ?? []) as unknown as Array<{
    id: string; cohort_id: string; day_number: number | null;
    question: string; options: PollOption[];
    opened_at: string; closed_at: string | null;
    poll_votes: Array<{ count: number }>;
  }>).map((p) => ({
    id: p.id,
    cohort_id: p.cohort_id,
    day_number: p.day_number,
    question: p.question,
    options: p.options ?? [],
    opened_at: p.opened_at,
    closed_at: p.closed_at,
    vote_count: p.poll_votes?.[0]?.count ?? 0,
  }));
});

export const getPollResults = cache(
  async (pollId: string): Promise<Record<string, number>> => {
    const sb = await getSupabaseServer();
    const { data } = await sb.from("poll_votes").select("choice").eq("poll_id", pollId);
    const counts: Record<string, number> = {};
    for (const v of (data ?? []) as Array<{ choice: string }>) {
      counts[v.choice] = (counts[v.choice] ?? 0) + 1;
    }
    return counts;
  },
);
