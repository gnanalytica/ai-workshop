"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DayPoll } from "@/lib/queries/day-interactive";
import { castVote } from "@/lib/actions/polls";

export function PollBlock({ poll }: { poll: DayPoll }) {
  const [choice, setChoice] = useState<string | null>(poll.my_choice);
  const [pending, start] = useTransition();
  const closed = !!poll.closed_at;

  function vote(c: string) {
    setChoice(c);
    start(async () => {
      const r = await castVote({ poll_id: poll.id, choice: c });
      if (r.ok) toast.success("Voted");
      else toast.error(r.error);
    });
  }

  const total = poll.results?.reduce((s, r) => s + r.votes, 0) ?? 0;

  return (
    <Card className="space-y-3 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <CardTitle>📊 {poll.question}</CardTitle>
        <Badge variant={closed ? "default" : "ok"}>{closed ? "Closed" : "Open"}</Badge>
      </div>
      {closed && poll.results ? (
        <div className="space-y-1.5">
          {poll.results.map((r) => {
            const pct = total === 0 ? 0 : Math.round((r.votes / total) * 100);
            const mine = poll.my_choice === r.choice;
            return (
              <div key={r.choice} className="space-y-0.5">
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-ink truncate">
                    {mine && "✓ "}
                    {r.label}
                  </span>
                  <span className="text-muted tabular-nums">
                    {r.votes} <span className="opacity-60">· {pct}%</span>
                  </span>
                </div>
                <div className="bg-bg-soft h-2 w-full overflow-hidden rounded-sm">
                  <div className="bg-accent h-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <p className="text-muted pt-1 text-[10px] uppercase tracking-wider">
            {total} {total === 1 ? "vote" : "votes"} total
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {poll.options.map((opt) => {
            const selected = choice === opt.id;
            return (
              <Button
                key={opt.id}
                variant={selected ? "default" : "outline"}
                size="sm"
                disabled={pending || closed}
                className="w-full justify-start"
                onClick={() => vote(opt.id)}
              >
                {selected && "✓ "}
                {opt.label}
              </Button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
