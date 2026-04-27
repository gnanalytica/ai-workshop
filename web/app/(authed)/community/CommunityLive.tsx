"use client";

import { useTableRefresh } from "@/lib/realtime/useTableRefresh";

export function CommunityLiveRefresh({ cohortId }: { cohortId: string }) {
  useTableRefresh("community_posts", { column: "cohort_id", value: cohortId });
  return null;
}
