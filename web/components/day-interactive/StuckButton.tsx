"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reportStuck } from "@/lib/actions/stuck";

type Kind = "content" | "tech" | "team" | "other";

export function StuckButton({ cohortId }: { cohortId: string }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("content");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  function send() {
    if (message.trim().length < 1) {
      toast.error("Describe what's stuck");
      return;
    }
    start(async () => {
      const r = await reportStuck({ cohort_id: cohortId, kind, message: message.trim() });
      if (r.ok) {
        toast.success("Help is on the way");
        setMessage("");
        setOpen(false);
      } else toast.error(r.error);
    });
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        I&apos;m stuck
      </Button>
    );
  }
  return (
    <div className="border-line bg-card flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center gap-2 text-xs">
        <label className="text-muted">Type</label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as Kind)}
          className="border-line bg-input-bg text-ink rounded-md border px-2 py-1"
        >
          <option value="content">Content</option>
          <option value="tech">Tech</option>
          <option value="team">Team</option>
          <option value="other">Other</option>
        </select>
      </div>
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What's blocking you?"
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
