import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface SubmissionLink {
  label: string;
  url: string;
}

export interface GradingSubmission {
  id: string;
  user_id: string;
  user_name: string | null;
  group_name: string | null;
  status: "draft" | "submitted" | "graded";
  body: string | null;
  links: SubmissionLink[];
  score: number | null;
  feedback_md: string | null;
  ai_graded: boolean;
  ai_score: number | null;
  ai_feedback_md: string | null;
  ai_strengths: string[];
  ai_weaknesses: string[];
  ai_graded_at: string | null;
  human_reviewed_at: string | null;
  updated_at: string;
}

export const listAssignmentSubmissions = cache(
  async (assignmentId: string): Promise<GradingSubmission[]> => {
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("submissions")
      .select(
        "id, user_id, status, body, group_name, links, score, feedback_md, ai_graded, ai_score, ai_feedback_md, ai_strengths, ai_weaknesses, ai_graded_at, human_reviewed_at, updated_at, profiles:user_id(full_name)",
      )
      .eq("assignment_id", assignmentId)
      .order("group_name", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false });
    return ((data ?? []) as unknown as Array<{
      id: string; user_id: string; status: GradingSubmission["status"];
      body: string | null;
      group_name: string | null;
      links: SubmissionLink[] | null;
      score: number | null; feedback_md: string | null;
      ai_graded: boolean; ai_score: number | null; ai_feedback_md: string | null;
      ai_strengths: string[] | null; ai_weaknesses: string[] | null;
      ai_graded_at: string | null; human_reviewed_at: string | null;
      updated_at: string;
      profiles: { full_name: string | null } | null;
    }>).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      user_name: r.profiles?.full_name ?? null,
      group_name: r.group_name,
      status: r.status,
      body: r.body,
      links: r.links ?? [],
      score: r.score,
      feedback_md: r.feedback_md,
      ai_graded: r.ai_graded,
      ai_score: r.ai_score,
      ai_feedback_md: r.ai_feedback_md,
      ai_strengths: r.ai_strengths ?? [],
      ai_weaknesses: r.ai_weaknesses ?? [],
      ai_graded_at: r.ai_graded_at,
      human_reviewed_at: r.human_reviewed_at,
      updated_at: r.updated_at,
    }));
  },
);
