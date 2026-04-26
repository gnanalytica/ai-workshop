"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { podEvent } from "@/lib/actions/pods";

interface Student { user_id: string; full_name: string | null }
interface Pod {
  pod_id: string;
  name: string;
  faculty_names: string[];
  is_my_pod: boolean;
  members: Student[];
}

export function PodBoard({
  pods,
  unassigned,
}: {
  pods: Pod[];
  unassigned: Student[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function move(targetPodId: string, userId: string) {
    start(async () => {
      const r = await podEvent({
        pod_id: targetPodId,
        kind: "member_added",
        target_user_id: userId,
      });
      if (r.ok) {
        toast.success("Moved");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function unassign(podId: string, userId: string) {
    start(async () => {
      const r = await podEvent({
        pod_id: podId,
        kind: "member_removed",
        target_user_id: userId,
      });
      if (r.ok) {
        toast.success("Unassigned");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-muted text-sm">
        Drag a student onto a pod card to move them. Drop on the &quot;Unassigned&quot; column to remove
        from any pod.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <DropColumn
          title="Unassigned"
          subtitle={`${unassigned.length} student${unassigned.length === 1 ? "" : "s"}`}
          onDrop={(sid, fromPod) => {
            if (fromPod) unassign(fromPod, sid);
          }}
        >
          {unassigned.length === 0 ? (
            <p className="text-muted text-xs">Everyone is in a pod.</p>
          ) : (
            unassigned.map((s) => (
              <DraggableChip key={s.user_id} userId={s.user_id} fromPodId={null} label={s.full_name ?? "—"} />
            ))
          )}
        </DropColumn>

        {pods.map((p) => (
          <DropColumn
            key={p.pod_id}
            title={p.name}
            badge={p.is_my_pod ? "Mine" : undefined}
            subtitle={`${p.members.length} students · ${p.faculty_names.length || 0} faculty`}
            onDrop={(sid) => move(p.pod_id, sid)}
          >
            {p.faculty_names.length > 0 && (
              <p className="text-muted mb-2 text-xs">{p.faculty_names.join(", ")}</p>
            )}
            {p.members.length === 0 ? (
              <p className="text-muted text-xs">Empty pod.</p>
            ) : (
              p.members.map((m) => (
                <DraggableChip
                  key={m.user_id}
                  userId={m.user_id}
                  fromPodId={p.pod_id}
                  label={m.full_name ?? "—"}
                />
              ))
            )}
          </DropColumn>
        ))}
      </div>
      {pending && <p className="text-muted text-xs">Saving…</p>}
    </div>
  );
}

function DraggableChip({
  userId,
  fromPodId,
  label,
}: {
  userId: string;
  fromPodId: string | null;
  label: string;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ userId, fromPodId }));
        e.dataTransfer.effectAllowed = "move";
      }}
      className="border-line bg-input-bg text-ink mb-1.5 cursor-grab rounded-md border px-2 py-1.5 text-sm active:cursor-grabbing"
    >
      {label}
    </div>
  );
}

function DropColumn({
  title,
  subtitle,
  badge,
  children,
  onDrop,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  onDrop: (userId: string, fromPodId: string | null) => void;
}) {
  return (
    <Card
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        try {
          const { userId, fromPodId } = JSON.parse(e.dataTransfer.getData("text/plain"));
          onDrop(userId, fromPodId);
        } catch {
          /* ignore */
        }
      }}
      className="min-h-[160px]"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <CardTitle>{title}</CardTitle>
        {badge && <Badge variant="accent">{badge}</Badge>}
      </div>
      {subtitle && <CardSub className="mb-3">{subtitle}</CardSub>}
      <div>{children}</div>
    </Card>
  );
}
