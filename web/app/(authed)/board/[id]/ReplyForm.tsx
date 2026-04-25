"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createBoardReply } from "@/lib/actions/board";

export function ReplyForm({ postId }: { postId: string }) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  function submit() {
    if (!body.trim()) return;
    start(async () => {
      const r = await createBoardReply({ post_id: postId, body_md: body.trim() });
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
      <textarea
        rows={4}
        placeholder="Your reply (markdown supported)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="border-line bg-input-bg text-ink w-full rounded-md border p-3 text-sm"
      />
      <div className="mt-3 flex justify-end">
        <Button onClick={submit} disabled={pending}>
          {pending ? "Posting…" : "Post reply"}
        </Button>
      </div>
    </Card>
  );
}
