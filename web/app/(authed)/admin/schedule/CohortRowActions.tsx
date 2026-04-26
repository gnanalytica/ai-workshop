"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteCohort } from "@/lib/actions/schedule";

export function CohortRowActions({ cohortId, name }: { cohortId: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function onDelete() {
    setErr(null);
    start(async () => {
      const out = await deleteCohort({ cohort_id: cohortId });
      if (!out.ok) {
        setErr(out.error);
        setConfirming(false);
        return;
      }
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="mt-3 flex flex-col gap-2 text-xs">
        <span className="text-muted">
          Delete <span className="text-ink">{name}</span>? This cannot be undone.
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-md bg-red-500/10 px-2.5 py-1 text-red-300 hover:bg-red-500/20 disabled:opacity-60"
          >
            {pending ? "Deleting…" : "Confirm delete"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="border-line text-muted hover:text-ink rounded-md border px-2.5 py-1"
          >
            Cancel
          </button>
        </div>
        {err && <p className="text-red-400">{err}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-muted hover:text-ink mt-3 inline-flex items-center gap-1 text-xs"
      title="Delete cohort"
    >
      <Trash2 size={12} />
      Delete
    </button>
  );
}
