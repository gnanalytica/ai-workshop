"use client";

import { useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setCommunityVote } from "@/lib/actions/community";
import { cn } from "@/lib/utils";

export function CommunityVoteControls({
  cohortId,
  postId,
  replyId = null,
  score,
  myVote,
  canVote,
  compact = false,
}: {
  cohortId: string;
  postId: string;
  /** When set, vote applies to this reply; otherwise to the top-level post. */
  replyId?: string | null;
  score: number;
  myVote: 1 | -1 | 0;
  canVote: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(next: 1 | -1 | 0) {
    if (!canVote) return;
    const value: 1 | -1 | 0 = myVote === next && next !== 0 ? 0 : next;
    start(async () => {
      const r = await setCommunityVote({
        cohort_id: cohortId,
        post_id: replyId ? undefined : postId,
        reply_id: replyId ?? undefined,
        value,
      });
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  }

  return (
    <div
      className={cn(
        "text-muted border-line flex flex-col items-center rounded-md border",
        compact ? "py-0.5" : "py-1",
      )}
    >
      <button
        type="button"
        disabled={!canVote || pending}
        onClick={() => act(1)}
        className={cn(
          "hover:text-accent flex items-center justify-center p-0.5 disabled:opacity-40",
          myVote === 1 && "text-accent",
        )}
        aria-label="Upvote"
      >
        <ChevronUp className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </button>
      <span
        className={cn(
          "text-ink font-mono tabular-nums",
          compact ? "text-[10px] leading-tight" : "text-xs",
        )}
      >
        {score}
      </span>
      <button
        type="button"
        disabled={!canVote || pending}
        onClick={() => act(-1)}
        className={cn(
          "hover:text-accent flex items-center justify-center p-0.5 disabled:opacity-40",
          myVote === -1 && "text-accent",
        )}
        aria-label="Downvote"
      >
        <ChevronDown className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </button>
    </div>
  );
}
