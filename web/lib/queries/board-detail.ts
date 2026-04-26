import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface BoardReply {
  id: string;
  body_md: string;
  is_accepted: boolean;
  created_at: string;
  author_name: string | null;
  author_id: string | null;
}

export interface BoardPostDetail {
  id: string;
  cohort_id: string;
  title: string;
  body_md: string;
  tags: string[];
  pinned_at: string | null;
  is_canonical: boolean;
  created_at: string;
  author_name: string | null;
  author_id: string | null;
  replies: BoardReply[];
}

export const getBoardPost = cache(async (postId: string): Promise<BoardPostDetail | null> => {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("board_posts")
    .select(
      "id, cohort_id, title, body_md, tags, pinned_at, is_canonical, created_at, author_id, profiles:author_id(full_name), board_replies(id, body_md, is_accepted, created_at, author_id, profiles:author_id(full_name))",
    )
    .eq("id", postId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) return null;
  const d = data as unknown as {
    id: string; cohort_id: string; title: string; body_md: string;
    tags: string[]; pinned_at: string | null; is_canonical: boolean; created_at: string;
    author_id: string | null;
    profiles: { full_name: string | null } | null;
    board_replies: Array<{
      id: string; body_md: string; is_accepted: boolean;
      created_at: string; author_id: string | null;
      profiles: { full_name: string | null } | null;
    }>;
  };
  return {
    id: d.id,
    cohort_id: d.cohort_id,
    title: d.title,
    body_md: d.body_md,
    tags: d.tags ?? [],
    pinned_at: d.pinned_at,
    is_canonical: d.is_canonical ?? false,
    created_at: d.created_at,
    author_name: d.profiles?.full_name ?? null,
    author_id: d.author_id,
    replies: (d.board_replies ?? [])
      .map((r) => ({
        id: r.id,
        body_md: r.body_md,
        is_accepted: r.is_accepted,
        created_at: r.created_at,
        author_id: r.author_id,
        author_name: r.profiles?.full_name ?? null,
      }))
      .sort((a, b) => (a.is_accepted === b.is_accepted ? a.created_at.localeCompare(b.created_at) : a.is_accepted ? -1 : 1)),
  };
});
