"use client";

import { useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { AskAITab } from "./AskAITab";
import { cn } from "@/lib/utils";
import type { Persona } from "@/lib/auth/persona";

/**
 * Sage — the workshop's in-product assistant. Right-side slide-in panel
 * with a warm header, a short tagline, and a persona-aware chat below.
 */
export function HelpPanel({
  open,
  onClose,
  persona,
}: {
  open: boolean;
  onClose: () => void;
  persona: Persona | null;
}) {
  // Esc to close.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-label="Sage — your workshop assistant"
        aria-hidden={!open}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col",
          "bg-bg text-ink border-l border-line",
          "shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.5)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0.16,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="border-line bg-card/40 relative z-10 flex items-stretch border-b">
          <div className="flex flex-1 items-start gap-3 px-5 py-4">
            <span className="bg-accent/12 text-accent mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <Sparkles size={16} strokeWidth={2.1} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <h2 className="text-ink font-display text-[17px] font-semibold leading-none tracking-tight">
                  Sage
                </h2>
                <span className="text-muted text-[11px]">your workshop assistant</span>
              </div>
              <p className="text-muted mt-1.5 text-[12px] leading-snug">
                {tagline(persona)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              text-muted hover:text-ink hover:bg-bg-soft
              border-line border-l flex w-12 shrink-0 items-center justify-center
              transition-colors
            "
          >
            <X size={16} />
          </button>
        </header>

        <div className="relative z-10 flex-1 min-h-0">
          <AskAITab persona={persona} />
        </div>
      </aside>
    </>
  );
}

function tagline(persona: Persona | null): string {
  switch (persona) {
    case "student":
      return "Ask about today's lesson, your pod, assignments, or anything you can't find.";
    case "faculty":
      return "Ask about your pod, grading, the help-desk queue, or platform how-tos.";
    case "admin":
      return "Ask about cohorts, invites, analytics, or anything in the platform.";
    default:
      return "Ask anything about the workshop. Replies cite the handbook.";
  }
}
