import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface MyDayFeedback {
  rating: number;
  fuzzy_topic: string | null;
  notes: string | null;
  anonymous: boolean;
}

export interface DayFeedbackRow {
  rating: number;
  fuzzy_topic: string | null;
  notes: string | null;
  anonymous: boolean;
  user_id: string | null;
  full_name: string | null;
  created_at: string;
}

export interface DayFeedbackSummary {
  total_responses: number;
  avg_rating: number | null;
  distribution: [number, number, number, number, number];
  rows: DayFeedbackRow[];
}

export const getMyDayFeedback = cache(
  async (
    cohortId: string,
    dayNumbers: number[],
  ): Promise<Map<number, MyDayFeedback>> => {
    const out = new Map<number, MyDayFeedback>();
    if (dayNumbers.length === 0) return out;
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("day_feedback")
      .select("day_number, rating, fuzzy_topic, notes, anonymous")
      .eq("cohort_id", cohortId)
      .in("day_number", dayNumbers);
    for (const r of (data ?? []) as Array<{
      day_number: number;
      rating: number;
      fuzzy_topic: string | null;
      notes: string | null;
      anonymous: boolean;
    }>) {
      out.set(r.day_number, {
        rating: r.rating,
        fuzzy_topic: r.fuzzy_topic,
        notes: r.notes,
        anonymous: r.anonymous,
      });
    }
    return out;
  },
);

/**
 * Returns up to `limit` most-recent past day_numbers for which the current
 * student has not yet submitted feedback. Past = day_number < todayDay and
 * day must exist in cohort_days (lesson actually scheduled).
 */
export const getPendingFeedbackDays = cache(
  async (
    cohortId: string,
    todayDay: number,
    limit = 3,
  ): Promise<Array<{ day_number: number; title: string }>> => {
    if (todayDay <= 1) return [];
    const sb = await getSupabaseServer();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return [];

    const [daysRes, mineRes] = await Promise.all([
      sb
        .from("cohort_days")
        .select("day_number, title")
        .eq("cohort_id", cohortId)
        .lt("day_number", todayDay)
        .order("day_number", { ascending: false }),
      sb
        .from("day_feedback")
        .select("day_number")
        .eq("cohort_id", cohortId)
        .eq("user_id", u.user.id)
        .lt("day_number", todayDay),
    ]);

    const filled = new Set(
      ((mineRes.data ?? []) as Array<{ day_number: number }>).map(
        (r) => r.day_number,
      ),
    );
    const pending: Array<{ day_number: number; title: string }> = [];
    for (const d of (daysRes.data ?? []) as Array<{
      day_number: number;
      title: string;
    }>) {
      if (!filled.has(d.day_number)) pending.push(d);
      if (pending.length >= limit) break;
    }
    return pending;
  },
);

/**
 * Returns the most recent N past day_numbers for the cohort with avg-rating
 * and total response count. Pod-scoped if podId supplied. Calls the RPC per
 * day; N is small (5) so this is cheap.
 */
export async function listRecentDaySummaries(
  cohortId: string,
  todayDay: number,
  limit = 5,
  podId?: string,
): Promise<
  Array<{
    day_number: number;
    title: string;
    total_responses: number;
    avg_rating: number | null;
  }>
> {
  if (todayDay <= 1) return [];
  const sb = await getSupabaseServer();
  const { data: days } = await sb
    .from("cohort_days")
    .select("day_number, title")
    .eq("cohort_id", cohortId)
    .lt("day_number", todayDay)
    .order("day_number", { ascending: false })
    .limit(limit);
  const list = (days ?? []) as Array<{ day_number: number; title: string }>;
  if (list.length === 0) return [];
  const summaries = await Promise.all(
    list.map((d) => getDayFeedbackSummary(cohortId, d.day_number, podId)),
  );
  return list.map((d, i) => {
    const s = summaries[i] ?? {
      total_responses: 0,
      avg_rating: null,
      distribution: [0, 0, 0, 0, 0] as [number, number, number, number, number],
      rows: [],
    };
    return {
      day_number: d.day_number,
      title: d.title,
      total_responses: s.total_responses,
      avg_rating: s.avg_rating,
    };
  });
}

/**
 * Returns the faculty's primary pod_id for this cohort, or the first pod they
 * are assigned to if no primary is flagged. Null if not assigned to any pod.
 */
export async function getFacultyPrimaryPodId(
  cohortId: string,
  facultyUserId: string,
): Promise<string | null> {
  const sb = await getSupabaseServer();
  // pod_faculty has no is_primary column anymore — schema simplified to one
  // row per faculty per pod. If multiple, picking the first is consistent
  // with the unique-pod-faculty model the app actually enforces.
  const { data } = await sb
    .from("pod_faculty")
    .select("pod_id, pods!inner(cohort_id)")
    .eq("faculty_user_id", facultyUserId)
    .eq("pods.cohort_id", cohortId)
    .limit(1);
  const rows = (data ?? []) as Array<{ pod_id: string }>;
  return rows[0]?.pod_id ?? null;
}

/**
 * Recent fuzzy-topic entries across a window of days. Surfaces what
 * students typed into the "anything fuzzy?" field — the highest-signal
 * qualitative data that otherwise sits invisible on the cohort overview.
 *
 * Skips empty / "no" / "none" / "good" answers (we treat them as noise).
 * Anonymous rows render with full_name = null.
 */
export interface FuzzyTopicEntry {
  day_number: number;
  text: string;
  rating: number;
  full_name: string | null;
  created_at: string;
}

const FUZZY_NOISE = new Set([
  "no", "none", "nothing", "nothing.", "good", "good.", "ok", "okay", "great",
  "n/a", "na", "-", "—",
]);

export async function listRecentFuzzyTopics(
  cohortId: string,
  dayNumbers: number[],
  limit = 25,
  excludeUserIds?: ReadonlyArray<string>,
): Promise<FuzzyTopicEntry[]> {
  if (dayNumbers.length === 0) return [];
  const sb = await getSupabaseServer();
  // Select user_id so we can filter against the exclude list before the limit
  // bites — the limit is post-filter so excluded rows can't crowd out real
  // entries.
  const { data } = await sb
    .from("day_feedback")
    .select(
      "day_number, fuzzy_topic, rating, anonymous, user_id, created_at, profiles:user_id(full_name)",
    )
    .eq("cohort_id", cohortId)
    .in("day_number", dayNumbers)
    .not("fuzzy_topic", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit * 3); // overshoot — we filter noise below

  const exclude = excludeUserIds ? new Set(excludeUserIds) : null;

  type Row = {
    day_number: number;
    fuzzy_topic: string | null;
    rating: number;
    anonymous: boolean;
    user_id: string;
    created_at: string;
    profiles: { full_name: string | null } | null;
  };

  const out: FuzzyTopicEntry[] = [];
  for (const r of (data ?? []) as unknown as Row[]) {
    if (exclude && exclude.has(r.user_id)) continue;
    const text = (r.fuzzy_topic ?? "").trim();
    if (!text) continue;
    if (FUZZY_NOISE.has(text.toLowerCase())) continue;
    out.push({
      day_number: r.day_number,
      text,
      rating: r.rating,
      full_name: r.anonymous ? null : (r.profiles?.full_name ?? null),
      created_at: r.created_at,
    });
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Students who left a low rating (≤ `maxRating`) on any day in the window.
 * Returned newest-first; user_id is null for anonymous rows so the UI can
 * still render the entry without linking.
 */
export interface LowRatingEntry {
  day_number: number;
  rating: number;
  fuzzy_topic: string | null;
  user_id: string | null;
  full_name: string | null;
  anonymous: boolean;
  created_at: string;
}

export async function listLowRatingFeedback(
  cohortId: string,
  dayNumbers: number[],
  maxRating = 2,
  limit = 20,
  excludeUserIds?: ReadonlyArray<string>,
): Promise<LowRatingEntry[]> {
  if (dayNumbers.length === 0) return [];
  const sb = await getSupabaseServer();
  // Over-fetch so the exclude filter doesn't shrink the visible result set
  // below `limit` — we still cap the response to `limit` post-filter.
  const exclude = excludeUserIds ? new Set(excludeUserIds) : null;
  const fetchLimit = exclude ? limit + exclude.size + 5 : limit;
  const { data } = await sb
    .from("day_feedback")
    .select(
      "day_number, rating, fuzzy_topic, user_id, anonymous, created_at, profiles:user_id(full_name)",
    )
    .eq("cohort_id", cohortId)
    .in("day_number", dayNumbers)
    .lte("rating", maxRating)
    .order("created_at", { ascending: false })
    .limit(fetchLimit);

  type Row = {
    day_number: number;
    rating: number;
    fuzzy_topic: string | null;
    user_id: string;
    anonymous: boolean;
    created_at: string;
    profiles: { full_name: string | null } | null;
  };

  return ((data ?? []) as unknown as Row[])
    .filter((r) => !exclude || !exclude.has(r.user_id))
    .slice(0, limit)
    .map((r) => ({
      day_number: r.day_number,
      rating: r.rating,
      fuzzy_topic: r.fuzzy_topic,
      user_id: r.anonymous ? null : r.user_id,
      full_name: r.anonymous ? null : (r.profiles?.full_name ?? null),
      anonymous: r.anonymous,
      created_at: r.created_at,
    }));
}

export async function getDayFeedbackSummary(
  cohortId: string,
  dayNumber: number,
  podId?: string,
): Promise<DayFeedbackSummary> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.rpc("rpc_day_feedback_summary", {
    p_cohort: cohortId,
    p_day: dayNumber,
    p_pod: podId ?? null,
  } as never);
  if (error || !data) {
    return {
      total_responses: 0,
      avg_rating: null,
      distribution: [0, 0, 0, 0, 0],
      rows: [],
    };
  }
  // RPC returns a single row (table-returning function). supabase-js gives an array.
  const r = (Array.isArray(data) ? data[0] : data) as
    | {
        total_responses: number | null;
        avg_rating: number | string | null;
        rating_1: number | null;
        rating_2: number | null;
        rating_3: number | null;
        rating_4: number | null;
        rating_5: number | null;
        rows: unknown;
      }
    | undefined;
  if (!r) {
    return {
      total_responses: 0,
      avg_rating: null,
      distribution: [0, 0, 0, 0, 0],
      rows: [],
    };
  }
  const avg =
    r.avg_rating == null
      ? null
      : typeof r.avg_rating === "string"
        ? Number(r.avg_rating)
        : r.avg_rating;
  return {
    total_responses: r.total_responses ?? 0,
    avg_rating: avg,
    distribution: [
      r.rating_1 ?? 0,
      r.rating_2 ?? 0,
      r.rating_3 ?? 0,
      r.rating_4 ?? 0,
      r.rating_5 ?? 0,
    ],
    rows: (r.rows as DayFeedbackRow[] | null) ?? [],
  };
}
