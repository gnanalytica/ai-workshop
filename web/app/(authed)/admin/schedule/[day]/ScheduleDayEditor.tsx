"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CohortDay } from "@/lib/queries/cohort";
import { updateCohortDay, setDayUnlocked } from "@/lib/actions/schedule";

export function ScheduleDayEditor({ cohortId, day }: { cohortId: string; day: CohortDay }) {
  const [title, setTitle] = useState(day.title);
  const [meetLink, setMeetLink] = useState(day.meet_link ?? "");
  const [notes, setNotes] = useState(day.notes ?? "");
  const [liveAt, setLiveAt] = useState<string>(day.live_session_at?.slice(0, 16) ?? "");
  const [unlocked, setUnlocked] = useState(day.is_unlocked);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const r = await updateCohortDay({
        cohort_id: cohortId,
        day_number: day.day_number,
        title,
        live_session_at: liveAt ? new Date(liveAt).toISOString() : null,
        meet_link: meetLink || null,
        notes: notes || null,
      });
      if (r.ok) toast.success("Saved");
      else toast.error(r.error);
    });
  }
  function toggle() {
    const next = !unlocked;
    setUnlocked(next);
    start(async () => {
      const r = await setDayUnlocked({
        cohort_id: cohortId,
        day_number: day.day_number,
        is_unlocked: next,
      });
      if (!r.ok) {
        setUnlocked(!next);
        toast.error(r.error);
      } else toast.success(next ? "Unlocked" : "Locked");
    });
  }

  return (
    <Card className="space-y-4 p-5">
      <div>
        <label className="text-muted text-xs uppercase tracking-widest">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-muted text-xs uppercase tracking-widest">Live session</label>
        <Input
          type="datetime-local"
          value={liveAt}
          onChange={(e) => setLiveAt(e.target.value)}
        />
      </div>
      <div>
        <label className="text-muted text-xs uppercase tracking-widest">Meet link</label>
        <Input
          placeholder="https://meet…"
          value={meetLink}
          onChange={(e) => setMeetLink(e.target.value)}
        />
      </div>
      <div>
        <label className="text-muted text-xs uppercase tracking-widest">Notes (private to staff)</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border-line bg-input-bg text-ink w-full rounded-md border p-3 text-sm"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={unlocked ? "ok" : "default"}>{unlocked ? "Unlocked" : "Locked"}</Badge>
        <Button variant="outline" disabled={pending} onClick={toggle}>
          {unlocked ? "Lock day" : "Unlock day"}
        </Button>
        <div className="hidden flex-1 sm:block" />
        <Button disabled={pending} onClick={save} className="sm:ml-auto">
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
