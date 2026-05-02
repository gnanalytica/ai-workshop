import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listPolls } from "@/lib/queries/polls";
import { PollResultsChart } from "@/app/(authed)/admin/polls/PollResultsChart";
import { LiveClient } from "./LiveClient";

export default async function LivePage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  await requireCapability("content.write", cohort.id);

  const polls = await listPolls(cohort.id);
  const now = Date.now();
  const isActive = (p: (typeof polls)[number]) =>
    p.closed_at === null && (p.closes_at === null || new Date(p.closes_at).getTime() > now);

  const active = polls.filter(isActive);
  const recent = polls.filter((p) => !isActive(p)).slice(0, 5);

  return (
    <>
      <CohortShell cohort={cohort} active="live" />

      <LiveClient
        cohortId={cohort.id}
        active={active.map((p) => ({
          id: p.id,
          question: p.question,
          options: p.options,
          opened_at: p.opened_at,
          closes_at: p.closes_at,
          vote_count: p.vote_count,
          chart: <PollResultsChart pollId={p.id} />,
        }))}
        hasActive={active.length > 0}
      />

      {recent.length > 0 && (
        <Card className="space-y-3 p-5">
          <CardTitle>Recent</CardTitle>
          <ul className="divide-line/40 divide-y">
            {recent.map((p) => (
              <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2 text-sm">
                <span className="text-ink min-w-0 break-words">{p.question}</span>
                <span className="text-muted tabular-nums text-xs">{p.vote_count} votes</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {active.length === 0 && recent.length === 0 && (
        <CardSub>Create the room. Fire a poll, see the room respond, end the moment.</CardSub>
      )}
    </>
  );
}
