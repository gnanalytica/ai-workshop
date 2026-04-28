"use client";

import { useEffect, useState } from "react";
import { AskAITab } from "./AskAITab";
import { cn } from "@/lib/utils";

/**
 * Workshop concierge — dispatch-channel framing. Treats the chat as a
 * live transmission rather than a chat-bubble widget. Header carries a
 * channel id, a UTC timestamp that updates every minute, and a status light.
 * A faint scanline overlay sells the channel metaphor without dominating.
 */
export function HelpPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [time, setTime] = useState(() => formatUtc(new Date()));
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setTime(formatUtc(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, [open]);

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
        aria-label="Workshop concierge channel"
        aria-hidden={!open}
        className={cn(
          // Frame
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col",
          "bg-bg text-ink border-l border-accent/25",
          "shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.5)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0.16,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Scanline overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:repeating-linear-gradient(0deg,transparent_0,transparent_2px,hsl(var(--ink)/0.04)_2px,hsl(var(--ink)/0.04)_3px)]"
        />

        {/* Header — channel ID strip */}
        <header className="border-line bg-card/60 relative z-10 flex items-stretch border-b">
          <div className="flex flex-1 flex-col gap-0.5 px-5 py-4">
            <div className="text-muted flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-[hsl(var(--accent))] opacity-70 animate-ping" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
              </span>
              <span>Channel · WKSHP-01</span>
              <span className="text-muted/60 ml-auto">{time}</span>
            </div>
            <h2 className="text-ink mt-1 font-mono text-base font-semibold tracking-tight">
              Workshop concierge
            </h2>
            <p className="text-muted text-[11px] leading-snug">
              Ask anything about your pod, today&apos;s lab, grading, or the platform.
              Responses cite the handbook.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close channel"
            className="
              text-muted/80 hover:text-ink hover:bg-bg-soft
              border-line border-l flex w-12 shrink-0 items-center justify-center
              font-mono text-[10px] uppercase tracking-[0.2em]
              transition-colors
            "
          >
            ESC
          </button>
        </header>

        <div className="relative z-10 flex-1 min-h-0">
          <AskAITab />
        </div>
      </aside>
    </>
  );
}

function formatUtc(d: Date): string {
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm} UTC`;
}
