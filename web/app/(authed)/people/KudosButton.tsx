"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { giveKudos } from "@/lib/actions/kudos";

export function KudosButton({ toUserId, cohortId }: { toUserId: string; cohortId: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  function send() {
    if (note.trim().length < 3) {
      toast.error("Please add a short note");
      return;
    }
    start(async () => {
      const r = await giveKudos({ to_user_id: toUserId, cohort_id: cohortId, note: note.trim() });
      if (r.ok) {
        toast.success("Appreciation sent");
        setNote("");
        setOpen(false);
      } else toast.error(r.error);
    });
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Send appreciation
      </Button>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What did they do well?"
        className="border-line bg-input-bg text-ink w-full rounded-md border p-2 text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={send} disabled={pending}>
          Send
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
