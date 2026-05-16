import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface AnalyticsSummary {
  totalStudents: number;
  avgDaysComplete: number;
  attendanceRate: number;
  pendingReview: number;
}

export interface DayAttendanceBucket {
  day_number: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface DayEngagementBucket {
  day_number: number;
  active: number;
  total: number;
  rate: number;
}

export interface AtRiskRow {
  user_id: string;
  full_name: string | null;
  email: string;
  days_present: number;
  labs_done: number;
}

export const getAnalyticsSummary = cache(async (cohortId: string): Promise<AnalyticsSummary> => {
  const sb = await getSupabaseServer();
  const [students, labs, attendance, submitted] = await Promise.all([
    sb.from("registrations").select("user_id", { count: "exact", head: true }).eq("cohort_id", cohortId).eq("status", "confirmed"),
    sb.from("lab_progress").select("user_id, day_number, status").eq("cohort_id", cohortId).eq("status", "done"),
    sb.from("attendance").select("status").eq("cohort_id", cohortId),
    sb.from("submissions").select("id, assignments!inner(cohort_id)", { count: "exact", head: true }).eq("status", "submitted").eq("assignments.cohort_id", cohortId),
  ]);

  const totalStudents = students.count ?? 0;
  const labRows = (labs.data ?? []) as Array<{ user_id: string; day_number: number }>;
  const completedDayPerStudent = new Map<string, Set<number>>();
  for (const r of labRows) {
    const set = completedDayPerStudent.get(r.user_id) ?? new Set();
    set.add(r.day_number);
    completedDayPerStudent.set(r.user_id, set);
  }
  const totalDaysCompleted = [...completedDayPerStudent.values()].reduce((s, set) => s + set.size, 0);
  const avgDaysComplete = totalStudents > 0 ? totalDaysCompleted / totalStudents : 0;

  const attRows = (attendance.data ?? []) as Array<{ status: string }>;
  const present = attRows.filter((r) => r.status === "present").length;
  const attendanceRate = attRows.length > 0 ? present / attRows.length : 0;

  return {
    totalStudents,
    avgDaysComplete,
    attendanceRate,
    pendingReview: submitted.count ?? 0,
  };
});

export const getAttendanceByDay = cache(
  async (
    cohortId: string,
    excludeUserIds?: ReadonlyArray<string>,
  ): Promise<DayAttendanceBucket[]> => {
    const sb = await getSupabaseServer();
    const exclude = excludeUserIds ? new Set(excludeUserIds) : null;
    const { data } = await sb
      .from("attendance")
      .select("user_id, day_number, status")
      .eq("cohort_id", cohortId);
    const buckets = new Map<number, DayAttendanceBucket>();
    for (const r of (data ?? []) as Array<{
      user_id: string;
      day_number: number;
      status: keyof Omit<DayAttendanceBucket, "day_number">;
    }>) {
      if (exclude && exclude.has(r.user_id)) continue;
      if (!buckets.has(r.day_number)) {
        buckets.set(r.day_number, {
          day_number: r.day_number,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        });
      }
      const b = buckets.get(r.day_number)!;
      b[r.status] = (b[r.status] ?? 0) + 1;
    }
    return [...buckets.values()].sort((a, b) => a.day_number - b.day_number);
  },
);

/**
 * Activity-based engagement per day. A confirmed student counts as "active"
 * on a given day if they did any of: submitted/updated an assignment for that
 * day, completed a quiz, gave day feedback, voted in a curriculum poll for
 * that day, or marked lab progress. Optional `userIdFilter` narrows the
 * "active" count + the "total" denominator to a subset (e.g. a pod's roster).
 */
export const getEngagementByDay = cache(
  async (
    cohortId: string,
    userIdFilter?: ReadonlyArray<string>,
    excludeUserIds?: ReadonlyArray<string>,
  ): Promise<DayEngagementBucket[]> => {
    const scope = userIdFilter ? new Set(userIdFilter) : null;
    const exclude = excludeUserIds ? new Set(excludeUserIds) : null;
    const sb = await getSupabaseServer();
    const [
      regs,
      subs,
      quizzes,
      feedback,
      votes,
      labs,
    ] = await Promise.all([
      sb
        .from("registrations")
        .select("user_id", { count: "exact", head: true })
        .eq("cohort_id", cohortId)
        .eq("status", "confirmed"),
      sb
        .from("submissions")
        .select("user_id, assignments!inner(day_number, cohort_id)")
        .eq("assignments.cohort_id", cohortId),
      sb
        .from("quiz_attempts")
        .select("user_id, quizzes!inner(day_number, cohort_id)")
        .eq("quizzes.cohort_id", cohortId),
      sb
        .from("day_feedback")
        .select("user_id, day_number")
        .eq("cohort_id", cohortId),
      sb
        .from("poll_votes")
        .select("user_id, polls!inner(day_number, cohort_id)")
        .eq("polls.cohort_id", cohortId)
        .not("polls.day_number", "is", null),
      sb
        .from("lab_progress")
        .select("user_id, day_number")
        .eq("cohort_id", cohortId),
    ]);

    const rawTotal = scope ? scope.size : regs.count ?? 0;
    // Exclude staff-pod members from both numerator and denominator. If a
    // userIdFilter (pod scope) is in use, the exclude list still applies on
    // top — staff members in that pod simply drop out.
    const excludeFromScope = exclude
      ? [...exclude].filter((u) => !scope || scope.has(u)).length
      : 0;
    const total = Math.max(0, rawTotal - excludeFromScope);
    const buckets = new Map<number, Set<string>>();

    const addRow = (day: number | null | undefined, userId: string) => {
      if (typeof day !== "number") return;
      if (scope && !scope.has(userId)) return;
      if (exclude && exclude.has(userId)) return;
      const set = buckets.get(day) ?? new Set<string>();
      set.add(userId);
      buckets.set(day, set);
    };

    for (const r of (subs.data ?? []) as Array<{
      user_id: string;
      assignments: { day_number: number } | Array<{ day_number: number }>;
    }>) {
      const a = Array.isArray(r.assignments) ? r.assignments[0] : r.assignments;
      addRow(a?.day_number, r.user_id);
    }
    for (const r of (quizzes.data ?? []) as Array<{
      user_id: string;
      quizzes: { day_number: number } | Array<{ day_number: number }>;
    }>) {
      const q = Array.isArray(r.quizzes) ? r.quizzes[0] : r.quizzes;
      addRow(q?.day_number, r.user_id);
    }
    for (const r of (feedback.data ?? []) as Array<{
      user_id: string;
      day_number: number;
    }>) {
      addRow(r.day_number, r.user_id);
    }
    for (const r of (votes.data ?? []) as Array<{
      user_id: string;
      polls: { day_number: number | null } | Array<{ day_number: number | null }>;
    }>) {
      const p = Array.isArray(r.polls) ? r.polls[0] : r.polls;
      addRow(p?.day_number ?? null, r.user_id);
    }
    for (const r of (labs.data ?? []) as Array<{
      user_id: string;
      day_number: number;
    }>) {
      addRow(r.day_number, r.user_id);
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a - b)
      .map(([day_number, set]) => {
        const active = set.size;
        return {
          day_number,
          active,
          total,
          rate: total > 0 ? active / total : 0,
        };
      });
  },
);

export interface CohortDayProgress {
  day_number: number;
  cohort_size: number;
  /** Number of students who attempted the day's quiz (any quiz tagged for this day). null = no quiz on this day. */
  quiz_attempts: number | null;
  /** Pass count among attempts. Pass = score >= 60. null = no quiz. */
  quiz_passed: number | null;
  /** Number of students with a submission on this day (status = submitted or graded). null = no assignment. */
  submitted: number | null;
  /** Total non-reflection assignments for this day (lab or capstone). 0 = nothing to submit. */
  submittable_assignments: number;
}

/**
 * Quiz pass rate + submission rate per day for the recent window. Drives
 * the "are they keeping up?" card on Pulse. Returns null axes when nothing
 * was deployable on that day, so the UI can hide / dash instead of
 * showing 0%.
 */
export const getCohortProgressByDay = cache(
  async (cohortId: string, dayNumbers: number[]): Promise<CohortDayProgress[]> => {
    if (dayNumbers.length === 0) return [];
    const sb = await getSupabaseServer();

    const [reg, quizMeta, attempts, asgnMeta, subs] = await Promise.all([
      sb
        .from("registrations")
        .select("user_id", { count: "exact", head: true })
        .eq("cohort_id", cohortId)
        .eq("status", "confirmed"),
      sb
        .from("quizzes")
        .select("id, day_number")
        .eq("cohort_id", cohortId)
        .in("day_number", dayNumbers),
      sb
        .from("quiz_attempts")
        .select("user_id, score, completed_at, quizzes!inner(day_number, cohort_id)")
        .eq("quizzes.cohort_id", cohortId)
        .in("quizzes.day_number", dayNumbers)
        .not("completed_at", "is", null),
      sb
        .from("assignments")
        .select("id, day_number, kind")
        .eq("cohort_id", cohortId)
        .in("day_number", dayNumbers)
        .neq("kind", "reflection"),
      sb
        .from("submissions")
        .select("user_id, status, assignments!inner(day_number, cohort_id, kind)")
        .eq("assignments.cohort_id", cohortId)
        .in("assignments.day_number", dayNumbers)
        .neq("assignments.kind", "reflection")
        .in("status", ["submitted", "graded"]),
    ]);

    const cohortSize = reg.count ?? 0;

    // Did this day have a quiz / assignment at all?
    const quizDays = new Set<number>();
    for (const r of (quizMeta.data ?? []) as Array<{ day_number: number }>) quizDays.add(r.day_number);

    const asgnByDay = new Map<number, number>();
    for (const r of (asgnMeta.data ?? []) as Array<{ day_number: number }>) {
      asgnByDay.set(r.day_number, (asgnByDay.get(r.day_number) ?? 0) + 1);
    }

    // Distinct attempters per day, and pass count (best attempt per user-day).
    type AttemptRow = {
      user_id: string;
      score: number | null;
      quizzes: { day_number: number } | Array<{ day_number: number }>;
    };
    const bestByDayUser = new Map<string, number>(); // key: `${day}-${uid}`
    for (const r of (attempts.data ?? []) as AttemptRow[]) {
      const q = Array.isArray(r.quizzes) ? r.quizzes[0] : r.quizzes;
      if (!q) continue;
      const key = `${q.day_number}-${r.user_id}`;
      const score = r.score ?? 0;
      if (score > (bestByDayUser.get(key) ?? -1)) bestByDayUser.set(key, score);
    }
    const attemptCountByDay = new Map<number, number>();
    const passCountByDay = new Map<number, number>();
    for (const [key, score] of bestByDayUser) {
      const day = Number(key.split("-")[0]);
      attemptCountByDay.set(day, (attemptCountByDay.get(day) ?? 0) + 1);
      if (score >= 60) passCountByDay.set(day, (passCountByDay.get(day) ?? 0) + 1);
    }

    // Distinct submitters per day.
    type SubRow = {
      user_id: string;
      assignments: { day_number: number } | Array<{ day_number: number }>;
    };
    const submittersByDay = new Map<number, Set<string>>();
    for (const r of (subs.data ?? []) as SubRow[]) {
      const a = Array.isArray(r.assignments) ? r.assignments[0] : r.assignments;
      if (!a) continue;
      let set = submittersByDay.get(a.day_number);
      if (!set) {
        set = new Set();
        submittersByDay.set(a.day_number, set);
      }
      set.add(r.user_id);
    }

    return dayNumbers
      .slice()
      .sort((a, b) => a - b)
      .map((day) => {
        const hasQuiz = quizDays.has(day);
        const submittable = asgnByDay.get(day) ?? 0;
        return {
          day_number: day,
          cohort_size: cohortSize,
          quiz_attempts: hasQuiz ? attemptCountByDay.get(day) ?? 0 : null,
          quiz_passed: hasQuiz ? passCountByDay.get(day) ?? 0 : null,
          submitted: submittable > 0 ? submittersByDay.get(day)?.size ?? 0 : null,
          submittable_assignments: submittable,
        };
      });
  },
);

export interface ActivityMatrixStudent {
  user_id: string;
  full_name: string | null;
  email: string;
  /** Map of day_number → distinct activity-type count (0–5). */
  by_day: Record<number, number>;
  /** Number of days in the requested window with at least one activity. */
  total_active_days: number;
}

/**
 * Per-student × per-day activity intensity (0–5) for the requested day window.
 * Intensity = number of distinct activity sources (submission, quiz, feedback,
 * poll vote, lab tick) observed on that day. Drives the Pulse heatmap.
 */
export const getActivityMatrix = cache(
  async (
    cohortId: string,
    dayNumbers: number[],
    excludeUserIds?: ReadonlyArray<string>,
  ): Promise<ActivityMatrixStudent[]> => {
    if (dayNumbers.length === 0) return [];
    const sb = await getSupabaseServer();
    const dayset = new Set(dayNumbers);
    const exclude = excludeUserIds ? new Set(excludeUserIds) : null;

    const [regs, subs, quizzes, feedback, votes, labs] = await Promise.all([
      sb
        .from("registrations")
        .select("user_id, profiles!inner(full_name, email)")
        .eq("cohort_id", cohortId)
        .eq("status", "confirmed"),
      sb
        .from("submissions")
        .select("user_id, assignments!inner(day_number, cohort_id)")
        .eq("assignments.cohort_id", cohortId),
      sb
        .from("quiz_attempts")
        .select("user_id, quizzes!inner(day_number, cohort_id)")
        .eq("quizzes.cohort_id", cohortId),
      sb
        .from("day_feedback")
        .select("user_id, day_number")
        .eq("cohort_id", cohortId),
      sb
        .from("poll_votes")
        .select("user_id, polls!inner(day_number, cohort_id)")
        .eq("polls.cohort_id", cohortId)
        .not("polls.day_number", "is", null),
      sb
        .from("lab_progress")
        .select("user_id, day_number")
        .eq("cohort_id", cohortId),
    ]);

    // For each (user, day) we accumulate which sources were seen.
    const sources = new Map<string, Set<string>>(); // key `${user}|${day}`
    const tag = (uid: string, day: number | null | undefined, src: string) => {
      if (typeof day !== "number" || !dayset.has(day)) return;
      if (exclude && exclude.has(uid)) return;
      const key = `${uid}|${day}`;
      const set = sources.get(key) ?? new Set<string>();
      set.add(src);
      sources.set(key, set);
    };

    for (const r of (subs.data ?? []) as Array<{
      user_id: string;
      assignments: { day_number: number } | Array<{ day_number: number }>;
    }>) {
      const a = Array.isArray(r.assignments) ? r.assignments[0] : r.assignments;
      tag(r.user_id, a?.day_number, "sub");
    }
    for (const r of (quizzes.data ?? []) as Array<{
      user_id: string;
      quizzes: { day_number: number } | Array<{ day_number: number }>;
    }>) {
      const q = Array.isArray(r.quizzes) ? r.quizzes[0] : r.quizzes;
      tag(r.user_id, q?.day_number, "quiz");
    }
    for (const r of (feedback.data ?? []) as Array<{
      user_id: string;
      day_number: number;
    }>) {
      tag(r.user_id, r.day_number, "fb");
    }
    for (const r of (votes.data ?? []) as Array<{
      user_id: string;
      polls: { day_number: number | null } | Array<{ day_number: number | null }>;
    }>) {
      const p = Array.isArray(r.polls) ? r.polls[0] : r.polls;
      tag(r.user_id, p?.day_number ?? null, "poll");
    }
    for (const r of (labs.data ?? []) as Array<{
      user_id: string;
      day_number: number;
    }>) {
      tag(r.user_id, r.day_number, "lab");
    }

    const roster = ((regs.data ?? []) as unknown as Array<{
      user_id: string;
      profiles: { full_name: string | null; email: string };
    }>)
      .filter((r) => !exclude || !exclude.has(r.user_id))
      .map((r) => {
      const by_day: Record<number, number> = {};
      let total_active_days = 0;
      for (const day of dayNumbers) {
        const set = sources.get(`${r.user_id}|${day}`);
        const n = set?.size ?? 0;
        by_day[day] = n;
        if (n > 0) total_active_days += 1;
      }
      return {
        user_id: r.user_id,
        full_name: r.profiles.full_name,
        email: r.profiles.email,
        by_day,
        total_active_days,
      };
    });

    // Sort: least-active first so at-risk surfaces at the top of the heatmap.
    return roster.sort((a, b) => {
      if (a.total_active_days !== b.total_active_days) {
        return a.total_active_days - b.total_active_days;
      }
      return (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email);
    });
  },
);

export const getAtRisk = cache(async (cohortId: string, threshold = 3): Promise<AtRiskRow[]> => {
  const sb = await getSupabaseServer();
  const [regs, atts, labs] = await Promise.all([
    sb.from("registrations").select("user_id, profiles!inner(full_name, email)").eq("cohort_id", cohortId).eq("status", "confirmed"),
    sb.from("attendance").select("user_id, status").eq("cohort_id", cohortId),
    sb.from("lab_progress").select("user_id, day_number, status").eq("cohort_id", cohortId).eq("status", "done"),
  ]);
  const present = new Map<string, number>();
  for (const a of (atts.data ?? []) as Array<{ user_id: string; status: string }>) {
    if (a.status === "present") present.set(a.user_id, (present.get(a.user_id) ?? 0) + 1);
  }
  const labsBy = new Map<string, Set<number>>();
  for (const r of (labs.data ?? []) as Array<{ user_id: string; day_number: number }>) {
    const set = labsBy.get(r.user_id) ?? new Set();
    set.add(r.day_number);
    labsBy.set(r.user_id, set);
  }
  const all = ((regs.data ?? []) as unknown as Array<{
    user_id: string;
    profiles: { full_name: string | null; email: string };
  }>).map((r) => ({
    user_id: r.user_id,
    full_name: r.profiles.full_name,
    email: r.profiles.email,
    days_present: present.get(r.user_id) ?? 0,
    labs_done: labsBy.get(r.user_id)?.size ?? 0,
  }));
  return all
    .filter((s) => s.days_present < threshold || s.labs_done < threshold)
    .sort((a, b) => a.days_present + a.labs_done - (b.days_present + b.labs_done));
});
