import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const DASHBOARD_URL = "https://gnanalytica.github.io/ai-workshop/dashboard.html";
const DAY_URL_BASE = "https://gnanalytica.github.io/ai-workshop/day.html";
const SEARCH_URL = "https://gnanalytica.github.io/ai-workshop/search.html";
const CONTACT_URL = "https://gnanalytica.github.io/ai-workshop/#contact";
const LIME = "#c3ff36";

// Day title is read from public.cohort_days.title at runtime.
// Week is computed from day_number: 5 days/week, weekends excluded by the schedule itself.
function weekForDay(n: number): number {
  return Math.max(1, Math.min(6, Math.ceil(n / 5)));
}

function wrap(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px 32px 8px 32px;">
          <div style="font-size:20px;font-weight:700;letter-spacing:-0.01em;color:#fff;">gn<span style="color:${LIME};">/</span>analytica</div>
          <div style="font-size:12px;color:#888;margin-top:2px;text-transform:uppercase;letter-spacing:0.08em;">AI Workshop · Daily Digest</div>
        </td></tr>
        <tr><td style="padding:16px 32px 8px 32px;">${inner}</td></tr>
        <tr><td style="padding:24px 32px 32px 32px;border-top:1px solid #1f1f1f;">
          <div style="font-size:12px;color:#777;line-height:1.6;">
            Questions? <a href="${CONTACT_URL}" style="color:${LIME};text-decoration:none;">Reach out</a>.<br/>
            Don't want these? Toggle off <em>Daily digest</em> on your <a href="${DASHBOARD_URL}#profile" style="color:${LIME};text-decoration:none;">profile</a>.<br/>
            gn/analytica AI Workshop
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function section(title: string, bodyHtml: string): string {
  return `<div style="margin:20px 0 0 0;padding:14px 16px;background:#0e0e0e;border:1px solid #1f1f1f;border-radius:10px;">
    <div style="font-size:11px;color:${LIME};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;margin-bottom:8px;">${title}</div>
    ${bodyHtml}
  </div>`;
}

function btn(href: string, label: string, primary = true): string {
  const bg = primary ? LIME : "transparent";
  const fg = primary ? "#0a0a0a" : "#fff";
  const border = primary ? LIME : "#333";
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${fg};border:1px solid ${border};font-weight:600;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;margin:2px 6px 2px 0;">${label}</a>`;
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }) + " IST";
  } catch { return iso; }
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>)[c]);
}

type Cohort = { id: string; name: string | null; starts_on: string; ends_on: string };

async function processCohort(admin: ReturnType<typeof createClient>, cohort: Cohort, todayIso: string): Promise<{ sent: number; skipped: number; errors: string[] }> {
  const errors: string[] = [];
  let sent = 0;
  let skipped = 0;

  const start = new Date(cohort.starts_on + "T00:00:00Z").getTime();
  const now = Date.now();
  const daysSince = Math.floor((now - start) / (24 * 3600 * 1000)) + 1;
  const dayN = Math.max(1, Math.min(30, daysSince));
  // Today's cohort_days row (now includes title)
  const { data: cohortDay } = await admin
    .from("cohort_days")
    .select("is_unlocked, live_session_at, meet_link, notes, title")
    .eq("cohort_id", cohort.id)
    .eq("day_number", dayN)
    .maybeSingle();

  const dayInfo = {
    n: dayN,
    w: weekForDay(dayN),
    title: (cohortDay?.title as string | null | undefined) || `Day ${dayN}`,
  };

  // Latest announcement for cohort (today or recent)
  const { data: announcement } = await admin
    .from("announcements")
    .select("title, body, created_at")
    .eq("cohort_id", cohort.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Poll-of-the-day open
  const { data: poll } = await admin
    .from("polls")
    .select("title, question, day_number")
    .eq("cohort_id", cohort.id)
    .eq("is_open", true)
    .order("opened_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  // Today's faculty (lead/support) + shared notes (read via public view)
  const { data: dayFaculty } = await admin
    .from("day_faculty_shared")
    .select("main_name, support_name, shared_notes")
    .eq("cohort_id", cohort.id)
    .eq("day_number", dayN)
    .maybeSingle();

  // Today's assignment due_at (if any)
  const { data: todayAssignment } = await admin
    .from("assignments")
    .select("title, due_at")
    .eq("cohort_id", cohort.id)
    .eq("day_number", dayN)
    .not("due_at", "is", null)
    .order("due_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  // Confirmed students with opt-in
  const { data: regs, error: regsErr } = await admin
    .from("registrations")
    .select("id, user_id, cohort_id, profiles:user_id ( full_name, daily_digest_opt_in )")
    .eq("status", "confirmed")
    .eq("cohort_id", cohort.id);

  if (regsErr) {
    errors.push(`regs fetch: ${regsErr.message}`);
    return { sent, skipped, errors };
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromAddr = Deno.env.get("RESEND_FROM") || "onboarding@resend.dev";

  for (const reg of regs ?? []) {
    const r = reg as { id: string; user_id: string; cohort_id: string; profiles: { full_name: string | null; daily_digest_opt_in: boolean } | null };
    const profile = r.profiles;
    if (!profile?.daily_digest_opt_in) { skipped++; continue; }

    // Idempotence check
    const { data: existing } = await admin
      .from("notifications_log")
      .select("id")
      .eq("user_id", r.user_id)
      .eq("kind", "daily_digest")
      .gte("created_at", todayIso + "T00:00:00Z")
      .lt("created_at", todayIso + "T23:59:59Z")
      .limit(1);
    if (existing && existing.length > 0) { skipped++; continue; }

    // User email
    const { data: userRes } = await admin.auth.admin.getUserById(r.user_id);
    const emailTo = userRes?.user?.email;
    if (!emailTo) { skipped++; continue; }

    // Pending peer reviews
    const { count: peerReviewsPending } = await admin
      .from("peer_reviews")
      .select("id", { count: "exact", head: true })
      .eq("reviewer_id", r.user_id)
      .eq("status", "assigned");

    // Overdue milestone submissions — assignments past due for this cohort without user submission
    const { data: assignments } = await admin
      .from("assignments")
      .select("id, title, due_at")
      .eq("cohort_id", cohort.id)
      .not("due_at", "is", null)
      .lt("due_at", new Date().toISOString());
    let overdueCount = 0;
    if (assignments && assignments.length > 0) {
      const ids = assignments.map((a) => a.id as string);
      const { data: subs } = await admin
        .from("submissions")
        .select("assignment_id")
        .eq("user_id", r.user_id)
        .in("assignment_id", ids);
      const submitted = new Set((subs ?? []).map((s) => s.assignment_id));
      overdueCount = ids.filter((id) => !submitted.has(id)).length;
    }

    // Stuck queue entries owned by user
    const { count: stuckCount } = await admin
      .from("stuck_queue")
      .select("id", { count: "exact", head: true })
      .eq("user_id", r.user_id)
      .in("status", ["pending", "helping"]);

    const first = profile.full_name?.split(" ")[0] || "there";
    const liveLine = cohortDay?.live_session_at
      ? `Live session at <strong style="color:#fff">${fmtTime(cohortDay.live_session_at as string)}</strong>`
      : "";
    const meetBtn = cohortDay?.meet_link ? btn(cohortDay.meet_link as string, "Join Meet →", true) : "";
    const lessonBtn = btn(`${DAY_URL_BASE}?n=${dayN}`, "Open today's lesson →", !meetBtn);

    const facultyParts: string[] = [];
    if (dayFaculty?.main_name) facultyParts.push(`Lead: <strong style="color:#fff">${escapeHtml(dayFaculty.main_name as string)}</strong>`);
    if (dayFaculty?.support_name) facultyParts.push(`Support: <strong style="color:#fff">${escapeHtml(dayFaculty.support_name as string)}</strong>`);
    const facultyLine = facultyParts.length ? facultyParts.join(" · ") : "";
    const sharedNotes = (dayFaculty?.shared_notes as string | null) || "";
    const sharedNotesPreview = sharedNotes ? sharedNotes.slice(0, 240) : "";

    const dueLine = todayAssignment?.due_at
      ? `Today's assignment <em style="color:#ddd">${escapeHtml(todayAssignment.title as string)}</em> due <strong style="color:#fff">${fmtTime(todayAssignment.due_at as string)}</strong>`
      : "";

    const todayBlock = `
      <div style="font-size:13px;color:#999;">Day ${dayN} · Week ${dayInfo.w}</div>
      <div style="font-size:22px;color:#fff;font-weight:700;margin:4px 0 10px 0;line-height:1.25;">${escapeHtml(dayInfo.title)}</div>
      ${liveLine ? `<div style="font-size:14px;color:#ccc;margin:2px 0 10px 0;">${liveLine}</div>` : ""}
      ${facultyLine ? `<div style="font-size:13px;color:#bbb;margin:2px 0 8px 0;">${facultyLine}</div>` : ""}
      ${sharedNotesPreview ? `<div style="font-size:13.5px;color:#bbb;margin:6px 0 10px 0;line-height:1.55;padding:8px 10px;background:#0a0a0a;border-left:2px solid ${LIME};border-radius:4px;">${escapeHtml(sharedNotesPreview)}${sharedNotes.length > 240 ? "…" : ""}</div>` : ""}
      ${dueLine ? `<div style="font-size:13px;color:#ccc;margin:2px 0 8px 0;">${dueLine}</div>` : ""}
      ${cohortDay?.notes ? `<div style="font-size:14px;color:#bbb;margin:6px 0 12px 0;line-height:1.55;">${escapeHtml(cohortDay.notes as string)}</div>` : ""}
      <div style="margin-top:10px">${meetBtn}${lessonBtn}</div>
    `;

    const pendingItems: string[] = [];
    if ((peerReviewsPending ?? 0) > 0) pendingItems.push(`<li style="margin:4px 0;"><strong style="color:#fff">${peerReviewsPending}</strong> peer review${peerReviewsPending === 1 ? "" : "s"} waiting · <a href="${DASHBOARD_URL}#activity" style="color:${LIME};text-decoration:none;">Review now</a></li>`);
    if (overdueCount > 0) pendingItems.push(`<li style="margin:4px 0;"><strong style="color:#fff">${overdueCount}</strong> overdue submission${overdueCount === 1 ? "" : "s"} · <a href="${DASHBOARD_URL}#capstone" style="color:${LIME};text-decoration:none;">Submit</a></li>`);
    if ((stuckCount ?? 0) > 0) pendingItems.push(`<li style="margin:4px 0;"><strong style="color:#fff">${stuckCount}</strong> stuck thread${stuckCount === 1 ? "" : "s"} open</li>`);
    const pendingBlock = pendingItems.length
      ? section("Your pending items", `<ul style="margin:0;padding-left:18px;color:#ccc;font-size:14px;line-height:1.6;">${pendingItems.join("")}</ul>`)
      : "";

    const newItems: string[] = [];
    if (announcement?.title || announcement?.body) {
      const aTitle = announcement.title ? `<div style="font-size:14px;color:#fff;font-weight:600;margin-bottom:4px;">${escapeHtml(announcement.title as string)}</div>` : "";
      const aBody = announcement.body ? `<div style="font-size:13.5px;color:#bbb;line-height:1.55;">${escapeHtml(String(announcement.body).slice(0, 280))}</div>` : "";
      newItems.push(`<div style="margin-bottom:10px;">${aTitle}${aBody}</div>`);
    }
    if (poll?.title || poll?.question) {
      newItems.push(`<div style="margin-top:6px;padding-top:10px;border-top:1px dashed #222;"><div style="font-size:11px;color:${LIME};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Poll of the day</div><div style="font-size:14px;color:#fff;">${escapeHtml((poll.title || poll.question) as string)}</div><div style="margin-top:8px">${btn(`${DASHBOARD_URL}#overview`, "Vote →", false)}</div></div>`);
    }
    const newBlock = newItems.length ? section("New in the cohort", newItems.join("")) : "";

    const quickLinks = `
      <div style="margin-top:22px;padding-top:16px;border-top:1px solid #1f1f1f;font-size:13px;color:#888;">
        Quick links:
        <a href="${DASHBOARD_URL}" style="color:${LIME};text-decoration:none;margin:0 6px;">Dashboard</a>·
        <a href="${DAY_URL_BASE}?n=${dayN}" style="color:${LIME};text-decoration:none;margin:0 6px;">Today's lesson</a>·
        <a href="${SEARCH_URL}" style="color:${LIME};text-decoration:none;margin:0 6px;">Search</a>
      </div>
    `;

    const body = `
      <p style="font-size:16px;color:#fff;margin:8px 0 4px 0;">Hi ${escapeHtml(first)},</p>
      <p style="font-size:14px;color:#aaa;margin:0 0 14px 0;">Here's your daily digest.</p>
      ${section("Today", todayBlock)}
      ${pendingBlock}
      ${newBlock}
      ${quickLinks}
    `;

    const subject = `Day ${dayN} · ${dayInfo.title} — your AI workshop today`;
    const html = wrap(body);

    let emailStatus: "sent" | "failed" = "failed";
    let errorMsg: string | null = null;
    let sentAt: string | null = null;

    if (!resendKey) {
      errorMsg = "RESEND_API_KEY not configured";
    } else {
      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: fromAddr, to: emailTo, subject, html }),
        });
        if (resp.ok) {
          emailStatus = "sent";
          sentAt = new Date().toISOString();
        } else {
          errorMsg = `resend ${resp.status}: ${(await resp.text()).slice(0, 400)}`;
        }
      } catch (e) {
        errorMsg = `resend fetch error: ${(e as Error).message}`;
      }
    }

    await admin.from("notifications_log").insert({
      user_id: r.user_id,
      registration_id: r.id,
      kind: "daily_digest",
      payload: { day: dayN, subject, cohort_id: cohort.id, peer_reviews: peerReviewsPending ?? 0, overdue: overdueCount, stuck: stuckCount ?? 0 },
      email_to: emailTo,
      email_status: emailStatus,
      error: errorMsg,
      sent_at: sentAt,
    });

    if (emailStatus === "sent") sent++;
    else { skipped++; if (errorMsg) errors.push(errorMsg); }
  }

  return { sent, skipped, errors };
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const { data: cohorts, error: cohortsErr } = await admin
    .from("cohorts")
    .select("id, name, starts_on, ends_on")
    .lte("starts_on", todayIso)
    .gte("ends_on", todayIso);

  if (cohortsErr) {
    return new Response(JSON.stringify({ error: cohortsErr.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  let totalSent = 0, totalSkipped = 0;
  const allErrors: string[] = [];
  const cohortResults: Array<{ cohort_id: string; sent: number; skipped: number }> = [];

  for (const c of (cohorts ?? []) as Cohort[]) {
    const r = await processCohort(admin, c, todayIso);
    totalSent += r.sent;
    totalSkipped += r.skipped;
    allErrors.push(...r.errors);
    cohortResults.push({ cohort_id: c.id, sent: r.sent, skipped: r.skipped });
  }

  return new Response(JSON.stringify({
    success: true,
    sent: totalSent,
    skipped: totalSkipped,
    cohorts: cohortResults,
    errors: allErrors.slice(0, 10),
  }), { status: 200, headers: { "Content-Type": "application/json" } });
});
