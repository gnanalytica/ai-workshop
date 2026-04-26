"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { podEvent } from "@/lib/actions/pods";

interface FacultyOpt {
  user_id: string;
  full_name: string | null;
}
interface StudentOpt {
  user_id: string;
  full_name: string | null;
  email: string;
}

export function FacultyOps({
  podId,
  current,
  candidates,
}: {
  podId: string;
  current: { user_id: string; full_name: string | null }[];
  candidates: FacultyOpt[];
}) {
  const [pending, start] = useTransition();
  const [pick, setPick] = useState("");
  const currentIds = new Set(current.map((c) => c.user_id));
  const addable = candidates.filter((c) => !currentIds.has(c.user_id));

  function call(kind: "faculty_added" | "faculty_removed", uid: string) {
    start(async () => {
      const r = await podEvent({ pod_id: podId, kind, target_user_id: uid });
      if (r.ok) toast.success("Updated");
      else toast.error(r.error);
    });
  }

  function add() {
    if (!pick) return;
    call("faculty_added", pick);
    setPick("");
  }

  return (
    <div className="space-y-2">
      {current.map((f) => (
        <div key={f.user_id} className="flex items-center gap-2">
          <span className="flex-1 text-sm">{f.full_name ?? "—"}</span>
          <Button size="sm" variant="danger" onClick={() => call("faculty_removed", f.user_id)} disabled={pending}>
            Remove
          </Button>
        </div>
      ))}
      {addable.length > 0 && (
        <div className="flex items-center gap-2 pt-2">
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            className="border-line bg-input-bg text-ink flex-1 rounded-md border px-2 py-1.5 text-sm"
          >
            <option value="">Add faculty…</option>
            {addable.map((c) => (
              <option key={c.user_id} value={c.user_id}>
                {c.full_name ?? c.user_id}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={add} disabled={pending || !pick}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

export function MemberOps({
  podId,
  current,
  candidates,
}: {
  podId: string;
  current: { user_id: string; full_name: string | null; email: string }[];
  candidates: StudentOpt[];
}) {
  const [pending, start] = useTransition();
  const [pick, setPick] = useState("");

  function remove(uid: string) {
    start(async () => {
      const r = await podEvent({ pod_id: podId, kind: "member_removed", target_user_id: uid });
      if (r.ok) toast.success("Removed");
      else toast.error(r.error);
    });
  }

  function add() {
    if (!pick) return;
    start(async () => {
      const r = await podEvent({ pod_id: podId, kind: "member_added", target_user_id: pick });
      if (r.ok) {
        toast.success("Added");
        setPick("");
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-2">
      {current.map((m) => (
        <div key={m.user_id} className="flex items-center gap-2">
          <span className="flex-1 text-sm">
            {m.full_name ?? "—"} <span className="text-muted">· {m.email}</span>
          </span>
          <Button size="sm" variant="danger" onClick={() => remove(m.user_id)} disabled={pending}>
            Remove
          </Button>
        </div>
      ))}
      {candidates.length > 0 && (
        <div className="flex items-center gap-2 pt-2">
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            className="border-line bg-input-bg text-ink flex-1 rounded-md border px-2 py-1.5 text-sm"
          >
            <option value="">Add unassigned student…</option>
            {candidates.map((c) => (
              <option key={c.user_id} value={c.user_id}>
                {c.full_name ?? c.email}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={add} disabled={pending || !pick}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
