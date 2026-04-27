import { getSupabaseServer } from "@/lib/supabase/server";

const MENTION_RE = /@\[([^\]]+)\]\(([0-9a-f-]{36})\)|@([a-zA-Z][a-zA-Z\s'.-]{1,50})/g;

/**
 * Extract mention targets from a markdown body. Two forms supported:
 *   @[Display Name](uuid)  — explicit, produced by mention-aware editors
 *   @Some Name             — best-effort lookup by full_name in the cohort
 *                            roster (faculty + confirmed students).
 *
 * Returns deduped user_ids that exist in the cohort. Uses the service-side
 * Supabase client so RLS doesn't block lookups.
 */
export async function extractMentions(
  body: string,
  cohortId: string,
): Promise<string[]> {
  const explicit: string[] = [];
  const fuzzy: string[] = [];
  for (const m of body.matchAll(MENTION_RE)) {
    if (m[2]) explicit.push(m[2]);
    else if (m[3]) fuzzy.push(m[3].trim());
  }
  if (explicit.length === 0 && fuzzy.length === 0) return [];

  const sb = await getSupabaseServer();

  const validIds = new Set<string>();
  if (explicit.length > 0) {
    const { data } = await sb
      .from("registrations")
      .select("user_id")
      .eq("cohort_id", cohortId)
      .in("user_id", explicit);
    ((data ?? []) as Array<{ user_id: string }>).forEach((r) => validIds.add(r.user_id));
    const { data: fac } = await sb
      .from("cohort_faculty")
      .select("user_id")
      .eq("cohort_id", cohortId)
      .in("user_id", explicit);
    ((fac ?? []) as Array<{ user_id: string }>).forEach((r) => validIds.add(r.user_id));
  }

  if (fuzzy.length > 0) {
    const [{ data: regs }, { data: fac }] = await Promise.all([
      sb
        .from("registrations")
        .select("user_id, profiles!inner(full_name)")
        .eq("cohort_id", cohortId)
        .eq("status", "confirmed"),
      sb
        .from("cohort_faculty")
        .select("user_id, profiles!inner(full_name)")
        .eq("cohort_id", cohortId),
    ]);
    type Row = { user_id: string; profiles: { full_name: string | null } };
    const all: Row[] = [
      ...(((regs ?? []) as unknown as Row[])),
      ...(((fac ?? []) as unknown as Row[])),
    ];
    const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();
    const fuzzySet = new Set(fuzzy.map(norm));
    for (const r of all) {
      if (fuzzySet.has(norm(r.profiles.full_name))) validIds.add(r.user_id);
    }
  }
  return [...validIds];
}

export async function recordMentions(
  userIds: string[],
  context: { kind: "post" | "reply"; postId: string; replyId?: string; cohortId: string; authorId: string },
): Promise<void> {
  if (userIds.length === 0) return;
  const sb = await getSupabaseServer();
  await sb.from("notifications_log").insert(
    userIds
      .filter((u) => u !== context.authorId)
      .map((u) => ({
        user_id: u,
        kind: "mention" as const,
        payload: {
          context: context.kind,
          post_id: context.postId,
          reply_id: context.replyId ?? null,
          cohort_id: context.cohortId,
          by: context.authorId,
        },
      })),
  );
}
