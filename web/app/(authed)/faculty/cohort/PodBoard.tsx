"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { podEvent, deletePod } from "@/lib/actions/pods";
import {
  StudentDrawer,
  type StudentDrawerTarget,
} from "@/components/student-drawer/StudentDrawer";
import { cn } from "@/lib/utils";

interface Student {
  user_id: string;
  full_name: string | null;
}
interface FacultyMember {
  user_id: string;
  full_name: string | null;
  college_role: "support" | "executive";
}
interface CohortFacultyMember {
  user_id: string;
  full_name: string | null;
  college_role: "support" | "executive";
}
interface Pod {
  pod_id: string;
  name: string;
  faculty_names: string[];
  faculty: FacultyMember[];
  is_my_pod: boolean;
  members: Student[];
}

type Located = { student: Student; podId: string | null };
type FacultyLocated = { faculty: FacultyMember | CohortFacultyMember; podId: string | null };

type DragPayload =
  | { kind: "student"; ids: string[]; fromPodId: string | null }
  | { kind: "faculty"; userId: string; fromPodId: string | null };

export function PodBoard({
  cohortId,
  pods,
  unassigned,
  cohortFaculty = [],
  canManagePods = false,
}: {
  cohortId: string;
  pods: Pod[];
  unassigned: Student[];
  cohortFaculty?: CohortFacultyMember[];
  canManagePods?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTarget, setBulkTarget] = useState<string>("");
  const [drawerTarget, setDrawerTarget] = useState<StudentDrawerTarget | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"kanban" | "faculty" | "students">(
    "kanban",
  );

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

  const facultyLookup = useMemo(() => {
    const m = new Map<string, FacultyLocated>();
    cohortFaculty.forEach((f) => m.set(f.user_id, { faculty: f, podId: null }));
    pods.forEach((p) =>
      p.faculty.forEach((f) => m.set(f.user_id, { faculty: f, podId: p.pod_id })),
    );
    return m;
  }, [pods, cohortFaculty]);

  const unassignedFaculty: CohortFacultyMember[] = useMemo(() => {
    const inAnyPod = new Set<string>();
    pods.forEach((p) => p.faculty.forEach((f) => inAnyPod.add(f.user_id)));
    return cohortFaculty.filter((f) => !inAnyPod.has(f.user_id));
  }, [pods, cohortFaculty]);

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
    moveMany(toPodId, [...selected]);
  }

  function moveMany(targetPodId: string | null, userIds: string[]) {
    if (userIds.length === 0) return;
    start(async () => {
      const results = await Promise.all(
        userIds.map(async (id) => {
          const located = studentLookup.get(id);
          if (targetPodId === null) {
            if (!located?.podId) return { id, ok: true as const };
            const r = await podEvent({
              pod_id: located.podId,
              kind: "member_removed",
              target_user_id: id,
            });
            return { id, ok: r.ok, error: r.ok ? undefined : r.error };
          }
          if (located?.podId === targetPodId) return { id, ok: true as const };
          const r = await podEvent({
            pod_id: targetPodId,
            kind: "member_added",
            target_user_id: id,
          });
          return { id, ok: r.ok, error: r.ok ? undefined : r.error };
        }),
      );
      const failures = results.filter((r) => !r.ok);
      const verb = targetPodId === null ? "Unassigned" : "Moved";
      if (failures.length === 0) {
        toast.success(
          `${verb} ${userIds.length} student${userIds.length === 1 ? "" : "s"}`,
        );
      } else {
        toast.error(
          `${failures.length} of ${userIds.length} failed: ${failures[0]?.error ?? "unknown"}`,
        );
      }
      if (selected.size > 0) clearSelection();
      router.refresh();
    });
  }

  function moveFaculty(targetPodId: string | null, userId: string) {
    const located = facultyLookup.get(userId);
    if (!located) return;
    if (located.podId === targetPodId) return;
    start(async () => {
      const ops: Array<Promise<{ ok: boolean; error?: string }>> = [];
      if (located.podId) {
        ops.push(
          podEvent({
            pod_id: located.podId,
            kind: "faculty_removed",
            target_user_id: userId,
          }),
        );
      }
      if (targetPodId) {
        ops.push(
          podEvent({
            pod_id: targetPodId,
            kind: "faculty_added",
            target_user_id: userId,
          }),
        );
      }
      const results = await Promise.all(ops);
      const fail = results.find((r) => !r.ok);
      if (fail) toast.error(fail.error ?? "Faculty move failed");
      else
        toast.success(
          targetPodId === null ? "Faculty unassigned" : "Faculty moved",
        );
      router.refresh();
    });
  }

  function handleDeletePod(pod: Pod) {
    if (pod.members.length > 0) {
      toast.error("Move students out first");
      return;
    }
    if (
      !confirm(
        `Delete pod "${pod.name}"? It has ${pod.members.length} member${pod.members.length === 1 ? "" : "s"} and ${pod.faculty.length} faculty.`,
      )
    ) {
      return;
    }
    start(async () => {
      const r = await deletePod(pod.pod_id);
      if (r.ok) {
        toast.success(`Pod "${pod.name}" deleted`);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  const selectedCount = selected.size;
  const matchCount = matchedIds?.size ?? 0;

  return (
    <div className="space-y-3">
      {pods.length === 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">No pods yet</CardTitle>
              <CardSub className="mt-1 text-sm leading-relaxed">
                {canManagePods ? (
                  <>
                    Create your first pod to assign students from the
                    Unassigned column.
                  </>
                ) : (
                  <>
                    Pods haven&apos;t been set up yet. Ask your cohort lead to
                    create pods when you&apos;re ready to place students.
                  </>
                )}
              </CardSub>
            </div>
            {canManagePods && (
              <Button variant="default" asChild className="shrink-0">
                <a href="#create-pod">Create first pod</a>
              </Button>
            )}
          </div>
        </Card>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <ViewToggle mode={viewMode} onChange={setViewMode} />
        {viewMode !== "faculty" && (
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students by name…"
            aria-label="Search students"
            className="max-w-xs"
          />
        )}
        {viewMode !== "faculty" && query && (
          <span className="text-muted text-xs">
            {matchCount} match{matchCount === 1 ? "" : "es"}
          </span>
        )}
        {viewMode !== "faculty" && query && matchCount > 0 && (
          <Button size="sm" variant="ghost" onClick={selectAllMatches}>
            Select all matches
          </Button>
        )}
        <span className="text-muted ml-auto text-xs">
          {viewMode === "kanban"
            ? "Tip: tick students to bulk-assign, drag chips between pods, or click a name to peek."
            : viewMode === "students"
              ? "Tick rows to bulk-assign, or use the per-row dropdown."
              : "Use the per-row dropdown to move a faculty member between pods."}
        </span>
      </div>

      {viewMode !== "faculty" && selectedCount > 0 && (
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

      {viewMode === "kanban" && (
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <DropColumn
          title="Cohort faculty"
          tone="default"
          subtitle={`${unassignedFaculty.length} unassigned`}
          onDrop={(payload) => {
            if (payload.kind === "faculty") {
              moveFaculty(null, payload.userId);
            }
          }}
        >
          {unassignedFaculty.length === 0 ? (
            <EmptyHint>All cohort faculty are assigned to pods.</EmptyHint>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {unassignedFaculty.map((f) => (
                <FacultyChip
                  key={f.user_id}
                  faculty={f}
                  fromPodId={null}
                  draggable={canManagePods}
                />
              ))}
            </div>
          )}
        </DropColumn>

        <DropColumn
          title="Unassigned"
          tone="warn"
          subtitle={`${unassigned.length} student${unassigned.length === 1 ? "" : "s"}`}
          onDrop={(payload) => {
            if (payload.kind === "student") {
              const toUnassign = payload.ids.filter(
                (id) => studentLookup.get(id)?.podId,
              );
              moveMany(null, toUnassign);
            }
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
                selectedIds={selected}
                dimmed={matchedIds !== null && !matchedIds.has(s.user_id)}
                onToggle={() => toggle(s.user_id)}
                onOpen={() => setDrawerTarget(s)}
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
              p.faculty.length ? ` · ${p.faculty.length} faculty` : ""
            }`}
            onDelete={
              canManagePods ? () => handleDeletePod(p) : undefined
            }
            onDrop={(payload) => {
              if (payload.kind === "student") {
                const toMove = payload.ids.filter(
                  (id) => studentLookup.get(id)?.podId !== p.pod_id,
                );
                moveMany(p.pod_id, toMove);
              } else {
                moveFaculty(p.pod_id, payload.userId);
              }
            }}
          >
            <div className="border-accent/20 bg-accent/[0.04] -mx-4 -mt-1 mb-3 border-y px-4 py-2">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-accent/80 text-[10px] font-semibold uppercase tracking-wider">
                  Faculty
                </p>
                <span className="text-muted text-[10px]">
                  {p.faculty.length === 0 ? "none" : `${p.faculty.length} assigned`}
                </span>
              </div>
              {p.faculty.length === 0 ? (
                <p className="text-muted py-1 text-xs italic">
                  Drag a faculty chip from “Cohort faculty” onto this pod.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {p.faculty.map((f) => (
                    <FacultyChip
                      key={f.user_id}
                      faculty={f}
                      fromPodId={p.pod_id}
                      draggable={canManagePods}
                    />
                  ))}
                </div>
              )}
            </div>
            {p.members.length === 0 ? (
              <EmptyHint>Empty pod — drag students here.</EmptyHint>
            ) : (
              p.members.map((m) => (
                <StudentChip
                  key={m.user_id}
                  student={m}
                  fromPodId={p.pod_id}
                  selected={selected.has(m.user_id)}
                  selectedIds={selected}
                  dimmed={matchedIds !== null && !matchedIds.has(m.user_id)}
                  onToggle={() => toggle(m.user_id)}
                  onOpen={() => setDrawerTarget(m)}
                />
              ))
            )}
          </DropColumn>
        ))}
      </div>
      )}

      {viewMode === "faculty" && (
        <FacultyListView
          pods={pods}
          allFaculty={[
            ...pods.flatMap((p) =>
              p.faculty.map((f) => ({
                user_id: f.user_id,
                full_name: f.full_name,
                college_role: f.college_role,
                podId: p.pod_id,
                podName: p.name,
              })),
            ),
            ...unassignedFaculty.map((f) => ({
              user_id: f.user_id,
              full_name: f.full_name,
              college_role: f.college_role,
              podId: null as string | null,
              podName: null as string | null,
            })),
          ]}
          canManagePods={canManagePods}
          pending={pending}
          onMove={moveFaculty}
        />
      )}

      {viewMode === "students" && (
        <StudentListView
          pods={pods}
          allLocated={all}
          query={query}
          matchedIds={matchedIds}
          selected={selected}
          onToggle={toggle}
          onOpenDrawer={(s) => setDrawerTarget(s)}
          canManagePods={canManagePods}
          pending={pending}
          onMove={(toPodId, ids) => moveMany(toPodId, ids)}
        />
      )}

      {pending && <p className="text-muted text-xs">Saving…</p>}

      <StudentDrawer
        cohortId={cohortId}
        target={drawerTarget}
        onClose={() => setDrawerTarget(null)}
      />
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
  selectedIds,
  dimmed,
  onToggle,
  onOpen,
}: {
  student: Student;
  fromPodId: string | null;
  selected: boolean;
  selectedIds: Set<string>;
  dimmed: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        const ids =
          selected && selectedIds.size > 1
            ? Array.from(selectedIds)
            : [student.user_id];
        const payload: DragPayload = { kind: "student", ids, fromPodId };
        e.dataTransfer.setData("text/plain", JSON.stringify(payload));
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
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="hover:text-accent flex-1 truncate text-left"
      >
        {student.full_name ?? "—"}
      </button>
    </div>
  );
}

function FacultyChip({
  faculty,
  fromPodId,
  draggable,
}: {
  faculty: FacultyMember;
  fromPodId: string | null;
  draggable: boolean;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={
        draggable
          ? (e) => {
              const payload: DragPayload = {
                kind: "faculty",
                userId: faculty.user_id,
                fromPodId,
              };
              e.dataTransfer.setData("text/plain", JSON.stringify(payload));
              e.dataTransfer.effectAllowed = "move";
            }
          : undefined
      }
      className={cn(
        "border-accent/40 bg-accent/10 text-ink inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-1 text-xs",
        draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      <span className="bg-accent/20 text-accent border-accent/30 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-medium">
        {initials(faculty.full_name)}
      </span>
      <span className="truncate">{faculty.full_name ?? "—"}</span>
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
  children,
  onDrop,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  tone?: "default" | "mine" | "warn";
  children: React.ReactNode;
  onDrop: (payload: DragPayload) => void;
  onDelete?: () => void;
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
          const raw = JSON.parse(e.dataTransfer.getData("text/plain"));
          if (raw && raw.kind === "student" && Array.isArray(raw.ids)) {
            onDrop({
              kind: "student",
              ids: raw.ids,
              fromPodId: raw.fromPodId ?? null,
            });
          } else if (raw && raw.kind === "faculty" && raw.userId) {
            onDrop({
              kind: "faculty",
              userId: raw.userId,
              fromPodId: raw.fromPodId ?? null,
            });
          } else if (raw && Array.isArray(raw.ids)) {
            onDrop({
              kind: "student",
              ids: raw.ids,
              fromPodId: raw.fromPodId ?? null,
            });
          }
        } catch {
          /* ignore */
        }
      }}
      className={cn(
        "min-h-[180px] transition-colors",
        tone === "mine" && "border-accent/40 ring-accent/20 ring-1",
        tone === "warn" && "border-warn/30",
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <CardTitle className="truncate">{title}</CardTitle>
        <div className="flex items-center gap-1">
          {badge && <Badge variant="accent">{badge}</Badge>}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-muted hover:text-danger rounded-md px-1.5 py-0.5 text-xs"
              aria-label={`Delete ${title}`}
              title="Delete pod"
            >
              ×
            </button>
          )}
        </div>
      </div>
      {subtitle && <CardSub className="mb-2 text-xs">{subtitle}</CardSub>}
      <div>{children}</div>
    </Card>
  );
}

function ViewToggle({
  mode,
  onChange,
}: {
  mode: "kanban" | "faculty" | "students";
  onChange: (m: "kanban" | "faculty" | "students") => void;
}) {
  const opts: Array<{ id: typeof mode; label: string }> = [
    { id: "kanban", label: "Kanban" },
    { id: "faculty", label: "Faculty" },
    { id: "students", label: "Students" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Roster view"
      className="border-line bg-input-bg inline-flex items-center rounded-md border p-0.5 text-xs"
    >
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={mode === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-[5px] px-3 py-1 transition-colors",
            mode === o.id
              ? "bg-accent text-cta-ink font-medium"
              : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface FacultyRow {
  user_id: string;
  full_name: string | null;
  college_role: "support" | "executive";
  podId: string | null;
  podName: string | null;
}

function FacultyListView({
  pods,
  allFaculty,
  canManagePods,
  pending,
  onMove,
}: {
  pods: Pod[];
  allFaculty: FacultyRow[];
  canManagePods: boolean;
  pending: boolean;
  onMove: (toPodId: string | null, userId: string) => void;
}) {
  const sorted = useMemo(
    () =>
      [...allFaculty].sort((a, b) =>
        (a.full_name ?? "").localeCompare(b.full_name ?? ""),
      ),
    [allFaculty],
  );
  if (sorted.length === 0) {
    return (
      <Card>
        <CardSub>No faculty assigned to this cohort yet.</CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0">
      <ul className="divide-line/50 divide-y">
        <li className="text-muted grid grid-cols-[1fr_1fr_auto] items-center gap-3 px-4 py-2 text-[10px] font-medium uppercase tracking-wider">
          <span>Name</span>
          <span>Pod</span>
          <span className="text-right">Move to</span>
        </li>
        {sorted.map((f) => (
          <li
            key={f.user_id}
            className="hover:bg-bg-soft grid grid-cols-[1fr_1fr_auto] items-center gap-3 px-4 py-2.5 text-sm transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="bg-accent/15 text-accent border-accent/30 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium">
                {initials(f.full_name)}
              </span>
              <span className="truncate">{f.full_name ?? "—"}</span>
            </div>
            <div className="text-muted truncate">
              {f.podName ?? <span className="text-warn">Unassigned</span>}
            </div>
            <div className="flex justify-end">
              <select
                value={f.podId ?? ""}
                disabled={!canManagePods || pending}
                onChange={(e) =>
                  onMove(e.target.value === "" ? null : e.target.value, f.user_id)
                }
                className="border-line bg-input-bg text-ink h-8 rounded-md border px-2 text-xs disabled:opacity-50"
                aria-label={`Move ${f.full_name ?? "faculty"} to pod`}
              >
                <option value="">— Unassigned —</option>
                {pods.map((p) => (
                  <option key={p.pod_id} value={p.pod_id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function StudentListView({
  pods,
  allLocated,
  query,
  matchedIds,
  selected,
  onToggle,
  onOpenDrawer,
  canManagePods,
  pending,
  onMove,
}: {
  pods: Pod[];
  allLocated: Located[];
  query: string;
  matchedIds: Set<string> | null;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onOpenDrawer: (s: Student) => void;
  canManagePods: boolean;
  pending: boolean;
  onMove: (toPodId: string | null, ids: string[]) => void;
}) {
  const podName = useMemo(() => {
    const m = new Map(pods.map((p) => [p.pod_id, p.name] as const));
    return (id: string | null) => (id ? m.get(id) ?? "—" : null);
  }, [pods]);

  const rows = useMemo(() => {
    const visible = matchedIds
      ? allLocated.filter((l) => matchedIds.has(l.student.user_id))
      : allLocated;
    return [...visible].sort((a, b) =>
      (a.student.full_name ?? "").localeCompare(b.student.full_name ?? ""),
    );
  }, [allLocated, matchedIds]);

  if (rows.length === 0) {
    return (
      <Card>
        <CardSub>
          {query ? "No students match that search." : "No students in this cohort yet."}
        </CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0">
      <ul className="divide-line/50 divide-y">
        <li className="text-muted grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 px-4 py-2 text-[10px] font-medium uppercase tracking-wider">
          <span className="w-4" />
          <span>Name</span>
          <span>Pod</span>
          <span className="text-right">Move to</span>
        </li>
        {rows.map(({ student, podId }) => {
          const checked = selected.has(student.user_id);
          const name = podName(podId);
          return (
            <li
              key={student.user_id}
              className={cn(
                "grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                checked ? "bg-accent/10" : "hover:bg-bg-soft",
              )}
            >
              <input
                type="checkbox"
                className="accent-[hsl(var(--accent))]"
                checked={checked}
                onChange={() => onToggle(student.user_id)}
                aria-label={`Select ${student.full_name ?? "student"}`}
              />
              <div className="flex items-center gap-2 min-w-0">
                <span className="bg-bg-soft border-line flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium">
                  {initials(student.full_name)}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenDrawer(student)}
                  className="hover:text-accent truncate text-left"
                >
                  {student.full_name ?? "—"}
                </button>
              </div>
              <div className="text-muted truncate">
                {name ?? <span className="text-warn">Unassigned</span>}
              </div>
              <div className="flex justify-end">
                <select
                  value={podId ?? ""}
                  disabled={!canManagePods || pending}
                  onChange={(e) =>
                    onMove(
                      e.target.value === "" ? null : e.target.value,
                      [student.user_id],
                    )
                  }
                  className="border-line bg-input-bg text-ink h-8 rounded-md border px-2 text-xs disabled:opacity-50"
                  aria-label={`Move ${student.full_name ?? "student"} to pod`}
                >
                  <option value="">— Unassigned —</option>
                  {pods.map((p) => (
                    <option key={p.pod_id} value={p.pod_id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
