import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listRoster, listFaculty } from "@/lib/queries/admin";
import { listTeams } from "@/lib/queries/teams";
import { RosterTabs } from "./RosterTabs";

type Tab = "students" | "faculty" | "teams";

export default async function AdminCohortRosterPage({
  params,
  searchParams,
}: {
  params: Promise<{ cohortId: string }>;
  searchParams: Promise<{ status?: string; tab?: string }>;
}) {
  await requireCapability("roster.read");
  const { cohortId } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  const sp = await searchParams;
  const tab: Tab =
    sp.tab === "faculty" || sp.tab === "teams" ? sp.tab : "students";

  const [rows, faculty, teams] = await Promise.all([
    listRoster(cohort.id),
    listFaculty(cohort.id),
    listTeams(cohort.id),
  ]);

  return (
    <>
      <CohortShell cohort={cohort} active="roster" />
      <RosterTabs
        students={rows}
        faculty={faculty}
        teams={teams}
        cohortId={cohort.id}
        cohortSlug={cohort.slug}
        initialTab={tab}
      />
    </>
  );
}
