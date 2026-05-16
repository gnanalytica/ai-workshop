/**
 * Centralized color tokens for all Recharts charts. Values pipe through our
 * HSL CSS variables so light/dark theme switching is automatic — no recharts
 * theming required beyond passing these strings as fill/stroke props.
 */
export const chartColor = {
  ink: "hsl(var(--ink))",
  muted: "hsl(var(--muted))",
  line: "hsl(var(--line))",
  bg: "hsl(var(--bg))",
  bgSoft: "hsl(var(--bg-soft))",
  card: "hsl(var(--card))",
  accent: "hsl(var(--accent))",
  accent2: "hsl(var(--accent-2))",
  ok: "hsl(var(--ok))",
  warn: "hsl(var(--warn))",
  danger: "hsl(var(--danger))",
  okSoft: "hsl(var(--ok-soft))",
  warnSoft: "hsl(var(--warn-soft))",
  dangerSoft: "hsl(var(--danger-soft))",
} as const;

/** Per-source colors for the engagement (activity) stacked bar. */
export const engagementSourceColor = {
  submissions: "hsl(var(--accent))",
  quiz_attempts: "hsl(var(--accent-2))",
  feedback: "hsl(var(--ok))",
  poll_votes: "hsl(var(--warn))",
  lab_progress: "hsl(200 50% 50%)", // a calm blue distinct from accent-2
} as const;

/** Score-band palette for the 5-bucket distribution charts. */
export const scoreBandColor = {
  under_60: "hsl(var(--danger))",
  band_60_69: "hsl(var(--warn))",
  band_70_79: "hsl(var(--muted))",
  band_80_89: "hsla(var(--ok), 0.55)",
  band_90_100: "hsl(var(--ok))",
} as const;

/** Per-rating colors for the feedback diverging bar. */
export const ratingColor = {
  r1: "hsl(var(--danger))",
  r2: "hsla(var(--danger), 0.65)",
  r3: "hsla(var(--warn), 0.55)",
  r4: "hsla(var(--ok), 0.65)",
  r5: "hsl(var(--ok))",
} as const;

export const tickStyle = {
  fontSize: 11,
  fontFamily: "var(--font-mono, ui-monospace, monospace)",
  fill: "hsl(var(--muted))",
} as const;

export const gridStyle = {
  stroke: "hsl(var(--line))",
  strokeDasharray: "2 3",
  opacity: 0.6,
} as const;
