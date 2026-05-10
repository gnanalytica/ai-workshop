import { type AdminCohortRef } from "@/lib/queries/admin-context";
import { fmtDate } from "@/lib/format";

/**
 * Header for any /admin/cohorts/[id]/* page. Renders the cohort name and
 * dates. Sub-navigation lives in the sidebar (see adminCohortNav in
 * lib/rbac/menus.ts), so this component no longer renders a horizontal tab
 * bar — that would just duplicate the sidebar.
 *
 * The `active` prop is kept for back-compat with existing callers but is
 * no longer used.
 */
export async function CohortShell({
  cohort,
}: {
  cohort: AdminCohortRef;
  active?:
    | "home"
    | "roster"
    | "curriculum"
    | "schedule"
    | "content"
    | "pods"
    | "grading"
    | "capstones"
    | "polls"
    | "live"
    | "help-desk"
    | "pulse"
    | "analytics"
    | "health";
}) {
  return (
    <header className="border-line/50 mb-4 flex flex-wrap items-end justify-between gap-3 border-b pb-4">
      <div className="min-w-0">
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          Cohort
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {cohort.name}
        </h1>
        <p className="text-muted mt-1 text-xs">
          {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)} · {cohort.status}
        </p>
      </div>
    </header>
  );
}
