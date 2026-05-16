import { setPreviewAs } from "@/lib/actions/preview-as";
import type { Persona } from "@/lib/auth/persona";

const TONE: Record<Persona, { bg: string; text: string; label: string }> = {
  student: {
    bg: "bg-[hsl(var(--ok-soft))]",
    text: "text-[hsl(var(--ok))]",
    label: "STUDENT",
  },
  faculty: {
    bg: "bg-[hsl(var(--warn-soft))]",
    text: "text-[hsl(var(--warn))]",
    label: "FACULTY",
  },
  admin: {
    bg: "bg-[hsl(var(--danger-soft))]",
    text: "text-[hsl(var(--danger))]",
    label: "ADMIN",
  },
};

export function PersonaBanner({
  truePersona,
  effectivePersona,
}: {
  truePersona: Persona | null;
  effectivePersona: Persona | null;
}) {
  if (!truePersona || !effectivePersona) return null;

  const isPreviewing = truePersona === "admin" && effectivePersona !== "admin";
  const tone = TONE[isPreviewing ? effectivePersona : truePersona];

  return (
    <div
      role="status"
      className={`${tone.bg} ${tone.text} flex h-6 items-center justify-center gap-2 px-3 font-mono text-[10px] tracking-widest uppercase`}
    >
      {isPreviewing ? (
        <>
          <span className="text-[hsl(var(--danger))]">ADMIN</span>
          <span className="opacity-60">·</span>
          <span>previewing as {TONE[effectivePersona].label}</span>
          <form action={setPreviewAs} className="contents">
            <input type="hidden" name="persona" value="admin" />
            <button
              type="submit"
              className="ml-1 underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
            >
              Exit preview
            </button>
          </form>
        </>
      ) : (
        <span>{tone.label}</span>
      )}
    </div>
  );
}
