"use client";

interface TooltipRow {
  label: string;
  value: string | number;
  /** Optional CSS color string for the swatch. */
  color?: string;
  /** Optional secondary text rendered to the right of value. */
  hint?: string;
}

/** Loose shape — Recharts injects these props on tooltip content. */
export interface TooltipPayloadItem {
  name?: string | number;
  value?: number | string;
  color?: string;
  fill?: string;
  payload?: unknown;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  /** Heading rendered above the rows. Falls back to the X-axis label. */
  title?: string;
  /** Override the default `payload`-driven rows with a custom renderer. */
  rows?: (payload: TooltipPayloadItem[]) => TooltipRow[];
  /** Footer text rendered below the rows. */
  footer?: (payload: TooltipPayloadItem[]) => string | null;
}

/**
 * Themed tooltip used by every Recharts chart on Pulse. Compact card with a
 * title row, color-swatch rows, and an optional footer hint. Stays close to
 * the cursor and uses HSL theme vars so it adapts to light/dark.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  title,
  rows,
  footer,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const items: TooltipRow[] = rows
    ? rows(payload)
    : payload.map((p) => ({
        label: String(p.name ?? ""),
        value: (p.value ?? 0) as number | string,
        color:
          typeof p.color === "string"
            ? p.color
            : typeof p.fill === "string"
              ? p.fill
              : undefined,
      }));

  const heading = title ?? (label !== undefined ? String(label) : null);
  const foot = footer?.(payload) ?? null;

  return (
    <div className="border-line bg-bg/95 pointer-events-none rounded-md border px-3 py-2 text-xs shadow-md backdrop-blur">
      {heading && (
        <div className="text-muted mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
          {heading}
        </div>
      )}
      <ul className="space-y-1">
        {items.map((row, i) => (
          <li key={i} className="flex items-center gap-2">
            {row.color && (
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-sm"
                style={{ background: row.color }}
              />
            )}
            <span className="text-ink">{row.label}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums">
              {row.value}
              {row.hint ? (
                <span className="text-muted ml-1 font-normal">{row.hint}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      {foot && <div className="text-muted mt-1 pt-1 text-[10px]">{foot}</div>}
    </div>
  );
}
