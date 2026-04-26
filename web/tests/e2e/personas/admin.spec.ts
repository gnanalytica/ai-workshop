import { expect, test } from "@playwright/test";

/**
 * Persona: Admin
 * Stored in:  profiles.staff_roles ⊇ {'admin'}
 * Scope:      global
 * Capabilities: roster.{read,write}, pods.write, faculty.write,
 *               schedule.{read,write}, content.{read,write},
 *               grading.{read,write:cohort}, attendance.mark:cohort,
 *               analytics.read:program, announcements.write:cohort,
 *               moderation.write, orgs.write, support.tech_only
 *
 * Golden path:
 *   1. Sign in as admin (bypass cookie).
 *   2. Land on /admin — see KPI dashboard + announcements editor.
 *   3. /admin/roster — see all confirmed students; filter; bulk action.
 *   4. /admin/pods — create or rebalance a pod via rpc_pod_faculty_event.
 *   5. /admin/schedule/[day] — edit a day's lab/lecture content.
 *   6. /admin/faculty — assign a college_role (support|executive).
 *   7. Verify announcements broadcast appears on student dashboard (cross-persona).
 */

test.describe("Admin golden path", () => {
  test.fixme(
    true,
    "Requires seeded Supabase + auth bypass — see RUNBOOK (tests/e2e/README.md)",
  );

  test("sign-in → /admin renders KPI dashboard", async ({ page }) => {
    // TODO: addCookies([{ name: "test-bypass-admin", value: process.env.TEST_BYPASS_TOKEN! ... }])
    await page.goto("/admin");
    // TODO: expect KPI cards (Active students, Pods, Open submissions).
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("/admin/roster lists all confirmed students", async ({ page }) => {
    await page.goto("/admin/roster");
    // TODO: assert table row count matches seed (50 students).
    // TODO: filter by pod or status, assert filtered count.
  });

  test("/admin/pods can rebalance a pod", async ({ page }) => {
    await page.goto("/admin/pods");
    // TODO: click "Move student" → choose target pod → assert pod_events row appears.
  });

  test("/admin/schedule/[day] edits a day", async ({ page }) => {
    await page.goto("/admin/schedule/1");
    // TODO: edit ScheduleDayEditor field, save, assert persistence on reload.
  });

  test("/admin/faculty can assign college_role", async ({ page }) => {
    await page.goto("/admin/faculty");
    // TODO: pick faculty, set role to "support", confirm row updates.
  });

  test("announcement broadcast appears for students", async ({ page }) => {
    await page.goto("/admin");
    // TODO: post announcement via AnnouncementsClient form.
    // TODO: switch to student session, verify it appears on /dashboard.
  });
});
