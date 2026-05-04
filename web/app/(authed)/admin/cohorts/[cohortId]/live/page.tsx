import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listPolls, listDraftPolls } from "@/lib/queries/polls";
import { getActiveBanner } from "@/lib/queries/banners";
import { PollResultsChart } from "@/app/(authed)/admin/polls/PollResultsChart";
import { LazyPollResults } from "@/components/polls/LazyPollResults";
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

  const [polls, drafts, activeBanner] = await Promise.all([
    listPolls(cohort.id),
    listDraftPolls(cohort.id),
    getActiveBanner(cohort.id),
  ]);
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
        activeBanner={activeBanner}
        drafts={drafts.map((d) => ({
          id: d.id,
          question: d.question,
          options: d.options,
          kind: d.kind,
          day_number: d.day_number,
        }))}
      />

      {recent.length > 0 && (
        <Card className="space-y-3 p-5">
          <div className="flex items-baseline justify-between gap-2">
            <CardTitle>Recent</CardTitle>
            <Link
              href={`/admin/cohorts/${cohort.id}/polls`}
              className="text-accent text-xs"
            >
              Full poll history →
            </Link>
          </div>
          <ul className="divide-line/40 divide-y">
            {recent.map((p) => (
              <li key={p.id} className="py-2 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-ink min-w-0 break-words">{p.question}</span>
                  <span className="flex items-baseline gap-3">
                    <span className="text-muted tabular-nums text-xs">{p.vote_count} votes</span>
                    <LazyPollResults pollId={p.id} cohortId={cohort.id} />
                  </span>
                </div>
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
