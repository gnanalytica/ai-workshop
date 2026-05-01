"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reportTicket } from "@/lib/actions/help-desk";

type Kind = "content" | "tech" | "team" | "other";

const KINDS: { value: Kind; label: string; hint: string }[] = [
  { value: "tech", label: "Tech", hint: "Login, audio/video, the platform itself" },
  { value: "content", label: "Content", hint: "A lesson, assignment, or quiz question" },
  { value: "team", label: "Team", hint: "Pod or teammate issue" },
  { value: "other", label: "Other", hint: "Anything else" },
];

/**
 * Always-visible new-ticket card for /help-desk. Replaces the inline-toggle
 * HelpDeskButton on the student help-desk page so the form is the page —
 * no extra click to discover it.
 */
export function NewTicketCard({ cohortId }: { cohortId: string }) {
  const [kind, setKind] = useState<Kind>("tech");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  function send() {
    const trimmed = message.trim();
    if (trimmed.length < 5) {
      toast.error("Add a sentence or two so we know what's blocking you");
      return;
    }
    start(async () => {
      const r = await reportTicket({
        cohort_id: cohortId,
        kind,
        message: trimmed,
      });
      if (r.ok) {
        toast.success("Ticket created — your faculty / pod will see it first");
        setMessage("");
        setKind("tech");
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <section
      aria-labelledby="new-ticket-heading"
      className="border-line bg-card rounded-lg border p-5"
    >
      <h2
        id="new-ticket-heading"
        className="text-ink text-base font-semibold tracking-tight"
      >
        Raise a new ticket
      </h2>
      <p className="text-muted mt-1 text-xs leading-relaxed">
        Pick a type, write what&apos;s blocking you. Your pod faculty sees it first; tech / staff
        pick up escalations.
      </p>

      <div className="mt-4">
        <p className="text-muted mb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em]">
          Type
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {KINDS.map((k) => {
            const active = kind === k.value;
            return (
              <button
                key={k.value}
                type="button"
                onClick={() => setKind(k.value)}
                disabled={pending}
                className={
                  active
                    ? "border-accent bg-accent/10 text-ink ring-accent/15 rounded-md border-2 px-3 py-2 text-left ring-2 transition-colors disabled:opacity-50"
                    : "border-line bg-bg hover:border-accent/55 hover:bg-accent/5 text-ink/85 rounded-md border px-3 py-2 text-left transition-colors disabled:opacity-50"
                }
                aria-pressed={active}
              >
                <span className="block text-[13px] font-semibold">{k.label}</span>
                <span className="text-muted mt-0.5 block text-[11px] leading-snug">
                  {k.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="ticket-message"
          className="text-muted mb-2 block text-[10.5px] font-semibold uppercase tracking-[0.18em]"
        >
          What&apos;s blocking you?
        </label>
        <textarea
          id="ticket-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Zoom audio cuts out every couple of minutes. Tried headphones, same thing."
          disabled={pending}
          className="border-line bg-input-bg text-ink focus:border-accent focus:ring-accent/15 w-full rounded-md border p-3 text-sm leading-relaxed transition-colors focus:outline-none focus:ring-2 disabled:opacity-50"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-muted text-[11px]">
          {message.trim().length === 0
            ? "Be specific — even one extra sentence helps."
            : `${message.trim().length} chars · ready to send`}
        </p>
        <Button
          onClick={send}
          disabled={pending || message.trim().length < 5}
          size="md"
        >
          <Send size={14} strokeWidth={2.2} className="mr-1.5" />
          {pending ? "Sending…" : "Send ticket"}
        </Button>
      </div>
    </section>
  );
}
