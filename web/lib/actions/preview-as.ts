"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTruePersona, PREVIEW_COOKIE } from "@/lib/auth/persona";

const schema = z.object({ persona: z.enum(["admin", "faculty", "student"]) });

/**
 * Admin-only: set the previewAs cookie so the sidebar shows another
 * persona's navigation. Cookie is ignored if the caller isn't an admin.
 */
export async function setPreviewAs(formData: FormData) {
  const parsed = schema.safeParse({ persona: formData.get("persona") });
  if (!parsed.success) return;
  if ((await getTruePersona()) !== "admin") return;

  const store = await cookies();
  if (parsed.data.persona === "admin") {
    store.delete(PREVIEW_COOKIE);
  } else {
    store.set(PREVIEW_COOKIE, parsed.data.persona, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  revalidatePath("/", "layout");
}
