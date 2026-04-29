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

export interface CapstoneMilestoneSubmission {
  assignment_id: string;
  assignment_title: string;
  day_number: number;
  body: string | null;
  links: { label: string; url: string }[];
  status: "draft" | "submitted" | "graded";
  score: number | null;
  feedback_md: string | null;
  human_reviewed_at: string | null;
  updated_at: string;
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
        "id, title, day_number, submissions(body, links, status, score, feedback_md, human_reviewed_at, updated_at, user_id)",
      )
      .eq("cohort_id", cohortId)
      .eq("kind", "capstone")
      .order("day_number");
    if (!data) return [];
    type Row = {
      id: string; title: string; day_number: number;
      submissions: Array<{
        body: string | null;
        links: { label: string; url: string }[] | null;
        status: "draft" | "submitted" | "graded";
        score: number | null;
        feedback_md: string | null;
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
        body: mine?.body ?? null,
        links: mine?.links ?? [],
        status: mine?.status ?? "draft",
        score: mine?.human_reviewed_at ? mine.score : null,
        feedback_md: mine?.human_reviewed_at ? mine.feedback_md : null,
        human_reviewed_at: mine?.human_reviewed_at ?? null,
        updated_at: mine?.updated_at ?? "",
      };
    });
  },
);

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
        .select("id, submissions(user_id, status, human_reviewed_at)")
        .eq("cohort_id", cohortId)
        .eq("kind", "capstone"),
    ]);

    const projects = new Map<string, CapstoneProject>();
    for (const p of (projectsRes.data ?? []) as CapstoneProject[]) projects.set(p.user_id, p);

    type CapsAssignmentRow = {
      id: string;
      submissions: Array<{ user_id: string; status: string; human_reviewed_at: string | null }>;
    };
    const capsAssignments = (capstoneAssignmentsRes.data ?? []) as unknown as CapsAssignmentRow[];
    const milestonesTotal = capsAssignments.length;
    const doneByUser = new Map<string, number>();
    for (const a of capsAssignments) {
      for (const s of a.submissions ?? []) {
        if (s.human_reviewed_at) {
          doneByUser.set(s.user_id, (doneByUser.get(s.user_id) ?? 0) + 1);
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
        milestones_done: doneByUser.get(r.user_id) ?? 0,
        milestones_total: milestonesTotal,
      }))
      .sort((a, b) => (a.user_name ?? "").localeCompare(b.user_name ?? ""));
  },
);
