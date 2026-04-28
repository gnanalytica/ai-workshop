"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { exitSandbox } from "@/lib/actions/sandbox";

/**
 * Sandbox banner — treats the demo cohort as a "field channel" with its
 * own dispatch chrome. Wider, more confident than a tip strip; prominent
 * enough to be noticed every time the user looks up, restrained enough not
 * to bury page content.
 */
export function SandboxBanner({ cohortName }: { cohortName: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div
      role="status"
      aria-label="Sandbox cohort active"
      className="
        relative isolate overflow-hidden border-b border-warn/35
        bg-[linear-gradient(180deg,hsl(var(--warn)/0.12),hsl(var(--warn)/0.04))]
        text-ink sticky top-0 z-50 backdrop-blur
      "
    >
      {/* Diagonal field-tape stripes — subtle, decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 right-32 opacity-[0.07] [background-image:repeating-linear-gradient(135deg,hsl(var(--ink))_0,hsl(var(--ink))_1px,transparent_1px,transparent_10px)]"
      />

      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        {/* Field stamp */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-[hsl(var(--warn))] opacity-70 animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-[hsl(var(--warn))]" />
          </span>
          <span className="bg-warn/20 text-warn border-warn/40 inline-flex h-5 items-center rounded-sm border px-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.22em]">
            Field mode
          </span>
        </div>

        {/* Channel label */}
        <p className="text-ink/85 flex items-baseline gap-2 text-sm">
          <span className="text-muted font-mono text-[10px] uppercase tracking-[0.2em]">
            Channel
          </span>
          <strong className="text-ink font-semibold tracking-tight">{cohortName}</strong>
          <span className="text-muted/85 hidden text-[12.5px] sm:inline">
            — practice freely, nothing here touches a real cohort.
          </span>
        </p>

        {/* Exit button */}
        <button
          type="button"
          onClick={() =>
            start(async () => {
              await exitSandbox();
              router.refresh();
            })
          }
          disabled={pending}
          className="
            ml-auto inline-flex h-8 items-center gap-2 px-3
            font-mono text-[10px] font-semibold uppercase tracking-[0.22em]
            text-ink/85 hover:text-ink
            border-warn/45 hover:border-warn/70 hover:bg-warn/10
            border rounded-sm
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <span aria-hidden className="text-warn text-[12px] leading-none">⏏</span>
          {pending ? "Exiting…" : "Exit field"}
        </button>
      </div>
    </div>
  );
}
