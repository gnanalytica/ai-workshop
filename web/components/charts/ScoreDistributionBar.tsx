import type { ScoreDistribution } from "@/lib/queries/pulse-scores";

/**
 * Stacked horizontal bar showing the 5 score bands (<60 / 60-69 / 70-79 /
 * 80-89 / 90-100). Each non-zero segment gets a min-pixel floor so a single
 * low-scoring student stays visible even in a class of 150.
 */
export function ScoreDistributionBar({
  dist,
  total,
}: {
  dist: ScoreDistribution;
  total: number;
}) {
  if (total === 0) {
    return <div className="border-line bg-bg-soft h-3 w-full rounded border" aria-hidden />;
  }
  const segments: Array<{ value: number; label: string; tone: string }> = [
    { value: dist.under_60, label: "<60", tone: "bg-danger/70" },
    { value: dist.band_60_69, label: "60–69", tone: "bg-warn/60" },
    { value: dist.band_70_79, label: "70–79", tone: "bg-bg-soft border-line border" },
    { value: dist.band_80_89, label: "80–89", tone: "bg-ok/45" },
    { value: dist.band_90_100, label: "90–100", tone: "bg-ok/80" },
  ];
  return (
    <div
      className="border-line bg-card flex h-3 w-full overflow-hidden rounded border"
      role="img"
      aria-label={`Score distribution across ${total} graded items`}
    >
      {segments.map((s) =>
        s.value === 0 ? null : (
          <div
            key={s.label}
            className={s.tone}
            style={{ flex: `${(s.value / total) * 100} 1 0` }}
            title={`${s.label}: ${s.value}`}
          />
        ),
      )}
    </div>
  );
}

export function ScoreDistributionLegend() {
  return (
    <div className="text-muted flex flex-wrap gap-3 text-xs">
      <span className="inline-flex items-center gap-1">
        <span className="bg-danger/70 inline-block h-2 w-3 rounded" /> &lt;60
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="bg-warn/60 inline-block h-2 w-3 rounded" /> 60–69
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="bg-bg-soft border-line inline-block h-2 w-3 rounded border" /> 70–79
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="bg-ok/45 inline-block h-2 w-3 rounded" /> 80–89
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="bg-ok/80 inline-block h-2 w-3 rounded" /> 90–100
      </span>
    </div>
  );
}
