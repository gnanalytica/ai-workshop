import { redirect } from "next/navigation";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { listPolls } from "@/lib/queries/polls";
import { LazyPollResults } from "@/components/polls/LazyPollResults";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Polls" };

export default async function PollsHistoryPage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) redirect("/learn");

  const polls = await listPolls(cohort.id);
  const now = Date.now();
  const past = polls.filter(
    (p) =>
      p.closed_at !== null ||
      (p.closes_at !== null && new Date(p.closes_at).getTime() <= now),
  );

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-ink text-xl font-semibold">Polls</h1>
        <p className="text-muted text-sm">
          Results from past polls and pulses for {cohort.name}.
        </p>
      </header>

      {past.length === 0 ? (
        <Card className="p-5">
          <CardTitle>No past polls yet</CardTitle>
          <CardSub>Once a poll closes you&rsquo;ll see its results here.</CardSub>
        </Card>
      ) : (
        <Card className="p-5">
          <ul className="divide-line/40 divide-y">
            {past.map((p) => {
              const when = p.closed_at ?? p.closes_at ?? p.opened_at;
              return (
                <li key={p.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-ink min-w-0 break-words">
                      {p.question}
                    </span>
                    <span className="flex items-baseline gap-3">
                      <span className="text-muted tabular-nums text-xs">
                        {fmtDate(when)} &middot; {p.vote_count} votes
                      </span>
                      <LazyPollResults pollId={p.id} cohortId={cohort.id} />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
