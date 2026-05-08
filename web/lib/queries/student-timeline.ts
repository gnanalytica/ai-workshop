import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export type TimelineEventKind =
  | "submission"
  | "quiz"
  | "feedback"
  | "poll_vote"
  | "lab_progress";

export interface TimelineEvent {
  id: string;
  kind: TimelineEventKind;
  day_number: number | null;
  at: string; // ISO timestamp
  title: string;
  hint?: string;
}

/**
 * Chronological activity feed for a single student inside one cohort.
 * Pulls from submissions, quiz_attempts, day_feedback, poll_votes, and
 * lab_progress, then sorts newest-first.
 */
export const getStudentTimeline = cache(
  async (cohortId: string, userId: string): Promise<TimelineEvent[]> => {
    const sb = await getSupabaseServer();
    const [subs, quizzes, feedback, votes, labs] = await Promise.all([
      sb
        .from("submissions")
        .select(
          "id, status, score, updated_at, assignments!inner(title, day_number, cohort_id)",
        )
        .eq("user_id", userId)
        .eq("assignments.cohort_id", cohortId)
        .order("updated_at", { ascending: false })
        .limit(60),
      sb
        .from("quiz_attempts")
        .select(
          "id, score, completed_at, created_at, quizzes!inner(title, day_number, cohort_id)",
        )
        .eq("user_id", userId)
        .eq("quizzes.cohort_id", cohortId)
        .order("created_at", { ascending: false })
        .limit(40),
      sb
        .from("day_feedback")
        .select("id, day_number, rating, created_at, fuzzy_topic")
        .eq("cohort_id", cohortId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(40),
      sb
        .from("poll_votes")
        .select("poll_id, voted_at, choice, polls!inner(question, day_number, kind, cohort_id)")
        .eq("user_id", userId)
        .eq("polls.cohort_id", cohortId)
        .order("voted_at", { ascending: false })
        .limit(40),
      sb
        .from("lab_progress")
        .select("lab_id, day_number, status, updated_at")
        .eq("cohort_id", cohortId)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(40),
    ]);

    const events: TimelineEvent[] = [];

    for (const r of (subs.data ?? []) as Array<{
      id: string;
      status: string;
      score: number | null;
      updated_at: string;
      assignments: { title: string; day_number: number } | Array<{ title: string; day_number: number }>;
    }>) {
      const a = Array.isArray(r.assignments) ? r.assignments[0] : r.assignments;
      const scoreHint =
        r.score !== null
          ? `score ${r.score}`
          : r.status === "submitted"
            ? "submitted"
            : r.status;
      events.push({
        id: `s-${r.id}`,
        kind: "submission",
        day_number: a?.day_number ?? null,
        at: r.updated_at,
        title: a?.title ?? "Submission",
        hint: scoreHint,
      });
    }

    for (const r of (quizzes.data ?? []) as Array<{
      id: string;
      score: number | null;
      completed_at: string | null;
      created_at: string;
      quizzes: { title: string; day_number: number } | Array<{ title: string; day_number: number }>;
    }>) {
      const q = Array.isArray(r.quizzes) ? r.quizzes[0] : r.quizzes;
      events.push({
        id: `q-${r.id}`,
        kind: "quiz",
        day_number: q?.day_number ?? null,
        at: r.completed_at ?? r.created_at,
        title: q?.title ?? "Quiz",
        hint:
          r.score !== null
            ? `${Math.round(r.score)}%`
            : r.completed_at
              ? "completed"
              : "in progress",
      });
    }

    for (const r of (feedback.data ?? []) as Array<{
      id: string;
      day_number: number;
      rating: number;
      created_at: string;
      fuzzy_topic: string | null;
    }>) {
      events.push({
        id: `f-${r.id}`,
        kind: "feedback",
        day_number: r.day_number,
        at: r.created_at,
        title: "Day feedback",
        hint: `${r.rating}★${r.fuzzy_topic ? ` · ${r.fuzzy_topic}` : ""}`,
      });
    }

    for (const r of (votes.data ?? []) as Array<{
      poll_id: string;
      voted_at: string;
      choice: string;
      polls:
        | { question: string; day_number: number | null; kind: string }
        | Array<{ question: string; day_number: number | null; kind: string }>;
    }>) {
      const p = Array.isArray(r.polls) ? r.polls[0] : r.polls;
      events.push({
        id: `pv-${r.poll_id}-${r.voted_at}`,
        kind: "poll_vote",
        day_number: p?.day_number ?? null,
        at: r.voted_at,
        title: p?.question ?? "Poll vote",
        hint: `voted "${r.choice}"`,
      });
    }

    for (const r of (labs.data ?? []) as Array<{
      lab_id: string;
      day_number: number;
      status: string;
      updated_at: string;
    }>) {
      events.push({
        id: `l-${r.lab_id}-${r.day_number}`,
        kind: "lab_progress",
        day_number: r.day_number,
        at: r.updated_at,
        title: r.lab_id,
        hint: r.status,
      });
    }

    return events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  },
);
