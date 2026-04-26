"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PollSummary } from "@/lib/queries/polls";
import { closePoll } from "@/lib/actions/polls";
import { fmtDateTime } from "@/lib/format";

export function PollRow({ poll, cohortId }: { poll: PollSummary; cohortId: string }) {
  const [pending, start] = useTransition();
  function close() {
    start(async () => {
      const r = await closePoll({ poll_id: poll.id, cohort_id: cohortId });
      if (r.ok) toast.success("Closed");
      else toast.error(r.error);
    });
  }
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <CardTitle>{poll.question}</CardTitle>
        <div className="flex items-center gap-2">
          {poll.day_number && <Badge>Day {poll.day_number}</Badge>}
          <Badge variant={poll.closed_at ? "default" : "ok"}>
            {poll.closed_at ? "Closed" : "Open"}
          </Badge>
          <Badge>{poll.vote_count} votes</Badge>
          {!poll.closed_at && (
            <Button size="sm" variant="outline" onClick={close} disabled={pending}>
              Close
            </Button>
          )}
        </div>
      </div>
      <ul className="text-muted mt-3 space-y-1 text-sm">
        {poll.options.map((o) => (
          <li key={o.id}>· {o.label}</li>
        ))}
      </ul>
      <p className="text-muted mt-3 text-xs">
        Opened {fmtDateTime(poll.opened_at)}
        {poll.closed_at && ` · closed ${fmtDateTime(poll.closed_at)}`}
      </p>
    </Card>
  );
}
