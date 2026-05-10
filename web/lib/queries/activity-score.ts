import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { listCohortDays } from "@/lib/queries/cohort";

export interface StudentActivity {
  user_id: string;
  /** % of opportunity days with at least one activity (0–100). 100 when no opportunity days have occurred yet. */
  score: number;
  /** % of last 3 opportunity days with activity (0–100). */
  recent_score: number;
  /** Distinct opportunity days the student was active on. */
  active_days: number;
  /** Total opportunity days (unlocked AND had an assignment/quiz/poll deployed). */
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
 * or lab_progress for d.
 *
 * Scoring is *relative to what was available*: a day only counts in the
 * denominator if at least one "opportunity" existed on it — an assignment,
 * a quiz, or a tagged poll. A buffer day with nothing deployed cannot
 * pull a student's score down. Likewise, the number of polls/quizzes on
 * a given day is irrelevant: activity is binary at the day level.
 *
 * When zero opportunity days have happened yet (early cohort), score is
 * 100 by convention — no penalty for the cohort not yet rolling.
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
    const recentDays = unlocked.slice(-3);
    const recentSet = new Set(recentDays);

    const scope = userIdFilter ? new Set(userIdFilter) : null;
    const inScope = (uid: string) => !scope || scope.has(uid);

    const [subs, quizzes, feedback, votes, labs, opportunities] = await Promise.all([
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
      // Days that had at least one deployable opportunity: an assignment,
      // a quiz, or a tagged poll. These are the days we'll count in the
      // denominator. Days without any of these (e.g., admin unlocked early
      // before deploying content, or pure live-session days) are ignored.
      Promise.all([
        sb.from("assignments").select("day_number").eq("cohort_id", cohortId),
        sb.from("quizzes").select("day_number").eq("cohort_id", cohortId),
        sb
          .from("polls")
          .select("day_number")
          .eq("cohort_id", cohortId)
          .not("day_number", "is", null),
      ]).then(([a, q, p]) => {
        const set = new Set<number>();
        for (const r of (a.data ?? []) as Array<{ day_number: number }>) set.add(r.day_number);
        for (const r of (q.data ?? []) as Array<{ day_number: number }>) set.add(r.day_number);
        for (const r of (p.data ?? []) as Array<{ day_number: number | null }>) {
          if (typeof r.day_number === "number") set.add(r.day_number);
        }
        return set;
      }),
    ]);

    // Effective denominator: only unlocked days that had at least one
    // opportunity (assignment / quiz / poll). Prevents "empty days"
    // (unlocked but nothing deployed) from dragging the score down.
    const opportunityDays = opportunities;
    const effectiveDenom = unlocked.filter((d) => opportunityDays.has(d)).length;
    const recentEffective = recentDays.filter((d) => opportunityDays.has(d)).length;

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
      // Effective active days = active days that fell on an opportunity day.
      // (A student could be "active" on a day with no formal opportunity by
      // submitting feedback alone — that's still effort, but to keep the
      // numerator and denominator comparable we count only opportunity days.)
      let activeOnOpp = 0;
      for (const d of s.activeDays) if (opportunityDays.has(d)) activeOnOpp++;
      let recentActiveOnOpp = 0;
      for (const d of s.recentActiveDays) if (opportunityDays.has(d)) recentActiveOnOpp++;

      const score =
        effectiveDenom === 0 ? 100 : Math.round((activeOnOpp / effectiveDenom) * 100);
      const recent_score =
        recentEffective === 0
          ? 100
          : Math.round((recentActiveOnOpp / recentEffective) * 100);
      const days_since_active = s.lastAt
        ? Math.floor((Date.now() - new Date(s.lastAt).getTime()) / 86_400_000)
        : null;
      out.set(uid, {
        user_id: uid,
        score,
        recent_score,
        active_days: activeOnOpp,
        unlocked_days: effectiveDenom,
        last_active_at: s.lastAt,
        days_since_active,
        signals: s.signals,
      });
    }
    return out;
  },
);
