/**
 * Shared email primitives for edge functions.
 *
 * - HTML wrapper with brand chrome
 * - CTA button
 * - Resend client + log writer
 *
 * Edge functions ship to Deno; imports use jsr:/npm: specifiers.
 */

const ACCENT = "#c3ff36";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://example.com";
const FROM = Deno.env.get("EMAIL_FROM") ?? "AI Workshop <noreply@example.com>";

export function emailWrap(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px 32px 8px 32px;">
          <div style="font-size:20px;font-weight:700;letter-spacing:-0.01em;color:#fff;">gn<span style="color:${ACCENT};">/</span>analytica</div>
          <div style="font-size:12px;color:#888;margin-top:2px;text-transform:uppercase;letter-spacing:0.08em;">AI Workshop</div>
        </td></tr>
        <tr><td style="padding:16px 32px 8px 32px;">${inner}</td></tr>
        <tr><td style="padding:24px 32px 32px 32px;border-top:1px solid #1f1f1f;">
          <div style="font-size:12px;color:#777;line-height:1.6;">
            Questions? <a href="${SITE_URL}/support" style="color:${ACCENT};text-decoration:none;">Reach out</a>.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function ctaButton(label: string, href = `${SITE_URL}/dashboard`): string {
  return `<div style="margin:24px 0 8px 0;"><a href="${href}" style="display:inline-block;background:${ACCENT};color:#0a0a0a;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;">${label}</a></div>`;
}

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return { ok: false, error: "RESEND_API_KEY missing" };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!r.ok) return { ok: false, error: `${r.status} ${await r.text()}` };
  return { ok: true };
}

import { createClient } from "npm:@supabase/supabase-js@2";

export function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function logNotification(args: {
  user_id: string | null;
  kind: "daily_digest" | "registration_status" | "announcement" | "grade_returned";
  payload: unknown;
  email_to: string | null;
  status: "sent" | "failed";
  error?: string;
}) {
  const sb = adminClient();
  await sb.from("notifications_log").insert({
    user_id: args.user_id,
    kind: args.kind,
    payload: args.payload,
    email_to: args.email_to,
    status: args.status,
    error: args.error ?? null,
    sent_at: args.status === "sent" ? new Date().toISOString() : null,
  });
}
