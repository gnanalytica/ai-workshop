"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface Row {
  choice: string;
  label: string;
  votes: number;
}

export function LazyPollResults({
  pollId,
  cohortId,
}: {
  pollId: string;
  cohortId: string;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const openRef = useRef(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/polls/${pollId}/results`);
      const data = (await res.json()) as { rows: Row[] };
      setRows(data.rows ?? []);
    } catch {
      setRows((prev) => prev ?? []);
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  // Subscribe only while open. Server actions broadcast `poll` on
  // create/close/vote — we refetch on tickle (no payload, RLS-bound API).
  useEffect(() => {
    if (!open) return;
    const sb = getSupabaseBrowser();
    const ch = sb.channel(`cohort:${cohortId}`);
    ch.on("broadcast", { event: "poll" }, () => {
      if (openRef.current) fetchRows();
    }).subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [open, cohortId, fetchRows]);

  async function toggle() {
    const next = !open;
    openRef.current = next;
    setOpen(next);
    if (next && rows === null) await fetchRows();
  }

  return (
    <>
      <button type="button" onClick={toggle} className="text-accent text-xs">
        {open ? "Hide" : "View results →"}
      </button>
      {open && (
        <div className="mt-2 w-full">
          {loading && rows === null && (
            <p className="text-muted text-sm">Loading…</p>
          )}
          {rows !== null && <ResultsBars rows={rows} />}
        </div>
      )}
    </>
  );
}

function ResultsBars({ rows }: { rows: Row[] }) {
  const total = rows.reduce((acc, r) => acc + r.votes, 0);
  if (total === 0) return <p className="text-muted text-sm">No votes yet.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => {
        const pct = Math.round((r.votes / total) * 100);
        return (
          <li key={r.choice} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink truncate">{r.label}</span>
              <span className="text-muted tabular-nums text-xs">
                {r.votes} · {pct}%
              </span>
            </div>
            <div className="bg-bg-soft h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-accent h-full rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
