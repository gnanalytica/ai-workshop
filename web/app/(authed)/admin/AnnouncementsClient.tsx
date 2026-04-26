"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  postAnnouncement,
  togglePinAnnouncement,
  softDeleteAnnouncement,
} from "@/lib/actions/announcements";
import { relTime } from "@/lib/format";

interface AnnouncementSummary {
  id: string;
  title: string;
  body_md: string;
  created_at: string;
  pinned_at?: string | null;
}

export function AnnouncementsClient({
  cohortId,
  initial,
}: {
  cohortId: string;
  initial: AnnouncementSummary[];
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [audience, setAudience] = useState<"all" | "students" | "faculty" | "staff">("all");
  const [pending, start] = useTransition();

  function compose() {
    if (title.trim().length < 3 || body.trim().length < 1) {
      toast.error("Title + body required");
      return;
    }
    start(async () => {
      const r = await postAnnouncement({
        cohort_id: cohortId,
        title: title.trim(),
        body_md: body.trim(),
        audience,
        pinned,
      });
      if (r.ok) {
        toast.success("Announcement posted");
        setTitle("");
        setBody("");
        setPinned(false);
      } else toast.error(r.error);
    });
  }

  function togglePin(a: AnnouncementSummary) {
    start(async () => {
      const r = await togglePinAnnouncement({
        id: a.id,
        cohort_id: cohortId,
        pinned: !a.pinned_at,
      });
      if (r.ok) toast.success(a.pinned_at ? "Unpinned" : "Pinned");
      else toast.error(r.error);
    });
  }

  function softDelete(a: AnnouncementSummary) {
    if (!window.confirm(`Delete "${a.title}"?`)) return;
    start(async () => {
      const r = await softDeleteAnnouncement({ id: a.id, cohort_id: cohortId });
      if (r.ok) toast.success("Deleted");
      else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3 p-5">
        <CardTitle>New announcement</CardTitle>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body (markdown supported)"
          className="border-line bg-input-bg text-ink w-full rounded-md border p-3 text-sm"
        />
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as typeof audience)}
            className="border-line bg-input-bg text-ink rounded-md border px-2 py-1.5"
          >
            <option value="all">All</option>
            <option value="students">Students only</option>
            <option value="faculty">Faculty only</option>
            <option value="staff">Staff only</option>
          </select>
          <label className="text-ink flex items-center gap-1.5">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            Pin to top
          </label>
          <div className="flex-1" />
          <Button onClick={compose} disabled={pending}>
            {pending ? "Posting…" : "Post"}
          </Button>
        </div>
      </Card>

      {initial.length === 0 ? (
        <Card><CardSub>No announcements yet.</CardSub></Card>
      ) : (
        initial.map((a) => (
          <Card key={a.id} className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-center gap-2">
                <CardTitle>{a.title}</CardTitle>
                {a.pinned_at && <Badge variant="accent">Pinned</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted text-xs">{relTime(a.created_at)}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => togglePin(a)}
                >
                  {a.pinned_at ? "Unpin" : "Pin"}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={pending}
                  onClick={() => softDelete(a)}
                >
                  Delete
                </Button>
              </div>
            </div>
            <p className="text-ink/85 text-sm whitespace-pre-line">
              {a.body_md.slice(0, 280)}
              {a.body_md.length > 280 ? "…" : ""}
            </p>
          </Card>
        ))
      )}
    </div>
  );
}
