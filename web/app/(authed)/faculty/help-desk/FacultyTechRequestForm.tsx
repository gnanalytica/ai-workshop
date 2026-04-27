"use client";

import { useState, useTransition } from "react";
import { Headset } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reportFacultyTechTicket } from "@/lib/actions/help-desk";
import { Card, CardSub, CardTitle } from "@/components/ui/card";

export function FacultyTechRequestForm({ cohortId }: { cohortId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  function send() {
    if (message.trim().length < 1) {
      toast.error("Describe what you need from platform or tech");
      return;
    }
    start(async () => {
      const r = await reportFacultyTechTicket({ cohort_id: cohortId, message: message.trim() });
      if (r.ok) {
        toast.success("Request sent to platform / tech");
        setMessage("");
        setOpen(false);
      } else toast.error(r.error);
    });
  }

  if (!open) {
    return (
      <Card className="border-accent/25 from-card/80 to-bg-soft/20 bg-gradient-to-br">
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-muted flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase">
                <Headset className="h-3.5 w-3.5" />
                For you
              </div>
              <CardTitle className="mt-1.5 text-base">Request help from platform tech</CardTitle>
              <CardSub className="text-ink/80 mt-1 max-w-xl">
                Opens a <strong>tech</strong> ticket in the same staff queue as escalations. Use it for login issues, bugs, wrong permissions, or anything only tech / cohort staff should fix—not for student
                support you would normally triage below.
              </CardSub>
            </div>
            <Button className="shrink-0" type="button" onClick={() => setOpen(true)}>
              New tech request
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-accent/30 p-4 sm:p-5">
      <div className="text-muted mb-2 font-mono text-[10px] tracking-widest uppercase">To platform / tech</div>
      <p className="text-ink/90 mb-3 text-sm">
        Describe the issue, steps to reproduce, and urgency. The ticket is tagged for tech/cohort staff—same lane as a student ticket escalated to tech.
      </p>
      <textarea
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="e.g. I can’t see Manage pods, or a student can’t open Day 3 lab — …"
        className="border-line bg-input-bg text-ink w-full rounded-lg border p-3 text-sm"
        disabled={pending}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" onClick={send} disabled={pending}>
          {pending ? "Sending…" : "Send to platform tech"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOpen(false);
            setMessage("");
          }}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
}
