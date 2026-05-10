import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface PodMilestoneRow {
  user_id: string;
  user_name: string | null;
  submission_id: string;
  assignment_id: string;
  assignment_title: string;
  milestone_number: number;
  day_number: number;
  kind: "lab" | "capstone" | "reflection";
  status: "draft" | "submitted" | "graded";
  body: string | null;
  faculty_notes_md: string | null;
  updated_at: string;
}

export const getPodMilestoneSubmissions = cache(
  async (cohortId: string, memberIds: string[]): Promise<PodMilestoneRow[]> => {
    if (memberIds.length === 0) return [];
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("submissions")
      .select(
        "id, body, status, faculty_notes_md, updated_at, user_id, profiles:user_id(full_name), assignments!inner(id, title, day_number, milestone_number, kind, cohort_id)",
      )
      .eq("assignments.cohort_id", cohortId)
      .not("assignments.milestone_number", "is", null)
      .in("user_id", memberIds)
      .order("updated_at", { ascending: false });

    if (!data) return [];

    type Row = {
      id: string;
      body: string | null;
      status: "draft" | "submitted" | "graded";
      faculty_notes_md: string | null;
      updated_at: string;
      user_id: string;
      profiles: { full_name: string | null } | null;
      assignments: {
        id: string;
        title: string;
        day_number: number;
        milestone_number: number;
        kind: "lab" | "capstone" | "reflection";
      };
    };

    return (data as unknown as Row[]).map((r) => ({
      user_id: r.user_id,
      user_name: r.profiles?.full_name ?? null,
      submission_id: r.id,
      assignment_id: r.assignments.id,
      assignment_title: r.assignments.title,
      milestone_number: r.assignments.milestone_number,
      day_number: r.assignments.day_number,
      kind: r.assignments.kind,
      status: r.status,
      body: r.body,
      faculty_notes_md: r.faculty_notes_md,
      updated_at: r.updated_at,
    }));
  },
);
