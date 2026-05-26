/**
 * Workshop calendar = Mon–Sat working days, with these exceptions:
 *  - Sundays are off.
 *  - 2nd Saturday of each month is off (day-of-month 8–14).
 *  - Explicit overrides in OFF_DAYS (e.g., Sheet3 has no session on 2026-05-22).
 */

const OFF_DAYS: ReadonlySet<string> = new Set<string>([
  "2026-05-22", // No session per Sheet3 (gap between Day 15 and Day 16).
]);

function parseDateUTC(iso: string): Date {
  // Treat 'YYYY-MM-DD' as UTC midnight to avoid TZ drift.
  return new Date(iso + "T00:00:00Z");
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isSecondSaturday(d: Date): boolean {
  return d.getUTCDay() === 6 && d.getUTCDate() >= 8 && d.getUTCDate() <= 14;
}

function isOffDay(d: Date): boolean {
  if (d.getUTCDay() === 0) return true; // Sunday
  if (isSecondSaturday(d)) return true; // 2nd Saturday of the month
  if (OFF_DAYS.has(toISODate(d))) return true;
  return false;
}

/** Kept for back-compat with call sites; now also covers 2nd-Saturday + OFF_DAYS. */
export function isWeekend(d: Date): boolean {
  return isOffDay(d);
}

export function isWeekdayISO(iso: string): boolean {
  return !isOffDay(parseDateUTC(iso));
}

/**
 * Return the ISO date of the Nth working day from `startISO`, where the start
 * date itself counts as day 1. Skips Sundays, 2nd Saturdays, and OFF_DAYS.
 */
export function addWorkingDays(startISO: string, count: number): string {
  if (count < 1) throw new Error("count must be >= 1");
  const d = parseDateUTC(startISO);
  if (isOffDay(d)) {
    throw new Error("startISO must be a working day");
  }
  let added = 1;
  while (added < count) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!isOffDay(d)) added++;
  }
  return toISODate(d);
}

/**
 * Working-day index (1-based) of `today` relative to `startISO`. Returns 1
 * before the start, the count of working days elapsed (inclusive) on
 * working days, and the most recent working day's count on off-days.
 */
export function workingDayNumber(startISO: string, today: Date = new Date()): number {
  const start = parseDateUTC(startISO);
  const t = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (t < start) return 1;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= t) {
    if (!isOffDay(cursor)) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return Math.max(1, count);
}
