"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { claimTicket, resolveTicket } from "@/lib/actions/help-desk";
import type { HelpDeskEntry } from "@/lib/queries/faculty";
import { fmtDateTime, relTime } from "@/lib/format";
import { useTableRefresh } from "@/lib/realtime/useTableRefresh";
import { cn } from "@/lib/utils";

const FIFTEEN_MIN = 15 * 60 * 1000;
const SIXTY_MIN = 60 * 60 * 1000;

function ageMs(iso: string): number {
  return Date.now() - new Date(iso).getTime();
}

function priorityBorder(s: HelpDeskEntry): string {
  const age = ageMs(s.created_at);
  if (s.kind === "tech" || s.escalated_at || age > SIXTY_MIN) {
    return "border-l-4 border-l-red-500/60";
  }
  if (s.status === "open" && age >= FIFTEEN_MIN && age <= SIXTY_MIN) {
    return "border-l-4 border-l-amber-500/60";
  }
  if (s.status === "helping") {
    return "border-l-4 border-l-emerald-500/40";
  }
  return "border-l-4 border-l-transparent";
}

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

type StatusTab = "pending" | "resolved";
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
  const [tab, setTab] = useState<StatusTab>("pending");
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, start] = useTransition();
  const [resolveTarget, setResolveTarget] = useState<HelpDeskEntry | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  useTableRefresh("help_desk_queue", { column: "cohort_id", value: cohortId });

  const pendingItems = items.filter((i) => i.status === "open" || i.status === "helping");
  const resolvedItems = items.filter((i) => i.status === "resolved");
  const activeItems = tab === "pending" ? pendingItems : resolvedItems;

  const filtered = filter === "all" ? activeItems : activeItems.filter((i) => i.kind === filter);

  // Pending: escalated first (oldest escalation = most urgent), then FIFO.
  // Resolved: newest-first.
  const sorted = [...filtered].sort((a, b) => {
    if (tab === "resolved") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    const aEsc = a.escalated_at != null;
    const bEsc = b.escalated_at != null;
    if (aEsc !== bEsc) return aEsc ? -1 : 1;
    if (aEsc && bEsc) {
      return new Date(a.escalated_at!).getTime() - new Date(b.escalated_at!).getTime();
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const escalatedCount = pendingItems.filter((i) => i.escalated_at != null).length;
  const openCount = pendingItems.length - escalatedCount;

  function onClaim(id: string) {
    start(async () => {
      const r = await claimTicket({ id });
      if (r.ok) toast.success("Claimed");
      else toast.error(r.error);
    });
  }
  function onResolve(id: string) {
    const target = sorted.find((s) => s.id === id) ?? items.find((i) => i.id === id) ?? null;
    setResolveNote("");
    setResolveTarget(target);
  }

  function closeResolve() {
    setResolveTarget(null);
    setResolveNote("");
  }

  function confirmResolve() {
    if (!resolveTarget) return;
    const id = resolveTarget.id;
    const note = resolveNote.trim();
    start(async () => {
      const r = await resolveTicket({ id, cohort_id: cohortId, resolution: note || undefined });
      if (r.ok) {
        toast.success("Resolved");
        setResolveTarget(null);
        setResolveNote("");
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-line">
        <button
          onClick={() => setTab("pending")}
          className={cn(
            "px-3 py-1.5 text-sm font-medium -mb-px border-b-2 transition-colors",
            tab === "pending"
              ? "border-accent text-ink"
              : "border-transparent text-muted hover:text-ink",
          )}
        >
          Pending ({pendingItems.length})
        </button>
        <button
          onClick={() => setTab("resolved")}
          className={cn(
            "px-3 py-1.5 text-sm font-medium -mb-px border-b-2 transition-colors",
            tab === "resolved"
              ? "border-accent text-ink"
              : "border-transparent text-muted hover:text-ink",
          )}
        >
          Resolved ({resolvedItems.length})
        </button>
      </div>

      {/* Kind filter */}
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

      {sorted.length === 0 ? (
        <Card>
          <CardSub>
            {tab === "pending" ? "Inbox zero. Nice." : "No resolved tickets yet."}
          </CardSub>
        </Card>
      ) : tab === "pending" ? (
        <div className="space-y-2">
          <div className="text-muted text-xs">
            {escalatedCount} escalated · {openCount} open · sorted by priority
          </div>
          {sorted.map((s) => (
            <HelpDeskRow
              key={s.id}
              s={s}
              pending={pending}
              onClaim={onClaim}
              onResolve={onResolve}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((s) => (
            <ResolvedRow key={s.id} s={s} />
          ))}
        </div>
      )}

      {resolveTarget && (
        <ResolveDialog
          note={resolveNote}
          setNote={setResolveNote}
          pending={pending}
          onCancel={closeResolve}
          onConfirm={confirmResolve}
        />
      )}
    </div>
  );
}

function ResolveDialog({
  note,
  setNote,
  pending,
  onCancel,
  onConfirm,
}: {
  note: string;
  setNote: (v: string) => void;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-card border-line w-full max-w-md rounded-lg border p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-ink text-base font-semibold">Resolve ticket</h2>
        <p className="text-muted mt-1 text-xs">
          Optional note for the student. They&apos;ll see it on their /help-desk page.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="What was done? Any follow-up?"
          className="border-line bg-input-bg text-ink mt-3 w-full rounded-md border px-2 py-1.5 text-sm"
          autoFocus
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button size="sm" variant="default" onClick={onConfirm} disabled={pending}>
            Resolve
          </Button>
        </div>
      </div>
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
    <Card className={cn("p-4", priorityBorder(s))}>
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

function ResolvedRow({ s }: { s: HelpDeskEntry }) {
  return (
    <Card className="p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ink text-sm font-medium">{s.user_name ?? "—"}</span>
          <Badge variant={KIND_TONE[s.kind]}>{s.kind}</Badge>
          <Badge variant="ok">resolved</Badge>
        </div>
        <p className="text-ink/85 mt-1.5 text-sm">{s.message ?? "—"}</p>
        {s.resolution && (
          <div className="bg-surface mt-2 rounded-md border border-line px-3 py-2">
            <p className="text-muted text-xs font-medium uppercase tracking-wide">Resolution</p>
            <p className="text-ink mt-0.5 text-sm">{s.resolution}</p>
          </div>
        )}
        <p className="text-muted mt-1.5 text-xs">
          {fmtDateTime(s.created_at)} · {relTime(s.created_at)}
          {s.claimed_by_name && ` · resolved by ${s.claimed_by_name}`}
        </p>
      </div>
    </Card>
  );
}
