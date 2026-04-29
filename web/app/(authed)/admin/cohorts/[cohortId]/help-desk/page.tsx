import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { CardSub } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listHelpDeskOpen } from "@/lib/queries/faculty";
import { HelpDeskQueueClient } from "@/app/(authed)/admin/help-desk/HelpDeskQueueClient";

export default async function CohortStuckPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  await requireCapability("support.triage");
  const { cohortId } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  const items = await listHelpDeskOpen(cohort.id);

  return (
    <>
      <CohortShell cohort={cohort} active="help-desk" />
      <CardSub className="max-w-2xl">
        {items.length} open · cohort-wide. Students open tickets from their lessons; pod faculty triage first.
        Escalations and tech-tagged items appear here for admins.
      </CardSub>
      <HelpDeskQueueClient cohortId={cohort.id} items={items} />
    </>
  );
}
