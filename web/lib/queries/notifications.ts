import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface MentionRow {
  id: string;
  context: "post" | "reply";
  post_id: string;
  reply_id: string | null;
  by_name: string | null;
  post_title: string | null;
  created_at: string;
}

export const listUnreadMentions = cache(async (limit = 20): Promise<MentionRow[]> => {
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return [];
  const { data } = await sb
    .from("notifications_log")
    .select("id, payload, created_at")
    .eq("user_id", user.user.id)
    .eq("kind", "mention")
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  type Row = { id: string; created_at: string; payload: { context?: string; post_id?: string; reply_id?: string | null; by?: string } };
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return [];

  const postIds = [...new Set(rows.map((r) => r.payload.post_id).filter((s): s is string => !!s))];
  const byIds = [...new Set(rows.map((r) => r.payload.by).filter((s): s is string => !!s))];
  const [posts, profs] = await Promise.all([
    postIds.length
      ? sb.from("board_posts").select("id, title").in("id", postIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string }> } as never),
    byIds.length
      ? sb.from("profiles").select("id, full_name").in("id", byIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }> } as never),
  ]);
  const titleById = new Map(((posts.data ?? []) as Array<{ id: string; title: string }>).map((p) => [p.id, p.title]));
  const nameById = new Map(((profs.data ?? []) as Array<{ id: string; full_name: string | null }>).map((p) => [p.id, p.full_name]));

  return rows.map((r) => ({
    id: r.id,
    context: (r.payload.context as "post" | "reply") ?? "post",
    post_id: r.payload.post_id ?? "",
    reply_id: r.payload.reply_id ?? null,
    by_name: r.payload.by ? (nameById.get(r.payload.by) ?? null) : null,
    post_title: r.payload.post_id ? (titleById.get(r.payload.post_id) ?? null) : null,
    created_at: r.created_at,
  }));
});

export const countUnreadMentions = cache(async (): Promise<number> => {
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return 0;
  const { count } = await sb
    .from("notifications_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.user.id)
    .eq("kind", "mention")
    .is("read_at", null);
  return count ?? 0;
});
