import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Score buckets used by both submissions and quizzes for at-a-glance distribution charts. */
export interface ScoreDistribution {
  under_60: number;
  band_60_69: number;
  band_70_79: number;
  band_80_89: number;
  band_90_100: number;
}

function bucket(score: number, dist: ScoreDistribution) {
  if (score < 60) dist.under_60 += 1;
  else if (score < 70) dist.band_60_69 += 1;
  else if (score < 80) dist.band_70_79 += 1;
  else if (score < 90) dist.band_80_89 += 1;
  else dist.band_90_100 += 1;
}

const emptyDist = (): ScoreDistribution => ({
  under_60: 0,
  band_60_69: 0,
  band_70_79: 0,
  band_80_89: 0,
  band_90_100: 0,
});

export interface SubmissionDayScores {
  day_number: number;
  /** Number of non-reflection assignments deployed on this day. 0 → nothing to submit, the day should not penalize submission rate. */
  assignments: number;
  /** Count of submissions in (submitted, graded) status for the day. */
  submitted: number;
  /** Subset of `submitted` where status='graded' (either AI or human). */
  graded: number;
  /** Average final score across `graded` rows. Null when graded=0. */
  avg_score: number | null;
  /** Average AI-only score across rows where ai_score IS NOT NULL. */
  avg_ai_score: number | null;
  /** Median final score across graded rows. Null when graded=0. */
  median_score: number | null;
  /** Distribution of final scores across graded rows. */
  distribution: ScoreDistribution;
  /** Rows that are submitted but not yet graded. */
  ungraded: number;
  /** Hours since the oldest ungraded submission for this day was first submitted. Null when ungraded=0. */
  oldest_ungraded_hours: number | null;
}

/**
 * Per-day grade rollup for non-reflection assignments. Powers the Submissions
 * section of Pulse — rate + distribution + grading queue ageing in one pass.
 */
export const getSubmissionScoresByDay = cache(
  async (
    cohortId: string,
    dayNumbers: number[],
    excludeUserIds?: ReadonlyArray<string>,
  ): Promise<SubmissionDayScores[]> => {
    if (dayNumbers.length === 0) return [];
    const sb = await getSupabaseServer();
    const exclude = excludeUserIds ? new Set(excludeUserIds) : null;

    const [subsRes, asgRes] = await Promise.all([
      sb
        .from("submissions")
        .select(
          "user_id, status, score, ai_score, created_at, updated_at, assignments!inner(day_number, cohort_id, kind)",
        )
        .eq("assignments.cohort_id", cohortId)
        .in("assignments.day_number", dayNumbers)
        .neq("assignments.kind", "reflection")
        .in("status", ["submitted", "graded"]),
      sb
        .from("assignments")
        .select("day_number, kind")
        .eq("cohort_id", cohortId)
        .in("day_number", dayNumbers)
        .neq("kind", "reflection"),
    ]);

    const asgByDay = new Map<number, number>();
    for (const r of (asgRes.data ?? []) as Array<{ day_number: number }>) {
      asgByDay.set(r.day_number, (asgByDay.get(r.day_number) ?? 0) + 1);
    }
    const data = subsRes.data;

    type Row = {
      user_id: string;
      status: "submitted" | "graded";
      score: number | null;
      ai_score: number | null;
      created_at: string;
      updated_at: string;
      assignments: { day_number: number } | Array<{ day_number: number }>;
    };

    const byDay = new Map<number, {
      scores: number[];
      ai_scores: number[];
      submitted: number;
      graded: number;
      ungraded_oldest: number | null;
      distribution: ScoreDistribution;
    }>();

    const now = Date.now();
    for (const r of (data ?? []) as Row[]) {
      if (exclude && exclude.has(r.user_id)) continue;
      const a = Array.isArray(r.assignments) ? r.assignments[0] : r.assignments;
      const day = a?.day_number;
      if (typeof day !== "number") continue;
      let b = byDay.get(day);
      if (!b) {
        b = {
          scores: [],
          ai_scores: [],
          submitted: 0,
          graded: 0,
          ungraded_oldest: null,
          distribution: emptyDist(),
        };
        byDay.set(day, b);
      }
      b.submitted += 1;
      if (r.ai_score !== null) b.ai_scores.push(Number(r.ai_score));
      if (r.status === "graded" && r.score !== null) {
        b.graded += 1;
        const s = Number(r.score);
        b.scores.push(s);
        bucket(s, b.distribution);
      } else {
        // Submitted but not yet graded.
        const ageH = (now - new Date(r.created_at).getTime()) / 3_600_000;
        if (b.ungraded_oldest === null || ageH > b.ungraded_oldest) {
          b.ungraded_oldest = ageH;
        }
      }
    }

    return dayNumbers
      .slice()
      .sort((a, b) => a - b)
      .map((day) => {
        const b = byDay.get(day);
        const assignments = asgByDay.get(day) ?? 0;
        if (!b) {
          return {
            day_number: day,
            assignments,
            submitted: 0,
            graded: 0,
            avg_score: null,
            avg_ai_score: null,
            median_score: null,
            distribution: emptyDist(),
            ungraded: 0,
            oldest_ungraded_hours: null,
          };
        }
        const avg =
          b.scores.length > 0
            ? b.scores.reduce((s, n) => s + n, 0) / b.scores.length
            : null;
        const avgAi =
          b.ai_scores.length > 0
            ? b.ai_scores.reduce((s, n) => s + n, 0) / b.ai_scores.length
            : null;
        let median: number | null = null;
        if (b.scores.length > 0) {
          const sorted = [...b.scores].sort((x, y) => x - y);
          const mid = Math.floor(sorted.length / 2);
          median =
            sorted.length % 2
              ? sorted[mid] ?? null
              : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
        }
        return {
          day_number: day,
          assignments,
          submitted: b.submitted,
          graded: b.graded,
          avg_score: avg,
          avg_ai_score: avgAi,
          median_score: median,
          distribution: b.distribution,
          ungraded: b.submitted - b.graded,
          oldest_ungraded_hours:
            b.ungraded_oldest === null ? null : Math.round(b.ungraded_oldest),
        };
      });
  },
);

export interface QuizDayScores {
  day_number: number;
  /** Number of published quizzes on this day. 0 → nothing to attempt. */
  quizzes: number;
  /** Unique users with at least one completed attempt. */
  attempters: number;
  /** Best attempt per (user, quiz) summed. */
  attempts: number;
  /** Pass count = attempts where best-score >= 60. */
  passed: number;
  /** Average best-score per (user, quiz). Null when attempts=0. */
  avg_score: number | null;
  /** Distribution across best-scores. */
  distribution: ScoreDistribution;
}

/**
 * Per-day quiz score rollup. "Best attempt per (user, quiz)" semantics so a
 * student who retook a quiz isn't double-counted in attempts/avg.
 */
export const getQuizScoresByDay = cache(
  async (
    cohortId: string,
    dayNumbers: number[],
    excludeUserIds?: ReadonlyArray<string>,
  ): Promise<QuizDayScores[]> => {
    if (dayNumbers.length === 0) return [];
    const sb = await getSupabaseServer();
    const exclude = excludeUserIds ? new Set(excludeUserIds) : null;

    const [quizMeta, attempts] = await Promise.all([
      sb
        .from("quizzes")
        .select("id, day_number")
        .eq("cohort_id", cohortId)
        .in("day_number", dayNumbers)
        .eq("is_published", true),
      sb
        .from("quiz_attempts")
        .select("quiz_id, user_id, score, completed_at, quizzes!inner(day_number, cohort_id)")
        .eq("quizzes.cohort_id", cohortId)
        .in("quizzes.day_number", dayNumbers)
        .not("completed_at", "is", null),
    ]);

    const quizDayById = new Map<string, number>();
    const quizzesByDay = new Map<number, number>();
    for (const q of (quizMeta.data ?? []) as Array<{ id: string; day_number: number }>) {
      quizDayById.set(q.id, q.day_number);
      quizzesByDay.set(q.day_number, (quizzesByDay.get(q.day_number) ?? 0) + 1);
    }

    // Best score per (user, quiz)
    type AttemptRow = {
      quiz_id: string;
      user_id: string;
      score: number | null;
    };
    const bestByKey = new Map<string, number>();
    for (const r of (attempts.data ?? []) as AttemptRow[]) {
      if (exclude && exclude.has(r.user_id)) continue;
      const key = `${r.quiz_id}|${r.user_id}`;
      const s = Number(r.score ?? 0);
      if (s > (bestByKey.get(key) ?? -1)) bestByKey.set(key, s);
    }

    const byDay = new Map<number, {
      scores: number[];
      attempters: Set<string>;
      passed: number;
      distribution: ScoreDistribution;
    }>();
    for (const [key, score] of bestByKey) {
      const [quizId, uid] = key.split("|");
      const day = quizDayById.get(quizId ?? "");
      if (typeof day !== "number") continue;
      let b = byDay.get(day);
      if (!b) {
        b = {
          scores: [],
          attempters: new Set(),
          passed: 0,
          distribution: emptyDist(),
        };
        byDay.set(day, b);
      }
      b.scores.push(score);
      if (uid) b.attempters.add(uid);
      if (score >= 60) b.passed += 1;
      bucket(score, b.distribution);
    }

    return dayNumbers
      .slice()
      .sort((a, b) => a - b)
      .map((day) => {
        const b = byDay.get(day);
        const quizzesCount = quizzesByDay.get(day) ?? 0;
        if (!b) {
          return {
            day_number: day,
            quizzes: quizzesCount,
            attempters: 0,
            attempts: 0,
            passed: 0,
            avg_score: null,
            distribution: emptyDist(),
          };
        }
        const avg =
          b.scores.length > 0
            ? b.scores.reduce((s, n) => s + n, 0) / b.scores.length
            : null;
        return {
          day_number: day,
          quizzes: quizzesCount,
          attempters: b.attempters.size,
          attempts: b.scores.length,
          passed: b.passed,
          avg_score: avg,
          distribution: b.distribution,
        };
      });
  },
);

export interface QuizPerformanceRow {
  quiz_id: string;
  day_number: number;
  title: string;
  attempts: number;
  passed: number;
  avg_score: number | null;
}

/**
 * One row per published quiz in the window. Surfaces score health at the
 * quiz level (e.g., one quiz tanked relative to its peers on the same day).
 */
export const listQuizPerformance = cache(
  async (
    cohortId: string,
    dayNumbers: number[],
    excludeUserIds?: ReadonlyArray<string>,
  ): Promise<QuizPerformanceRow[]> => {
    if (dayNumbers.length === 0) return [];
    const sb = await getSupabaseServer();
    const exclude = excludeUserIds ? new Set(excludeUserIds) : null;

    const [quizMeta, attempts] = await Promise.all([
      sb
        .from("quizzes")
        .select("id, day_number, title")
        .eq("cohort_id", cohortId)
        .in("day_number", dayNumbers)
        .eq("is_published", true),
      sb
        .from("quiz_attempts")
        .select("quiz_id, user_id, score, completed_at, quizzes!inner(cohort_id, day_number)")
        .eq("quizzes.cohort_id", cohortId)
        .in("quizzes.day_number", dayNumbers)
        .not("completed_at", "is", null),
    ]);

    const meta = new Map(
      ((quizMeta.data ?? []) as Array<{ id: string; day_number: number; title: string }>).map(
        (q) => [q.id, q],
      ),
    );

    const bestByKey = new Map<string, number>();
    for (const r of (attempts.data ?? []) as Array<{
      quiz_id: string;
      user_id: string;
      score: number | null;
    }>) {
      if (exclude && exclude.has(r.user_id)) continue;
      const key = `${r.quiz_id}|${r.user_id}`;
      const s = Number(r.score ?? 0);
      if (s > (bestByKey.get(key) ?? -1)) bestByKey.set(key, s);
    }

    const byQuiz = new Map<string, { scores: number[]; passed: number }>();
    for (const [key, score] of bestByKey) {
      const [quizId] = key.split("|");
      if (!quizId) continue;
      let b = byQuiz.get(quizId);
      if (!b) {
        b = { scores: [], passed: 0 };
        byQuiz.set(quizId, b);
      }
      b.scores.push(score);
      if (score >= 60) b.passed += 1;
    }

    const rows: QuizPerformanceRow[] = [];
    for (const [id, q] of meta) {
      const b = byQuiz.get(id);
      const scores = b?.scores ?? [];
      rows.push({
        quiz_id: id,
        day_number: q.day_number,
        title: q.title,
        attempts: scores.length,
        passed: b?.passed ?? 0,
        avg_score:
          scores.length > 0
            ? scores.reduce((s, n) => s + n, 0) / scores.length
            : null,
      });
    }
    return rows.sort((a, b) => a.day_number - b.day_number || a.title.localeCompare(b.title));
  },
);

/** Roll-ups used by the per-pod and per-student tables. */
export interface StudentScoreTotals {
  user_id: string;
  /** Avg quiz score across best-attempts. Null when no attempts. */
  avg_quiz_score: number | null;
  /** # quiz attempts (distinct quizzes attempted). */
  quiz_attempts: number;
  /** Avg final submission grade across graded rows. Null when none. */
  avg_submission_grade: number | null;
  /** # graded submissions. */
  graded_submissions: number;
}

export const getStudentScoreTotals = cache(
  async (
    cohortId: string,
    excludeUserIds?: ReadonlyArray<string>,
  ): Promise<Map<string, StudentScoreTotals>> => {
    const sb = await getSupabaseServer();
    const exclude = excludeUserIds ? new Set(excludeUserIds) : null;
    const [attempts, subs] = await Promise.all([
      sb
        .from("quiz_attempts")
        .select("user_id, quiz_id, score, completed_at, quizzes!inner(cohort_id)")
        .eq("quizzes.cohort_id", cohortId)
        .not("completed_at", "is", null),
      sb
        .from("submissions")
        .select("user_id, score, status, assignments!inner(cohort_id)")
        .eq("assignments.cohort_id", cohortId)
        .eq("status", "graded"),
    ]);

    // Best score per (user, quiz)
    const bestQuiz = new Map<string, number>();
    for (const r of (attempts.data ?? []) as Array<{
      user_id: string;
      quiz_id: string;
      score: number | null;
    }>) {
      if (exclude && exclude.has(r.user_id)) continue;
      const key = `${r.user_id}|${r.quiz_id}`;
      const s = Number(r.score ?? 0);
      if (s > (bestQuiz.get(key) ?? -1)) bestQuiz.set(key, s);
    }

    type Acc = {
      quizScores: number[];
      subScores: number[];
    };
    const acc = new Map<string, Acc>();
    const ensure = (uid: string): Acc => {
      let a = acc.get(uid);
      if (!a) {
        a = { quizScores: [], subScores: [] };
        acc.set(uid, a);
      }
      return a;
    };

    for (const [key, score] of bestQuiz) {
      const [uid] = key.split("|");
      if (!uid) continue;
      ensure(uid).quizScores.push(score);
    }
    for (const r of (subs.data ?? []) as Array<{
      user_id: string;
      score: number | null;
    }>) {
      if (r.score === null) continue;
      if (exclude && exclude.has(r.user_id)) continue;
      ensure(r.user_id).subScores.push(Number(r.score));
    }

    const out = new Map<string, StudentScoreTotals>();
    for (const [uid, a] of acc) {
      out.set(uid, {
        user_id: uid,
        avg_quiz_score:
          a.quizScores.length > 0
            ? a.quizScores.reduce((s, n) => s + n, 0) / a.quizScores.length
            : null,
        quiz_attempts: a.quizScores.length,
        avg_submission_grade:
          a.subScores.length > 0
            ? a.subScores.reduce((s, n) => s + n, 0) / a.subScores.length
            : null,
        graded_submissions: a.subScores.length,
      });
    }
    return out;
  },
);
