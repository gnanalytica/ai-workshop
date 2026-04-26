"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { FACULTY_COHORT_COOKIE, listMyFacultyCohorts } from "@/lib/faculty/currentCohort";

const schema = z.object({ cohort_id: z.string().uuid() });

export async function setCurrentFacultyCohort(formData: FormData) {
  const parsed = schema.safeParse({ cohort_id: formData.get("cohort_id") });
  if (!parsed.success) return;

  const cohorts = await listMyFacultyCohorts();
  if (!cohorts.some((c) => c.id === parsed.data.cohort_id)) return;

  const store = await cookies();
  store.set(FACULTY_COHORT_COOKIE, parsed.data.cohort_id, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 90,
  });

  redirect("/faculty");
}
