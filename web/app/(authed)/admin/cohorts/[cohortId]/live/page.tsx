import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listPolls, listDraftPolls } from "@/lib/queries/polls";
import { listCohortPolls } from "@/lib/queries/polls-overview";
import { getActiveBanner } from "@/lib/queries/banners";
import { PollResultsChart } from "@/app/(authed)/admin/polls/PollResultsChart";
import { PollResultsPie } from "@/app/(authed)/admin/polls/PollResultsPie";
import { PollsExplorer } from "@/components/admin-cohort/PollsExplorer";
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

  const [polls, drafts, activeBanner, history] = await Promise.all([
    listPolls(cohort.id),
    listDraftPolls(cohort.id),
    getActiveBanner(cohort.id),
    listCohortPolls(cohort.id),
  ]);
  const now = Date.now();
  const isActive = (p: (typeof polls)[number]) =>
    p.closed_at === null &&
    (p.closes_at === null || new Date(p.closes_at).getTime() > now);

  const active = polls.filter(isActive);
  // polls is already ordered by opened_at desc in listPolls.
  const mostRecent = polls[0] ?? null;

  return (
    <>
      <CohortShell cohort={cohort} />

      {mostRecent && (
        <Card className="space-y-2 p-5">
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight">
              Most recent poll
            </h2>
            <span className="text-muted text-xs">
              {mostRecent.vote_count} vote{mostRecent.vote_count === 1 ? "" : "s"}
              {mostRecent.day_number != null ? ` · Day ${mostRecent.day_number}` : ""}
            </span>
          </header>
          <p className="text-ink text-sm">{mostRecent.question}</p>
          <PollResultsPie pollId={mostRecent.id} />
        </Card>
      )}

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

      <section className="space-y-2">
        <header className="border-line/50 flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
          <h2 className="text-lg font-semibold tracking-tight">History</h2>
          <p className="text-muted text-xs">
            {history.length} poll{history.length === 1 ? "" : "s"} across the cohort
            run · grouped by day, click a row to see results
          </p>
        </header>
        {history.length === 0 ? (
          <Card>
            <CardSub>
              Nothing yet. Fire a poll above and it&apos;ll land here once it
              closes.
            </CardSub>
          </Card>
        ) : (
          <PollsExplorer polls={history} cohortId={cohort.id} />
        )}
      </section>
    </>
  );
}
