"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { markAttendance } from "@/lib/actions/attendance";
import type { AttendanceRow } from "@/lib/queries/attendance";

type Status = "present" | "absent" | "late" | "excused";

const NEXT: Record<Status | "none", Status> = {
  none: "present",
  present: "absent",
  absent: "late",
  late: "excused",
  excused: "present",
};

const TONE: Record<Status, string> = {
  present: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  absent: "bg-red-500/20 text-red-300 border-red-500/30",
  late: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  excused: "bg-sky-500/20 text-sky-300 border-sky-500/30",
};

const SHORT: Record<Status, string> = {
  present: "P",
  absent: "A",
  late: "L",
  excused: "E",
};

export function AttendanceGrid({
  cohortId,
  rows,
  unlockedDays,
  focusDay,
}: {
  cohortId: string;
  rows: AttendanceRow[];
  unlockedDays: number[];
  focusDay: number;
}) {
  const [search, setSearch] = useState("");
  const [activeDay, setActiveDay] = useState<number>(focusDay);
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState<Record<string, Status | undefined>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.full_name ?? "").toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.pod_name ?? "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  function key(userId: string, day: number) {
    return `${userId}:${day}`;
  }
  function statusOf(row: AttendanceRow, day: number): Status | undefined {
    return optimistic[key(row.user_id, day)] ?? row.by_day[day];
  }

  function cycle(row: AttendanceRow, day: number) {
    const cur = statusOf(row, day) ?? "none";
    const next = NEXT[cur];
    setOptimistic((o) => ({ ...o, [key(row.user_id, day)]: next }));
    start(async () => {
      const r = await markAttendance({
        cohort_id: cohortId,
        day_number: day,
        user_id: row.user_id,
        status: next,
      });
      if (!r.ok) {
        setOptimistic((o) => ({ ...o, [key(row.user_id, day)]: row.by_day[day] }));
        toast.error(r.error);
      }
    });
  }

  function bulkMark(day: number, status: Status) {
    const targets = filtered.filter((r) => statusOf(r, day) !== status);
    setOptimistic((o) => {
      const next = { ...o };
      for (const r of targets) next[key(r.user_id, day)] = status;
      return next;
    });
    start(async () => {
      let failed = 0;
      for (const r of targets) {
        const res = await markAttendance({
          cohort_id: cohortId,
          day_number: day,
          user_id: r.user_id,
          status,
        });
        if (!res.ok) failed++;
      }
      if (failed > 0) toast.error(`${failed} updates failed`);
      else toast.success(`Marked ${targets.length} as ${status}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name, email, pod…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-muted text-xs">Click a cell to cycle status (P → A → L → E).</div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-muted text-xs">Bulk mark Day {activeDay}:</span>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => bulkMark(activeDay, "present")}>
            All present
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => bulkMark(activeDay, "absent")}>
            All absent
          </Button>
        </div>
      </div>

      <div className="border-line overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft sticky top-0">
            <tr>
              <th className="text-muted px-3 py-2 text-left text-xs font-medium uppercase">Student</th>
              {unlockedDays.map((d) => (
                <th key={d} className="px-2 py-2 text-center text-xs font-medium">
                  <button
                    onClick={() => setActiveDay(d)}
                    className={cn(
                      "rounded px-1.5 py-0.5 font-mono",
                      d === activeDay ? "bg-accent text-cta-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    D{String(d).padStart(2, "0")}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={unlockedDays.length + 1} className="text-muted px-3 py-12 text-center">
                  No students match.
                </td>
              </tr>
            )}
            {filtered.map((row) => (
              <tr key={row.user_id} className="border-line border-t">
                <td className="px-3 py-2">
                  <div className="text-ink truncate text-sm font-medium">{row.full_name ?? row.email}</div>
                  <div className="text-muted truncate text-xs">{row.pod_name ?? "—"}</div>
                </td>
                {unlockedDays.map((d) => {
                  const s = statusOf(row, d);
                  return (
                    <td key={d} className="px-1 py-1 text-center">
                      <button
                        onClick={() => cycle(row, d)}
                        disabled={pending}
                        className={cn(
                          "h-7 w-8 rounded border font-mono text-xs",
                          s ? TONE[s] : "border-line text-muted hover:bg-bg-soft",
                        )}
                        aria-label={`Day ${d} for ${row.full_name ?? row.email}`}
                      >
                        {s ? SHORT[s] : "·"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
