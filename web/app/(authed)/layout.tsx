import { AppShell } from "@/components/shell/AppShell";
import { getFacultyCohort } from "@/lib/queries/faculty";

/**
 * Layout for every authenticated route. Ensures the user has a session
 * (AppShell redirects to /sign-in otherwise) and renders the unified shell.
 * Passes the faculty member's current teaching cohort when present so nav
 * capability checks (e.g. pods.write) are cohort-scoped like the rest of
 * faculty UI — no admin persona required.
 */
export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const f = await getFacultyCohort();
  return (
    <AppShell
      cohortId={f?.cohort.id ?? null}
      cohortName={f?.cohort.name ?? null}
      cohortStartsOn={f?.cohort.starts_on ?? null}
    >
      {children}
    </AppShell>
  );
}
