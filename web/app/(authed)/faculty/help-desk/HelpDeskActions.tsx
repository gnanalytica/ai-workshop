"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { claimTicket, resolveTicket, escalateTicket } from "@/lib/actions/help-desk";

export function HelpDeskActions({
  id,
  cohortId,
  status,
  alreadyEscalated,
  isSelfToTechRequest,
}: {
  id: string;
  cohortId: string;
  status: "open" | "helping" | "resolved" | "cancelled";
  alreadyEscalated: boolean;
  /** Faculty’s own ticket filed directly to tech — no triage actions here */
  isSelfToTechRequest?: boolean;
}) {
  const [pending, start] = useTransition();
  const [showEscalate, setShowEscalate] = useState(false);
  const [note, setNote] = useState("");

  function claim() {
    start(async () => {
      const r = await claimTicket({ id });
      if (r.ok) toast.success("Claimed");
      else toast.error(r.error);
    });
  }
  function resolve() {
    start(async () => {
      const r = await resolveTicket({ id, cohort_id: cohortId });
      if (r.ok) toast.success("Resolved");
      else toast.error(r.error);
    });
  }
  function escalate() {
    if (!note.trim()) {
        toast.error("Add a note for trainer, admin, or tech");
      return;
    }
    start(async () => {
      const r = await escalateTicket({ id, cohort_id: cohortId, note });
      if (r.ok) {
        toast.success("Sent to help desk (staff)");
        setShowEscalate(false);
        setNote("");
      } else toast.error(r.error);
    });
  }

  if (status === "resolved") return null;

  if (isSelfToTechRequest) {
    return (
      <p className="text-muted max-w-[14rem] text-right text-xs leading-snug">
        {status === "helping"
          ? "Platform or tech is handling this."
          : "Queued with platform / tech staff. They’ll pick it up from the tech queue."}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {status === "open" && (
          <Button size="sm" variant="outline" onClick={claim} disabled={pending}>
            Claim
          </Button>
        )}
        {status === "helping" && (
          <Button size="sm" onClick={resolve} disabled={pending}>
            Resolve
          </Button>
        )}
        {!alreadyEscalated && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowEscalate((v) => !v)}
            disabled={pending}
          >
            Escalate to staff
          </Button>
        )}
      </div>
      {showEscalate && (
        <div className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What should trainer, admin, or tech do?"
            className="border-line bg-input-bg text-ink w-72 rounded-md border px-2 py-1 text-sm"
          />
          <Button size="sm" variant="danger" onClick={escalate} disabled={pending}>
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
