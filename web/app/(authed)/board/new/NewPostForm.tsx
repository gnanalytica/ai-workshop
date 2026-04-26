"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MentionEditor } from "@/components/mention-editor/MentionEditor";
import { createBoardPost } from "@/lib/actions/board";
import type { RosterMember } from "@/lib/queries/cohort-roster-mini";

export function NewPostForm({ cohortId, roster }: { cohortId: string; roster: RosterMember[] }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (title.trim().length < 3) return toast.error("Title too short");
    if (body.trim().length < 1) return toast.error("Body required");
    start(async () => {
      const r = await createBoardPost({
        cohort_id: cohortId,
        title: title.trim(),
        body_md: body.trim(),
        tags,
      });
      if (r.ok) {
        toast.success("Posted");
        const id = (r.data as { id?: string } | undefined)?.id;
        router.push(id ? `/board/${id}` : "/board");
      } else toast.error(r.error);
    });
  }

  return (
    <Card className="space-y-4 p-5">
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <MentionEditor
        value={body}
        onChange={setBody}
        roster={roster}
        rows={10}
        placeholder="Body (markdown). Type @ to mention someone."
        className="font-mono"
      />
      <Input
        placeholder="tags, comma, separated"
        value={tagsRaw}
        onChange={(e) => setTagsRaw(e.target.value)}
      />
      <div className="flex justify-end">
        <Button onClick={submit} disabled={pending}>
          {pending ? "Posting…" : "Post"}
        </Button>
      </div>
    </Card>
  );
}
