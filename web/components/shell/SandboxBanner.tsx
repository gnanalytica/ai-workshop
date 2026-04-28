"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { exitSandbox } from "@/lib/actions/sandbox";

/**
 * Sticky top banner shown across every authed page when the sandbox cookie
 * is active. Mounted by AppShell only when the server-side check passes, so
 * the banner showing IS the source of truth (no client-side cookie read).
 */
export function SandboxBanner({ cohortName }: { cohortName: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="border-accent/40 bg-accent/[0.07] text-ink sticky top-0 z-50 flex flex-wrap items-center justify-center gap-3 border-b px-4 py-2 text-sm backdrop-blur">
      <span className="text-accent inline-flex h-5 items-center rounded-full bg-accent/20 px-2 text-[10px] font-semibold uppercase tracking-widest">
        Sandbox
      </span>
      <span className="text-ink/85">
        You&apos;re in <strong className="text-ink">{cohortName}</strong> — changes
        you make here don&apos;t affect any real cohort.
      </span>
      <button
        type="button"
        onClick={() =>
          start(async () => {
            await exitSandbox();
            router.refresh();
          })
        }
        disabled={pending}
        className="border-line text-muted hover:text-ink hover:border-ink/40 ml-auto rounded-md border px-3 py-1 text-xs transition-colors disabled:opacity-60"
      >
        {pending ? "Exiting…" : "Exit sandbox"}
      </button>
    </div>
  );
}
