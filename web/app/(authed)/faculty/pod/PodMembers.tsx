"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentRow } from "@/components/student-row/StudentRow";
import { cn } from "@/lib/utils";

export interface PodMember {
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  attendance_count: number;
  labs_done: number;
  pending_submissions: number;
}

type Status = "ok" | "at_risk" | "behind";

function classify(att: number, labs: number): Status {
  if (att < 3 && labs < 3) return "behind";
  if (att < 6 || labs < 6) return "at_risk";
  return "ok";
}

type Filter = "all" | Status | "to_review";

export function PodMembers({
  members,
  totalDays,
}: {
  members: PodMember[];
  totalDays: number;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const counts = useMemo(() => {
    let ok = 0,
      at_risk = 0,
      behind = 0,
      to_review = 0;
    members.forEach((m) => {
      const s = classify(m.attendance_count, m.labs_done);
      if (s === "ok") ok++;
      else if (s === "at_risk") at_risk++;
      else behind++;
      if (m.pending_submissions > 0) to_review++;
    });
    return { all: members.length, ok, at_risk, behind, to_review };
  }, [members]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return members.filter((m) => {
      if (t) {
        const hay = `${m.full_name ?? ""} ${m.email}`.toLowerCase();
        if (!hay.includes(t)) return false;
      }
      if (filter === "all") return true;
      if (filter === "to_review") return m.pending_submissions > 0;
      return classify(m.attendance_count, m.labs_done) === filter;
    });
  }, [q, filter, members]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(filtered.map((m) => m.user_id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  const denom = Math.max(totalDays, 1);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${members.length} member${
            members.length === 1 ? "" : "s"
          }…`}
          aria-label="Search members"
          className="max-w-xs"
        />
        <FilterPill
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
          count={counts.all}
        />
        <FilterPill
          active={filter === "behind"}
          onClick={() => setFilter("behind")}
          label="Behind"
          count={counts.behind}
          tone="danger"
        />
        <FilterPill
          active={filter === "at_risk"}
          onClick={() => setFilter("at_risk")}
          label="At risk"
          count={counts.at_risk}
          tone="warn"
        />
        <FilterPill
          active={filter === "ok"}
          onClick={() => setFilter("ok")}
          label="On track"
          count={counts.ok}
          tone="ok"
        />
        <FilterPill
          active={filter === "to_review"}
          onClick={() => setFilter("to_review")}
          label="To review"
          count={counts.to_review}
          tone="warn"
        />
      </div>

      {selected.size > 0 && (
        <div className="border-accent/40 bg-accent/5 sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 backdrop-blur">
          <Badge variant="accent">{selected.size} selected</Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const emails = members
                .filter((m) => selected.has(m.user_id))
                .map((m) => m.email)
                .join(", ");
              try {
                await navigator.clipboard.writeText(emails);
                toast.success("Emails copied to clipboard");
              } catch {
                toast.error("Could not copy");
              }
            }}
          >
            Copy emails
          </Button>
          {selected.size === 1 && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/faculty/student/${[...selected][0]}`}>
                Open profile
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={selectAllVisible}
            className="ml-auto"
          >
            Select all visible
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <p className="text-muted text-sm">No members match.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => {
            const status = classify(m.attendance_count, m.labs_done);
            const labsPct = Math.min(
              100,
              Math.round((m.labs_done / denom) * 100),
            );
            const attPct = Math.min(
              100,
              Math.round((m.attendance_count / denom) * 100),
            );
            const isSelected = selected.has(m.user_id);
            return (
              <Card
                key={m.user_id}
                className={cn(
                  "relative h-full p-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
                  status === "behind" && "border-l-4 border-l-danger/60",
                  status === "at_risk" && "border-l-4 border-l-warn/60",
                  status === "ok" && "border-l-4 border-l-ok/40",
                  isSelected && "ring-accent/40 ring-2",
                )}
              >
                <div className="absolute top-3 right-3 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(m.user_id)}
                    aria-label={`Select ${m.full_name ?? m.email}`}
                    className="accent-[hsl(var(--accent))]"
                  />
                </div>
                <Link href={`/faculty/student/${m.user_id}`} className="block">
                  <StudentRow
                    fullName={m.full_name}
                    email={m.email}
                    avatarUrl={m.avatar_url}
                    status={status}
                  />
                  <div className="mt-4 space-y-2">
                    <Stat
                      label="Attendance"
                      value={`${m.attendance_count}/${denom}`}
                      pct={attPct}
                      tone={status}
                    />
                    <Stat
                      label="Labs"
                      value={`${m.labs_done}/${denom}`}
                      pct={labsPct}
                      tone={status}
                    />
                  </div>
                  {m.pending_submissions > 0 && (
                    <div className="mt-3">
                      <Badge variant="warn">
                        {m.pending_submissions} to review
                      </Badge>
                    </div>
                  )}
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: Status;
}) {
  const barColor =
    tone === "behind"
      ? "bg-danger/70"
      : tone === "at_risk"
        ? "bg-warn/70"
        : "bg-ok/70";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted">{label}</span>
        <span className="text-ink font-medium">{value}</span>
      </div>
      <div className="bg-bg-soft border-line h-1.5 overflow-hidden rounded-full border">
        <div
          className={cn("h-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "warn" | "danger" | "ok";
}) {
  const toneClass =
    tone === "danger"
      ? "data-[active=true]:border-danger/60 data-[active=true]:bg-danger/10 data-[active=true]:text-danger"
      : tone === "warn"
        ? "data-[active=true]:border-warn/60 data-[active=true]:bg-warn/10 data-[active=true]:text-warn"
        : tone === "ok"
          ? "data-[active=true]:border-ok/60 data-[active=true]:bg-ok/10 data-[active=true]:text-ok"
          : "data-[active=true]:border-accent/60 data-[active=true]:bg-accent/10 data-[active=true]:text-accent";
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      className={cn(
        "border-line text-muted hover:text-ink inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        toneClass,
      )}
    >
      <span>{label}</span>
      <span className="bg-bg-soft text-ink rounded-full px-1.5 text-[10px]">
        {count}
      </span>
    </button>
  );
}
