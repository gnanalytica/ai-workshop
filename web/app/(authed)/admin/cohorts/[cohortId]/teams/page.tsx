import { notFound } from "next/navigation";
import { requireCapability, checkCapability } from "@/lib/auth/requireCapability";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listTeamsAdmin, getTeamDeadline } from "@/lib/queries/teams";
import { TeamsAdminClient } from "./TeamsAdminClient";

export default async function AdminCohortTeamsPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  await requireCapability("roster.read", cohortId);
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();

  const [teams, deadline, canManage, canGrade] = await Promise.all([
    listTeamsAdmin(cohort.id),
    getTeamDeadline(cohort.id),
    checkCapability("roster.write", cohort.id),
    checkCapability("grading.write:cohort", cohort.id),
  ]);

  return (
    <>
      <CohortShell cohort={cohort} active="capstones" />
      <TeamsAdminClient
        cohortId={cohort.id}
        initialTeams={teams}
        initialDeadline={deadline}
        canManage={canManage}
        canGrade={canGrade}
      />
    </>
  );
}
