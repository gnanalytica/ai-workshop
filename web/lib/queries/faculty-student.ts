import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface StudentDrill {
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  pod_id: string | null;
  pod_name: string | null;
  score: {
    quiz: number; submissions: number; posts: number; comments: number; upvotes: number; total: number;
  } | null;
  recentSubmissions: { id: string; assignment_title: string; day_number: number; status: string; score: number | null; updated_at: string }[];
  recentStuck: { id: string; kind: string; status: string; message: string | null; created_at: string }[];
  recentPosts: { id: string; title: string; created_at: string }[];
  lastActiveAt: string | null;
  labsDone: number;
}

export const getStudentDrill = cache(
  async (cohortId: string, userId: string): Promise<StudentDrill | null> => {
    const sb = await getSupabaseServer();
    const { data: prof } = await sb
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    if (!prof) return null;

    const [
      { data: pod },
      { data: score },
      { data: subs },
      { data: stuck },
      { data: posts },
      { data: lastLab },
      { count: labCount },
    ] = await Promise.all([
      sb
        .from("pod_members")
        .select("pods!inner(id, name, cohort_id)")
        .eq("student_user_id", userId)
        .eq("cohort_id", cohortId)
        .maybeSingle(),
      sb
        .from("v_student_score")
        .select("quiz_score, submission_score, posts_score, comments_score, upvotes_score, total_score")
        .eq("cohort_id", cohortId)
        .eq("user_id", userId)
        .maybeSingle(),
      sb
        .from("submissions")
        .select("id, status, score, updated_at, assignments!inner(title, day_number, cohort_id)")
        .eq("user_id", userId)
        .eq("assignments.cohort_id", cohortId)
        .order("updated_at", { ascending: false })
        .limit(8),
      sb
        .from("stuck_queue")
        .select("id, kind, status, message, created_at")
        .eq("user_id", userId)
        .eq("cohort_id", cohortId)
        .order("created_at", { ascending: false })
        .limit(8),
      sb
        .from("board_posts")
        .select("id, title, created_at")
        .eq("author_id", userId)
        .eq("cohort_id", cohortId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(8),
      sb
        .from("lab_progress")
        .select("updated_at")
        .eq("user_id", userId)
        .eq("cohort_id", cohortId)
        .order("updated_at", { ascending: false })
        .limit(1),
      sb
        .from("lab_progress")
        .select("user_id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("cohort_id", cohortId)
        .eq("status", "done"),
    ]);

    type Sub = { id: string; status: string; score: number | null; updated_at: string; assignments: { title: string; day_number: number } };
    return {
      user_id: prof.id,
      full_name: prof.full_name,
      email: prof.email,
      avatar_url: prof.avatar_url,
      pod_id: ((pod as unknown) as { pods: { id: string } } | null)?.pods.id ?? null,
      pod_name: ((pod as unknown) as { pods: { name: string } } | null)?.pods.name ?? null,
      score: score
        ? {
            quiz: Number((score as { quiz_score: number }).quiz_score),
            submissions: Number((score as { submission_score: number }).submission_score),
            posts: Number((score as { posts_score: number }).posts_score),
            comments: Number((score as { comments_score: number }).comments_score),
            upvotes: Number((score as { upvotes_score: number }).upvotes_score),
            total: Number((score as { total_score: number }).total_score),
          }
        : null,
      recentSubmissions: ((subs ?? []) as unknown as Sub[]).map((s) => ({
        id: s.id,
        assignment_title: s.assignments.title,
        day_number: s.assignments.day_number,
        status: s.status,
        score: s.score,
        updated_at: s.updated_at,
      })),
      recentStuck: (stuck ?? []) as StudentDrill["recentStuck"],
      recentPosts: (posts ?? []) as StudentDrill["recentPosts"],
      lastActiveAt: ((lastLab ?? []) as Array<{ updated_at: string }>)[0]?.updated_at ?? null,
      labsDone: labCount ?? 0,
    };
  },
);
