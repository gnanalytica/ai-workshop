import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { listCohortDays } from "@/lib/queries/cohort";

export interface StudentActivity {
  user_id: string;
  /** % of unlocked days with at least one activity (0–100). */
  score: number;
  /** % of last 3 unlocked days with activity (0–100). */
  recent_score: number;
  /** Distinct unlocked days with any activity. */
  active_days: number;
  /** Total unlocked days against which active_days is measured. */
  unlocked_days: number;
  /** Most recent activity timestamp across all signals (ISO string), or null. */
  last_active_at: string | null;
  /** Days since `last_active_at`, or null if never active. */
  days_since_active: number | null;
  /** Per-signal counts. */
  signals: {
    submissions: number;
    quiz_attempts: number;
    feedback: number;
    poll_votes: number;
    lab_progress: number;
  };
}

/**
 * Derive a per-student activity rollup for an entire cohort.
 *
 * "Active on day d" = the student touched any of: submissions for d, quiz
 * attempts for d, day_feedback for d, poll_votes for a poll tagged with d,
 * or lab_progress for d. The score is `active_days / unlocked_days * 100`,
 * which naturally evolves as new days unlock and new activity rolls in.
 */
export const getStudentActivity = cache(
  async (
    cohortId: string,
    userIdFilter?: ReadonlyArray<string>,
  ): Promise<Map<string, StudentActivity>> => {
    const sb = await getSupabaseServer();

    const days = await listCohortDays(cohortId);
    const unlocked = days
      .filter((d) => d.is_unlocked)
      .map((d) => d.day_number)
      .sort((a, b) => a - b);
    const unlockedSet = new Set(unlocked);
    const unlocked_days = Math.max(1, unlocked.length);
    const recentDays = unlocked.slice(-3);
    const recentSet = new Set(recentDays);
    const recentDenom = Math.max(1, recentDays.length);

    const scope = userIdFilter ? new Set(userIdFilter) : null;
    const inScope = (uid: string) => !scope || scope.has(uid);

    const [subs, quizzes, feedback, votes, labs] = await Promise.all([
      sb
        .from("submissions")
        .select(
          "user_id, updated_at, assignments!inner(day_number, cohort_id)",
        )
        .eq("assignments.cohort_id", cohortId),
      sb
        .from("quiz_attempts")
        .select(
          "user_id, completed_at, created_at, quizzes!inner(day_number, cohort_id)",
        )
        .eq("quizzes.cohort_id", cohortId),
      sb
        .from("day_feedback")
        .select("user_id, day_number, created_at")
        .eq("cohort_id", cohortId),
      sb
        .from("poll_votes")
        .select("user_id, voted_at, polls!inner(day_number, cohort_id)")
        .eq("polls.cohort_id", cohortId)
        .not("polls.day_number", "is", null),
      sb
        .from("lab_progress")
        .select("user_id, day_number, updated_at")
        .eq("cohort_id", cohortId),
    ]);

    interface UserState {
      activeDays: Set<number>;
      recentActiveDays: Set<number>;
      lastAt: string | null;
      signals: StudentActivity["signals"];
    }

    const m = new Map<string, UserState>();
    const ensure = (uid: string): UserState => {
      let s = m.get(uid);
      if (!s) {
        s = {
          activeDays: new Set(),
          recentActiveDays: new Set(),
          lastAt: null,
          signals: {
            submissions: 0,
            quiz_attempts: 0,
            feedback: 0,
            poll_votes: 0,
            lab_progress: 0,
          },
        };
        m.set(uid, s);
      }
      return s;
    };

    const touch = (
      uid: string,
      day: number | null | undefined,
      at: string | null | undefined,
      kind: keyof StudentActivity["signals"],
    ) => {
      if (!inScope(uid)) return;
      const s = ensure(uid);
      s.signals[kind]++;
      if (typeof day === "number" && unlockedSet.has(day)) {
        s.activeDays.add(day);
        if (recentSet.has(day)) s.recentActiveDays.add(day);
      }
      if (at && (!s.lastAt || at > s.lastAt)) s.lastAt = at;
    };

    for (const r of (subs.data ?? []) as Array<{
      user_id: string;
      updated_at: string;
      assignments: { day_number: number } | Array<{ day_number: number }>;
    }>) {
      const a = Array.isArray(r.assignments) ? r.assignments[0] : r.assignments;
      touch(r.user_id, a?.day_number, r.updated_at, "submissions");
    }
    for (const r of (quizzes.data ?? []) as Array<{
      user_id: string;
      completed_at: string | null;
      created_at: string;
      quizzes: { day_number: number } | Array<{ day_number: number }>;
    }>) {
      const q = Array.isArray(r.quizzes) ? r.quizzes[0] : r.quizzes;
      touch(
        r.user_id,
        q?.day_number,
        r.completed_at ?? r.created_at,
        "quiz_attempts",
      );
    }
    for (const r of (feedback.data ?? []) as Array<{
      user_id: string;
      day_number: number;
      created_at: string;
    }>) {
      touch(r.user_id, r.day_number, r.created_at, "feedback");
    }
    for (const r of (votes.data ?? []) as Array<{
      user_id: string;
      voted_at: string;
      polls: { day_number: number | null } | Array<{ day_number: number | null }>;
    }>) {
      const p = Array.isArray(r.polls) ? r.polls[0] : r.polls;
      touch(r.user_id, p?.day_number ?? null, r.voted_at, "poll_votes");
    }
    for (const r of (labs.data ?? []) as Array<{
      user_id: string;
      day_number: number;
      updated_at: string;
    }>) {
      touch(r.user_id, r.day_number, r.updated_at, "lab_progress");
    }

    const out = new Map<string, StudentActivity>();
    for (const [uid, s] of m.entries()) {
      const score = Math.round((s.activeDays.size / unlocked_days) * 100);
      const recent_score = Math.round(
        (s.recentActiveDays.size / recentDenom) * 100,
      );
      const days_since_active = s.lastAt
        ? Math.floor((Date.now() - new Date(s.lastAt).getTime()) / 86_400_000)
        : null;
      out.set(uid, {
        user_id: uid,
        score,
        recent_score,
        active_days: s.activeDays.size,
        unlocked_days,
        last_active_at: s.lastAt,
        days_since_active,
        signals: s.signals,
      });
    }
    return out;
  },
);
