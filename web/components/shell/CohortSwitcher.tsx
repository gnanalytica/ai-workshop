import { listMyFacultyCohorts, getCurrentFacultyCohort } from "@/lib/faculty/currentCohort";
import { listAdminCohorts } from "@/lib/queries/admin-context";
import { CohortSwitcherClient } from "./CohortSwitcherClient";
import { AdminCohortSwitcherClient } from "./AdminCohortSwitcherClient";
import type { Persona } from "@/lib/auth/persona";

export async function CohortSwitcher({ persona }: { persona: Persona | null }) {
  if (persona === "admin") {
    const cohorts = await listAdminCohorts();
    if (cohorts.length <= 1) return null;
    return <AdminCohortSwitcherClient cohorts={cohorts} />;
  }

  if (persona === "faculty") {
    const [cohorts, current] = await Promise.all([
      listMyFacultyCohorts(),
      getCurrentFacultyCohort(),
    ]);
    if (cohorts.length <= 1 || !current) return null;
    return (
      <CohortSwitcherClient
        cohorts={cohorts.map((c) => ({ id: c.id, name: c.name }))}
        currentId={current.id}
      />
    );
  }

  return null;
}
