import type { ReactNode } from "react";

/**
 * Server-rendered collapsible section wrapper. Uses the native <details>/<summary>
 * pair so it works without JS, keyboard-accessible by default, and respects
 * user-agent expand/collapse hints. Default state is open; pass `defaultOpen={false}`
 * for sections you want collapsed on first load.
 *
 * Visual style mirrors the existing section headers (border-b-2 + small dot +
 * muted sub) but adds a chevron that rotates on open via CSS group-open state.
 */
export function CollapsibleSection({
  title,
  sub,
  defaultOpen = true,
  variant = "section",
  children,
}: {
  title: string;
  sub?: ReactNode;
  defaultOpen?: boolean;
  /** "section" — top-level on Pulse: thick border-b separator, h2 heading.
   *  "card"    — nested inside a section: card-like container, h3 heading,
   *              lighter visual weight so the parent section still reads as
   *              the dominant level. */
  variant?: "section" | "card";
  children: ReactNode;
}) {
  if (variant === "card") {
    return (
      <details
        open={defaultOpen}
        className="group border-line bg-card space-y-2 rounded-lg border px-4 py-3 [&[open]>summary>.chev]:rotate-90"
      >
        <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2 list-none [&::-webkit-details-marker]:hidden">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span
              aria-hidden
              className="chev text-muted inline-block text-xs transition-transform"
            >
              ▸
            </span>
            {title}
          </h3>
          {sub ? (
            typeof sub === "string" ? (
              <p className="text-muted text-xs">{sub}</p>
            ) : (
              sub
            )
          ) : null}
        </summary>
        <div className="space-y-3 pt-1">{children}</div>
      </details>
    );
  }
  return (
    <details
      open={defaultOpen}
      className="group border-line/40 space-y-3 border-b-2 pb-3 [&[open]>summary>.chev]:rotate-90"
    >
      <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2 list-none [&::-webkit-details-marker]:hidden">
        <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span
            aria-hidden
            className="chev text-muted inline-block transition-transform"
          >
            ▸
          </span>
          {title}
        </h2>
        {sub ? (
          typeof sub === "string" ? (
            <p className="text-muted text-xs">{sub}</p>
          ) : (
            sub
          )
        ) : null}
      </summary>
      <div className="space-y-4 pt-1">{children}</div>
    </details>
  );
}
