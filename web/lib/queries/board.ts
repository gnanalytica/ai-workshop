import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface BoardPostSummary {
  id: string;
  title: string;
  body_md: string;
  tags: string[];
  pinned_at: string | null;
  is_canonical: boolean;
  created_at: string;
  reply_count: number;
  author_name: string | null;
}

export const listBoardPosts = cache(async (cohortId: string): Promise<BoardPostSummary[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("board_posts")
    .select(
      "id, title, body_md, tags, pinned_at, is_canonical, created_at, profiles:author_id(full_name), board_replies(count)",
    )
    .eq("cohort_id", cohortId)
    .is("deleted_at", null)
    .order("pinned_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(50);
  return ((data ?? []) as unknown as Array<{
    id: string;
    title: string;
    body_md: string;
    tags: string[];
    pinned_at: string | null;
    is_canonical: boolean;
    created_at: string;
    profiles: { full_name: string | null } | null;
    board_replies: Array<{ count: number }>;
  }>).map((r) => ({
    id: r.id,
    title: r.title,
    body_md: r.body_md,
    tags: r.tags ?? [],
    pinned_at: r.pinned_at,
    is_canonical: r.is_canonical ?? false,
    created_at: r.created_at,
    reply_count: r.board_replies?.[0]?.count ?? 0,
    author_name: r.profiles?.full_name ?? null,
  }));
});
