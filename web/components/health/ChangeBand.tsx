type Tone = "default" | "ok" | "warn" | "danger";

export interface ChangeSignal {
  label: string;
  value: string;
  /** Optional sub-line; e.g. "vs Day 14" */
  hint?: string;
  tone?: Tone;
  /** Optional arrow direction; "up" / "down" / "flat" / null. */
  direction?: "up" | "down" | "flat" | null;
}

const TONE_BAR: Record<Tone, string> = {
  default: "bg-line",
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
};

const TONE_TEXT: Record<Tone, string> = {
  default: "text-ink",
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
};

export function ChangeBand({ signals }: { signals: ChangeSignal[] }) {
  if (signals.length === 0) return null;
  return (
    <section
      aria-label="What changed since the previous day"
      className="border-line bg-card/40 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-4"
    >
      {signals.map((s, i) => {
        const tone = s.tone ?? "default";
        return (
          <div
            key={i}
            className="bg-card relative flex items-baseline gap-3 px-4 py-3"
          >
            <span
              aria-hidden
              className={`absolute inset-y-2 left-0 w-[3px] rounded-r ${TONE_BAR[tone]}`}
            />
            <div className="flex-1 pl-3">
              <p className="text-muted font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
                {s.label}
              </p>
              <p
                className={`font-display mt-0.5 flex items-baseline gap-1.5 text-base font-semibold tabular-nums ${TONE_TEXT[tone]}`}
              >
                {s.direction && (
                  <Arrow direction={s.direction} tone={tone} />
                )}
                {s.value}
              </p>
              {s.hint && (
                <p className="text-muted mt-0.5 text-[11px]">{s.hint}</p>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Arrow({
  direction,
  tone,
}: {
  direction: "up" | "down" | "flat";
  tone: Tone;
}) {
  const symbol = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  return (
    <span aria-hidden className={`text-sm ${TONE_TEXT[tone]}`}>
      {symbol}
    </span>
  );
}
