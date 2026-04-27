import { expect, test } from "@playwright/test";

/**
 * Persona: Trainer
 * Stored in:  profiles.staff_roles ⊇ {'trainer'}
 * Scope:      global
 * Capabilities: content.{read,write}, schedule.{read,write},
 *               grading.{read,write:cohort}, attendance.mark:cohort,
 *               analytics.read:program, announcements.write:cohort
 *
 * Golden path:
 *   1. Sign in as trainer.
 *   2. /admin/schedule/[day] — edit a day's plan; save persists.
 *   3. /admin/grading — grade any submission cohort-wide
 *      (trainer grading authority is cohort-wide).
 *   4. /admin (analytics tab) — see program-wide KPI.
 *   5. Trainer cannot manage roster (roster.write not granted) — UI hides
 *      bulk roster mutations OR server action returns denied.
 */

test.describe("Trainer golden path", () => {
  test.fixme(
    true,
    "Requires seeded Supabase + auth bypass — see RUNBOOK (tests/e2e/README.md)",
  );

  test("can edit /admin/schedule/[day]", async ({ page }) => {
    await page.goto("/admin/schedule/1");
    // TODO: edit field, save, reload, assert persistence.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("/admin/grading allows grading any cohort submission", async ({ page }) => {
    await page.goto("/admin/grading");
    // TODO: grade a submission in a pod the trainer is NOT assigned to;
    // expect success (cohort-wide can_grade).
  });

  test("/admin analytics renders program KPI", async ({ page }) => {
    await page.goto("/admin");
    // TODO: assert program-wide aggregates (cohort count, avg attendance).
  });

  test("roster mutation is blocked", async ({ page }) => {
    await page.goto("/admin/roster");
    // TODO: attempt bulk-delete or status-flip; expect 403 or hidden control.
  });
});
