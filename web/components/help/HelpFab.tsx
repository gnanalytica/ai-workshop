"use client";

import { useState } from "react";
import { HelpPanel } from "./HelpPanel";
import { cn } from "@/lib/utils";

/**
 * Fixed bottom-right "?" FAB that toggles the HelpPanel.
 *
 * TODO(phase-7): Mount once from `components/shell/AppShell.tsx`. Until
 * AppShell integration lands, this component is exported but not rendered
 * anywhere — keeps the worktree's diff scoped.
 */
export function HelpFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open help assistant"
        className={cn(
          "bg-accent text-cta-ink fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full text-xl font-semibold shadow-lg transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]",
        )}
      >
        ?
      </button>
      <HelpPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
