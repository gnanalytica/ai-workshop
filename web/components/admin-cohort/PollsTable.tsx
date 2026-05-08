import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtDateTime } from "@/lib/format";
import type { PollOverviewRow } from "@/lib/queries/polls-overview";

export function PollsTable({ polls }: { polls: PollOverviewRow[] }) {
  if (polls.length === 0) {
    return (
      <Card>
        <CardSub>No polls or pulses launched yet for this cohort.</CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-muted text-[10.5px] uppercase tracking-[0.18em]">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Day</th>
              <th className="px-4 py-2 text-left font-semibold">Type</th>
              <th className="px-4 py-2 text-left font-semibold">Question</th>
              <th className="px-4 py-2 text-right font-semibold">Votes</th>
              <th className="px-4 py-2 text-left font-semibold">Opened</th>
              <th className="px-4 py-2 text-left font-semibold">Closed</th>
            </tr>
          </thead>
          <tbody className="divide-line/40 divide-y">
            {polls.map((p) => (
              <tr key={p.id} className="hover:bg-bg-soft/60">
                <td className="px-4 py-2 font-mono text-xs">
                  {p.day_number === null ? "—" : `D${String(p.day_number).padStart(2, "0")}`}
                </td>
                <td className="px-4 py-2">
                  <Badge variant={p.kind === "pulse" ? "accent" : "default"}>
                    {p.kind}
                  </Badge>
                </td>
                <td className="text-ink max-w-[28rem] truncate px-4 py-2">
                  {p.question}
                </td>
                <td className="text-ink px-4 py-2 text-right font-mono tabular-nums">
                  {p.total_votes}
                </td>
                <td className="text-muted px-4 py-2 text-xs whitespace-nowrap">
                  {p.opened_at ? fmtDateTime(p.opened_at) : "—"}
                </td>
                <td className="text-muted px-4 py-2 text-xs whitespace-nowrap">
                  {p.closed_at ? fmtDateTime(p.closed_at) : "open"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
