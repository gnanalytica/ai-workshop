"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MentionEditor } from "@/components/mention-editor/MentionEditor";
import { createCommunityReply } from "@/lib/actions/community";
import type { RosterMember } from "@/lib/queries/cohort-roster-mini";

export function ReplyForm({ postId, roster }: { postId: string; roster: RosterMember[] }) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  function submit() {
    if (!body.trim()) return;
    start(async () => {
      const r = await createCommunityReply({ post_id: postId, body_md: body.trim() });
      if (r.ok) {
        toast.success("Replied");
        setBody("");
      } else {
        toast.error(r.error);
      }
    });
  }
  return (
    <Card className="p-5">
      <MentionEditor
        value={body}
        onChange={setBody}
        roster={roster}
        rows={4}
        placeholder="Your reply (markdown supported). Type @ to mention."
      />
      <div className="mt-3 flex justify-end">
        <Button onClick={submit} disabled={pending}>
          {pending ? "Posting…" : "Post reply"}
        </Button>
      </div>
    </Card>
  );
}
