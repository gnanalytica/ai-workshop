import { cn } from "@/lib/utils";

export interface BarSegment { value: number; label: string; tone: "ok" | "warn" | "danger" | "default" }
export interface BarRow { id: string | number; label: string; segments: BarSegment[] }

const TONE_BG: Record<BarSegment["tone"], string> = {
  ok: "bg-emerald-500/70",
  warn: "bg-amber-500/70",
  danger: "bg-red-500/70",
  default: "bg-bg-soft",
};

/**
 * Pure-CSS stacked bar chart. Used for per-day attendance breakdown.
 * Avoids pulling Recharts (~100KB) for visualisations this simple.
 */
export function StackedBarChart({ rows, className }: { rows: BarRow[]; className?: string }) {
  const maxTotal = Math.max(1, ...rows.map((r) => r.segments.reduce((s, x) => s + x.value, 0)));
  return (
    <div className={cn("space-y-1.5", className)}>
      {rows.map((row) => {
        const total = row.segments.reduce((s, x) => s + x.value, 0);
        return (
          <div key={row.id} className="flex items-center gap-3 text-xs">
            <span className="text-muted w-12 truncate font-mono">{row.label}</span>
            <div className="bg-bg-soft border-line relative h-5 flex-1 overflow-hidden rounded border">
              <div className="flex h-full">
                {row.segments.map((s, i) =>
                  s.value > 0 ? (
                    <div
                      key={i}
                      className={cn("h-full", TONE_BG[s.tone])}
                      style={{ width: `${(s.value / maxTotal) * 100}%` }}
                      title={`${s.label}: ${s.value}`}
                    />
                  ) : null,
                )}
              </div>
            </div>
            <span className="text-muted w-10 text-right tabular-nums">{total}</span>
          </div>
        );
      })}
    </div>
  );
}
