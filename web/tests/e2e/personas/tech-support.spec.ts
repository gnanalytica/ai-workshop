import { expect, test } from "@playwright/test";

/**
 * Persona: Tech Support
 * Stored in:  profiles.staff_roles ⊇ {'tech_support'}
 * Scope:      global
 * Capabilities: support.{triage,tech_only}, roster.read,
 *               (NO grading, NO content.write, NO announcements.write)
 *
 * Golden path:
 *   1. Sign in as tech_support.
 *   2. /admin (or /admin/support) — see triage queue, tech-only tickets.
 *   3. /admin/roster — read-only roster; mutation controls hidden.
 *   4. Cannot edit /admin/schedule/[day] — capability denied.
 *   5. Cannot grade — /admin/grading denied.
 */

test.describe("Tech Support golden path", () => {
  test.fixme(
    true,
    "Requires seeded Supabase + auth bypass — see RUNBOOK (tests/e2e/README.md)",
  );

  test("/admin landing shows support triage entry", async ({ page }) => {
    await page.goto("/admin");
    // TODO: assert "Support" / triage card visible; analytics+roster-write hidden.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("/admin/roster is read-only", async ({ page }) => {
    await page.goto("/admin/roster");
    // TODO: rows visible; bulk-action / row-action menus disabled or absent.
  });

  test("/admin/schedule/[day] is denied", async ({ page }) => {
    await page.goto("/admin/schedule/1");
    await page.waitForURL(/\/denied|\/sign-in/, { timeout: 10_000 });
  });

  test("/admin/grading is denied", async ({ page }) => {
    await page.goto("/admin/grading");
    await page.waitForURL(/\/denied|\/sign-in/, { timeout: 10_000 });
  });
});
