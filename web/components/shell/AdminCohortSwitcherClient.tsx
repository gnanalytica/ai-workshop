"use client";

import { useRouter, usePathname } from "next/navigation";
import type { AdminCohortRef } from "@/lib/queries/admin-context";

export function AdminCohortSwitcherClient({
  cohorts,
}: {
  cohorts: AdminCohortRef[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Detect a /admin/cohorts/<uuid>... prefix; if present we treat the first
  // captured uuid as the "current" cohort and rewrite that segment on switch.
  // Otherwise (any non-admin route, or admin index), navigate to the cohort
  // home.
  const match = pathname.match(
    /^\/admin\/cohorts\/([0-9a-f-]{36})(\/.*)?$/i,
  );
  const currentId = match?.[1] ?? "";

  function go(nextId: string) {
    if (!nextId || nextId === currentId) return;
    if (match) {
      const suffix = match[2] ?? "";
      router.push(`/admin/cohorts/${nextId}${suffix}`);
    } else {
      router.push(`/admin/cohorts/${nextId}`);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="admin_cohort_id" className="text-muted text-xs tracking-wide uppercase">
        Cohort
      </label>
      <select
        id="admin_cohort_id"
        value={currentId}
        onChange={(e) => go(e.target.value)}
        className="border-line bg-input-bg text-ink focus-visible:border-accent/50 max-w-[16rem] truncate rounded-md border px-2 py-1 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
        aria-label="Switch cohort"
      >
        {!currentId && (
          <option value="" disabled>
            Select cohort…
          </option>
        )}
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
