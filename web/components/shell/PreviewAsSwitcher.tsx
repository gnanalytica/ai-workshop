"use client";

import { useRef } from "react";
import { setPreviewAs } from "@/lib/actions/preview-as";
import type { Persona } from "@/lib/auth/persona";

export function PreviewAsSwitcher({ effective }: { effective: Persona }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={setPreviewAs} className="flex items-center gap-2">
      <label htmlFor="persona" className="text-muted text-xs tracking-wide uppercase">
        View as
      </label>
      <select
        id="persona"
        name="persona"
        defaultValue={effective}
        onChange={() => formRef.current?.requestSubmit()}
        className="border-line bg-input-bg text-ink rounded-md border px-2 py-1 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
      >
        <option value="admin">Admin</option>
        <option value="faculty">Faculty (preview)</option>
        <option value="student">Student (preview)</option>
      </select>
    </form>
  );
}
