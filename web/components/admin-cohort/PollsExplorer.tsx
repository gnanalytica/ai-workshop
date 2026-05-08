"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtDateTime } from "@/lib/format";
import { fetchPollResults, type PollResultRow } from "@/lib/actions/poll-results";
import type { PollOverviewRow } from "@/lib/queries/polls-overview";
import { cn } from "@/lib/utils";

type DayFilter = "all" | number;
type KindFilter = "all" | string;

export function PollsExplorer({ polls }: { polls: PollOverviewRow[] }) {
  const [day, setDay] = useState<DayFilter>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, PollResultRow[]>>({});
  const [pending, startTransition] = useTransition();
  const [pendingFor, setPendingFor] = useState<string | null>(null);

  const days = useMemo(() => {
    const xs = new Set<number>();
    for (const p of polls)
      if (typeof p.day_number === "number") xs.add(p.day_number);
    return [...xs].sort((a, b) => a - b);
  }, [polls]);

  const kinds = useMemo(() => {
    const xs = new Set<string>();
    for (const p of polls) xs.add(p.kind);
    return [...xs].sort();
  }, [polls]);

  const filtered = useMemo(() => {
    return polls.filter((p) => {
      if (kind !== "all" && p.kind !== kind) return false;
      if (day === "all") return true;
      return p.day_number === day;
    });
  }, [polls, day, kind]);

  function toggle(id: string) {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    if (results[id]) return;
    setPendingFor(id);
    startTransition(async () => {
      const r = await fetchPollResults(id);
      if (r.ok) setResults((m) => ({ ...m, [id]: r.rows }));
      setPendingFor(null);
    });
  }

  if (polls.length === 0) {
    return (
      <Card>
        <CardSub>No polls or pulses launched yet for this cohort.</CardSub>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border-line bg-card flex flex-wrap items-center gap-3 rounded-lg border p-3">
        <FilterGroup
          label="Day"
          value={day === "all" ? "all" : String(day)}
          onChange={(v) => setDay(v === "all" ? "all" : Number(v))}
          options={[
            { value: "all", label: `All (${polls.length})` },
            ...days.map((d) => ({
              value: String(d),
              label: `D${String(d).padStart(2, "0")}`,
            })),
            { value: "none", label: "No day", disabled: true },
          ]}
          onCustom={(v) => v === "none"}
        />
        <FilterGroup
          label="Type"
          value={kind}
          onChange={(v) => setKind(v)}
          options={[
            { value: "all", label: "All" },
            ...kinds.map((k) => ({ value: k, label: k })),
          ]}
        />
        <span className="text-muted ml-auto text-xs">
          {filtered.length} match{filtered.length === 1 ? "" : "es"}
        </span>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft text-muted text-[10.5px] uppercase tracking-[0.18em]">
              <tr>
                <th className="w-12 px-2 py-2"></th>
                <th className="px-3 py-2 text-left font-semibold">Day</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Question</th>
                <th className="px-3 py-2 text-right font-semibold">Votes</th>
                <th className="px-3 py-2 text-left font-semibold">Opened</th>
                <th className="px-3 py-2 text-left font-semibold">Closed</th>
              </tr>
            </thead>
            <tbody className="divide-line/40 divide-y">
              {filtered.map((p) => {
                const open = openId === p.id;
                return (
                  <FragmentRow
                    key={p.id}
                    poll={p}
                    open={open}
                    onToggle={() => toggle(p.id)}
                    rows={results[p.id]}
                    loading={pending && pendingFor === p.id}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function FragmentRow({
  poll,
  open,
  onToggle,
  rows,
  loading,
}: {
  poll: PollOverviewRow;
  open: boolean;
  onToggle: () => void;
  rows?: PollResultRow[];
  loading: boolean;
}) {
  return (
    <>
      <tr
        className={cn(
          "hover:bg-bg-soft/60 cursor-pointer",
          open && "bg-bg-soft/40",
        )}
        onClick={onToggle}
      >
        <td className="px-2 py-2 text-center">
          <span
            className={cn(
              "text-muted inline-block transition-transform",
              open && "rotate-90",
            )}
            aria-hidden
          >
            ▸
          </span>
        </td>
        <td className="px-3 py-2 font-mono text-xs">
          {poll.day_number === null
            ? "—"
            : `D${String(poll.day_number).padStart(2, "0")}`}
        </td>
        <td className="px-3 py-2">
          <Badge variant={poll.kind === "pulse" ? "accent" : "default"}>
            {poll.kind}
          </Badge>
        </td>
        <td className="text-ink max-w-[28rem] truncate px-3 py-2">
          {poll.question}
        </td>
        <td className="text-ink px-3 py-2 text-right font-mono tabular-nums">
          {poll.total_votes}
        </td>
        <td className="text-muted px-3 py-2 text-xs whitespace-nowrap">
          {poll.opened_at ? fmtDateTime(poll.opened_at) : "—"}
        </td>
        <td className="text-muted px-3 py-2 text-xs whitespace-nowrap">
          {poll.closed_at ? fmtDateTime(poll.closed_at) : "open"}
        </td>
      </tr>
      {open && (
        <tr className="bg-bg-soft/20">
          <td className="px-2"></td>
          <td colSpan={6} className="px-3 py-3">
            {loading ? (
              <p className="text-muted text-xs">loading vote breakdown…</p>
            ) : rows ? (
              rows.length === 0 ? (
                <p className="text-muted text-xs">No votes yet.</p>
              ) : (
                <ResultBars rows={rows} total={poll.total_votes} />
              )
            ) : (
              <p className="text-muted text-xs">Click again to retry.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function ResultBars({ rows, total }: { rows: PollResultRow[]; total: number }) {
  const denom = total > 0 ? total : 1;
  const sorted = [...rows].sort((a, b) => b.votes - a.votes);
  return (
    <div className="space-y-1.5">
      {sorted.map((r) => {
        const pct = Math.round((r.votes / denom) * 100);
        return (
          <div key={r.choice} className="flex items-center gap-2 text-xs">
            <span className="text-muted w-32 shrink-0 truncate">{r.label}</span>
            <div className="bg-bg-soft border-line relative h-4 flex-1 overflow-hidden rounded-sm border">
              <div
                className="bg-accent/30 absolute inset-y-0 left-0"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-ink w-12 shrink-0 text-right font-mono tabular-nums">
              {r.votes}
            </span>
            <span className="text-muted w-10 shrink-0 text-right tabular-nums">
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  onCustom?: (v: string) => boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted font-mono uppercase tracking-[0.18em]">
        {label}
      </span>
      <div className="bg-bg-soft border-line flex items-center gap-0.5 rounded-md border p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            disabled={o.disabled}
            onClick={() => !o.disabled && onChange(o.value)}
            className={cn(
              "rounded px-2 py-1 text-xs transition-colors",
              o.disabled && "cursor-not-allowed opacity-40",
              !o.disabled && value === o.value && "bg-accent text-cta-ink",
              !o.disabled && value !== o.value && "text-muted hover:text-ink",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
