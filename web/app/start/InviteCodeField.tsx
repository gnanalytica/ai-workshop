"use client";

import { useEffect, useState } from "react";
import { previewInvite, type InvitePreview } from "@/lib/auth/actions";

type Status =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok"; preview: Extract<InvitePreview, { ok: true }> }
  | { state: "bad"; message: string };

const KIND_LABEL: Record<"student" | "faculty" | "staff", string> = {
  student: "Student",
  faculty: "Faculty",
  staff: "Staff",
};

export function InviteCodeField({
  name,
  label,
  required = true,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 4) {
      setStatus({ state: "idle" });
      return;
    }
    setStatus({ state: "checking" });
    const t = setTimeout(async () => {
      const result = await previewInvite(trimmed);
      if (result.ok) {
        setStatus({ state: "ok", preview: result });
      } else {
        setStatus({ state: "bad", message: result.message });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted text-xs font-medium tracking-wide uppercase">{label}</span>
      <input
        name={name}
        required={required}
        maxLength={64}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. STU-A1B2C3"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        aria-describedby={`${name}-status`}
        className="border-line bg-input-bg text-ink placeholder:text-muted rounded-md border px-3 py-2 font-mono text-sm tracking-wider uppercase transition-[border-color,box-shadow] duration-200 focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
      />
      <Status id={`${name}-status`} status={status} />
    </label>
  );
}

function Status({ id, status }: { id: string; status: Status }) {
  if (status.state === "idle") {
    return (
      <span id={id} className="text-muted text-xs">
        We&apos;ll set up the right access based on your code.
      </span>
    );
  }
  if (status.state === "checking") {
    return (
      <span id={id} className="text-muted text-xs">
        Checking…
      </span>
    );
  }
  if (status.state === "bad") {
    return (
      <span id={id} className="text-danger text-xs">
        {status.message}
      </span>
    );
  }
  const { kind, cohort_name, staff_role } = status.preview;
  const role = kind === "staff" && staff_role ? staff_role.replace("_", " ") : KIND_LABEL[kind];
  return (
    <span id={id} className="text-accent text-xs">
      ✓ Valid · {role}
      {cohort_name ? ` · ${cohort_name}` : ""}
    </span>
  );
}
