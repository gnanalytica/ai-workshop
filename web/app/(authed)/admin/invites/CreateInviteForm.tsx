"use client";

import { useState, useTransition } from "react";
import { createInvite } from "@/lib/actions/invites";

type Kind = "student" | "faculty" | "staff";

export function CreateInviteForm({
  cohorts,
}: {
  cohorts: Array<{ id: string; name: string; status: string }>;
}) {
  const [kind, setKind] = useState<Kind>("student");
  const [cohortId, setCohortId] = useState<string>(cohorts[0]?.id ?? "");
  const [staffRole, setStaffRole] = useState<"admin" | "trainer" | "tech_support">("admin");
  const [maxUses, setMaxUses] = useState<number>(1);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok?: boolean; code?: string; error?: string }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult({});
    start(async () => {
      const out = await createInvite({
        kind,
        cohort_id: kind === "staff" ? null : cohortId || null,
        staff_role: kind === "staff" ? staffRole : null,
        max_uses: maxUses,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        note: note || null,
      });
      if (!out.ok) {
        setResult({ ok: false, error: out.error });
      } else {
        const data = out.data as { code: string } | undefined;
        setResult({ ok: true, code: data?.code });
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
      <Field label="Kind">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as Kind)}
          className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="staff">Staff (admin / trainer / support)</option>
        </select>
      </Field>

      {kind !== "staff" && (
        <Field label="Cohort">
          <select
            value={cohortId}
            onChange={(e) => setCohortId(e.target.value)}
            required
            className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
          >
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        </Field>
      )}

      {kind === "staff" && (
        <Field label="Staff role">
          <select
            value={staffRole}
            onChange={(e) =>
              setStaffRole(e.target.value as "admin" | "trainer" | "tech_support")
            }
            className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
          >
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="tech_support">Tech support</option>
          </select>
        </Field>
      )}

      <Field label="Max uses">
        <input
          type="number"
          min={1}
          max={1000}
          value={maxUses}
          onChange={(e) => setMaxUses(parseInt(e.target.value || "1", 10))}
          className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Expires (optional)">
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Note (optional)" className="md:col-span-2">
        <input
          type="text"
          maxLength={500}
          placeholder="Who is this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
        />
      </Field>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-cta-ink rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create invite"}
        </button>
        {result.ok && result.code && (
          <p className="text-accent mt-3 text-sm">
            Created: <span className="font-mono tracking-wider">{result.code}</span> — copy and
            share with the recipient.
          </p>
        )}
        {result.ok === false && <p className="mt-3 text-sm text-red-400">{result.error}</p>}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="text-muted text-xs font-medium tracking-wide uppercase">{label}</span>
      {children}
    </label>
  );
}
