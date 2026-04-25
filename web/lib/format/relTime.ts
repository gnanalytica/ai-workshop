const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
];

/** "2 minutes ago", "yesterday", "in 3 days" — single source of truth. */
export function relTime(input: string | Date | null | undefined): string {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  for (const { unit, ms } of UNITS) {
    if (abs >= ms || unit === "second") {
      return RTF.format(Math.round(diff / ms), unit);
    }
  }
  return "";
}
