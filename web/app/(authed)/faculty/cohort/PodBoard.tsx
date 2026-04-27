"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { podEvent } from "@/lib/actions/pods";
import { cn } from "@/lib/utils";

interface Student {
  user_id: string;
  full_name: string | null;
}
interface Pod {
  pod_id: string;
  name: string;
  faculty_names: string[];
  is_my_pod: boolean;
  members: Student[];
}

type Located = { student: Student; podId: string | null };

export function PodBoard({
  pods,
  unassigned,
}: {
  pods: Pod[];
  unassigned: Student[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTarget, setBulkTarget] = useState<string>("");

  const all: Located[] = useMemo(() => {
    const list: Located[] = [];
    unassigned.forEach((s) => list.push({ student: s, podId: null }));
    pods.forEach((p) =>
      p.members.forEach((s) => list.push({ student: s, podId: p.pod_id })),
    );
    return list;
  }, [pods, unassigned]);

  const studentLookup = useMemo(() => {
    const m = new Map<string, Located>();
    all.forEach((l) => m.set(l.student.user_id, l));
    return m;
  }, [all]);

  const matchedIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      all
        .filter(({ student }) =>
          (student.full_name ?? "").toLowerCase().includes(q),
        )
        .map(({ student }) => student.user_id),
    );
  }, [query, all]);

  function toggle(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function selectAllMatches() {
    if (matchedIds && matchedIds.size > 0) {
      setSelected(new Set(matchedIds));
    }
  }

  function clearSelection() {
    setSelected(new Set());
    setBulkTarget("");
  }

  function bulkRun(toPodId: string | null) {
    const ids = [...selected];
    if (ids.length === 0) return;
    start(async () => {
      const results = await Promise.all(
        ids.map(async (id) => {
          const located = studentLookup.get(id);
          if (toPodId === null) {
            if (!located?.podId) return { id, ok: true as const };
            const r = await podEvent({
              pod_id: located.podId,
              kind: "member_removed",
              target_user_id: id,
            });
            return { id, ok: r.ok, error: r.ok ? undefined : r.error };
          }
          if (located?.podId === toPodId) return { id, ok: true as const };
          const r = await podEvent({
            pod_id: toPodId,
            kind: "member_added",
            target_user_id: id,
          });
          return { id, ok: r.ok, error: r.ok ? undefined : r.error };
        }),
      );
      const failures = results.filter((r) => !r.ok);
      if (failures.length === 0) {
        toast.success(
          `Updated ${ids.length} student${ids.length === 1 ? "" : "s"}`,
        );
      } else {
        toast.error(
          `${failures.length} of ${ids.length} failed: ${failures[0]?.error ?? "unknown"}`,
        );
      }
      clearSelection();
      router.refresh();
    });
  }

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

  const selectedCount = selected.size;
  const matchCount = matchedIds?.size ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students by name…"
          aria-label="Search students"
          className="max-w-xs"
        />
        {query && (
          <span className="text-muted text-xs">
            {matchCount} match{matchCount === 1 ? "" : "es"}
          </span>
        )}
        {query && matchCount > 0 && (
          <Button size="sm" variant="ghost" onClick={selectAllMatches}>
            Select all matches
          </Button>
        )}
        <span className="text-muted ml-auto text-xs">
          Tip: tick students to bulk-assign, or drag a chip onto a pod.
        </span>
      </div>

      {selectedCount > 0 && (
        <div className="border-accent/40 bg-accent/5 sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 backdrop-blur">
          <Badge variant="accent">{selectedCount} selected</Badge>
          <span className="text-muted text-xs">Move to:</span>
          <select
            value={bulkTarget}
            onChange={(e) => setBulkTarget(e.target.value)}
            className="border-line bg-input-bg text-ink h-8 rounded-md border px-2 text-sm"
            aria-label="Target pod"
          >
            <option value="">Choose pod…</option>
            {pods.map((p) => (
              <option key={p.pod_id} value={p.pod_id}>
                {p.name}
                {p.is_my_pod ? " (mine)" : ""} · {p.members.length}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!bulkTarget || pending}
            onClick={() => bulkRun(bulkTarget)}
          >
            Move {selectedCount}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => bulkRun(null)}
          >
            Unassign {selectedCount}
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <DropColumn
          title="Unassigned"
          tone="warn"
          subtitle={`${unassigned.length} student${unassigned.length === 1 ? "" : "s"}`}
          onDrop={(sid, fromPod) => {
            if (fromPod) unassign(fromPod, sid);
          }}
        >
          {unassigned.length === 0 ? (
            <EmptyHint>Everyone is in a pod.</EmptyHint>
          ) : (
            unassigned.map((s) => (
              <StudentChip
                key={s.user_id}
                student={s}
                fromPodId={null}
                selected={selected.has(s.user_id)}
                dimmed={matchedIds !== null && !matchedIds.has(s.user_id)}
                onToggle={() => toggle(s.user_id)}
              />
            ))
          )}
        </DropColumn>

        {pods.map((p) => (
          <DropColumn
            key={p.pod_id}
            title={p.name}
            tone={p.is_my_pod ? "mine" : "default"}
            badge={p.is_my_pod ? "Mine" : undefined}
            subtitle={`${p.members.length} student${p.members.length === 1 ? "" : "s"}${
              p.faculty_names.length
                ? ` · ${p.faculty_names.length} faculty`
                : ""
            }`}
            faculty={p.faculty_names}
            onDrop={(sid, fromPod) => {
              if (fromPod === p.pod_id) return;
              move(p.pod_id, sid);
            }}
          >
            {p.members.length === 0 ? (
              <EmptyHint>Empty pod — drag students here.</EmptyHint>
            ) : (
              p.members.map((m) => (
                <StudentChip
                  key={m.user_id}
                  student={m}
                  fromPodId={p.pod_id}
                  selected={selected.has(m.user_id)}
                  dimmed={matchedIds !== null && !matchedIds.has(m.user_id)}
                  onToggle={() => toggle(m.user_id)}
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

function initials(name: string | null) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "—";
}

function StudentChip({
  student,
  fromPodId,
  selected,
  dimmed,
  onToggle,
}: {
  student: Student;
  fromPodId: string | null;
  selected: boolean;
  dimmed: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({ userId: student.user_id, fromPodId }),
        );
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "border-line bg-input-bg text-ink mb-1.5 flex cursor-grab items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-opacity active:cursor-grabbing",
        selected && "border-accent/60 bg-accent/10",
        dimmed && "opacity-30",
      )}
    >
      <input
        type="checkbox"
        className="accent-[hsl(var(--accent))]"
        checked={selected}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select ${student.full_name ?? "student"}`}
      />
      <span className="bg-bg-soft border-line flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium">
        {initials(student.full_name)}
      </span>
      <span className="truncate">{student.full_name ?? "—"}</span>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-muted text-xs italic">{children}</p>;
}

function DropColumn({
  title,
  subtitle,
  badge,
  tone = "default",
  faculty,
  children,
  onDrop,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  tone?: "default" | "mine" | "warn";
  faculty?: string[];
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
          const { userId, fromPodId } = JSON.parse(
            e.dataTransfer.getData("text/plain"),
          );
          onDrop(userId, fromPodId);
        } catch {
          /* ignore */
        }
      }}
      className={cn(
        "min-h-[180px] transition-colors",
        tone === "mine" && "border-accent/40 ring-accent/20 ring-1",
        tone === "warn" && "border-amber-500/30",
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <CardTitle className="truncate">{title}</CardTitle>
        {badge && <Badge variant="accent">{badge}</Badge>}
      </div>
      {subtitle && <CardSub className="mb-2 text-xs">{subtitle}</CardSub>}
      {faculty && faculty.length > 0 && (
        <p className="text-muted mb-3 truncate text-[11px]">
          {faculty.join(" · ")}
        </p>
      )}
      <div>{children}</div>
    </Card>
  );
}
