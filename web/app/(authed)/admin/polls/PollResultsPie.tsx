import { getPollResults } from "@/lib/queries/polls";

const SLICE_TOKENS = [
  "hsl(var(--accent))",
  "hsl(var(--ok))",
  "hsl(var(--warn))",
  "hsl(var(--accent-2))",
  "hsl(var(--danger))",
  "hsl(var(--muted))",
];

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx: number, cy: number, r: number, startRad: number, endRad: number) {
  const start = polarToCartesian(cx, cy, r, startRad);
  const end = polarToCartesian(cx, cy, r, endRad);
  const largeArc = endRad - startRad > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export async function PollResultsPie({ pollId }: { pollId: string }) {
  const rows = await getPollResults(pollId);
  const total = rows.reduce((acc, r) => acc + r.votes, 0);

  if (total === 0) {
    return (
      <div className="border-line bg-bg-soft flex h-40 w-40 items-center justify-center rounded-full border text-sm text-muted">
        0 votes
      </div>
    );
  }

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  let angle = -Math.PI / 2;
  const slices = rows.map((row, i) => {
    const frac = row.votes / total;
    const end = angle + frac * Math.PI * 2;
    const path =
      frac >= 1
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
        : arcPath(cx, cy, r, angle, end);
    const color = SLICE_TOKENS[i % SLICE_TOKENS.length];
    angle = end;
    return { ...row, path, color, pct: Math.round(frac * 100) };
  });

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Pie chart of ${total} vote${total === 1 ? "" : "s"}`}
      >
        {slices.map((s) => (
          <path key={s.choice} d={s.path} fill={s.color} stroke="hsl(var(--bg))" strokeWidth={1} />
        ))}
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
        {slices.map((s) => (
          <li key={s.choice} className="flex items-baseline gap-2">
            <span
              aria-hidden
              className="inline-block h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-ink truncate">{s.label}</span>
            <span className="text-muted tabular-nums text-xs ml-auto">
              {s.votes} · {s.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
