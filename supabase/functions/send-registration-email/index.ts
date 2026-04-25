// supabase/functions/send-registration-email
// Triggered by webhook (or RPC) on registration.status change.
// POST { user_id, cohort_id, old_status, new_status }
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, ctaButton, emailWrap, logNotification, sendEmail } from "../_shared/email.ts";

interface Body {
  user_id: string;
  cohort_id: string;
  old_status: string | null;
  new_status: "pending" | "confirmed" | "waitlist" | "cancelled";
}

const SHARED_SECRET = Deno.env.get("EDGE_FUNCTION_SHARED_SECRET");

const SUBJECTS: Record<Body["new_status"], string> = {
  pending: "Your registration is being reviewed",
  confirmed: "You're in — see you on Day 1",
  waitlist: "You're on the waitlist",
  cancelled: "Your registration has been cancelled",
};

function template(name: string, status: Body["new_status"], cohortName: string): string {
  const greeting = `<h1 style="margin:0 0 12px 0;font-size:22px;font-weight:600;color:#fff;">Hi ${name || "there"},</h1>`;
  const body = ({
    confirmed: `<p>You're confirmed for <strong>${cohortName}</strong>. Check your dashboard to see the schedule, your pod, and the day-1 prep.</p>${ctaButton("Open my dashboard")}`,
    pending:   `<p>We received your application for <strong>${cohortName}</strong>. We'll be in touch as soon as a slot opens up.</p>`,
    waitlist:  `<p>You're on the waitlist for <strong>${cohortName}</strong>. We'll notify you the moment a spot frees up.</p>`,
    cancelled: `<p>Your registration for <strong>${cohortName}</strong> has been cancelled. If this was a mistake, reply to this email and we'll fix it.</p>`,
  } as const)[status];
  return emailWrap(greeting + body);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (SHARED_SECRET && req.headers.get("authorization") !== `Bearer ${SHARED_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }
  if (!payload.user_id || !payload.cohort_id || !payload.new_status) {
    return new Response("Missing fields", { status: 400 });
  }

  const sb = adminClient();
  const { data: profile } = await sb
    .from("profiles")
    .select("email, full_name")
    .eq("id", payload.user_id)
    .single();
  const { data: cohort } = await sb
    .from("cohorts")
    .select("name")
    .eq("id", payload.cohort_id)
    .single();

  if (!profile?.email || !cohort?.name) {
    await logNotification({
      user_id: payload.user_id,
      kind: "registration_status",
      payload,
      email_to: profile?.email ?? null,
      status: "failed",
      error: "missing profile/cohort",
    });
    return new Response("missing profile/cohort", { status: 404 });
  }

  const html = template(profile.full_name ?? "", payload.new_status, cohort.name);
  const result = await sendEmail({
    to: profile.email,
    subject: SUBJECTS[payload.new_status],
    html,
  });

  await logNotification({
    user_id: payload.user_id,
    kind: "registration_status",
    payload,
    email_to: profile.email,
    status: result.ok ? "sent" : "failed",
    error: result.error,
  });

  return new Response(JSON.stringify({ ok: result.ok }), {
    status: result.ok ? 200 : 500,
    headers: { "content-type": "application/json" },
  });
});
