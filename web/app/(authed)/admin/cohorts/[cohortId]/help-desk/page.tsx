import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { CardSub } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listStuckOpen } from "@/lib/queries/faculty";
import { StuckQueueClient } from "@/app/(authed)/admin/stuck/StuckQueueClient";

export default async function CohortStuckPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  await requireCapability("support.triage");
  const { cohortId } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  const items = await listStuckOpen(cohort.id);

  return (
    <>
      <CohortShell cohort={cohort} active="stuck" />
      <CardSub className="max-w-2xl">
        {items.length} open · cohort-wide. Students open tickets from their lessons; pod faculty triage first.
        Escalations and tech-tagged items appear here for trainers, admins, and tech support.
      </CardSub>
      <StuckQueueClient cohortId={cohort.id} items={items} />
    </>
  );
}
