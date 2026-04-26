import { expect, test } from "@playwright/test";

/**
 * Persona: Student
 * Stored in:  registrations.status='confirmed'
 * Capabilities: self.{read,write}, attendance.self, board.read,
 *               announcements.read:cohort, content.read, schedule.read
 *
 * Golden path:
 *   1. Sign in (auth bypass via TEST_BYPASS_TOKEN cookie or magic-link stub).
 *   2. Land on /dashboard — see "My pod", "Today", "Day rail" widgets.
 *   3. Navigate to /day/1 and confirm MDX content renders.
 *   4. Mark attendance via the self-attendance button on /day/[n].
 *   5. Submit a lab via /day/[n] → assignment → /submit page.
 *   6. Verify pod page renders with primary faculty + peers.
 *   7. Verify nav HIDES /admin, /faculty/*, "Roster", "Pods", etc.
 */

test.describe("Student golden path", () => {
  test.fixme(
    true,
    "Requires seeded Supabase + auth bypass — see RUNBOOK (tests/e2e/README.md)",
  );

  test("sign-in → dashboard shows student-only nav", async ({ page }) => {
    // TODO: set TEST_BYPASS cookie for a confirmed-registration user.
    // await page.context().addCookies([{ name: "test-bypass", value: process.env.TEST_BYPASS_TOKEN!, url: "http://localhost:3000" }]);
    await page.goto("/dashboard");

    // TODO: assert visible nav items (Dashboard, Today, Pod, Board, People).
    // TODO: assert HIDDEN admin/faculty entries.
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("can view current day MDX content", async ({ page }) => {
    await page.goto("/day/1");
    // TODO: expect frontmatter title, lab block, render markers.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("can mark self-attendance", async ({ page }) => {
    await page.goto("/day/1");
    // TODO: click attendance.self button, expect optimistic state + success toast.
  });

  test("can submit a lab assignment", async ({ page }) => {
    await page.goto("/day/1");
    // TODO: navigate to assignment submit form, fill, submit, verify status badge.
  });

  test("pod page lists primary faculty + peers", async ({ page }) => {
    await page.goto("/pod");
    // TODO: assert pod name, primary faculty badge, member roster count.
  });

  test("admin route is denied", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/denied|\/sign-in/, { timeout: 10_000 });
  });
});
