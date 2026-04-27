"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { podEvent } from "@/lib/actions/pods";

interface PodOption {
  pod_id: string;
  name: string;
}

export function StudentActions({
  userId,
  email,
  currentPodId,
  pods,
}: {
  userId: string;
  email: string;
  currentPodId: string | null;
  pods: PodOption[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [target, setTarget] = useState<string>("");
  const [showMove, setShowMove] = useState(false);

  function move() {
    if (!target || target === currentPodId) return;
    start(async () => {
      const r = await podEvent({
        pod_id: target,
        kind: "member_added",
        target_user_id: userId,
      });
      if (r.ok) {
        toast.success("Moved");
        setShowMove(false);
        setTarget("");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function unassign() {
    if (!currentPodId) return;
    start(async () => {
      const r = await podEvent({
        pod_id: currentPodId,
        kind: "member_removed",
        target_user_id: userId,
      });
      if (r.ok) {
        toast.success("Unassigned");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" asChild>
        <a href={`mailto:${email}`}>Email</a>
      </Button>
      <Button size="sm" variant="outline" onClick={copyEmail}>
        Copy email
      </Button>
      {pods.length > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowMove((v) => !v)}
          disabled={pending}
        >
          {showMove ? "Cancel" : "Move pod"}
        </Button>
      )}
      {currentPodId && (
        <Button
          size="sm"
          variant="ghost"
          onClick={unassign}
          disabled={pending}
        >
          Unassign
        </Button>
      )}
      {showMove && (
        <div className="flex items-center gap-2">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="border-line bg-input-bg text-ink h-8 rounded-md border px-2 text-sm"
            aria-label="Target pod"
          >
            <option value="">Choose pod…</option>
            {pods.map((p) => (
              <option
                key={p.pod_id}
                value={p.pod_id}
                disabled={p.pod_id === currentPodId}
              >
                {p.name}
                {p.pod_id === currentPodId ? " (current)" : ""}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!target || target === currentPodId || pending}
            onClick={move}
          >
            Move
          </Button>
        </div>
      )}
    </div>
  );
}
