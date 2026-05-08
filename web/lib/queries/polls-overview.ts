import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface PollOverviewRow {
  id: string;
  question: string;
  kind: string;
  day_number: number | null;
  opened_at: string | null;
  closed_at: string | null;
  total_votes: number;
}

export const listCohortPolls = cache(
  async (cohortId: string): Promise<PollOverviewRow[]> => {
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("polls")
      .select("id, question, kind, day_number, opened_at, closed_at, vote_count")
      .eq("cohort_id", cohortId)
      .order("opened_at", { ascending: false, nullsFirst: false });
    return ((data ?? []) as Array<{
      id: string;
      question: string;
      kind: string;
      day_number: number | null;
      opened_at: string | null;
      closed_at: string | null;
      vote_count: number;
    }>).map((r) => ({
      id: r.id,
      question: r.question,
      kind: r.kind,
      day_number: r.day_number,
      opened_at: r.opened_at,
      closed_at: r.closed_at,
      total_votes: r.vote_count ?? 0,
    }));
  },
);
