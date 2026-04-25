"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail } from "./_helpers";

const newPostSchema = z.object({
  cohort_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  body_md: z.string().min(1).max(20_000),
  tags: z.array(z.string().max(40)).max(8).default([]),
});

export async function createBoardPost(input: z.infer<typeof newPostSchema>) {
  const parsed = newPostSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("board_posts")
      .insert({
        cohort_id: parsed.data.cohort_id,
        author_id: user.user.id,
        title: parsed.data.title,
        body_md: parsed.data.body_md,
        tags: parsed.data.tags,
      })
      .select()
      .single();
  }, "/board");
}

const replySchema = z.object({
  post_id: z.string().uuid(),
  body_md: z.string().min(1).max(20_000),
});

export async function createBoardReply(input: z.infer<typeof replySchema>) {
  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(async (sb) => {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return { data: null, error: { message: "Not signed in" } };
    return sb
      .from("board_replies")
      .insert({
        post_id: parsed.data.post_id,
        author_id: user.user.id,
        body_md: parsed.data.body_md,
      })
      .select()
      .single();
  });
}

const acceptSchema = z.object({ reply_id: z.string().uuid(), post_id: z.string().uuid() });
export async function acceptAnswer(input: z.infer<typeof acceptSchema>) {
  const parsed = acceptSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  return withSupabase(
    (sb) =>
      sb
        .from("board_replies")
        .update({ is_accepted: true })
        .eq("id", parsed.data.reply_id)
        .select()
        .single(),
    `/board/${parsed.data.post_id}`,
  );
}

const moderateSchema = z.object({
  kind: z.enum(["post", "reply"]),
  id: z.string().uuid(),
  pinned: z.boolean().optional(),
  deleted: z.boolean().optional(),
});

export async function moderateBoard(input: z.infer<typeof moderateSchema>) {
  const parsed = moderateSchema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  await requireCapability("moderation.write");
  const table = parsed.data.kind === "post" ? "board_posts" : "board_replies";
  const patch: Record<string, string | null> = {};
  if (parsed.data.pinned !== undefined && parsed.data.kind === "post") {
    patch.pinned_at = parsed.data.pinned ? new Date().toISOString() : null;
  }
  if (parsed.data.deleted !== undefined) {
    patch.deleted_at = parsed.data.deleted ? new Date().toISOString() : null;
  }
  return withSupabase(
    (sb) => sb.from(table).update(patch).eq("id", parsed.data.id).select().single(),
    "/admin/board",
  );
}

export async function revalidateBoard() {
  revalidatePath("/board");
}
