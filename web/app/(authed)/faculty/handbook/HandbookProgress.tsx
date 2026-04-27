"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setHandbookProgress } from "@/lib/actions/handbook";

export function HandbookProgress({
  moduleId,
  status,
}: {
  moduleId: string;
  status: "not_started" | "in_progress" | "completed" | null;
}) {
  const [pending, start] = useTransition();
  function set(next: "in_progress" | "completed" | "not_started") {
    start(async () => {
      const r = await setHandbookProgress({ module_id: moduleId, status: next });
      if (r.ok) toast.success(next === "completed" ? "Marked complete" : "Updated");
      else toast.error(r.error);
    });
  }
  if (status === "completed") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="rounded-lg"
        onClick={() => set("not_started")}
        disabled={pending}
      >
        Mark incomplete
      </Button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "in_progress" && (
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg"
          onClick={() => set("in_progress")}
          disabled={pending}
        >
          Start
        </Button>
      )}
      <Button size="sm" className="rounded-lg" onClick={() => set("completed")} disabled={pending}>
        Mark complete
      </Button>
    </div>
  );
}
