import { notFound } from "next/navigation";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { requireCapability, checkCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { getCohortPodRoster } from "@/lib/queries/cohort-roster";
import { CreatePodForm } from "@/app/(authed)/pods/CreatePodForm";
import { PodBoard } from "@/app/(authed)/faculty/cohort/PodBoard";

export default async function AdminCohortPodsPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  await requireCapability("roster.read");
  const { cohortId } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  const me = await getSession();
  if (!me) notFound();
  const [roster, canManagePods] = await Promise.all([
    getCohortPodRoster(cohortId, me.id),
    checkCapability("pods.write", cohortId),
  ]);

  return (
    <>
      <CohortShell cohort={cohort} active="pods" />
      <section id="pods" className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Pods</h2>
          <CardSub className="text-xs">
            Search, multi-select, or drag to assign students and faculty. Drop
            faculty chips between pods to reassign them.
          </CardSub>
        </div>
        {canManagePods && (
          <Card id="create-pod" className="border-accent/20">
            <CardTitle className="mb-1">
              {roster.pods.length === 0 ? "Create first pod" : "Create a pod"}
            </CardTitle>
            <CardSub className="mb-3 text-xs leading-relaxed">
              Name it, then drag students and faculty from the columns below.
            </CardSub>
            <CreatePodForm cohortId={cohortId} afterCreateScrollToId="pods-board" />
          </Card>
        )}
        <div id="pods-board" className="scroll-mt-24">
          <PodBoard
            cohortId={cohortId}
            pods={roster.pods}
            unassigned={roster.unassigned}
            cohortFaculty={roster.cohortFaculty}
            canManagePods={canManagePods}
          />
        </div>
      </section>
    </>
  );
}
