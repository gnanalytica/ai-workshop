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
  closes_at: string | null;
  vote_count: number;
}

export const listPolls = cache(async (cohortId: string): Promise<PollSummary[]> => {
  const sb = await getSupabaseServer();
  // vote_count is denormalized via trigger (migration 0077); avoids the
  // per-row poll_votes(count) correlated subquery for every poll.
  const { data } = await sb
    .from("polls")
    .select("id, cohort_id, day_number, question, options, opened_at, closed_at, closes_at, vote_count")
    .eq("cohort_id", cohortId)
    .order("opened_at", { ascending: false });
  return ((data ?? []) as unknown as Array<{
    id: string; cohort_id: string; day_number: number | null;
    question: string; options: PollOption[];
    opened_at: string; closed_at: string | null;
    closes_at: string | null;
    vote_count: number | null;
  }>).map((p) => ({
    id: p.id,
    cohort_id: p.cohort_id,
    day_number: p.day_number,
    question: p.question,
    options: p.options ?? [],
    opened_at: p.opened_at,
    closed_at: p.closed_at,
    closes_at: p.closes_at,
    vote_count: p.vote_count ?? 0,
  }));
});

export interface PollResultRow { choice: string; label: string; votes: number }

export const getPollResults = cache(
  async (pollId: string): Promise<PollResultRow[]> => {
    const sb = await getSupabaseServer();
    const { data } = await (sb.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: Array<{ choice: string; label: string; votes: number }> | null }>)(
      "rpc_poll_results",
      { p_poll: pollId },
    );
    return ((data ?? []) as Array<{ choice: string; label: string; votes: number }>).map((r) => ({
      choice: r.choice,
      label: r.label,
      votes: Number(r.votes ?? 0),
    }));
  },
);

export interface ActivePoll {
  id: string;
  question: string;
  options: PollOption[];
  opened_at: string;
  closes_at: string | null;
  closed_at: string | null;
  my_choice: string | null;
  phase: "open" | "results";
  results: PollResultRow[] | null;
  kind: "poll" | "pulse";
}

export async function getActivePoll(cohortId: string): Promise<ActivePoll | null> {
  const sb = await getSupabaseServer();
  const { data } = await (sb.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data:
      | {
          id: string; question: string; options: PollOption[];
          opened_at: string; closes_at: string | null; closed_at: string | null;
          my_choice: string | null; phase: "open" | "results";
          results: PollResultRow[] | null;
          kind: "poll" | "pulse";
        }
      | Array<{
          id: string; question: string; options: PollOption[];
          opened_at: string; closes_at: string | null; closed_at: string | null;
          my_choice: string | null; phase: "open" | "results";
          results: PollResultRow[] | null;
          kind: "poll" | "pulse";
        }>
      | null;
  }>)("rpc_active_poll", { p_cohort: cohortId });
  if (!data) return null;
  const row = Array.isArray(data) ? data[0] ?? null : data;
  if (!row) return null;
  return {
    id: row.id,
    question: row.question,
    options: row.options ?? [],
    opened_at: row.opened_at,
    closes_at: row.closes_at,
    closed_at: row.closed_at,
    my_choice: row.my_choice ?? null,
    phase: row.phase,
    results: row.results
      ? row.results.map((r) => ({ choice: r.choice, label: r.label, votes: Number(r.votes ?? 0) }))
      : null,
    kind: (row.kind ?? "poll") as "poll" | "pulse",
  };
}
