"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AssignmentRow } from "@/lib/queries/content";

/**
 * Compact, searchable picker for grading. Replaces a wall of cards.
 *
 * Renders a button showing the current selection; click → dropdown panel
 * with a search box and a day-grouped list. URL is the source of truth:
 * clicking an item routes to `?a=<id>`. The page re-renders with the new
 * `activeAssignment`.
 */
export function AssignmentPicker({
  cohortId,
  assignments,
  activeId,
}: {
  cohortId: string;
  assignments: AssignmentRow[];
  activeId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const active = assignments.find((a) => a.id === activeId) ?? null;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return assignments;
    return assignments.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        `d${a.day_number}`.includes(needle) ||
        a.kind.includes(needle),
    );
  }, [assignments, q]);

  const grouped = useMemo(() => {
    const byDay = new Map<number, AssignmentRow[]>();
    for (const a of filtered) {
      const list = byDay.get(a.day_number) ?? [];
      list.push(a);
      byDay.set(a.day_number, list);
    }
    return Array.from(byDay.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([day, items]) => ({ day, items }));
  }, [filtered]);

  function pick(id: string) {
    setOpen(false);
    setQ("");
    router.push(`/admin/cohorts/${cohortId}/grading?a=${id}`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="border-line bg-card hover:border-accent/40 flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors"
      >
        <div className="min-w-0">
          <p className="text-muted text-[10.5px] uppercase tracking-[0.16em]">
            Assignment
          </p>
          {active ? (
            <p className="text-ink mt-0.5 truncate text-sm font-medium">
              <span className="text-muted mr-2 font-mono">
                D{String(active.day_number).padStart(2, "0")}
              </span>
              {active.title}
              <span className="text-muted ml-2 text-xs font-normal">
                · {active.submission_count} submission
                {active.submission_count === 1 ? "" : "s"}
              </span>
            </p>
          ) : (
            <p className="text-muted mt-0.5 text-sm">Pick an assignment…</p>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-line bg-card shadow-lift absolute z-30 mt-2 w-full overflow-hidden rounded-lg border">
          <div className="border-line/60 relative border-b">
            <Search
              size={14}
              className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, day, or kind…"
              className="text-ink placeholder:text-muted w-full bg-transparent py-2.5 pr-8 pl-9 text-sm outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="text-muted hover:text-ink absolute top-1/2 right-2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {grouped.length === 0 ? (
              <p className="text-muted px-4 py-6 text-center text-sm">
                No assignments match.
              </p>
            ) : (
              grouped.map(({ day, items }) => (
                <div key={day} className="border-line/40 border-b last:border-b-0">
                  <p className="text-muted bg-bg-soft/50 px-4 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em]">
                    Day {day}
                  </p>
                  <ul>
                    {items.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => pick(a.id)}
                          className={
                            "hover:bg-bg-soft flex w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors " +
                            (a.id === activeId ? "bg-accent/5" : "")
                          }
                        >
                          <div className="min-w-0">
                            <p className="text-ink truncate text-sm">
                              {a.title}
                              {a.id === activeId && (
                                <span className="text-accent ml-2 text-xs">
                                  current
                                </span>
                              )}
                            </p>
                            <p className="text-muted mt-0.5 text-xs">
                              {a.kind}
                              {a.auto_grade && " · AI-eligible"}
                            </p>
                          </div>
                          <Badge>
                            {a.submission_count} sub
                            {a.submission_count === 1 ? "" : "s"}
                          </Badge>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {open && (
        <div
          aria-hidden
          className="fixed inset-0 z-20"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
