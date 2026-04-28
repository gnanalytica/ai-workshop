"use client";

import { AskAITab } from "./AskAITab";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * HelpPanel — slide-in drawer that hosts the help-chat UI.
 *
 * Phase 6 only ships the "Ask AI" tab; the additional tabs (handbook
 * shortcuts, recent tickets, what's new) are out of scope for this worktree
 * and will land in a follow-up.
 *
 * TODO(phase-7): Mount this from `components/shell/AppShell.tsx` so it's
 * available on every authed route. For now, the component is unused — import
 * it from a temporary surface to test.
 */
export function HelpPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Help assistant"
        aria-hidden={!open}
        className={cn(
          "border-line bg-card fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l shadow-xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="border-line flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-muted font-mono text-[10px] font-medium tracking-[0.2em] uppercase">
              In-product guide
            </p>
            <h2 className="text-ink text-base font-semibold">Ask AI</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close help">
            Close
          </Button>
        </header>
        <div className="flex-1 min-h-0">
          <AskAITab />
        </div>
      </aside>
    </>
  );
}
