"use client";

import { useTransition } from "react";
import { deletePod } from "@/lib/actions/pods";

export function DeletePodButton({ podId, podName }: { podId: string; podName: string }) {
  const [pending, start] = useTransition();

  function onClick() {
    if (
      !confirm(
        `Delete pod "${podName}"? This removes all members and faculty assignments. This cannot be undone.`,
      )
    )
      return;
    start(async () => {
      await deletePod(podId);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="border-line text-muted hover:border-red-400/60 hover:text-red-400 rounded-md border px-3 py-1.5 text-xs disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete pod"}
    </button>
  );
}
