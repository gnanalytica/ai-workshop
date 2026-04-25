import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Common server-action result type. UI components inspect these to display
 * toasts. Throws are reserved for genuinely exceptional cases (DB down).
 */
export type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };

export function actionOk<T>(data?: T): ActionResult<T> {
  return data === undefined ? { ok: true } : { ok: true, data };
}
export function actionFail<T = unknown>(error: string): ActionResult<T> {
  return { ok: false, error };
}

type Sb = Awaited<ReturnType<typeof getSupabaseServer>>;
type ThenableResult<T> = PromiseLike<{ data: T | null; error: { message: string } | null }>;

/** Run a Supabase mutation with consistent error handling + path revalidation. */
export async function withSupabase<T>(
  fn: (sb: Sb) => ThenableResult<T> | Promise<ThenableResult<T>>,
  revalidate?: string | string[],
): Promise<ActionResult<T>> {
  const sb = await getSupabaseServer();
  const { data, error } = await fn(sb);
  if (error) return actionFail(error.message);
  if (revalidate) {
    for (const p of Array.isArray(revalidate) ? revalidate : [revalidate]) {
      revalidatePath(p);
    }
  }
  return { ok: true, data: (data as T | undefined) ?? undefined };
}
