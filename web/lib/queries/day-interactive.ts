import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface DayAssignment {
  id: string;
  title: string;
  body_md: string | null;
  kind: "lab" | "capstone" | "reflection" | "quiz";
  due_at: string | null;
  submission?: {
    id: string;
    body: string | null;
    status: "draft" | "submitted" | "graded" | "returned";
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
  my_choice: string | null;
}

export interface DayAttendance {
  status: "present" | "absent" | "late" | "excused" | null;
}

export interface DayInteractive {
  assignment: DayAssignment | null;
  quiz: DayQuiz | null;
  poll: DayPoll | null;
  attendance: DayAttendance;
}

export const getDayInteractive = cache(
  async (cohortId: string, dayNumber: number): Promise<DayInteractive> => {
    const sb = await getSupabaseServer();
    const { data: user } = await sb.auth.getUser();
    const uid = user.user?.id;

    const [assignmentRes, quizRes, pollRes, attendanceRes] = await Promise.all([
      sb
        .from("assignments")
        .select(
          "id, title, body_md, kind, due_at, submissions(id, body, status, score, feedback_md, ai_graded, ai_strengths, ai_weaknesses, human_reviewed_at, updated_at, user_id)",
        )
        .eq("cohort_id", cohortId)
        .eq("day_number", dayNumber)
        .order("created_at")
        .limit(1)
        .maybeSingle(),
      sb
        .from("quizzes")
        .select(
          "id, title, quiz_questions(ordinal, prompt, kind, options), quiz_attempts(answers, score, completed_at, user_id)",
        )
        .eq("cohort_id", cohortId)
        .eq("day_number", dayNumber)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle(),
      sb
        .from("polls")
        .select("id, question, options, closed_at, poll_votes(choice, user_id)")
        .eq("cohort_id", cohortId)
        .eq("day_number", dayNumber)
        .order("opened_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      uid
        ? sb
            .from("attendance")
            .select("status")
            .eq("cohort_id", cohortId)
            .eq("day_number", dayNumber)
            .eq("user_id", uid)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    let assignment: DayAssignment | null = null;
    if (assignmentRes.data) {
      const a = assignmentRes.data as unknown as {
        id: string; title: string; body_md: string | null; kind: DayAssignment["kind"]; due_at: string | null;
        submissions: Array<{
          id: string; body: string | null; status: DayAssignment["submission"] extends { status: infer S } ? S : never;
          score: number | null; feedback_md: string | null;
          ai_graded: boolean | null; ai_strengths: string[] | null; ai_weaknesses: string[] | null;
          human_reviewed_at: string | null;
          updated_at: string; user_id: string;
        }>;
      };
      const mine = a.submissions?.find((s) => s.user_id === uid) ?? null;
      assignment = {
        id: a.id,
        title: a.title,
        body_md: a.body_md,
        kind: a.kind,
        due_at: a.due_at,
        submission: mine
          ? {
              id: mine.id,
              body: mine.body,
              status: mine.status,
              score: mine.human_reviewed_at ? mine.score : null,
              feedback_md: mine.human_reviewed_at ? mine.feedback_md : null,
              published: !!mine.human_reviewed_at,
              ai_strengths: mine.human_reviewed_at ? (mine.ai_strengths ?? []) : [],
              ai_weaknesses: mine.human_reviewed_at ? (mine.ai_weaknesses ?? []) : [],
              updated_at: mine.updated_at,
            }
          : null,
      };
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
        closed_at: string | null; poll_votes: Array<{ choice: string; user_id: string }>;
      };
      const my = p.poll_votes?.find((v) => v.user_id === uid) ?? null;
      poll = {
        id: p.id,
        question: p.question,
        options: p.options ?? [],
        closed_at: p.closed_at,
        my_choice: my?.choice ?? null,
      };
    }

    return {
      assignment,
      quiz,
      poll,
      attendance: {
        status: ((attendanceRes.data as { status: DayAttendance["status"] } | null)?.status ?? null),
      },
    };
  },
);
