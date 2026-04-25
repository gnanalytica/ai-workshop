// supabase/functions/send-daily-digest
// Cron-invoked once a day. Sends each enrolled student a digest of:
//   - today's day title + live session
//   - their pending submissions
//   - top board questions
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, ctaButton, emailWrap, logNotification, sendEmail } from "../_shared/email.ts";

const SHARED_SECRET = Deno.env.get("EDGE_FUNCTION_SHARED_SECRET");

interface CohortRow {
  id: string;
  name: string;
  starts_on: string;
}

interface RegistrationRow {
  user_id: string;
  cohort_id: string;
  profiles: { email: string; full_name: string | null } | null;
}

function dayNumberOf(cohort: CohortRow, today = new Date()): number {
  const start = new Date(cohort.starts_on);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.min(30, diff + 1));
}

function digestHtml(args: {
  fullName: string;
  cohortName: string;
  dayNumber: number;
  dayTitle: string;
  pendingCount: number;
}): string {
  const { fullName, cohortName, dayNumber, dayTitle, pendingCount } = args;
  return emailWrap(
    `<h1 style="margin:0 0 8px 0;font-size:22px;font-weight:600;color:#fff;">Day ${dayNumber} · ${dayTitle}</h1>
     <p style="color:#bbb;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
        Hi ${fullName || "there"} — here's your ${cohortName} morning briefing.
     </p>
     ${pendingCount > 0
       ? `<p style="color:#fff;font-size:14px;">📝 You have <strong>${pendingCount}</strong> open ${pendingCount === 1 ? "submission" : "submissions"}.</p>`
       : `<p style="color:#bbb;font-size:14px;">✅ No pending work — focus on today.</p>`
     }
     ${ctaButton("Open today's lesson")}`,
  );
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (SHARED_SECRET && req.headers.get("authorization") !== `Bearer ${SHARED_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const sb = adminClient();

  // Iterate live cohorts.
  const { data: cohorts } = await sb
    .from("cohorts")
    .select("id, name, starts_on, ends_on")
    .eq("status", "live");

  let sent = 0;
  let failed = 0;

  for (const cohort of (cohorts ?? []) as CohortRow[]) {
    const day = dayNumberOf(cohort);
    const { data: dayMeta } = await sb
      .from("cohort_days")
      .select("title")
      .eq("cohort_id", cohort.id)
      .eq("day_number", day)
      .maybeSingle();
    const dayTitle = (dayMeta as { title?: string } | null)?.title ?? "Today's lesson";

    const { data: registrations } = await sb
      .from("registrations")
      .select("user_id, cohort_id, profiles!inner(email, full_name)")
      .eq("cohort_id", cohort.id)
      .eq("status", "confirmed");

    for (const r of (registrations ?? []) as RegistrationRow[]) {
      if (!r.profiles?.email) continue;

      const { count: pending } = await sb
        .from("submissions")
        .select("id, assignments!inner(cohort_id)", { count: "exact", head: true })
        .eq("user_id", r.user_id)
        .eq("status", "draft")
        .eq("assignments.cohort_id", cohort.id);

      const html = digestHtml({
        fullName: r.profiles.full_name ?? "",
        cohortName: cohort.name,
        dayNumber: day,
        dayTitle,
        pendingCount: pending ?? 0,
      });

      const result = await sendEmail({
        to: r.profiles.email,
        subject: `Day ${day} · ${dayTitle}`,
        html,
      });

      await logNotification({
        user_id: r.user_id,
        kind: "daily_digest",
        payload: { cohort_id: cohort.id, day },
        email_to: r.profiles.email,
        status: result.ok ? "sent" : "failed",
        error: result.error,
      });

      if (result.ok) sent++;
      else failed++;
    }
  }

  return new Response(JSON.stringify({ sent, failed }), {
    headers: { "content-type": "application/json" },
  });
});
