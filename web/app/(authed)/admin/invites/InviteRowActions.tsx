"use client";

import { useState, useTransition } from "react";
import { deleteInvite } from "@/lib/actions/invites";

export function InviteRowActions({ id, code }: { id: string; code: string }) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  }

  function remove() {
    if (!confirm(`Delete invite ${code}?`)) return;
    start(async () => {
      await deleteInvite(id);
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={copy}
        className="text-muted hover:text-ink text-xs underline-offset-2 hover:underline"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="text-danger hover:text-danger/80 text-xs transition-colors disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
