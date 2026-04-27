"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { markAllMentionsRead, markMentionRead } from "@/lib/actions/notifications";
import { relTime } from "@/lib/format";
import type { MentionRow } from "@/lib/queries/notifications";

export function MentionInbox({ unread, items }: { unread: number; items: MentionRow[] }) {
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  const router = useRouter();

  function clickItem(item: MentionRow) {
    start(async () => {
      await markMentionRead({ id: item.id });
      const href = item.reply_id
        ? `/community/${item.post_id}#reply-${item.reply_id}`
        : `/community/${item.post_id}`;
      router.push(href);
    });
    setOpen(false);
  }

  function clearAll() {
    start(async () => {
      await markAllMentionsRead();
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mentions"
        className="text-muted hover:text-ink relative rounded-md p-2"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="bg-accent text-bg absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="border-line bg-bg absolute right-0 z-40 mt-2 w-80 rounded-md border shadow-lg">
          <div className="border-line flex items-center justify-between border-b px-3 py-2">
            <span className="text-ink text-sm font-medium">Mentions</span>
            {items.length > 0 && (
              <button onClick={clearAll} className="text-muted hover:text-ink text-xs">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-muted px-3 py-6 text-center text-sm">No new mentions.</p>
            ) : (
              <ul className="divide-y divide-line/50">
                {items.map((m) => (
                  <li key={m.id}>
                    <button
                      onClick={() => clickItem(m)}
                      className="hover:bg-input-bg w-full px-3 py-2 text-left text-sm"
                    >
                      <p className="text-ink">
                        <span className="font-medium">{m.by_name ?? "Someone"}</span>
                        <span className="text-muted"> mentioned you in </span>
                        <span className="font-medium">{m.post_title ?? "a post"}</span>
                      </p>
                      <p className="text-muted text-xs">{relTime(m.created_at)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-line border-t px-3 py-2 text-right">
            <Link href="/community" onClick={() => setOpen(false)} className="text-accent text-xs hover:underline">
              Open board →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
