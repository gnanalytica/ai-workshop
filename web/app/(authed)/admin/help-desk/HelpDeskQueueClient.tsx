"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { claimTicket, resolveTicket } from "@/lib/actions/help-desk";
import type { HelpDeskEntry } from "@/lib/queries/faculty";
import { fmtDateTime, relTime } from "@/lib/format";
import { useTableRefresh } from "@/lib/realtime/useTableRefresh";

const KIND_TONE: Record<HelpDeskEntry["kind"], "warn" | "danger" | "default" | "accent"> = {
  content: "warn",
  tech: "danger",
  team: "accent",
  other: "default",
};

const STATUS_TONE: Record<HelpDeskEntry["status"], "warn" | "accent" | "ok" | "default"> = {
  open: "warn",
  helping: "accent",
  resolved: "ok",
  cancelled: "default",
};

type Filter = "all" | "content" | "tech" | "team" | "other";

const FILTER_LABEL: Record<Filter, string> = {
  all: "All",
  content: "Content",
  tech: "Tech",
  team: "Team",
  other: "Other",
};

export function HelpDeskQueueClient({
  cohortId,
  items,
}: {
  cohortId: string;
  items: HelpDeskEntry[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, start] = useTransition();
  useTableRefresh("help_desk_queue", { column: "cohort_id", value: cohortId });
  const filtered = filter === "all" ? items : items.filter((i) => i.kind === filter);
  const escalated = filtered.filter((i) => i.escalated_at != null);
  const open = filtered.filter((i) => i.escalated_at == null);

  function onClaim(id: string) {
    start(async () => {
      const r = await claimTicket({ id });
      if (r.ok) toast.success("Claimed");
      else toast.error(r.error);
    });
  }
  function onResolve(id: string) {
    const note = window.prompt("Resolution note (optional)") ?? "";
    start(async () => {
      const r = await resolveTicket({ id, cohort_id: cohortId, resolution: note || undefined });
      if (r.ok) toast.success("Resolved");
      else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "content", "tech", "team", "other"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "rounded-full border px-3 py-1 text-xs " +
              (filter === f
                ? "bg-accent text-cta-ink border-transparent"
                : "border-line text-muted hover:text-ink")
            }
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
        <span className="text-muted ml-auto text-xs">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      {filtered.length === 0 ? (
        <Card><CardSub>Inbox zero. Nice.</CardSub></Card>
      ) : (
        <div className="space-y-6">
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-ink text-sm font-medium">Escalated</h3>
              <span className="text-muted text-xs">
                {escalated.length} escalated · {open.length} open
              </span>
            </div>
            {escalated.map((s) => (
              <HelpDeskRow
                key={s.id}
                s={s}
                pending={pending}
                onClaim={onClaim}
                onResolve={onResolve}
              />
            ))}
          </section>
          {open.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-ink text-sm font-medium">Open</h3>
                <span className="text-muted text-xs">{open.length} open</span>
              </div>
              {open.map((s) => (
                <HelpDeskRow
                  key={s.id}
                  s={s}
                  pending={pending}
                  onClaim={onClaim}
                  onResolve={onResolve}
                />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function HelpDeskRow({
  s,
  pending,
  onClaim,
  onResolve,
}: {
  s: HelpDeskEntry;
  pending: boolean;
  onClaim: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const isEscalated = s.escalated_at != null;
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ink text-sm font-medium">{s.user_name ?? "—"}</span>
            <Badge variant={KIND_TONE[s.kind]}>{s.kind}</Badge>
            <Badge variant={STATUS_TONE[s.status]}>{s.status}</Badge>
            {isEscalated && <Badge variant="danger">Escalated</Badge>}
          </div>
          <p className="text-ink/85 mt-1.5 text-sm">{s.message ?? "—"}</p>
          {isEscalated && s.escalation_note && (
            <p className="text-muted mt-1 text-xs italic">
              — {s.escalator_name ?? "Faculty"}: &ldquo;{s.escalation_note}&rdquo;
            </p>
          )}
          <p className="text-muted mt-1 text-xs">
            {fmtDateTime(s.created_at)} · {relTime(s.created_at)}
            {s.claimed_by_name && ` · helping: ${s.claimed_by_name}`}
          </p>
        </div>
        <div className="flex gap-2">
          {s.status === "open" && (
            <Button size="sm" variant="outline" disabled={pending} onClick={() => onClaim(s.id)}>
              Claim
            </Button>
          )}
          {(s.status === "open" || s.status === "helping") && (
            <Button size="sm" variant="default" disabled={pending} onClick={() => onResolve(s.id)}>
              Resolve
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
