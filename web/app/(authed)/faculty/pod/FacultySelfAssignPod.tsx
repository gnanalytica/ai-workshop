"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { podEvent } from "@/lib/actions/pods";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function FacultySelfAssignPod({
  cohortPods,
  currentPodId,
  meId,
  canWrite,
}: {
  cohortPods: { pod_id: string; name: string }[];
  currentPodId: string | null;
  meId: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function assignToPod(podId: string | null) {
    if (!canWrite || pending) return;
    if (podId !== null && podId === currentPodId) return;
    if (podId === null && currentPodId === null) return;
    start(async () => {
      if (podId === null) {
        if (!currentPodId) return;
        const r = await podEvent({
          pod_id: currentPodId,
          kind: "faculty_removed",
          target_user_id: meId,
        });
        if (!r.ok) {
          toast.error(r.error);
          return;
        }
        toast.success("Left pod");
      } else {
        const r = await podEvent({
          pod_id: podId,
          kind: "faculty_added",
          target_user_id: meId,
        });
        if (!r.ok) {
          toast.error(r.error);
          return;
        }
        toast.success("Pod updated");
      }
      router.refresh();
    });
  }

  if (!canWrite || cohortPods.length === 0) return null;

  return (
    <Card className="border-accent/25 bg-accent/5">
      <CardTitle className="text-base">Your pod assignment</CardTitle>
      <CardSub className="mt-1 mb-3 text-sm leading-relaxed">
        Drag <span className="text-ink font-medium">You</span> onto a pod, or onto
        Unassigned to step off your current pod.
      </CardSub>
      <div className={cn("flex flex-wrap gap-2", pending && "pointer-events-none opacity-70")}>
        <DropZone
          label="Unassigned"
          tone="warn"
          highlight={currentPodId === null}
          onDrop={() => assignToPod(null)}
        />
        {cohortPods.map((p) => (
          <DropZone
            key={p.pod_id}
            label={p.name}
            tone={p.pod_id === currentPodId ? "mine" : "default"}
            highlight={p.pod_id === currentPodId}
            onDrop={() => assignToPod(p.pod_id)}
          />
        ))}
      </div>
      <div className="mt-3">
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "text/plain",
              JSON.stringify({ kind: "faculty-self", meId }),
            );
            e.dataTransfer.effectAllowed = "move";
          }}
          className="border-line bg-input-bg text-ink inline-flex cursor-grab items-center gap-2 rounded-md border px-3 py-2 text-sm active:cursor-grabbing"
        >
          <span className="text-muted text-xs">Drag</span>
          <span className="font-medium">You</span>
        </div>
      </div>
    </Card>
  );
}

function DropZone({
  label,
  tone,
  highlight,
  onDrop,
}: {
  label: string;
  tone: "default" | "mine" | "warn";
  highlight: boolean;
  onDrop: () => void;
}) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        try {
          const raw = e.dataTransfer.getData("text/plain");
          const p = JSON.parse(raw) as { kind?: string };
          if (p?.kind === "faculty-self") onDrop();
        } catch {
          /* ignore */
        }
      }}
      className={cn(
        "min-h-[72px] min-w-[104px] rounded-md border px-3 py-2 text-sm transition-colors",
        tone === "mine" && "border-accent/50 bg-accent/10 ring-accent/20 ring-1",
        tone === "warn" && "border-warn/30 bg-bg-soft",
        tone === "default" && "border-line bg-bg-soft",
        highlight && "ring-2 ring-accent/35",
      )}
    >
      <span className="font-medium">{label}</span>
    </div>
  );
}
