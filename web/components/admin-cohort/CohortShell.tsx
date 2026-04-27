import Link from "next/link";
import { CohortSwitcher } from "./CohortSwitcher";
import { CohortTabs } from "./CohortTabs";
import { listAdminCohorts, type AdminCohortRef } from "@/lib/queries/admin-context";
import { fmtDate } from "@/lib/format";

export async function CohortShell({
  cohort,
  active,
}: {
  cohort: AdminCohortRef;
  active:
    | "home"
    | "roster"
    | "schedule"
    | "content"
    | "pods"
    | "grading"
    | "polls"
    | "stuck"
    | "analytics"
    | "milestones";
}) {
  const cohorts = await listAdminCohorts();
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
        <div className="flex items-center gap-2">
          <CohortSwitcher current={cohort} cohorts={cohorts} />
          <Link
            href="/admin"
            className="text-muted hover:text-ink text-xs"
          >
            All cohorts
          </Link>
        </div>
      </header>
      <CohortTabs cohortId={cohort.id} active={active} />
    </div>
  );
}
