import { getPollResults } from "@/lib/queries/polls";

export async function PollResultsChart({ pollId }: { pollId: string }) {
  const rows = await getPollResults(pollId);
  const total = rows.reduce((acc, r) => acc + r.votes, 0);

  if (total === 0) {
    return <p className="text-muted mt-3 text-sm">0 votes yet</p>;
  }

  return (
    <ul className="mt-3 space-y-2">
      {rows.map((r) => {
        const pct = Math.round((r.votes / total) * 100);
        return (
          <li key={r.choice} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink truncate">{r.label}</span>
              <span className="text-muted tabular-nums text-xs">
                {r.votes} · {pct}%
              </span>
            </div>
            <div className="bg-bg-soft h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-accent h-full rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
