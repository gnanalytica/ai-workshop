"use client";

import { useState } from "react";
import { HelpPanel } from "./HelpPanel";

/**
 * Bottom-right "open channel" button. Designed as a dispatch pill rather than
 * a generic ? bubble — a status light + monospaced label communicates the
 * help system's character: a real backchannel to the workshop, not an
 * afterthought widget.
 */
export function HelpFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the workshop concierge"
        className="
          fixed bottom-5 right-5 z-30 group
          inline-flex h-11 items-center gap-2.5 pl-3 pr-4
          font-mono text-[11px] font-semibold uppercase tracking-[0.18em]
          text-ink/85 hover:text-ink
          bg-card border border-line rounded-full
          shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35),0_2px_6px_-2px_rgba(0,0,0,0.18)]
          backdrop-blur-md
          transition-[transform,border-color,color] duration-200
          hover:-translate-y-0.5 hover:border-accent/55
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]
        "
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inset-0 rounded-full bg-[hsl(var(--accent))] opacity-60 animate-ping" />
          <span className="relative h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
        </span>
        <span>Channel</span>
        <span className="text-muted/70 ml-0.5 text-[9px] tracking-[0.3em]">
          ?
        </span>
      </button>
      <HelpPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
