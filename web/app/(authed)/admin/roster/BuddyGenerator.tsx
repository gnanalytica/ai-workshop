"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateBuddyPairs } from "@/lib/actions/buddies";

export function BuddyGenerator({ cohortId }: { cohortId: string }) {
  const [week, setWeek] = useState("1");
  const [pending, start] = useTransition();

  function go() {
    start(async () => {
      const r = await generateBuddyPairs({ cohort_id: cohortId, week_number: Number(week) });
      if (r.ok) {
        const pairs = (r.data as { pairs: number } | undefined)?.pairs ?? 0;
        toast.success(`Generated ${pairs} buddy pairs`);
      }
      else toast.error(r.error);
    });
  }

  return (
    <div className="border-line flex flex-wrap items-center gap-2 rounded-md border p-3">
      <span className="text-muted text-xs">Buddy pairs · week</span>
      <select
        value={week}
        onChange={(e) => setWeek(e.target.value)}
        className="border-line bg-input-bg text-ink rounded-md border px-2 py-1 text-sm"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1}</option>
        ))}
      </select>
      <Button size="sm" variant="outline" onClick={go} disabled={pending}>
        {pending ? "Generating…" : "Generate"}
      </Button>
    </div>
  );
}
