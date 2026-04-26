import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface CohortTrend {
  labsDone: number[];
  submissions: number[];
  posts: number[];
  totalLabs: number;
  totalSubmissions: number;
  totalPosts: number;
}

const DAYS = 14;

function bucketIndex(ts: string, base: Date): number {
  const d = new Date(ts);
  const diff = Math.floor((base.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diff < 0) return -1;
  if (diff >= DAYS) return -1;
  return DAYS - 1 - diff;
}

export const getCohortTrend = cache(async (cohortId: string, userIds?: string[]): Promise<CohortTrend> => {
  const sb = await getSupabaseServer();
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();
  const today = new Date(new Date().toDateString());
  const scope = userIds && userIds.length > 0 ? userIds : null;

  const labQ = sb
    .from("lab_progress")
    .select("updated_at")
    .eq("cohort_id", cohortId)
    .eq("status", "done")
    .gte("updated_at", since);
  const subQ = sb
    .from("submissions")
    .select("updated_at, assignments!inner(cohort_id)")
    .eq("status", "submitted")
    .eq("assignments.cohort_id", cohortId)
    .gte("updated_at", since);
  const postQ = sb
    .from("board_posts")
    .select("created_at")
    .eq("cohort_id", cohortId)
    .is("deleted_at", null)
    .gte("created_at", since);

  const [labs, subs, posts] = await Promise.all([
    scope ? labQ.in("user_id", scope) : labQ,
    scope ? subQ.in("user_id", scope) : subQ,
    scope ? postQ.in("author_id", scope) : postQ,
  ]);

  const empty = () => Array(DAYS).fill(0) as number[];
  const labArr = empty(); const subArr = empty(); const postArr = empty();
  const bump = (arr: number[], i: number) => {
    if (i >= 0 && i < arr.length) arr[i] = (arr[i] ?? 0) + 1;
  };
  for (const r of (labs.data ?? []) as Array<{ updated_at: string }>) bump(labArr, bucketIndex(r.updated_at, today));
  for (const r of (subs.data ?? []) as Array<{ updated_at: string }>) bump(subArr, bucketIndex(r.updated_at, today));
  for (const r of (posts.data ?? []) as Array<{ created_at: string }>) bump(postArr, bucketIndex(r.created_at, today));

  return {
    labsDone: labArr,
    submissions: subArr,
    posts: postArr,
    totalLabs: labArr.reduce((a, b) => a + b, 0),
    totalSubmissions: subArr.reduce((a, b) => a + b, 0),
    totalPosts: postArr.reduce((a, b) => a + b, 0),
  };
});
