"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { HelpPanel } from "./HelpPanel";
import type { Persona } from "@/lib/auth/persona";

/**
 * Bottom-right "Ask Buddy" pill. Buddy is the workshop's in-product assistant —
 * one consistent name students and faculty can refer to ("ask Buddy",
 * "Buddy says…") instead of an anonymous "channel" or "?" widget.
 */
export function HelpFab({ persona }: { persona: Persona | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask Buddy — your workshop assistant"
        className="
          fixed bottom-5 right-5 z-30 group
          inline-flex h-11 items-center gap-2 pl-3 pr-4
          text-sm font-semibold tracking-tight
          text-ink/90 hover:text-ink
          bg-card border border-line rounded-full
          shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35),0_2px_6px_-2px_rgba(0,0,0,0.18)]
          backdrop-blur-md
          transition-[transform,border-color,color,background] duration-200
          hover:-translate-y-0.5 hover:border-accent/55 hover:bg-accent/5
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]
        "
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[hsl(var(--accent))]/15" />
          <Sparkles size={13} strokeWidth={2.2} className="text-accent relative" />
        </span>
        <span>Ask Buddy</span>
      </button>
      <HelpPanel open={open} onClose={() => setOpen(false)} persona={persona} />
    </>
  );
}
