import { checkCapability } from "@/lib/auth/requireCapability";

/** Explains pod-scoped visibility for faculty (admins see everything). */
export async function HelpDeskScopeNotice() {
  // Admins have orgs.write — they see all tickets, so skip the notice.
  const isAdmin = await checkCapability("orgs.write");
  if (isAdmin) return null;
  return (
    <div className="border-accent/25 bg-accent/5 text-ink/90 rounded-lg border px-4 py-3 text-sm leading-relaxed">
      <p className="text-ink font-medium">You only see your pods</p>
      <p className="text-muted mt-1">
        Open tickets here are limited to students in pods you&apos;re assigned to
        as faculty. If something is missing, confirm you&apos;re on the right pod or
        ask an admin to add you under Pod settings → Faculty.
      </p>
    </div>
  );
}
