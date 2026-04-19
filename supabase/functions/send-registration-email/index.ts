import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const DASHBOARD_URL = "https://gnanalytica.github.io/ai-workshop/dashboard.html";
const CONTACT_URL = "https://gnanalytica.github.io/ai-workshop/#contact";
const LIME = "#c3ff36";

type Body = {
  user_id: string;
  registration_id: string;
  old_status: string | null;
  new_status: string;
};

function wrap(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px 32px 8px 32px;">
          <div style="font-size:20px;font-weight:700;letter-spacing:-0.01em;color:#fff;">gn<span style="color:${LIME};">/</span>analytica</div>
          <div style="font-size:12px;color:#888;margin-top:2px;text-transform:uppercase;letter-spacing:0.08em;">AI Workshop</div>
        </td></tr>
        <tr><td style="padding:16px 32px 8px 32px;">${inner}</td></tr>
        <tr><td style="padding:24px 32px 32px 32px;border-top:1px solid #1f1f1f;">
          <div style="font-size:12px;color:#777;line-height:1.6;">
            Questions? <a href="${CONTACT_URL}" style="color:${LIME};text-decoration:none;">Reach out</a>.<br/>
            gn/analytica AI Workshop &middot; Cohort 01
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(label: string): string {
  return `<div style="margin:24px 0 8px 0;"><a href="${DASHBOARD_URL}" style="display:inline-block;background:${LIME};color:#0a0a0a;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;">${label}</a></div>`;
}

function greeting(name: string | null): string {
  const n = (name && name.trim()) ? name.split(" ")[0] : "there";
  return `<p style="font-size:16px;color:#fff;margin:8px 0 4px 0;">Hi ${n},</p>`;
}

function footerDates(startsOn: string | null, endsOn: string | null): string {
  if (!startsOn) return "";
  const pretty = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const range = endsOn ? `${pretty(startsOn)} \u2013 ${pretty(endsOn)}` : pretty(startsOn);
  return `<p style="font-size:13px;color:#888;margin-top:18px;">Cohort dates: <span style="color:#ccc;">${range}</span></p>`;
}

function buildTemplate(status: string, fullName: string | null, cohortName: string | null, startsOn: string | null, endsOn: string | null): { subject: string; html: string } | null {
  const cohort = cohortName || "Cohort 01";
  const startsPretty = startsOn ? new Date(startsOn).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "soon";

  if (status === "confirmed") {
    const body = `${greeting(fullName)}
      <h1 style="font-size:24px;color:#fff;margin:8px 0 12px 0;line-height:1.3;">You're in.</h1>
      <p style="font-size:15px;color:#ccc;line-height:1.6;margin:0;">${cohort} starts <strong style="color:#fff;">${startsPretty}</strong>. Your seat is confirmed.</p>
      <p style="font-size:15px;color:#ccc;line-height:1.6;margin:10px 0 0 0;">Check your dashboard for the schedule, prep materials, and what to expect in week one.</p>
      ${button("Open dashboard \u2192")}
      ${footerDates(startsOn, endsOn)}`;
    return { subject: `You're in \u2014 ${cohort} starts ${startsPretty}`, html: wrap(body) };
  }

  if (status === "waitlist") {
    const body = `${greeting(fullName)}
      <h1 style="font-size:24px;color:#fff;margin:8px 0 12px 0;line-height:1.3;">You're on the waitlist.</h1>
      <p style="font-size:15px;color:#ccc;line-height:1.6;margin:0;">Thanks for applying to ${cohort}. We're at capacity right now, but we'll reach out the moment a seat opens up.</p>
      <p style="font-size:15px;color:#ccc;line-height:1.6;margin:10px 0 0 0;">You can track your status anytime on your dashboard.</p>
      ${button("Check status \u2192")}
      ${footerDates(startsOn, endsOn)}`;
    return { subject: `You're on the waitlist \u2014 ${cohort}`, html: wrap(body) };
  }

  if (status === "cancelled") {
    const body = `${greeting(fullName)}
      <h1 style="font-size:24px;color:#fff;margin:8px 0 12px 0;line-height:1.3;">Your registration was cancelled.</h1>
      <p style="font-size:15px;color:#ccc;line-height:1.6;margin:0;">Your registration for ${cohort} has been cancelled. If this wasn't you, or if you'd like to rejoin a future cohort, reach out and we'll sort it out.</p>
      ${button("Open dashboard \u2192")}
      ${footerDates(startsOn, endsOn)}`;
    return { subject: `Registration cancelled \u2014 ${cohort}`, html: wrap(body) };
  }

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const expectedSecret = Deno.env.get("TRIGGER_SECRET");
  const providedSecret = req.headers.get("x-trigger-secret");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch (_e) {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { user_id, registration_id, old_status, new_status } = body || ({} as Body);
  if (!user_id || !registration_id || !new_status) {
    return new Response(JSON.stringify({ error: "missing fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  if (new_status === "pending") {
    return new Response(JSON.stringify({ success: true, skipped: "pending" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(user_id);
  if (userErr || !userRes?.user?.email) {
    return new Response(JSON.stringify({ error: "user not found", detail: userErr?.message }), { status: 404, headers: { "Content-Type": "application/json" } });
  }
  const emailTo = userRes.user.email;

  const { data: profile } = await admin.from("profiles").select("full_name").eq("id", user_id).maybeSingle();

  const { data: reg } = await admin
    .from("registrations")
    .select("id, cohort_id, cohorts:cohort_id ( name, starts_on, ends_on )")
    .eq("id", registration_id)
    .maybeSingle();

  const cohort = (reg?.cohorts ?? null) as { name: string | null; starts_on: string | null; ends_on: string | null } | null;

  const tmpl = buildTemplate(new_status, profile?.full_name ?? null, cohort?.name ?? null, cohort?.starts_on ?? null, cohort?.ends_on ?? null);
  if (!tmpl) {
    return new Response(JSON.stringify({ success: true, skipped: `no template for ${new_status}` }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromAddr = Deno.env.get("RESEND_FROM") || "onboarding@resend.dev";

  let emailStatus: "sent" | "failed" = "failed";
  let errorMsg: string | null = null;
  let sentAt: string | null = null;

  if (!resendKey) {
    errorMsg = "RESEND_API_KEY not configured";
  } else {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddr,
          to: emailTo,
          subject: tmpl.subject,
          html: tmpl.html,
        }),
      });
      if (resp.ok) {
        emailStatus = "sent";
        sentAt = new Date().toISOString();
      } else {
        const text = await resp.text();
        errorMsg = `resend ${resp.status}: ${text.slice(0, 500)}`;
      }
    } catch (e) {
      errorMsg = `resend fetch error: ${(e as Error).message}`;
    }
  }

  const { data: logRow, error: logErr } = await admin
    .from("notifications_log")
    .insert({
      user_id,
      registration_id,
      kind: "status_change",
      payload: { old_status, new_status, subject: tmpl.subject },
      email_to: emailTo,
      email_status: emailStatus,
      error: errorMsg,
      sent_at: sentAt,
    })
    .select("id")
    .single();

  if (logErr) {
    return new Response(JSON.stringify({ success: false, error: logErr.message, email_status: emailStatus, email_error: errorMsg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ success: emailStatus === "sent", log_id: logRow?.id, email_status: emailStatus, error: errorMsg }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
