import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export type CapstoneStatus = "exploring" | "locked" | "building" | "shipped";

export interface CapstoneProject {
  id: string;
  cohort_id: string;
  user_id: string;
  title: string | null;
  problem_statement: string | null;
  target_user: string | null;
  repo_url: string | null;
  demo_url: string | null;
  status: CapstoneStatus;
  created_at: string;
  updated_at: string;
}

export type AssignmentKind = "lab" | "capstone" | "reflection";

export interface CapstoneMilestoneSubmission {
  assignment_id: string;
  assignment_title: string;
  day_number: number;
  milestone_number: number;
  kind: AssignmentKind;
  body: string | null;
  links: { label: string; url: string }[];
  status: "draft" | "submitted" | "graded";
  score: number | null;
  feedback_md: string | null;
  faculty_notes_md: string | null;
  human_reviewed_at: string | null;
  updated_at: string;
}

export interface CapstoneMilestoneGroup {
  milestone_number: number;
  start_day: number;
  brief: CapstoneMilestoneSubmission | null;
  reflection: CapstoneMilestoneSubmission | null;
  extras: CapstoneMilestoneSubmission[];
  status: "not_started" | "drafting" | "submitted" | "graded";
}

export const getMyCapstone = cache(
  async (cohortId: string): Promise<CapstoneProject | null> => {
    const sb = await getSupabaseServer();
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return null;
    const { data } = await sb
      .from("capstone_projects")
      .select("*")
      .eq("cohort_id", cohortId)
      .eq("user_id", user.user.id)
      .maybeSingle();
    return (data as CapstoneProject | null) ?? null;
  },
);

export const getMyCapstoneMilestones = cache(
  async (cohortId: string): Promise<CapstoneMilestoneSubmission[]> => {
    const sb = await getSupabaseServer();
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return [];
    const { data } = await sb
      .from("assignments")
      .select(
        "id, title, day_number, milestone_number, kind, submissions(body, links, status, score, feedback_md, faculty_notes_md, human_reviewed_at, updated_at, user_id)",
      )
      .eq("cohort_id", cohortId)
      .not("milestone_number", "is", null)
      .order("milestone_number")
      .order("day_number")
      .order("kind");
    if (!data) return [];
    type Row = {
      id: string; title: string; day_number: number;
      milestone_number: number; kind: AssignmentKind;
      submissions: Array<{
        body: string | null;
        links: { label: string; url: string }[] | null;
        status: "draft" | "submitted" | "graded";
        score: number | null;
        feedback_md: string | null;
        faculty_notes_md: string | null;
        human_reviewed_at: string | null;
        updated_at: string;
        user_id: string;
      }>;
    };
    return (data as unknown as Row[]).map((a) => {
      const mine = a.submissions?.find((s) => s.user_id === user.user!.id) ?? null;
      return {
        assignment_id: a.id,
        assignment_title: a.title,
        day_number: a.day_number,
        milestone_number: a.milestone_number,
        kind: a.kind,
        body: mine?.body ?? null,
        links: mine?.links ?? [],
        status: mine?.status ?? "draft",
        score: mine?.human_reviewed_at ? mine.score : null,
        feedback_md: mine?.human_reviewed_at ? mine.feedback_md : null,
        faculty_notes_md: mine?.faculty_notes_md ?? null,
        human_reviewed_at: mine?.human_reviewed_at ?? null,
        updated_at: mine?.updated_at ?? "",
      };
    });
  },
);

export function groupCapstoneMilestones(
  rows: CapstoneMilestoneSubmission[],
): CapstoneMilestoneGroup[] {
  const byNumber = new Map<number, CapstoneMilestoneGroup>();
  for (const row of rows) {
    const n = row.milestone_number;
    let g = byNumber.get(n);
    if (!g) {
      g = {
        milestone_number: n,
        start_day: row.day_number,
        brief: null,
        reflection: null,
        extras: [],
        status: "not_started",
      };
      byNumber.set(n, g);
    }
    g.start_day = Math.min(g.start_day, row.day_number);
    if (row.kind === "reflection") g.reflection = row;
    else if (!g.brief && (row.kind === "capstone" || row.kind === "lab")) g.brief = row;
    else g.extras.push(row);
  }
  for (const g of byNumber.values()) {
    const all = [g.brief, g.reflection, ...g.extras].filter(
      (x): x is CapstoneMilestoneSubmission => !!x,
    );
    if (all.some((s) => s.human_reviewed_at)) g.status = "graded";
    else if (all.some((s) => s.status === "submitted")) g.status = "submitted";
    else if (all.some((s) => s.body || s.links.length)) g.status = "drafting";
    else g.status = "not_started";
  }
  return Array.from(byNumber.values()).sort(
    (a, b) => a.milestone_number - b.milestone_number,
  );
}

export interface CohortCapstoneRow {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  project: CapstoneProject | null;
  milestones_done: number;
  milestones_total: number;
}

export const listCohortCapstones = cache(
  async (cohortId: string): Promise<CohortCapstoneRow[]> => {
    const sb = await getSupabaseServer();
    const [regsRes, projectsRes, capstoneAssignmentsRes] = await Promise.all([
      sb
        .from("registrations")
        .select("user_id, profiles:user_id(full_name, email)")
        .eq("cohort_id", cohortId)
        .eq("status", "confirmed"),
      sb
        .from("capstone_projects")
        .select("*")
        .eq("cohort_id", cohortId),
      sb
        .from("assignments")
        .select("id, milestone_number, submissions(user_id, status, human_reviewed_at)")
        .eq("cohort_id", cohortId)
        .not("milestone_number", "is", null)
        .neq("kind", "reflection"),
    ]);

    const projects = new Map<string, CapstoneProject>();
    for (const p of (projectsRes.data ?? []) as CapstoneProject[]) projects.set(p.user_id, p);

    type CapsAssignmentRow = {
      id: string;
      milestone_number: number;
      submissions: Array<{ user_id: string; status: string; human_reviewed_at: string | null }>;
    };
    const capsAssignments = (capstoneAssignmentsRes.data ?? []) as unknown as CapsAssignmentRow[];
    const milestonesTotal = new Set(capsAssignments.map((a) => a.milestone_number)).size;
    const doneByUser = new Map<string, Set<number>>();
    for (const a of capsAssignments) {
      for (const s of a.submissions ?? []) {
        if (s.human_reviewed_at) {
          let set = doneByUser.get(s.user_id);
          if (!set) {
            set = new Set();
            doneByUser.set(s.user_id, set);
          }
          set.add(a.milestone_number);
        }
      }
    }

    type RegRow = { user_id: string; profiles: { full_name: string | null; email: string | null } | null };
    return ((regsRes.data ?? []) as unknown as RegRow[])
      .map((r) => ({
        user_id: r.user_id,
        user_name: r.profiles?.full_name ?? null,
        user_email: r.profiles?.email ?? null,
        project: projects.get(r.user_id) ?? null,
        milestones_done: doneByUser.get(r.user_id)?.size ?? 0,
        milestones_total: milestonesTotal,
      }))
      .sort((a, b) => (a.user_name ?? "").localeCompare(b.user_name ?? ""));
  },
);
