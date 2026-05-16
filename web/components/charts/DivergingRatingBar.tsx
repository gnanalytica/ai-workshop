/**
 * Diverging promoter-style bar for 1–5★ feedback. ≤2★ grows left in red,
 * 3★ is neutral mid-grey, ≥4★ grows right in green. Width on each side is
 * proportional to actual counts so a single ★1 in a class of 150 still shows
 * as a visible sliver (each non-zero segment gets a min-pixel floor).
 *
 * Centerline sits at the boundary between the neutral and positive segments
 * so the eye reads "more positive than negative" at a glance.
 */
export function DivergingRatingBar({
  rating_1,
  rating_2,
  rating_3,
  rating_4,
  rating_5,
  total,
}: {
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
  total: number;
}) {
  if (total === 0) {
    return <div className="border-line bg-bg-soft h-4 w-full rounded border" aria-hidden />;
  }

  const neg = rating_1 + rating_2;
  const neu = rating_3;
  const pos = rating_4 + rating_5;
  const pctNeg = (neg / total) * 100;
  const pctNeu = (neu / total) * 100;
  const pctPos = (pos / total) * 100;

  return (
    <div
      className="relative h-4 w-full"
      role="img"
      aria-label={`Rating distribution — ${pos} positive (4–5★), ${neu} neutral (3★), ${neg} negative (≤2★) of ${total}`}
    >
      {/* Track */}
      <div className="border-line bg-card absolute inset-0 flex overflow-hidden rounded border">
        {neg > 0 && (
          <div
            className="bg-danger/70 flex h-full items-center justify-end pr-1 text-[10px] font-medium text-white/90"
            style={{ width: `${pctNeg}%` }}
            title={`${rating_1} ★1 + ${rating_2} ★2 = ${neg}`}
          >
            {pctNeg >= 8 ? neg : null}
          </div>
        )}
        {neu > 0 && (
          <div
            className="bg-warn/40 text-warn flex h-full items-center justify-center text-[10px] font-medium"
            style={{ width: `${pctNeu}%` }}
            title={`${neu} ★3`}
          >
            {pctNeu >= 6 ? neu : null}
          </div>
        )}
        {pos > 0 && (
          <div
            className="bg-ok/70 flex h-full items-center justify-start pl-1 text-[10px] font-medium text-white/90"
            style={{ width: `${pctPos}%` }}
            title={`${rating_4} ★4 + ${rating_5} ★5 = ${pos}`}
          >
            {pctPos >= 8 ? pos : null}
          </div>
        )}
      </div>
    </div>
  );
}
