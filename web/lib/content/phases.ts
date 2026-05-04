export type Phase = "intro" | "pre" | "live" | "post" | "extra";

export interface DayPhases {
  pre: string;
  live: string;
  post: string;
  extra: string;
  intro: string;
}

const HEADING_RE = /^##\s+(.+)$/;

function classify(heading: string): Phase {
  const h = heading
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, "")
    .trim();
  if (h.includes("pre-class") || h.includes("today's objective") || h.includes("todays objective"))
    return "pre";
  if (
    h.includes("in-class") ||
    h.startsWith("lab") ||
    h.includes(" lab") ||
    h.includes("live poll") ||
    h.startsWith("discuss") ||
    h.includes("prompt of the day")
  )
    return "live";
  if (
    h.startsWith("quiz") ||
    h.includes("assignment") ||
    h.includes("prep for next class")
  )
    return "post";
  return "extra";
}

/**
 * Split a day MDX body into four phase buckets keyed by `## ` heading.
 * Anything before the first `## ` lands in `intro` and is rendered above the tabs.
 */
export function splitDayPhases(body: string): DayPhases {
  const lines = body.split("\n");
  const phases: DayPhases = { pre: "", live: "", post: "", extra: "", intro: "" };

  let current: Phase | "intro" = "intro";
  const buf: Record<Phase | "intro", string[]> = {
    intro: [],
    pre: [],
    live: [],
    post: [],
    extra: [],
  };

  for (const line of lines) {
    const m = line.match(HEADING_RE);
    if (m) {
      current = classify(m[1] ?? "");
    }
    buf[current].push(line);
  }

  phases.intro = buf.intro.join("\n").trim();
  phases.pre = buf.pre.join("\n").trim();
  phases.live = buf.live.join("\n").trim();
  phases.post = buf.post.join("\n").trim();
  phases.extra = buf.extra.join("\n").trim();
  return phases;
}

export function isPhase(value: string | undefined): value is Phase {
  return (
    value === "intro" ||
    value === "pre" ||
    value === "live" ||
    value === "post" ||
    value === "extra"
  );
}

/**
 * Pick the default phase based on the live session timestamp.
 * - pre  : >2h before session, or no session scheduled
 * - live : within ±2h of session
 * - post : >2h after session
 */
export function defaultPhase(liveSessionAt: string | null | undefined): Phase {
  if (!liveSessionAt) return "pre";
  const t = new Date(liveSessionAt).getTime();
  if (Number.isNaN(t)) return "pre";
  const now = Date.now();
  const diffMs = now - t;
  const twoH = 2 * 60 * 60 * 1000;
  if (diffMs < -twoH) return "pre";
  if (diffMs > twoH) return "post";
  return "live";
}
