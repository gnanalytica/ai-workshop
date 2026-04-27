"use client";

import { useTableRefresh } from "@/lib/realtime/useTableRefresh";

export function BoardLiveRefresh({ cohortId }: { cohortId: string }) {
  useTableRefresh("board_posts", { column: "cohort_id", value: cohortId });
  return null;
}
