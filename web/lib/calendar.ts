/**
 * Workshop calendar = weekdays only (Mon–Fri). Saturdays and Sundays are
 * skipped both when sizing a cohort and when computing the current day_number.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parseDateUTC(iso: string): Date {
  // Treat 'YYYY-MM-DD' as UTC midnight to avoid TZ drift.
  return new Date(iso + "T00:00:00Z");
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}

export function isWeekdayISO(iso: string): boolean {
  return !isWeekend(parseDateUTC(iso));
}

/**
 * Return the ISO date of the Nth weekday from `startISO`, where the start
 * date itself counts as day 1. Skips Saturdays and Sundays.
 */
export function addWorkingDays(startISO: string, count: number): string {
  if (count < 1) throw new Error("count must be >= 1");
  const d = parseDateUTC(startISO);
  if (isWeekend(d)) {
    throw new Error("startISO must be a weekday");
  }
  let added = 1;
  while (added < count) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!isWeekend(d)) added++;
  }
  return toISODate(d);
}

/**
 * Working-day index (1-based) of `today` relative to `startISO`. Returns 1
 * before the start, the count of weekdays elapsed (inclusive) on weekdays,
 * and the most recent weekday's count on weekends.
 */
export function workingDayNumber(startISO: string, today: Date = new Date()): number {
  const start = parseDateUTC(startISO);
  const t = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (t < start) return 1;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= t) {
    if (!isWeekend(cursor)) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return Math.max(1, count);
}
