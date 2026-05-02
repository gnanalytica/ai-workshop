import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listPolls } from "@/lib/queries/polls";
import { PollsClient } from "@/app/(authed)/admin/polls/PollsClient";
import { PollRow } from "@/app/(authed)/admin/polls/PollRow";
import { PollResultsChart } from "@/app/(authed)/admin/polls/PollResultsChart";

export default async function AdminCohortPollsPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  await requireCapability("content.write");
  const { cohortId } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  const polls = await listPolls(cohort.id);

  return (
    <>
      <CohortShell cohort={cohort} active="polls" />

      <CardSub>
        {polls.length} polls · {polls.filter((p) => !p.closed_at).length} open
      </CardSub>

      <PollsClient cohortId={cohort.id} />

      {polls.length === 0 ? (
        <Card><CardSub>No polls yet.</CardSub></Card>
      ) : (
        <div className="space-y-3">
          {polls.map((p) => (
            <PollRow
              key={p.id}
              poll={p}
              cohortId={cohort.id}
              results={<PollResultsChart pollId={p.id} />}
            />
          ))}
        </div>
      )}
    </>
  );
}
