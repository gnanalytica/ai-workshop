import { redirect } from "next/navigation";
import { getAuthCaps, getSession } from "./session";
import type { Capability } from "@/lib/rbac/capabilities";

/**
 * Server-side authorization gate. Call from RSC, route handlers, or server
 * actions. Redirects to /sign-in when not authenticated, /denied when
 * authenticated but missing the capability.
 */
export async function requireCapability(
  cap: Capability,
  cohortId?: string | null,
): Promise<void> {
  const user = await getSession();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(currentPath())}`);
  const caps = await getAuthCaps(cohortId ?? null);
  if (!caps.includes(cap)) redirect(`/denied?cap=${encodeURIComponent(cap)}`);
}

/** Soft check (no redirect). */
export async function checkCapability(
  cap: Capability,
  cohortId?: string | null,
): Promise<boolean> {
  const caps = await getAuthCaps(cohortId ?? null);
  return caps.includes(cap);
}

/** Best-effort current path for redirect-back; only meaningful in middleware. */
function currentPath(): string {
  // RSCs do not expose pathname directly; sign-in flow falls back to "/".
  return "/";
}
