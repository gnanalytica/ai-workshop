"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCohort } from "@/lib/actions/schedule";
import { addWorkingDays, isWeekdayISO } from "@/lib/calendar";

const WORKSHOP_DAYS = 30;

export function CreateCohortForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [status, setStatus] = useState<"draft" | "live" | "archived">("draft");
  const [err, setErr] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!startsOn || !/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) return null;
    if (!isWeekdayISO(startsOn)) return { invalid: true } as const;
    return { invalid: false, ends_on: addWorkingDays(startsOn, WORKSHOP_DAYS) } as const;
  }, [startsOn]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const out = await createCohort({
        slug: slug.toLowerCase(),
        name,
        starts_on: startsOn,
        status,
      });
      if (!out.ok) {
        setErr(out.error);
        return;
      }
      setSlug("");
      setName("");
      setStartsOn("");
      setStatus("draft");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
      <Field label="Slug" hint="URL-safe identifier, e.g. cohort-2026-09">
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="cohort-2026-09"
          className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 font-mono text-sm"
        />
      </Field>
      <Field label="Name">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workshop Cohort · Sep 2026"
          className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
        />
      </Field>
      <Field
        label="Start date"
        hint={
          preview?.invalid
            ? "⚠ Pick a weekday (Mon–Fri). Workshop runs Mon–Fri."
            : preview
            ? `30 working days → ends on ${preview.ends_on}`
            : "Workshop runs 30 working days, Mon–Fri (weekends skipped)."
        }
      >
        <input
          required
          type="date"
          value={startsOn}
          onChange={(e) => setStartsOn(e.target.value)}
          className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Status">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "draft" | "live" | "archived")}
          className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
        >
          <option value="draft">Draft (hidden from students)</option>
          <option value="live">Live</option>
          <option value="archived">Archived</option>
        </select>
      </Field>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pending || !!preview?.invalid}
          className="bg-accent text-cta-ink rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create cohort"}
        </button>
        {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted text-xs font-medium tracking-wide uppercase">{label}</span>
      {children}
      {hint && <span className="text-muted text-xs">{hint}</span>}
    </label>
  );
}
