"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPod } from "@/lib/actions/pods";
import { cn } from "@/lib/utils";

export function CreatePodForm({
  cohortId,
  afterCreateScrollToId,
}: {
  cohortId: string;
  /** Optional element id to scroll to after a successful create (e.g. pods board). */
  afterCreateScrollToId?: string;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const out = await createPod({
        cohort_id: cohortId,
        name: name.trim(),
        shared_notes: note.trim() || null,
      });
      if (!out.ok) {
        setError(out.error);
        return;
      }
      setName("");
      setNote("");
      toast.success("Pod created");
      router.refresh();
      if (afterCreateScrollToId) {
        window.setTimeout(() => {
          document
            .getElementById(afterCreateScrollToId)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    });
  }

  return (
    <div className="relative">
      {pending && (
        <div
          className="bg-bg/70 absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-md backdrop-blur-[2px]"
          aria-hidden
        >
          <Loader2 className="text-accent h-6 w-6 shrink-0 animate-spin" />
          <span className="text-muted text-sm">Creating pod…</span>
        </div>
      )}
      <form
        onSubmit={submit}
        aria-busy={pending}
        className={cn(
          "grid gap-3 md:grid-cols-[1fr_2fr_auto]",
          pending && "pointer-events-none opacity-80",
        )}
      >
        <input
          type="text"
          required
          maxLength={80}
          placeholder="Pod name (e.g. Pod A)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
        />
        <input
          type="text"
          maxLength={2000}
          placeholder="Faculty note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
        />
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="bg-accent text-cta-ink rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create pod"}
        </button>
        {error && (
          <p className="text-danger text-sm sm:col-span-3" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
