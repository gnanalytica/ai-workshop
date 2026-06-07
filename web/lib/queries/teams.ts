import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

// ---------------------------------------------------------------------------
// Legacy shape — still consumed by the admin roster "Teams" tab. Kept stable.
// ---------------------------------------------------------------------------
export interface TeamRow {
  id: string;
  cohort_id: string;
  name: string;
  member_count: number;
  members: { user_id: string; full_name: string | null }[];
}

export const listTeams = cache(async (cohortId: string): Promise<TeamRow[]> => {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("teams")
    .select("id, cohort_id, name, team_members(user_id, profiles(full_name))")
    .eq("cohort_id", cohortId)
    .order("name");
  if (error) return [];
  return ((data ?? []) as unknown as Array<{
    id: string; cohort_id: string; name: string;
    team_members: Array<{ user_id: string; profiles: { full_name: string | null } | null }>;
  }>).map((t) => ({
    id: t.id,
    cohort_id: t.cohort_id,
    name: t.name,
    member_count: t.team_members.length,
    members: t.team_members.map((m) => ({ user_id: m.user_id, full_name: m.profiles?.full_name ?? null })),
  }));
});

// ---------------------------------------------------------------------------
// Team capstone — final group deliverable (migration 0115).
// ---------------------------------------------------------------------------

export type TeamSubmissionStatus = "draft" | "submitted";

export interface TeamMember {
  user_id: string;
  full_name: string | null;
  roll_number: string | null;
}

export interface TeamSubmission {
  team_id: string;
  cohort_id: string;
  title: string | null;
  pitch: string | null;
  chosen_idea: string | null;
  presentation_url: string | null;
  product_url: string | null;
  repo_url: string | null;
  demo_video_url: string | null;
  cover_image_url: string | null;
  status: TeamSubmissionStatus;
  unlocked: boolean;
  submitted_at: string | null;
  updated_at: string;
}

export interface TeamGrade {
  team_id: string;
  score: number | null;
  feedback_md: string | null;
  reviewed_at: string;
}

export interface MyTeam {
  id: string;
  cohort_id: string;
  name: string;
  team_number: number | null;
  pitched_ideas: string[];
  members: TeamMember[];
  submission: TeamSubmission | null;
  grade: TeamGrade | null;
  /** True when the deadline has not passed (or the team is admin-unlocked). */
  editable: boolean;
  deadline: string | null;
}

function asIdeas(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  return [];
}

/** The signed-in student's team for this cohort, with deliverable + grade. */
export const getMyTeam = cache(
  async (cohortId: string): Promise<MyTeam | null> => {
    const sb = await getSupabaseServer();
    const user = await getSession();
    if (!user) return null;

    const { data: mem } = await sb
      .from("team_members")
      .select("team_id, teams!inner(id, cohort_id, name, team_number, pitched_ideas)")
      .eq("user_id", user.id)
      .eq("teams.cohort_id", cohortId)
      .maybeSingle();
    if (!mem) return null;
    const team = (mem as unknown as { teams: {
      id: string; cohort_id: string; name: string; team_number: number | null; pitched_ideas: unknown;
    } }).teams;

    const [membersRes, subRes, gradeRes, cohortRes] = await Promise.all([
      sb.from("team_members").select("user_id, profiles(full_name)").eq("team_id", team.id),
      sb.from("team_submissions").select("*").eq("team_id", team.id).maybeSingle(),
      sb.from("team_grades").select("team_id, score, feedback_md, reviewed_at").eq("team_id", team.id).maybeSingle(),
      sb.from("cohorts").select("team_submission_deadline").eq("id", cohortId).maybeSingle(),
    ]);

    const memberRows = (membersRes.data ?? []) as unknown as Array<{
      user_id: string; profiles: { full_name: string | null } | null;
    }>;
    // Roll numbers (best-effort; RLS may limit to the caller's own row).
    const rollByUser = new Map<string, string | null>();
    if (memberRows.length) {
      const { data: regs } = await sb
        .from("registrations")
        .select("user_id, roll_number")
        .eq("cohort_id", cohortId)
        .in("user_id", memberRows.map((m) => m.user_id));
      for (const r of (regs ?? []) as Array<{ user_id: string; roll_number: string | null }>) {
        rollByUser.set(r.user_id, r.roll_number);
      }
    }

    const submission = (subRes.data as TeamSubmission | null) ?? null;
    const deadline = (cohortRes.data as { team_submission_deadline: string | null } | null)?.team_submission_deadline ?? null;
    const pastDeadline = deadline != null && new Date(deadline).getTime() <= Date.now();
    const editable = !!submission?.unlocked || !pastDeadline;

    return {
      id: team.id,
      cohort_id: team.cohort_id,
      name: team.name,
      team_number: team.team_number,
      pitched_ideas: asIdeas(team.pitched_ideas),
      members: memberRows.map((m) => ({
        user_id: m.user_id,
        full_name: m.profiles?.full_name ?? null,
        roll_number: rollByUser.get(m.user_id) ?? null,
      })),
      submission,
      grade: (gradeRes.data as TeamGrade | null) ?? null,
      editable,
      deadline,
    };
  },
);

export interface GalleryTeam {
  id: string;
  name: string;
  team_number: number | null;
  member_names: string[];
  submission: TeamSubmission | null;
}

/** Every team in the cohort for the public showcase gallery (drafts included). */
export const listTeamGallery = cache(
  async (cohortId: string): Promise<GalleryTeam[]> => {
    const sb = await getSupabaseServer();
    const [teamsRes, subsRes] = await Promise.all([
      sb
        .from("teams")
        .select("id, name, team_number, team_members(profiles(full_name))")
        .eq("cohort_id", cohortId)
        .order("team_number", { ascending: true, nullsFirst: false })
        .order("name"),
      sb.from("team_submissions").select("*").eq("cohort_id", cohortId),
    ]);

    const subByTeam = new Map<string, TeamSubmission>();
    for (const s of (subsRes.data ?? []) as TeamSubmission[]) subByTeam.set(s.team_id, s);

    return ((teamsRes.data ?? []) as unknown as Array<{
      id: string; name: string; team_number: number | null;
      team_members: Array<{ profiles: { full_name: string | null } | null }>;
    }>).map((t) => ({
      id: t.id,
      name: t.name,
      team_number: t.team_number,
      member_names: t.team_members.map((m) => m.profiles?.full_name ?? "—"),
      submission: subByTeam.get(t.id) ?? null,
    }));
  },
);

export interface AdminTeamRow {
  id: string;
  name: string;
  team_number: number | null;
  member_count: number;
  member_names: string[];
  submission: TeamSubmission | null;
  grade: TeamGrade | null;
}

/** Admin overview: teams + submission status + grade for a cohort. */
export const listTeamsAdmin = cache(
  async (cohortId: string): Promise<AdminTeamRow[]> => {
    const sb = await getSupabaseServer();
    const [teamsRes, subsRes, gradesRes] = await Promise.all([
      sb
        .from("teams")
        .select("id, name, team_number, team_members(profiles(full_name))")
        .eq("cohort_id", cohortId)
        .order("team_number", { ascending: true, nullsFirst: false })
        .order("name"),
      sb.from("team_submissions").select("*").eq("cohort_id", cohortId),
      sb.from("team_grades").select("team_id, score, feedback_md, reviewed_at").eq("cohort_id", cohortId),
    ]);

    const subByTeam = new Map<string, TeamSubmission>();
    for (const s of (subsRes.data ?? []) as TeamSubmission[]) subByTeam.set(s.team_id, s);
    const gradeByTeam = new Map<string, TeamGrade>();
    for (const g of (gradesRes.data ?? []) as TeamGrade[]) gradeByTeam.set(g.team_id, g);

    return ((teamsRes.data ?? []) as unknown as Array<{
      id: string; name: string; team_number: number | null;
      team_members: Array<{ profiles: { full_name: string | null } | null }>;
    }>).map((t) => ({
      id: t.id,
      name: t.name,
      team_number: t.team_number,
      member_count: t.team_members.length,
      member_names: t.team_members.map((m) => m.profiles?.full_name ?? "—"),
      submission: subByTeam.get(t.id) ?? null,
      grade: gradeByTeam.get(t.id) ?? null,
    }));
  },
);

/** Per-cohort submission deadline (admin-set). */
export const getTeamDeadline = cache(
  async (cohortId: string): Promise<string | null> => {
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("cohorts")
      .select("team_submission_deadline")
      .eq("id", cohortId)
      .maybeSingle();
    return (data as { team_submission_deadline: string | null } | null)?.team_submission_deadline ?? null;
  },
);
