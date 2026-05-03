import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface RankedPodSummaryRow {
  pod_id: string;
  pod_name: string;
  member_count: number;
  total_score: number;
  avg_score: number;
  rank: number;
}

/**
 * Cohort-wide pod leaderboard sourced from `v_pod_score_summary` (added in
 * migration 0074). Ranks are computed in JS — dense ascending by total_score
 * desc with stable secondary order by pod_name.
 */
export const getCohortPodLeaderboard = cache(
  async (cohortId: string): Promise<RankedPodSummaryRow[]> => {
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("v_pod_score_summary")
      .select("pod_id, pod_name, member_count, total_score, avg_score")
      .eq("cohort_id", cohortId)
      .order("total_score", { ascending: false })
      .order("pod_name", { ascending: true });
    type Row = {
      pod_id: string;
      pod_name: string;
      member_count: number;
      total_score: number;
      avg_score: number;
    };
    const rows = (data ?? []) as Row[];
    return rows.map((r, i) => ({
      pod_id: r.pod_id,
      pod_name: r.pod_name,
      member_count: Number(r.member_count ?? 0),
      total_score: Number(r.total_score ?? 0),
      avg_score: Number(r.avg_score ?? 0),
      rank: i + 1,
    }));
  },
);

export interface RankedPodMemberRow {
  user_id: string;
  full_name: string | null;
  total_score: number;
  rank: number;
}

/**
 * Internal student ranking inside a single pod. Pulls totals from
 * `v_student_score` for the cohort and intersects with `pod_members`. Ranks
 * are 1-based, sorted by total_score desc.
 */
export const getMyPodMembers = cache(
  async (
    cohortId: string,
    podId: string,
  ): Promise<RankedPodMemberRow[]> => {
    const sb = await getSupabaseServer();
    const { data: members } = await sb
      .from("pod_members")
      .select("student_user_id")
      .eq("cohort_id", cohortId)
      .eq("pod_id", podId);
    const memberIds = ((members ?? []) as Array<{ student_user_id: string }>)
      .map((m) => m.student_user_id);
    if (memberIds.length === 0) return [];

    const [{ data: scores }, { data: profs }] = await Promise.all([
      sb
        .from("v_student_score")
        .select("user_id, total_score")
        .eq("cohort_id", cohortId)
        .in("user_id", memberIds),
      sb
        .from("profiles")
        .select("id, full_name")
        .in("id", memberIds),
    ]);

    const scoreById = new Map(
      ((scores ?? []) as Array<{ user_id: string; total_score: number }>).map(
        (r) => [r.user_id, Number(r.total_score ?? 0)],
      ),
    );
    const nameById = new Map(
      ((profs ?? []) as Array<{ id: string; full_name: string | null }>).map(
        (p) => [p.id, p.full_name],
      ),
    );

    return memberIds
      .map((uid) => ({
        user_id: uid,
        full_name: nameById.get(uid) ?? null,
        total_score: scoreById.get(uid) ?? 0,
      }))
      .sort((a, b) => {
        if (b.total_score !== a.total_score) return b.total_score - a.total_score;
        return (a.full_name ?? "").localeCompare(b.full_name ?? "");
      })
      .map((r, i) => ({ ...r, rank: i + 1 }));
  },
);
