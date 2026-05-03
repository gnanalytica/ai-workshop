"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTeam, joinTeam, leaveTeam } from "@/lib/actions/teams";
import type { TeamRow } from "@/lib/queries/teams";

export function TeamsClient({ cohortId, teams }: { cohortId: string; teams: TeamRow[] }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [pending, start] = useTransition();

  function create() {
    if (!name.trim()) return toast.error("Name required");
    start(async () => {
      const r = await createTeam({ cohort_id: cohortId, name: name.trim(), description: desc.trim() || undefined });
      if (r.ok) {
        toast.success("Team created");
        setName("");
        setDesc("");
      } else toast.error(r.error);
    });
  }

  function onJoin(t: TeamRow) {
    start(async () => {
      const r = await joinTeam({ team_id: t.id });
      if (r.ok) toast.success(`Joined ${t.name}`);
      else toast.error(r.error);
    });
  }
  function onLeave(t: TeamRow) {
    start(async () => {
      const r = await leaveTeam({ team_id: t.id });
      if (r.ok) toast.success(`Left ${t.name}`);
      else toast.error(r.error);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <CardTitle>Start a new team</CardTitle>
        <div className="mt-3 space-y-3">
          <Input placeholder="Team name" value={name} onChange={(e) => setName(e.target.value)} />
          <textarea
            rows={3}
            placeholder="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="border-line bg-input-bg text-ink w-full rounded-md border p-3 text-sm"
          />
          <div className="flex justify-end">
            <Button onClick={create} disabled={pending}>
              Create team
            </Button>
          </div>
        </div>
      </Card>
      <Card className="p-5">
        <CardTitle>Join an existing team</CardTitle>
        <div className="mt-3 space-y-2">
          {teams.length === 0 ? (
            <p className="text-muted text-sm">No teams yet. Start the first one.</p>
          ) : (
            teams.map((t) => (
              <div key={t.id} className="border-line flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2">
                <div className="min-w-0 flex-1 truncate text-sm">
                  {t.name}
                  <span className="text-muted ml-2 text-xs">({t.member_count})</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => onJoin(t)}>
                    Join
                  </Button>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => onLeave(t)}>
                    Leave
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
