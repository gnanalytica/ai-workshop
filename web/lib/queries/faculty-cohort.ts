import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getStudentActivity } from "@/lib/queries/activity-score";

export interface CohortPod {
  pod_id: string;
  name: string;
  member_count: number;
  faculty_count: number;
  faculty_names: string[];
  is_my_pod: boolean;
}

export interface CohortKpis {
  students: number;
  pods: number;
  unassignedStudents: number;
  pendingReview: number;
  helpDeskOpen: number;
  atRisk: number;
}

export type AtRiskSignal =
  | "no_activity"
  | "no_submissions"
  | "low_labs"
  | "open_help";

export interface AtRiskStudent {
  user_id: string;
  full_name: string | null;
  pod_name: string | null;
  days_since_active: number | null;
  reason: "no_activity" | "low_completion";
  signals: AtRiskSignal[];
  /** 0–100, share of unlocked days the student touched anything. */
  activity_score: number;
  /** 0–100, same but limited to the last 3 unlocked days. */
  recent_score: number;
  details: {
    submissions: number;
    labs_done: number;
    open_help_desk: number;
  };
}

export const getCohortKpis = cache(async (cohortId: string): Promise<CohortKpis> => {
  const sb = await getSupabaseServer();
  const [students, pods, assignedStudents, submitted, helpDesk] = await Promise.all([
    sb.from("registrations").select("user_id", { count: "exact", head: true })
      .eq("cohort_id", cohortId).eq("status", "confirmed"),
    sb.from("pods").select("id", { count: "exact", head: true }).eq("cohort_id", cohortId),
    sb.from("pod_members").select("student_user_id", { count: "exact", head: true })
      .eq("cohort_id", cohortId),
    sb.from("submissions").select("id, assignments!inner(cohort_id)", { count: "exact", head: true })
      .eq("status", "submitted").eq("assignments.cohort_id", cohortId),
    sb.from("help_desk_queue").select("id", { count: "exact", head: true })
      .eq("cohort_id", cohortId).in("status", ["open", "helping"]),
  ]);
  const total = students.count ?? 0;
  const assigned = assignedStudents.count ?? 0;
  return {
    students: total,
    pods: pods.count ?? 0,
    unassignedStudents: Math.max(0, total - assigned),
    pendingReview: submitted.count ?? 0,
    helpDeskOpen: helpDesk.count ?? 0,
    atRisk: 0,
  };
});

export const listCohortPods = cache(async (cohortId: string, myUserId: string): Promise<CohortPod[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("pods")
    .select("id, name, pod_members(count), pod_faculty(faculty_user_id, profiles:faculty_user_id(full_name))")
    .eq("cohort_id", cohortId)
    .order("name");
  return ((data ?? []) as unknown as Array<{
    id: string; name: string;
    pod_members: Array<{ count: number }>;
    pod_faculty: Array<{ faculty_user_id: string; profiles: { full_name: string | null } | null }>;
  }>).map((p) => ({
    pod_id: p.id,
    name: p.name,
    member_count: p.pod_members?.[0]?.count ?? 0,
    faculty_count: p.pod_faculty?.length ?? 0,
    faculty_names: p.pod_faculty.map((f) => f.profiles?.full_name).filter((n): n is string => !!n),
    is_my_pod: p.pod_faculty.some((f) => f.faculty_user_id === myUserId),
  }));
});

export const listAtRiskStudents = cache(async (cohortId: string): Promise<AtRiskStudent[]> => {
  const sb = await getSupabaseServer();
  const { data: regs } = await sb
    .from("registrations")
    .select("user_id, profiles!inner(full_name), pod_members!left(pods(name))")
    .eq("cohort_id", cohortId)
    .eq("status", "confirmed");
  type Reg = {
    user_id: string;
    profiles: { full_name: string | null };
    pod_members: Array<{ pods: { name: string | null } | null }>;
  };
  const list = (regs ?? []) as unknown as Reg[];
  if (list.length === 0) return [];

  const userIds = list.map((r) => r.user_id);
  const [activity, { data: helpDesk }] = await Promise.all([
    getStudentActivity(cohortId, userIds),
    sb
      .from("help_desk_queue")
      .select("user_id")
      .eq("cohort_id", cohortId)
      .in("status", ["open", "helping"])
      .in("user_id", userIds),
  ]);

  const helpDeskByUser = new Map<string, number>();
  ((helpDesk ?? []) as Array<{ user_id: string }>).forEach((r) => {
    helpDeskByUser.set(r.user_id, (helpDeskByUser.get(r.user_id) ?? 0) + 1);
  });

  const enriched: AtRiskStudent[] = list.map((r) => {
    const a = activity.get(r.user_id);
    const score = a?.score ?? 0;
    const recentScore = a?.recent_score ?? 0;
    const daysSinceActive = a?.days_since_active ?? null;
    const subs = a?.signals.submissions ?? 0;
    const labs = a?.signals.lab_progress ?? 0;
    const helpDeskCount = helpDeskByUser.get(r.user_id) ?? 0;

    // Trigger rules — every signal has to have evidence behind it, otherwise
    // the at-risk list becomes noise. The recent_score === 0 check replaces
    // the old lab-only "no recent activity" fallacy.
    const inactiveRecently =
      recentScore === 0 || (daysSinceActive !== null && daysSinceActive >= 3);
    const signals: AtRiskSignal[] = [];
    if (inactiveRecently) signals.push("no_activity");
    if (subs === 0 && (a?.unlocked_days ?? 0) >= 2) signals.push("no_submissions");
    if (labs === 0 && (a?.unlocked_days ?? 0) >= 3) signals.push("low_labs");
    if (helpDeskCount > 0) signals.push("open_help");

    return {
      user_id: r.user_id,
      full_name: r.profiles.full_name,
      pod_name: r.pod_members?.[0]?.pods?.name ?? null,
      days_since_active: daysSinceActive,
      reason: inactiveRecently ? "no_activity" : "low_completion",
      signals,
      activity_score: score,
      recent_score: recentScore,
      details: {
        submissions: subs,
        labs_done: labs,
        open_help_desk: helpDeskCount,
      },
    };
  });

  // Surface anyone with at least one signal OR a clearly low score.
  return enriched
    .filter((s) => s.signals.length > 0 || s.activity_score < 40)
    .sort((a, b) => {
      const aw = a.signals.length * 100 + (100 - a.activity_score);
      const bw = b.signals.length * 100 + (100 - b.activity_score);
      return bw - aw;
    })
    .slice(0, 50);
});

export interface PodKpis {
  members: number;
  attendancePct: number;
  submissionPct: number;
  helpDeskOpen: number;
  avgFeedbackRating: number | null;
  feedbackResponses: number;
  pulseGotItPct: number | null;
}

export const getPodKpis = cache(
  async (cohortId: string, podId: string): Promise<PodKpis> => {
    const sb = await getSupabaseServer();
    const { data: memberRows } = await sb
      .from("pod_members")
      .select("student_user_id")
      .eq("pod_id", podId)
      .eq("cohort_id", cohortId);
    const memberIds = ((memberRows ?? []) as Array<{ student_user_id: string }>).map(
      (m) => m.student_user_id,
    );
    const members = memberIds.length;

    if (members === 0) {
      return {
        members: 0,
        attendancePct: 0,
        submissionPct: 0,
        helpDeskOpen: 0,
        avgFeedbackRating: null,
        feedbackResponses: 0,
        pulseGotItPct: null,
      };
    }

    const [daysRes, attRes, asgnRes, subsRes, helpRes, fbRes, pulseRes] =
      await Promise.all([
        sb
          .from("cohort_days")
          .select("day_number", { count: "exact", head: true })
          .eq("cohort_id", cohortId)
          .eq("is_unlocked", true),
        sb
          .from("attendance")
          .select("user_id", { count: "exact", head: true })
          .eq("cohort_id", cohortId)
          .eq("status", "present")
          .in("user_id", memberIds),
        sb
          .from("assignments")
          .select("id", { count: "exact", head: true })
          .eq("cohort_id", cohortId),
        sb
          .from("submissions")
          .select("user_id, assignments!inner(cohort_id)", {
            count: "exact",
            head: true,
          })
          .eq("assignments.cohort_id", cohortId)
          .in("user_id", memberIds),
        sb
          .from("help_desk_queue")
          .select("id", { count: "exact", head: true })
          .eq("cohort_id", cohortId)
          .in("status", ["open", "helping"])
          .in("user_id", memberIds),
        sb
          .from("day_feedback")
          .select("rating, day_number")
          .eq("cohort_id", cohortId)
          .in("user_id", memberIds)
          .order("day_number", { ascending: false })
          .limit(200),
        sb
          .from("polls")
          .select("id, kind, opened_at")
          .eq("cohort_id", cohortId)
          .eq("kind", "pulse")
          .order("opened_at", { ascending: false })
          .limit(5),
      ]);

    const unlockedDays = daysRes.count ?? 0;
    const attendanceDen = members * Math.max(1, unlockedDays);
    const attendancePct =
      attendanceDen > 0
        ? Math.round(((attRes.count ?? 0) / attendanceDen) * 100)
        : 0;

    const totalAssignments = asgnRes.count ?? 0;
    const submissionDen = members * Math.max(1, totalAssignments);
    const submissionPct =
      submissionDen > 0
        ? Math.round(((subsRes.count ?? 0) / submissionDen) * 100)
        : 0;

    const fbRows = (fbRes.data ?? []) as Array<{
      rating: number;
      day_number: number;
    }>;
    const last3Days = Array.from(new Set(fbRows.map((r) => r.day_number)))
      .slice(0, 3);
    const last3 = fbRows.filter((r) => last3Days.includes(r.day_number));
    const avgFeedbackRating =
      last3.length > 0
        ? Math.round((last3.reduce((s, r) => s + r.rating, 0) / last3.length) * 10) /
          10
        : null;

    const pulses = (pulseRes.data ?? []) as Array<{ id: string; kind: string }>;
    let pulseGotItPct: number | null = null;
    if (pulses.length > 0) {
      const results = await Promise.all(
        pulses.map(
          (p) =>
            (sb.rpc as unknown as (
              fn: string,
              args: Record<string, unknown>,
            ) => Promise<{
              data: Array<{ choice: string; label: string; votes: number }> | null;
            }>)("rpc_poll_results", { p_poll: p.id }),
        ),
      );
      let got = 0;
      let total = 0;
      for (const r of results) {
        for (const row of r.data ?? []) {
          const votes = Number(row.votes ?? 0);
          total += votes;
          const c = String(row.choice ?? "").toLowerCase();
          const l = String(row.label ?? "").toLowerCase();
          if (
            c === "got_it" ||
            c === "got" ||
            l.includes("got") ||
            l.includes("clear")
          ) {
            got += votes;
          }
        }
      }
      pulseGotItPct = total > 0 ? Math.round((got / total) * 100) : null;
    }

    return {
      members,
      attendancePct,
      submissionPct,
      helpDeskOpen: helpRes.count ?? 0,
      avgFeedbackRating,
      feedbackResponses: last3.length,
      pulseGotItPct,
    };
  },
);

export const listAtRiskInPod = cache(
  async (cohortId: string, podId: string): Promise<AtRiskStudent[]> => {
    const sb = await getSupabaseServer();
    const { data: memberRows } = await sb
      .from("pod_members")
      .select("student_user_id")
      .eq("pod_id", podId)
      .eq("cohort_id", cohortId);
    const ids = new Set(
      ((memberRows ?? []) as Array<{ student_user_id: string }>).map(
        (m) => m.student_user_id,
      ),
    );
    if (ids.size === 0) return [];
    const all = await listAtRiskStudents(cohortId);
    return all.filter((s) => ids.has(s.user_id));
  },
);

export interface DayFeedbackSummary {
  day_number: number;
  total_responses: number;
  avg_rating: number | null;
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
}

export const listRecentDayFeedback = cache(
  async (
    cohortId: string,
    dayNumbers: number[],
    podId?: string | null,
  ): Promise<DayFeedbackSummary[]> => {
    if (dayNumbers.length === 0) return [];
    const sb = await getSupabaseServer();
    const summaries = await Promise.all(
      dayNumbers.map(async (day) => {
        const { data } = await (sb.rpc as unknown as (
          fn: string,
          args: Record<string, unknown>,
        ) => Promise<{
          data: Array<{
            total_responses: number;
            avg_rating: number | null;
            rating_1: number;
            rating_2: number;
            rating_3: number;
            rating_4: number;
            rating_5: number;
          }> | null;
        }>)("rpc_day_feedback_summary", {
          p_cohort: cohortId,
          p_day: day,
          p_pod: podId ?? null,
        });
        const row = (data ?? [])[0];
        if (!row) {
          return {
            day_number: day,
            total_responses: 0,
            avg_rating: null,
            rating_1: 0,
            rating_2: 0,
            rating_3: 0,
            rating_4: 0,
            rating_5: 0,
          } as DayFeedbackSummary;
        }
        return {
          day_number: day,
          total_responses: Number(row.total_responses ?? 0),
          avg_rating: row.avg_rating === null ? null : Number(row.avg_rating),
          rating_1: Number(row.rating_1 ?? 0),
          rating_2: Number(row.rating_2 ?? 0),
          rating_3: Number(row.rating_3 ?? 0),
          rating_4: Number(row.rating_4 ?? 0),
          rating_5: Number(row.rating_5 ?? 0),
        };
      }),
    );
    return summaries;
  },
);

export interface RecentPulse {
  id: string;
  question: string;
  opened_at: string;
  closed_at: string | null;
  results: Array<{ choice: string; label: string; votes: number }>;
  total_votes: number;
}

export const listRecentPulses = cache(
  async (cohortId: string, limit = 3): Promise<RecentPulse[]> => {
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("polls")
      .select("id, question, opened_at, closed_at")
      .eq("cohort_id", cohortId)
      .eq("kind", "pulse")
      .order("opened_at", { ascending: false })
      .limit(limit);
    const rows = (data ?? []) as Array<{
      id: string;
      question: string;
      opened_at: string;
      closed_at: string | null;
    }>;
    if (rows.length === 0) return [];
    const results = await Promise.all(
      rows.map(
        (r) =>
          (sb.rpc as unknown as (
            fn: string,
            args: Record<string, unknown>,
          ) => Promise<{
            data: Array<{ choice: string; label: string; votes: number }> | null;
          }>)("rpc_poll_results", { p_poll: r.id }),
      ),
    );
    return rows.map((r, i) => {
      const rs = (results[i]?.data ?? []).map((x) => ({
        choice: x.choice,
        label: x.label,
        votes: Number(x.votes ?? 0),
      }));
      return {
        id: r.id,
        question: r.question,
        opened_at: r.opened_at,
        closed_at: r.closed_at,
        results: rs,
        total_votes: rs.reduce((s, x) => s + x.votes, 0),
      };
    });
  },
);

export interface ScoreRow {
  user_id: string;
  full_name: string | null;
  pod_name: string | null;
  quiz_score: number;
  submission_score: number;
  activity_score: number;
  total_score: number;
}

export const listStudentLeaderboard = cache(async (cohortId: string): Promise<ScoreRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("v_student_score")
    .select("user_id, quiz_score, submission_score, activity_score, total_score")
    .eq("cohort_id", cohortId)
    .order("total_score", { ascending: false })
    .limit(100);
  type Row = {
    user_id: string;
    quiz_score: number; submission_score: number;
    activity_score: number; total_score: number;
  };
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return [];
  const userIds = rows.map((r) => r.user_id);
  const { data: profs } = await sb
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);
  const { data: members } = await sb
    .from("pod_members")
    .select("student_user_id, pods!inner(name, cohort_id)")
    .eq("pods.cohort_id", cohortId)
    .in("student_user_id", userIds);
  const nameById = new Map(((profs ?? []) as Array<{ id: string; full_name: string | null }>).map((p) => [p.id, p.full_name]));
  const podByStudent = new Map(((members ?? []) as unknown as Array<{ student_user_id: string; pods: { name: string } }>).map((m) => [m.student_user_id, m.pods.name]));
  return rows.map((r) => ({
    user_id: r.user_id,
    full_name: nameById.get(r.user_id) ?? null,
    pod_name: podByStudent.get(r.user_id) ?? null,
    quiz_score: Number(r.quiz_score),
    submission_score: Number(r.submission_score),
    activity_score: Number(r.activity_score),
    total_score: Number(r.total_score),
  }));
});

export interface PodScoreRow {
  pod_id: string;
  pod_name: string;
  member_count: number;
  total_score: number;
  avg_score: number;
}

export const listPodLeaderboard = cache(async (cohortId: string): Promise<PodScoreRow[]> => {
  const students = await listStudentLeaderboard(cohortId);
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("pods")
    .select("id, name, pod_members(student_user_id)")
    .eq("cohort_id", cohortId);
  const pods = (data ?? []) as unknown as Array<{ id: string; name: string; pod_members: Array<{ student_user_id: string }> }>;
  const scoreById = new Map(students.map((s) => [s.user_id, s.total_score]));
  return pods
    .map((p) => {
      const members = p.pod_members ?? [];
      const total = members.reduce((acc, m) => acc + (scoreById.get(m.student_user_id) ?? 0), 0);
      return {
        pod_id: p.id,
        pod_name: p.name,
        member_count: members.length,
        total_score: total,
        avg_score: members.length > 0 ? Math.round(total / members.length) : 0,
      };
    })
    .sort((a, b) => b.total_score - a.total_score);
});

export interface TeamScoreRow {
  team_id: string;
  team_name: string;
  member_count: number;
  total_score: number;
  avg_score: number;
}

export const listTeamLeaderboard = cache(async (cohortId: string): Promise<TeamScoreRow[]> => {
  const students = await listStudentLeaderboard(cohortId);
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("teams")
    .select("id, name, team_members(user_id)")
    .eq("cohort_id", cohortId);
  const teams = (data ?? []) as unknown as Array<{ id: string; name: string; team_members: Array<{ user_id: string }> }>;
  const scoreById = new Map(students.map((s) => [s.user_id, s.total_score]));
  return teams
    .map((t) => {
      const members = t.team_members ?? [];
      const total = members.reduce((acc, m) => acc + (scoreById.get(m.user_id) ?? 0), 0);
      return {
        team_id: t.id,
        team_name: t.name,
        member_count: members.length,
        total_score: total,
        avg_score: members.length > 0 ? Math.round(total / members.length) : 0,
      };
    })
    .sort((a, b) => b.total_score - a.total_score);
});
