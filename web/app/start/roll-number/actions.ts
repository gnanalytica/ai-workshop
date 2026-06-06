"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";

export type SubmitState = {
  ok?: boolean;
  message?: string;
};

const rollNumberSchema = z.object({
  roll_number: z
    .string()
    .trim()
    .min(1, "Roll number is required")
    .max(64, "Roll number is too long"),
});

export async function submitRollNumber(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const parsed = rollNumberSchema.safeParse({
    roll_number: formData.get("roll_number"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid roll number";
    return { ok: false, message: first };
  }

  const rollNumber = parsed.data.roll_number;

  // Get current user
  const sb = await getSupabaseServer();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) {
    redirect("/start");
  }

  const userId = userData.user.id;
  const svc = getSupabaseService();

  // Get user's confirmed registration + cohort
  const { data: registration, error: regError } = await svc
    .from("registrations")
    .select("cohort_id")
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .maybeSingle();

  if (regError || !registration) {
    return { ok: false, message: "Could not find your enrollment. Please contact support." };
  }

  const cohortId = registration.cohort_id;

  // Check if roll number is already taken in this cohort
  const { data: existing, error: checkError } = await svc
    .from("registrations")
    .select("user_id")
    .eq("cohort_id", cohortId)
    .eq("roll_number", rollNumber)
    .eq("status", "confirmed")
    .maybeSingle();

  if (checkError) {
    return { ok: false, message: "Could not validate roll number. Please try again." };
  }

  if (existing) {
    return { ok: false, message: "This roll number is already taken in your cohort." };
  }

  // Update the registration with the roll number
  const { error: updateError } = await svc
    .from("registrations")
    .update({ roll_number: rollNumber })
    .eq("user_id", userId)
    .eq("cohort_id", cohortId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  // Redirect to dashboard
  redirect("/dashboard");
}
