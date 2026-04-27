import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface BoardReply {
  id: string;
  body_md: string;
  is_accepted: boolean;
  created_at: string;
  author_name: string | null;
  author_id: string | null;
  /** Net score from community_votes (up − down). */
  vote_score: number;
  /** Current user's vote: 1, -1, or 0 if none. */
  my_vote: 1 | -1 | 0;
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
  /** Net upvotes for the post. */
  post_vote_score: number;
  /** Current user's vote on the post. */
  my_post_vote: 1 | -1 | 0;
  replies: BoardReply[];
}

export const getCommunityPost = cache(async (postId: string): Promise<BoardPostDetail | null> => {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("community_posts")
    .select(
      "id, cohort_id, title, body_md, tags, pinned_at, is_canonical, created_at, author_id, profiles:author_id(full_name), community_replies(id, body_md, is_accepted, created_at, author_id, profiles:author_id(full_name))",
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
    community_replies: Array<{
      id: string; body_md: string; is_accepted: boolean;
      created_at: string; author_id: string | null;
      profiles: { full_name: string | null } | null;
    }>;
  };
  const replyRows = d.community_replies ?? [];
  const replyIds = replyRows.map((r) => r.id);
  const { data: voteRows } = await sb
    .from("community_votes")
    .select("post_id, reply_id, value, user_id")
    .or(
      `post_id.eq.${d.id}` +
        (replyIds.length > 0 ? `,reply_id.in.(${replyIds.join(",")})` : ""),
    );
  const me = (await sb.auth.getUser()).data.user?.id ?? null;
  const rows = (voteRows ?? []) as Array<{
    post_id: string | null;
    reply_id: string | null;
    value: number;
    user_id: string;
  }>;
  let postVoteScore = 0;
  let myPostVote: 1 | -1 | 0 = 0;
  const replyScore: Record<string, number> = Object.fromEntries(replyIds.map((id) => [id, 0]));
  const myReply: Record<string, 1 | -1 | 0> = Object.fromEntries(replyIds.map((id) => [id, 0 as const]));
  for (const v of rows) {
    if (v.post_id === d.id && !v.reply_id) {
      postVoteScore += v.value;
      if (me && v.user_id === me) myPostVote = v.value as 1 | -1;
    } else if (v.reply_id) {
      replyScore[v.reply_id] = (replyScore[v.reply_id] ?? 0) + v.value;
      if (me && v.user_id === me) myReply[v.reply_id] = v.value as 1 | -1;
    }
  }
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
    post_vote_score: postVoteScore,
    my_post_vote: myPostVote,
    replies: replyRows
      .map((r) => ({
        id: r.id,
        body_md: r.body_md,
        is_accepted: r.is_accepted,
        created_at: r.created_at,
        author_id: r.author_id,
        author_name: r.profiles?.full_name ?? null,
        vote_score: replyScore[r.id] ?? 0,
        my_vote: (myReply[r.id] ?? 0) as 1 | -1 | 0,
      }))
      .sort((a, b) => (a.is_accepted === b.is_accepted ? a.created_at.localeCompare(b.created_at) : a.is_accepted ? -1 : 1)),
  };
});
