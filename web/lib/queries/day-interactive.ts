import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";
import { getPreviewUserId } from "@/lib/auth/persona";
import { getSession } from "@/lib/auth/session";

export interface DayAssignment {
  id: string;
  title: string;
  body_md: string | null;
  kind: "lab" | "capstone" | "reflection";
  due_at: string | null;
  submission?: {
    id: string;
    body: string | null;
    links: { label: string; url: string }[];
    status: "draft" | "submitted" | "graded";
    score: number | null;
    feedback_md: string | null;
    published: boolean;
    ai_strengths: string[];
    ai_weaknesses: string[];
    updated_at: string;
  } | null;
}

export interface DayQuizQuestion {
  ordinal: number;
  prompt: string;
  kind: "single" | "multi" | "short";
  options: { id: string; label: string }[];
}

export interface DayQuiz {
  id: string;
  title: string;
  questions: DayQuizQuestion[];
  attempt: {
    answers: Record<string, unknown>;
    score: number | null;
    completed_at: string | null;
  } | null;
}

export interface DayPoll {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  closed_at: string | null;
  closes_at: string | null;
  my_choice: string | null;
  results: { choice: string; label: string; votes: number }[] | null;
}

export interface DayAttendance {
  status: "present" | "absent" | "late" | "excused" | null;
}

export interface DayInteractive {
  assignments: DayAssignment[];
  quiz: DayQuiz | null;
  poll: DayPoll | null;
  attendance: DayAttendance;
  dayFeedbackSubmitted: boolean;
}

export const getDayInteractive = cache(
  async (cohortId: string, dayNumber: number): Promise<DayInteractive> => {
    const previewUid = await getPreviewUserId();
    // Read-only impersonation: route through service client when admin is
    // previewing as a student so the joined submissions/attempts/votes
    // contain the previewed student's rows.
    const sb = previewUid ? getSupabaseService() : await getSupabaseServer();
    // Reuse the per-request cached session lookup instead of calling
    // sb.auth.getUser() directly — every other server query on this render
    // already shares this Promise.
    const uid = previewUid ?? (await getSession())?.id;

    // Filter the embedded user-scoped resources to just `uid` so we don't
    // drag every cohort student's submissions/attempts/votes across the wire.
    // PostgREST embed filters keep the parent row even when the embed array
    // is empty, which is exactly what we want for "no submission yet" cases.
    const userScope = uid ?? "00000000-0000-0000-0000-000000000000";

    // Kick off the polls query first so we can chain rpc_poll_results off it
    // without serializing against the rest of the batch — when the poll is
    // closed, the RPC overlaps with whatever assignment/quiz queries are still
    // in flight instead of waiting for the whole Promise.all to resolve.
    const pollResPromise = sb
      .from("polls")
      .select("id, question, options, closed_at, closes_at, poll_votes(choice, user_id)")
      .eq("cohort_id", cohortId)
      .eq("day_number", dayNumber)
      .eq("poll_votes.user_id", userScope)
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const pollResultsPromise: Promise<Array<{ choice: string; label: string; votes: number }> | null> =
      Promise.resolve(pollResPromise).then(async ({ data }) => {
        if (!data) return null;
        const p = data as { id: string; closed_at: string | null; closes_at: string | null };
        const isClosed =
          !!p.closed_at || (p.closes_at != null && new Date(p.closes_at).getTime() <= Date.now());
        if (!isClosed) return null;
        const { data: rows } = await (sb.rpc as unknown as (
          fn: string,
          args: Record<string, unknown>,
        ) => Promise<{ data: Array<{ choice: string; label: string; votes: number }> | null }>)(
          "rpc_poll_results",
          { p_poll: p.id },
        );
        return rows ?? null;
      });

    const [assignmentRes, quizRes, pollRes, pollResultsRows, attendanceRes, dayFeedbackRes] = await Promise.all([
      sb
        .from("assignments")
        .select(
          "id, title, body_md, kind, due_at, submissions(id, body, links, status, score, feedback_md, ai_graded, ai_strengths, ai_weaknesses, human_reviewed_at, updated_at, user_id)",
        )
        .eq("cohort_id", cohortId)
        .eq("day_number", dayNumber)
        .eq("submissions.user_id", userScope)
        .order("created_at"),
      sb
        .from("quizzes")
        .select(
          "id, title, quiz_questions(ordinal, prompt, kind, options), quiz_attempts(answers, score, completed_at, user_id)",
        )
        .eq("cohort_id", cohortId)
        .eq("day_number", dayNumber)
        .eq("is_published", true)
        .eq("quiz_attempts.user_id", userScope)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle(),
      pollResPromise,
      pollResultsPromise,
      uid
        ? sb
            .from("attendance")
            .select("status")
            .eq("cohort_id", cohortId)
            .eq("day_number", dayNumber)
            .eq("user_id", uid)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      uid
        ? sb
            .from("day_feedback")
            .select("user_id")
            .eq("cohort_id", cohortId)
            .eq("day_number", dayNumber)
            .eq("user_id", uid)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const assignments: DayAssignment[] = [];
    if (assignmentRes.data) {
      type AssignmentRow = {
        id: string; title: string; body_md: string | null; kind: DayAssignment["kind"]; due_at: string | null;
        submissions: Array<{
          id: string; body: string | null;
          links: { label: string; url: string }[] | null;
          status: DayAssignment["submission"] extends { status: infer S } ? S : never;
          score: number | null; feedback_md: string | null;
          ai_graded: boolean | null; ai_strengths: string[] | null; ai_weaknesses: string[] | null;
          human_reviewed_at: string | null;
          updated_at: string; user_id: string;
        }>;
      };
      for (const row of assignmentRes.data as unknown as AssignmentRow[]) {
        const mine = row.submissions?.find((s) => s.user_id === uid) ?? null;
        assignments.push({
          id: row.id,
          title: row.title,
          body_md: row.body_md,
          kind: row.kind,
          due_at: row.due_at,
          submission: mine
            ? {
                id: mine.id,
                body: mine.body,
                links: mine.links ?? [],
                status: mine.status,
                score: mine.human_reviewed_at ? mine.score : null,
                feedback_md: mine.human_reviewed_at ? mine.feedback_md : null,
                published: !!mine.human_reviewed_at,
                ai_strengths: mine.human_reviewed_at ? (mine.ai_strengths ?? []) : [],
                ai_weaknesses: mine.human_reviewed_at ? (mine.ai_weaknesses ?? []) : [],
                updated_at: mine.updated_at,
              }
            : null,
        });
      }
    }

    let quiz: DayQuiz | null = null;
    if (quizRes.data) {
      const q = quizRes.data as unknown as {
        id: string; title: string;
        quiz_questions: Array<{ ordinal: number; prompt: string; kind: DayQuizQuestion["kind"]; options: { id: string; label: string }[] }>;
        quiz_attempts: Array<{ answers: Record<string, unknown>; score: number | null; completed_at: string | null; user_id: string }>;
      };
      const myAttempt = q.quiz_attempts?.find((a) => a.user_id === uid) ?? null;
      quiz = {
        id: q.id,
        title: q.title,
        questions: (q.quiz_questions ?? []).sort((a, b) => a.ordinal - b.ordinal),
        attempt: myAttempt
          ? { answers: myAttempt.answers ?? {}, score: myAttempt.score, completed_at: myAttempt.completed_at }
          : null,
      };
    }

    let poll: DayPoll | null = null;
    if (pollRes.data) {
      const p = pollRes.data as unknown as {
        id: string; question: string; options: { id: string; label: string }[];
        closed_at: string | null; closes_at: string | null;
        poll_votes: Array<{ choice: string; user_id: string }>;
      };
      const my = p.poll_votes?.find((v) => v.user_id === uid) ?? null;
      const results: DayPoll["results"] = pollResultsRows
        ? pollResultsRows.map((r) => ({
            choice: r.choice,
            label: r.label,
            votes: Number(r.votes ?? 0),
          }))
        : null;
      poll = {
        id: p.id,
        question: p.question,
        options: p.options ?? [],
        closed_at: p.closed_at,
        closes_at: p.closes_at,
        my_choice: my?.choice ?? null,
        results,
      };
    }

    return {
      assignments,
      quiz,
      poll,
      attendance: {
        status: ((attendanceRes.data as { status: DayAttendance["status"] } | null)?.status ?? null),
      },
      dayFeedbackSubmitted: !!dayFeedbackRes.data,
    };
  },
);
