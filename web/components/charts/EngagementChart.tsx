import type { DayEngagementBucket } from "@/lib/queries/analytics";

export function EngagementChart({
  rows,
  className,
}: {
  rows: DayEngagementBucket[];
  className?: string;
}) {
  if (rows.length === 0) return null;
  return (
    <div className={`space-y-1.5 ${className ?? ""}`.trim()}>
      {rows.map((r) => {
        const pct = Math.round(r.rate * 100);
        const tone =
          r.rate >= 0.7 ? "bg-ok/70" : r.rate >= 0.4 ? "bg-warn/70" : "bg-danger/70";
        return (
          <div key={r.day_number} className="flex items-center gap-3 text-xs">
            <span className="text-muted w-12 shrink-0 font-mono">
              D{String(r.day_number).padStart(2, "0")}
            </span>
            <div className="bg-bg-soft border-line relative h-5 flex-1 overflow-hidden rounded border">
              <div
                className={`${tone} absolute inset-y-0 left-0`}
                style={{ width: `${Math.max(pct, 0)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-end pr-2 font-mono text-[10.5px] tabular-nums text-ink/85">
                {r.active}/{r.total}
              </span>
            </div>
            <span className="text-ink w-10 shrink-0 text-right font-mono tabular-nums">
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
