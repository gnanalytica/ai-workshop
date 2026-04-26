"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPod } from "@/lib/actions/pods";

export function CreatePodForm({ cohortId }: { cohortId: string }) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const out = await createPod({
        cohort_id: cohortId,
        name: name.trim(),
        mentor_note: note.trim() || null,
      });
      if (!out.ok) {
        setError(out.error);
        return;
      }
      setName("");
      setNote("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
      <input
        type="text"
        required
        maxLength={80}
        placeholder="Pod name (e.g. Pod A)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 text-sm"
      />
      <input
        type="text"
        maxLength={2000}
        placeholder="Mentor note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="bg-accent text-cta-ink rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create pod"}
      </button>
      {error && <p className="text-sm text-red-400 sm:col-span-3">{error}</p>}
    </form>
  );
}
