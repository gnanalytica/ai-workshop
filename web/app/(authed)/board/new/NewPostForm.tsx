"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createBoardPost } from "@/lib/actions/board";

export function NewPostForm({ cohortId }: { cohortId: string }) {
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
      <textarea
        rows={10}
        placeholder="Body (markdown)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="border-line bg-input-bg text-ink w-full rounded-md border p-3 font-mono text-sm"
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
