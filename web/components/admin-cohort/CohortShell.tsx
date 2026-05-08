import { CohortTabs } from "./CohortTabs";
import { type AdminCohortRef } from "@/lib/queries/admin-context";
import { fmtDate } from "@/lib/format";

export async function CohortShell({
  cohort,
  active,
}: {
  cohort: AdminCohortRef;
  active:
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
    | "health"
    | "milestones";
}) {
  return (
    <div className="space-y-4">
      <header className="border-line/50 flex flex-wrap items-end justify-between gap-3 border-b pb-4">
        <div className="min-w-0">
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            Cohort
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {cohort.name}
          </h1>
          <p className="text-muted mt-1 text-xs">
            {fmtDate(cohort.starts_on)} → {fmtDate(cohort.ends_on)} ·{" "}
            {cohort.status}
          </p>
        </div>
      </header>
      <CohortTabs cohortId={cohort.id} active={active} />
    </div>
  );
}
