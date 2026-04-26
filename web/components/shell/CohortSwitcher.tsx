import { listMyFacultyCohorts, getCurrentFacultyCohort } from "@/lib/faculty/currentCohort";
import { CohortSwitcherClient } from "./CohortSwitcherClient";

export async function CohortSwitcher() {
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
