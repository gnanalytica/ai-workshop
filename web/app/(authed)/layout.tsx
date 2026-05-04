import { headers } from "next/headers";
import { AppShell } from "@/components/shell/AppShell";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { getAdminCohortById } from "@/lib/queries/admin-context";

const ADMIN_COHORT_PATH = /^\/admin\/cohorts\/([0-9a-f-]{36})(?:\/|$)/i;

/**
 * Layout for every authenticated route. Ensures the user has a session
 * (AppShell redirects to /sign-in otherwise) and renders the unified shell.
 *
 * Cohort resolution priority:
 *   1. /admin/cohorts/<uuid>/… — pin the chrome to that cohort so the topbar
 *      Meet-link affordance can never write to a cohort the admin isn't
 *      looking at. (RLS still allows admins to read any cohort.)
 *   2. Faculty's currentCohort cookie / sandbox / preview pin.
 *   3. AppShell's own student-side fallback (getMyCurrentCohort).
 */
export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const adminCohortMatch = pathname.match(ADMIN_COHORT_PATH);
  const urlCohortId = adminCohortMatch?.[1];
  const urlCohort = urlCohortId ? await getAdminCohortById(urlCohortId) : null;
  const f = urlCohort ? null : await getFacultyCohort();
  const cohort = urlCohort
    ? {
        id: urlCohort.id,
        name: urlCohort.name,
        starts_on: urlCohort.starts_on,
      }
    : f
      ? { id: f.cohort.id, name: f.cohort.name, starts_on: f.cohort.starts_on }
      : null;
  return (
    <AppShell
      cohortId={cohort?.id ?? null}
      cohortName={cohort?.name ?? null}
      cohortStartsOn={cohort?.starts_on ?? null}
    >
      {children}
    </AppShell>
  );
}
