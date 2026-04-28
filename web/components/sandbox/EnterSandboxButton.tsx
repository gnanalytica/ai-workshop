"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { enterSandbox } from "@/lib/actions/sandbox";
import { toast } from "sonner";

/**
 * "Open field channel" button — same dispatch motif as the help FAB.
 * Status dot + mono uppercase label so it reads as instrumented action,
 * not a generic CTA.
 */
export function EnterSandboxButton({
  label = "Open field channel",
}: {
  label?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await enterSandbox();
          if (!r.ok) {
            toast.error(r.error);
            return;
          }
          toast.success("Field channel open — explore freely.");
          router.refresh();
        })
      }
      className="
        group relative inline-flex h-10 items-center gap-2.5 px-4
        font-mono text-[11px] font-semibold uppercase tracking-[0.18em]
        text-ink/90 hover:text-ink
        bg-card border border-warn/35 hover:border-warn/60
        rounded-sm
        shadow-[inset_0_1px_0_hsl(var(--ink)/0.04)]
        transition-[border-color,color,transform] duration-150
        hover:-translate-y-px
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--warn))]
      "
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 rounded-full bg-[hsl(var(--warn))] opacity-60 animate-ping group-hover:opacity-100" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-[hsl(var(--warn))]" />
      </span>
      {pending ? "Opening…" : label}
    </button>
  );
}
