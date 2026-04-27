"use client";

import { useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { AdminCohortRef } from "@/lib/queries/admin-context";

export function CohortSwitcher({
  current,
  cohorts,
}: {
  current: AdminCohortRef;
  cohorts: AdminCohortRef[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  function go(nextId: string) {
    if (nextId === current.id) return;
    const suffix = pathname.replace(
      new RegExp(`^/admin/cohorts/${current.id}`),
      "",
    );
    router.push(`/admin/cohorts/${nextId}${suffix}`);
  }

  if (cohorts.length <= 1) {
    return (
      <Badge variant="default" className="font-normal">
        {current.name}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-muted text-xs">Cohort:</span>
      <select
        value={current.id}
        onChange={(e) => go(e.target.value)}
        className="border-line bg-input-bg text-ink h-8 max-w-[14rem] truncate rounded-md border px-2 text-sm"
        aria-label="Switch cohort"
      >
        {cohorts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.status !== "live" ? ` (${c.status})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
