"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSupabaseServer } from "@/lib/supabase/server";
import { extractMentions, recordMentions } from "@/lib/community/mentions";
import { withSupabase, actionFail } from "./_helpers";

const newPostSchema = z.object({
  cohort_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  body_md: z.string().min(1).max(20_000),
  tags: z.array(z.string().max(40)).max(8).default([]),
});

export async function createCommunityPost(input: z.infer<typeof newPostSchema>) {
  const parsed = newPostSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("community.write", parsed.data.cohort_id);
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");
  const { data: row, error } = await sb
    .from("community_posts")
    .insert({
      cohort_id: parsed.data.cohort_id,
      author_id: user.user.id,
      title: parsed.data.title,
      body_md: parsed.data.body_md,
      tags: parsed.data.tags,
    })
    .select()
    .single();
  if (error || !row) return actionFail(error?.message ?? "Failed");
  const mentioned = await extractMentions(
    `${parsed.data.title}\n${parsed.data.body_md}`,
    parsed.data.cohort_id,
  );
  await recordMentions(mentioned, {
    kind: "post",
    postId: row.id,
    cohortId: parsed.data.cohort_id,
    authorId: user.user.id,
  });
  revalidatePath("/community");
  return { ok: true as const, data: row };
}

const replySchema = z.object({
  post_id: z.string().uuid(),
  body_md: z.string().min(1).max(20_000),
});

export async function createCommunityReply(input: z.infer<typeof replySchema>) {
  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const sb = await getSupabaseServer();
  const { data: postRow } = await sb
    .from("community_posts")
    .select("cohort_id")
    .eq("id", parsed.data.post_id)
    .is("deleted_at", null)
    .maybeSingle();
  const cohortId = (postRow as { cohort_id: string } | null)?.cohort_id;
  if (!cohortId) return actionFail("Post not found");
  await requireCapability("community.write", cohortId);
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");
  const { data: row, error } = await sb
    .from("community_replies")
    .insert({
      post_id: parsed.data.post_id,
      author_id: user.user.id,
      body_md: parsed.data.body_md,
    })
    .select("id, post_id, community_posts:post_id(cohort_id)")
    .single();
  if (error || !row) return actionFail(error?.message ?? "Failed");
  const mentioned = await extractMentions(parsed.data.body_md, cohortId);
  await recordMentions(mentioned, {
    kind: "reply",
    postId: parsed.data.post_id,
    replyId: row.id,
    cohortId,
    authorId: user.user.id,
  });
  revalidatePath(`/community/${parsed.data.post_id}`);
  return { ok: true as const, data: row };
}

const voteSchema = z
  .object({
    cohort_id: z.string().uuid(),
    post_id: z.string().uuid().optional(),
    reply_id: z.string().uuid().optional(),
    value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
  })
  .refine((d) => Boolean(d.post_id) !== Boolean(d.reply_id), { message: "Choose post or reply" });

/** Upvote / downvote / clear vote on a post or reply. Requires community.write. */
export async function setCommunityVote(input: z.infer<typeof voteSchema>) {
  const parsed = voteSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("community.write", parsed.data.cohort_id);
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return actionFail("Not signed in");
  const uid = user.user.id;
  const { post_id, reply_id, value } = parsed.data;

  if (value === 0) {
    let del = sb.from("community_votes").delete().eq("user_id", uid);
    if (post_id) del = del.eq("post_id", post_id).is("reply_id", null);
    else del = del.eq("reply_id", reply_id!).is("post_id", null);
    const { error } = await del;
    if (error) return actionFail(error.message);
  } else {
    let del = sb.from("community_votes").delete().eq("user_id", uid);
    if (post_id) del = del.eq("post_id", post_id).is("reply_id", null);
    else del = del.eq("reply_id", reply_id!).is("post_id", null);
    await del;
    const { error } = await sb.from("community_votes").insert({
      user_id: uid,
      post_id: post_id ?? null,
      reply_id: reply_id ?? null,
      value,
    });
    if (error) return actionFail(error.message);
  }

  let revalidatePost = post_id;
  if (!revalidatePost && reply_id) {
    const { data: r } = await sb.from("community_replies").select("post_id").eq("id", reply_id).maybeSingle();
    revalidatePost = (r as { post_id: string } | null)?.post_id;
  }
  revalidatePath("/community");
  if (revalidatePost) revalidatePath(`/community/${revalidatePost}`);
  return { ok: true as const };
}

const acceptSchema = z.object({ reply_id: z.string().uuid(), post_id: z.string().uuid() });
export async function acceptAnswer(input: z.infer<typeof acceptSchema>) {
  const parsed = acceptSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(
    (sb) =>
      sb
        .from("community_replies")
        .update({ is_accepted: true })
        .eq("id", parsed.data.reply_id)
        .select()
        .single(),
    `/community/${parsed.data.post_id}`,
  );
}

const moderateSchema = z.object({
  kind: z.enum(["post", "reply"]),
  id: z.string().uuid(),
  pinned: z.boolean().optional(),
  deleted: z.boolean().optional(),
});

export async function moderateCommunity(input: z.infer<typeof moderateSchema>) {
  const parsed = moderateSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("moderation.write");
  const table = parsed.data.kind === "post" ? "community_posts" : "community_replies";
  const patch: Record<string, string | null> = {};
  if (parsed.data.pinned !== undefined && parsed.data.kind === "post") {
    patch.pinned_at = parsed.data.pinned ? new Date().toISOString() : null;
  }
  if (parsed.data.deleted !== undefined) {
    patch.deleted_at = parsed.data.deleted ? new Date().toISOString() : null;
  }
  return withSupabase(
    (sb) => sb.from(table).update(patch).eq("id", parsed.data.id).select().single(),
    "/admin/community",
  );
}

export async function revalidateBoard() {
  revalidatePath("/community");
}

const canonicalSchema = z.object({
  post_id: z.string().uuid(),
  is_canonical: z.boolean(),
});
export async function setCanonical(input: z.infer<typeof canonicalSchema>) {
  const parsed = canonicalSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("moderation.write");
  return withSupabase(
    (sb) =>
      sb
        .from("community_posts")
        .update({ is_canonical: parsed.data.is_canonical })
        .eq("id", parsed.data.post_id)
        .select()
        .single(),
    ["/community", `/community/${parsed.data.post_id}`],
  );
}
