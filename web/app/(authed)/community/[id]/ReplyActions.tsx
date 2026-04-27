"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptAnswer, moderateBoard, setCanonical } from "@/lib/actions/board";

export function ReplyActions({
  replyId,
  postId,
  isAccepted,
  canAccept,
  canModerate,
}: {
  replyId: string;
  postId: string;
  isAccepted: boolean;
  canAccept: boolean;
  canModerate: boolean;
}) {
  const [pending, start] = useTransition();

  function accept() {
    start(async () => {
      const r = await acceptAnswer({ reply_id: replyId, post_id: postId });
      if (r.ok) toast.success("Marked as accepted");
      else toast.error(r.error);
    });
  }

  function remove() {
    if (!window.confirm("Delete this reply?")) return;
    start(async () => {
      const r = await moderateBoard({ kind: "reply", id: replyId, deleted: true });
      if (r.ok) toast.success("Removed");
      else toast.error(r.error);
    });
  }

  if (!canAccept && !canModerate) return null;
  return (
    <div className="flex items-center gap-2">
      {canAccept && !isAccepted && (
        <Button size="sm" variant="outline" onClick={accept} disabled={pending}>
          Accept answer
        </Button>
      )}
      {canModerate && (
        <Button size="sm" variant="danger" onClick={remove} disabled={pending}>
          Delete
        </Button>
      )}
    </div>
  );
}

export function PostModeration({
  postId,
  pinned,
  isCanonical,
  canModerate,
}: {
  postId: string;
  pinned: boolean;
  isCanonical: boolean;
  canModerate: boolean;
}) {
  const [pending, start] = useTransition();
  if (!canModerate) return null;

  function togglePin() {
    start(async () => {
      const r = await moderateBoard({ kind: "post", id: postId, pinned: !pinned });
      if (r.ok) toast.success(pinned ? "Unpinned" : "Pinned");
      else toast.error(r.error);
    });
  }

  function toggleFaq() {
    start(async () => {
      const r = await setCanonical({ post_id: postId, is_canonical: !isCanonical });
      if (r.ok) toast.success(isCanonical ? "Removed from FAQ" : "Marked as FAQ");
      else toast.error(r.error);
    });
  }

  function remove() {
    if (!window.confirm("Delete this post?")) return;
    start(async () => {
      const r = await moderateBoard({ kind: "post", id: postId, deleted: true });
      if (r.ok) toast.success("Deleted");
      else toast.error(r.error);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={toggleFaq} disabled={pending}>
        {isCanonical ? "Unmark FAQ" : "Mark as FAQ"}
      </Button>
      <Button size="sm" variant="outline" onClick={togglePin} disabled={pending}>
        {pinned ? "Unpin" : "Pin"}
      </Button>
      <Button size="sm" variant="danger" onClick={remove} disabled={pending}>
        Delete post
      </Button>
    </div>
  );
}
