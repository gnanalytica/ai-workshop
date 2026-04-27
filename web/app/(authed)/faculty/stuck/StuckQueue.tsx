"use client";

import { useMemo, useState } from "react";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { relTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StuckActions } from "./StuckActions";
import type { FacultyStuckEntry } from "@/lib/queries/faculty-stuck";

type FilterKey = "all" | "open" | "helping" | "mine" | "tech" | "other";
type SortKey = "oldest" | "newest" | "stalled";

const FIFTEEN_MIN = 15 * 60 * 1000;
const SIXTY_MIN = 60 * 60 * 1000;

function ageMs(iso: string): number {
  return Date.now() - new Date(iso).getTime();
}

function priorityBorder(s: FacultyStuckEntry): string {
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

export function StuckQueue({
  items,
  meId,
  cohortId,
}: {
  items: FacultyStuckEntry[];
  meId: string;
  cohortId: string;
}) {
  // meId is currently unused for exact-match filtering — see "mine" filter TODO below.
  void meId;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("oldest");

  const counts = useMemo(() => {
    return {
      all: items.length,
      open: items.filter((i) => i.status === "open").length,
      helping: items.filter((i) => i.status === "helping").length,
      // TODO: wire claimer_id through listFacultyStuck so we can match "mine" exactly
      // against meId. For now, "mine" surfaces all helping tickets (anyone helping).
      mine: items.filter((i) => i.status === "helping" && !!i.claimed_by_name).length,
      tech: items.filter((i) => i.kind === "tech").length,
      other: items.filter((i) => i.kind !== "tech").length,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((s) => {
      if (q) {
        const name = (s.user_name ?? "").toLowerCase();
        const msg = (s.message ?? "").toLowerCase();
        if (!name.includes(q) && !msg.includes(q)) return false;
      }
      switch (filter) {
        case "open":
          return s.status === "open";
        case "helping":
          return s.status === "helping";
        case "mine":
          return s.status === "helping" && !!s.claimed_by_name;
        case "tech":
          return s.kind === "tech";
        case "other":
          return s.kind !== "tech";
        case "all":
        default:
          return true;
      }
    });

    list = [...list].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      switch (sort) {
        case "newest":
          return tb - ta;
        case "stalled": {
          const aHelping = a.status === "helping" ? 0 : 1;
          const bHelping = b.status === "helping" ? 0 : 1;
          if (aHelping !== bHelping) return aHelping - bHelping;
          return ta - tb;
        }
        case "oldest":
        default:
          return ta - tb;
      }
    });

    return list;
  }, [items, query, filter, sort]);

  const pills: Array<{ key: FilterKey; label: string; count: number }> = [
    { key: "all", label: "All", count: counts.all },
    { key: "open", label: "Open", count: counts.open },
    { key: "helping", label: "Helping", count: counts.helping },
    { key: "mine", label: "Mine", count: counts.mine },
    { key: "tech", label: "Tech", count: counts.tech },
    { key: "other", label: "Other", count: counts.other },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by student or message…"
          className="w-72"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="border-line bg-input-bg text-ink rounded-md border px-2 py-1.5 text-sm"
          aria-label="Sort tickets"
        >
          <option value="oldest">Oldest first</option>
          <option value="newest">Newest first</option>
          <option value="stalled">Stalled (helping, oldest)</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {pills.map((p) => (
          <Button
            key={p.key}
            size="sm"
            variant={filter === p.key ? "default" : "outline"}
            onClick={() => setFilter(p.key)}
          >
            {p.label}
            <span className="text-muted ml-1.5 text-xs">{p.count}</span>
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardSub>No tickets match.</CardSub>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <Card
              key={s.id}
              className={cn(
                "flex items-start justify-between gap-3 p-4",
                priorityBorder(s),
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink text-sm font-medium">{s.user_name ?? "—"}</span>
                  {s.pod_name && <Badge>{s.pod_name}</Badge>}
                  <Badge variant={s.kind === "tech" ? "danger" : "warn"}>{s.kind}</Badge>
                  <Badge variant={s.status === "helping" ? "accent" : "default"}>{s.status}</Badge>
                  {s.escalated_at && <Badge variant="danger">escalated</Badge>}
                  <span className="text-muted text-xs">{relTime(s.created_at)}</span>
                </div>
                {s.message && <p className="text-ink/85 mt-2 text-sm">{s.message}</p>}
                {s.claimed_by_name && (
                  <p className="text-muted mt-1 text-xs">helping: {s.claimed_by_name}</p>
                )}
                {s.escalation_note && (
                  <p className="text-danger mt-1 text-xs">escalation: {s.escalation_note}</p>
                )}
              </div>
              <StuckActions
                id={s.id}
                cohortId={cohortId}
                status={s.status}
                alreadyEscalated={!!s.escalated_at}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
