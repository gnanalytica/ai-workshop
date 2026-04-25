import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface ModPost {
  id: string;
  cohort_id: string;
  author_name: string | null;
  title: string;
  pinned_at: string | null;
  deleted_at: string | null;
  created_at: string;
  reply_count: number;
}

export const listModBoardPosts = cache(async (cohortId: string): Promise<ModPost[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("board_posts")
    .select("id, cohort_id, title, pinned_at, deleted_at, created_at, profiles:author_id(full_name), board_replies(count)")
    .eq("cohort_id", cohortId)
    .order("created_at", { ascending: false })
    .limit(100);
  return ((data ?? []) as unknown as Array<{
    id: string; cohort_id: string; title: string;
    pinned_at: string | null; deleted_at: string | null; created_at: string;
    profiles: { full_name: string | null } | null;
    board_replies: Array<{ count: number }>;
  }>).map((p) => ({
    id: p.id,
    cohort_id: p.cohort_id,
    author_name: p.profiles?.full_name ?? null,
    title: p.title,
    pinned_at: p.pinned_at,
    deleted_at: p.deleted_at,
    created_at: p.created_at,
    reply_count: p.board_replies?.[0]?.count ?? 0,
  }));
});
