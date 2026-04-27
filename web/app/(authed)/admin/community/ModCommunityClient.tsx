"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { moderateCommunity } from "@/lib/actions/community";
import type { ModPost } from "@/lib/queries/community-mod";
import { fmtDateTime, relTime } from "@/lib/format";

export function ModCommunityClient({ posts }: { posts: ModPost[] }) {
  const [pending, start] = useTransition();

  function pin(post: ModPost) {
    start(async () => {
      const r = await moderateCommunity({ kind: "post", id: post.id, pinned: !post.pinned_at });
      if (r.ok) toast.success(post.pinned_at ? "Unpinned" : "Pinned");
      else toast.error(r.error);
    });
  }
  function hide(post: ModPost) {
    if (!post.deleted_at && !window.confirm(`Hide "${post.title}"?`)) return;
    start(async () => {
      const r = await moderateCommunity({ kind: "post", id: post.id, deleted: !post.deleted_at });
      if (r.ok) toast.success(post.deleted_at ? "Restored" : "Hidden");
      else toast.error(r.error);
    });
  }

  if (posts.length === 0) return <Card><CardTitle>No posts.</CardTitle></Card>;

  return (
    <div className="space-y-2">
      {posts.map((p) => (
        <Card key={p.id} className={p.deleted_at ? "opacity-60" : ""}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Link href={`/community/${p.id}`} className="hover:text-accent">
              <CardTitle>{p.title}</CardTitle>
            </Link>
            <div className="flex items-center gap-2">
              {p.pinned_at && <Badge variant="accent">Pinned</Badge>}
              {p.deleted_at && <Badge variant="danger">Hidden</Badge>}
              <Badge>{p.reply_count} replies</Badge>
            </div>
          </div>
          <p className="text-muted mt-2 text-xs">
            {p.author_name ?? "Member"} · {fmtDateTime(p.created_at)} · {relTime(p.created_at)}
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" disabled={pending} onClick={() => pin(p)}>
              {p.pinned_at ? "Unpin" : "Pin"}
            </Button>
            <Button
              size="sm"
              variant={p.deleted_at ? "secondary" : "danger"}
              disabled={pending}
              onClick={() => hide(p)}
            >
              {p.deleted_at ? "Restore" : "Hide"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
