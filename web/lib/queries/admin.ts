import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface AdminCohortKpis {
  confirmed: number;
  pending: number;
  faculty: number;
  pods: number;
}

export interface RosterRow {
  user_id: string;
  full_name: string | null;
  email: string;
  college: string | null;
  status: "pending" | "confirmed" | "waitlist" | "cancelled";
  source: string | null;
  pod_name: string | null;
  created_at: string;
}

export interface PodRow {
  pod_id: string;
  cohort_id: string;
  name: string;
  member_count: number;
  faculty_count: number;
  faculty_names: string[];
}

export interface FacultyRow {
  user_id: string;
  full_name: string | null;
  email: string;
  pods: number;
}

export interface AttentionItem {
  kind: "pending_reg" | "pod_no_faculty" | "help_desk_stale" | "ungraded_old";
  label: string;
  hint: string;
  href: string;
  count: number;
}

/**
 * Single-call attention rollup for the admin cohort overview.
 *
 * Items: pending registrations · pods without faculty · help-desk tickets
 * open >24h · submissions submitted >3 days ago and still ungraded.
 *
 * Returned in priority order. Items with count=0 are filtered out before
 * render, so the card stays empty (= nothing to do) when the cohort is
 * tidy.
 */
export const getAdminAttentionItems = cache(
  async (cohortId: string): Promise<AttentionItem[]> => {
    const sb = await getSupabaseServer();
    const now = Date.now();
    const dayAgo = new Date(now - 24 * 3600_000).toISOString();
    const threeDaysAgo = new Date(now - 3 * 86_400_000).toISOString();

    const [pending, podsNoFac, helpStale, ungraded] = await Promise.all([
      sb
        .from("registrations")
        .select("user_id", { count: "exact", head: true })
        .eq("cohort_id", cohortId)
        .eq("status", "pending"),
      sb
        .from("pods")
        .select("id, pod_faculty(faculty_user_id)")
        .eq("cohort_id", cohortId),
      sb
        .from("help_desk_queue")
        .select("id", { count: "exact", head: true })
        .eq("cohort_id", cohortId)
        .eq("status", "open")
        .lt("created_at", dayAgo),
      sb
        .from("submissions")
        .select("id, assignments!inner(cohort_id)", { count: "exact", head: true })
        .eq("assignments.cohort_id", cohortId)
        .eq("status", "submitted")
        .is("human_reviewed_at", null)
        .lt("updated_at", threeDaysAgo),
    ]);

    type PodWithFac = { id: string; pod_faculty: Array<{ faculty_user_id: string }> };
    const podsList = (podsNoFac.data ?? []) as unknown as PodWithFac[];
    const podNoFacCount = podsList.filter((p) => (p.pod_faculty ?? []).length === 0).length;

    const items: AttentionItem[] = [
      {
        kind: "pending_reg",
        label: "Pending registrations",
        hint: "Confirm so students can log in",
        href: `/admin/cohorts/${cohortId}/roster?status=pending`,
        count: pending.count ?? 0,
      },
      {
        kind: "pod_no_faculty",
        label: "Pods without faculty",
        hint: "Assign a coach before next class",
        href: `/admin/cohorts/${cohortId}/pods`,
        count: podNoFacCount,
      },
      {
        kind: "help_desk_stale",
        label: "Help desk · open >24h",
        hint: "These are escalations to look at",
        href: `/admin/cohorts/${cohortId}/help-desk`,
        count: helpStale.count ?? 0,
      },
      {
        kind: "ungraded_old",
        label: "Ungraded · submitted >3 days ago",
        hint: "Grade or send back for rework",
        href: `/admin/cohorts/${cohortId}/grading?filter=ungraded`,
        count: ungraded.count ?? 0,
      },
    ];

    return items.filter((it) => it.count > 0);
  },
);

export const getAdminCohortKpis = cache(async (cohortId: string): Promise<AdminCohortKpis> => {
  const sb = await getSupabaseServer();
  const [conf, pend, fac, pods] = await Promise.all([
    sb.from("registrations").select("user_id", { count: "exact", head: true }).eq("cohort_id", cohortId).eq("status", "confirmed"),
    sb.from("registrations").select("user_id", { count: "exact", head: true }).eq("cohort_id", cohortId).eq("status", "pending"),
    sb.from("cohort_faculty").select("user_id", { count: "exact", head: true }).eq("cohort_id", cohortId),
    sb.from("pods").select("id", { count: "exact", head: true }).eq("cohort_id", cohortId),
  ]);
  return {
    confirmed: conf.count ?? 0,
    pending: pend.count ?? 0,
    faculty: fac.count ?? 0,
    pods: pods.count ?? 0,
  };
});

export const listRoster = cache(async (cohortId: string): Promise<RosterRow[]> => {
  const sb = await getSupabaseServer();
  // Two separate queries instead of one embed: pod_members has no FK to
  // registrations (only to profiles + cohorts), so PostgREST sometimes
  // can't infer the join and silently returns nothing. We split + stitch
  // to keep the roster reliable. Drop `profiles!inner` defensively too —
  // a left-style embed surfaces orphan registrations rather than hiding
  // them, and logs any error instead of silently swallowing it.
  const { data: regData, error: regErr } = await sb
    .from("registrations")
    .select("user_id, status, source, created_at, profiles(full_name, email, college)")
    .eq("cohort_id", cohortId)
    .order("created_at", { ascending: false });
  if (regErr) {
    console.error("[listRoster] registrations query failed", regErr);
    return [];
  }
  const regs = (regData ?? []) as unknown as Array<{
    user_id: string;
    status: RosterRow["status"];
    source: string | null;
    created_at: string;
    profiles: { full_name: string | null; email: string; college: string | null } | null;
  }>;

  // Pod assignments — fetch once for this cohort, index by user_id.
  let podByUser = new Map<string, string>();
  if (regs.length > 0) {
    const userIds = regs.map((r) => r.user_id);
    const { data: pmData, error: pmErr } = await sb
      .from("pod_members")
      .select("student_user_id, pods!inner(name)")
      .eq("cohort_id", cohortId)
      .in("student_user_id", userIds);
    if (pmErr) {
      console.warn("[listRoster] pod_members lookup failed; pods will be blank", pmErr);
    } else {
      podByUser = new Map(
        ((pmData ?? []) as unknown as Array<{
          student_user_id: string;
          pods: { name: string };
        }>).map((p) => [p.student_user_id, p.pods.name]),
      );
    }
  }

  return regs.map((r) => ({
    user_id: r.user_id,
    full_name: r.profiles?.full_name ?? null,
    email: r.profiles?.email ?? "",
    college: r.profiles?.college ?? null,
    status: r.status,
    source: r.source,
    pod_name: podByUser.get(r.user_id) ?? null,
    created_at: r.created_at,
  }));
});

export const listPods = cache(async (cohortId: string): Promise<PodRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("pods")
    .select(
      "id, cohort_id, name, pod_members(count), pod_faculty(faculty_user_id, profiles:faculty_user_id(full_name))",
    )
    .eq("cohort_id", cohortId)
    .order("name");
  return ((data ?? []) as unknown as Array<{
    id: string; cohort_id: string; name: string;
    pod_members: Array<{ count: number }>;
    pod_faculty: Array<{ faculty_user_id: string; profiles: { full_name: string | null } | null }>;
  }>).map((p) => ({
    pod_id: p.id,
    cohort_id: p.cohort_id,
    name: p.name,
    member_count: p.pod_members?.[0]?.count ?? 0,
    faculty_count: p.pod_faculty?.length ?? 0,
    faculty_names: p.pod_faculty
      .map((f) => f.profiles?.full_name)
      .filter((n): n is string => !!n),
  }));
});

export const listFaculty = cache(async (cohortId: string): Promise<FacultyRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("cohort_faculty")
    .select("user_id, profiles!inner(full_name, email)")
    .eq("cohort_id", cohortId);
  return ((data ?? []) as unknown as Array<{
    user_id: string;
    profiles: { full_name: string | null; email: string };
  }>).map((r) => ({
    user_id: r.user_id,
    full_name: r.profiles.full_name,
    email: r.profiles.email,
    pods: 0, // can be filled via second query if needed
  }));
});
