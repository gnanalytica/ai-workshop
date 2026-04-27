"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePod } from "@/lib/actions/pods";
import { cn } from "@/lib/utils";

export function DeletePodButton({
  podId,
  podName,
  cohortId,
}: {
  podId: string;
  podName: string;
  cohortId: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onClick() {
    if (
      !confirm(
        `Delete pod "${podName}"? This removes all members and faculty assignments. This cannot be undone.`,
      )
    )
      return;
    start(async () => {
      const loadingId = toast.loading("Deleting pod…");
      const r = await deletePod(podId, cohortId);
      toast.dismiss(loadingId);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Pod deleted");
      const q = /^[0-9a-f-]{36}$/i.test(cohortId) ? `?cohort=${cohortId}` : "";
      router.push(`/pods${q}`);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "border-line text-muted hover:border-red-400/60 hover:text-red-400 rounded-md border px-3 py-1.5 text-xs disabled:opacity-60",
        pending && "pointer-events-none opacity-70",
      )}
    >
      {pending ? "Deleting…" : "Delete pod"}
    </button>
  );
}
