import Link from "next/link";
import type { ActivityMatrixStudent } from "@/lib/queries/analytics";

interface Props {
  rows: ActivityMatrixStudent[];
  days: number[];
  studentHref?: (uid: string) => string;
  /** Cap shown rows; surface a "+N more" footer if truncated. */
  maxRows?: number;
}

export function ActivityHeatmap({
  rows,
  days,
  studentHref,
  maxRows = 40,
}: Props) {
  if (rows.length === 0 || days.length === 0) return null;

  const visible = rows.slice(0, maxRows);
  const hidden = rows.length - visible.length;
  const sortedDays = [...days].sort((a, b) => a - b);

  return (
    <div className="border-line bg-card overflow-hidden rounded-lg border">
      <div className="border-line/60 flex items-center justify-between border-b px-4 py-2">
        <p className="text-muted font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
          Student × Day · activity intensity
        </p>
        <Scale />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-xs">
          <thead>
            <tr>
              <th className="bg-card sticky left-0 z-10 w-44 px-3 py-2 text-left font-medium text-muted">
                Student
              </th>
              {sortedDays.map((d) => (
                <th
                  key={d}
                  className="text-muted font-mono text-[10px] font-semibold tabular-nums"
                  style={{ width: 22 }}
                  title={`Day ${d}`}
                >
                  {d}
                </th>
              ))}
              <th className="text-muted px-2 text-right font-mono text-[10px] font-semibold uppercase tracking-wider">
                Σ
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => {
              const name = s.full_name ?? s.email;
              const total = s.total_active_days;
              const totalTone =
                total === 0
                  ? "text-danger"
                  : total < sortedDays.length / 2
                    ? "text-warn"
                    : "text-ok";
              return (
                <tr key={s.user_id} className="group">
                  <td className="bg-card border-line/40 sticky left-0 z-10 truncate border-t px-3 py-1.5">
                    {studentHref ? (
                      <Link
                        href={studentHref(s.user_id)}
                        className="hover:text-accent text-ink truncate"
                        title={name}
                      >
                        {name}
                      </Link>
                    ) : (
                      <span className="text-ink truncate" title={name}>
                        {name}
                      </span>
                    )}
                  </td>
                  {sortedDays.map((d) => {
                    const n = s.by_day[d] ?? 0;
                    return (
                      <td
                        key={d}
                        className="border-line/40 border-t px-[2px] py-[3px]"
                      >
                        <Cell intensity={n} day={d} name={name} />
                      </td>
                    );
                  })}
                  <td
                    className={`border-line/40 border-t px-2 text-right font-mono tabular-nums ${totalTone}`}
                  >
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {hidden > 0 && (
        <div className="border-line/60 text-muted border-t px-4 py-2 text-xs">
          + {hidden} more student{hidden === 1 ? "" : "s"} not shown
        </div>
      )}
    </div>
  );
}

/** Single heatmap cell. Intensity 0–5 = number of distinct activity sources. */
function Cell({
  intensity,
  day,
  name,
}: {
  intensity: number;
  day: number;
  name: string;
}) {
  // Map 0–5 → opacity steps. Empty = subtle dot so the grid stays scannable.
  const styles = [
    { bg: "transparent", border: "1px dashed hsl(var(--line) / 0.6)" },
    { bg: "hsl(var(--accent) / 0.18)", border: "1px solid hsl(var(--accent) / 0.25)" },
    { bg: "hsl(var(--accent) / 0.38)", border: "1px solid hsl(var(--accent) / 0.45)" },
    { bg: "hsl(var(--accent) / 0.58)", border: "1px solid hsl(var(--accent) / 0.6)" },
    { bg: "hsl(var(--accent) / 0.78)", border: "1px solid hsl(var(--accent) / 0.75)" },
    { bg: "hsl(var(--accent) / 0.95)", border: "1px solid hsl(var(--accent))" },
  ];
  const idx = Math.min(intensity, 5);
  const s = styles[idx]!;
  const label = `${name} · Day ${day} · ${intensity} activity type${intensity === 1 ? "" : "s"}`;
  return (
    <div
      title={label}
      aria-label={label}
      className="h-4 w-full rounded-[3px] transition-transform hover:scale-125"
      style={{ background: s.bg, border: s.border }}
    />
  );
}

function Scale() {
  return (
    <div className="text-muted flex items-center gap-1.5 text-[10px]">
      <span className="font-mono uppercase tracking-wider">low</span>
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="h-3 w-3 rounded-[2px]"
          style={{
            background:
              n === 0 ? "transparent" : `hsl(var(--accent) / ${0.18 + n * 0.155})`,
            border:
              n === 0
                ? "1px dashed hsl(var(--line) / 0.6)"
                : "1px solid hsl(var(--accent) / 0.4)",
          }}
        />
      ))}
      <span className="font-mono uppercase tracking-wider">high</span>
    </div>
  );
}
