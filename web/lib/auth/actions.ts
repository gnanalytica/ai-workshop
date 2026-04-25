"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().email(),
  next: z.string().optional(),
});

export type SignInState = {
  ok?: boolean;
  message?: string;
};

export async function sendMagicLink(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Please enter a valid email." };
  }

  const sb = await getSupabaseServer();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const next = parsed.data.next && parsed.data.next.startsWith("/") ? parsed.data.next : "/dashboard";

  const { error } = await sb.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { ok: false, message: error.message };

  return { ok: true, message: "Check your email for the sign-in link." };
}

export async function signOut() {
  const sb = await getSupabaseServer();
  await sb.auth.signOut();
  redirect("/");
}
