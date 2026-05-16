/**
 * Shared parser + type for the Pulse window selector. Lives in a plain
 * module (no "use client" directive) so the page's Server Component can
 * call `parseWindow` without Next.js refusing the call as a client
 * reference. The interactive picker UI in PulseWindowPicker.tsx re-imports
 * the type from here.
 */

export type PulseWindow = 7 | 14 | 30 | "all";

export function parseWindow(raw: string | undefined): PulseWindow {
  if (raw === "14" || raw === "30") return Number(raw) as PulseWindow;
  if (raw === "all") return "all";
  return 7;
}
