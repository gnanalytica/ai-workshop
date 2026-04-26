import { expect, test } from "@playwright/test";

/**
 * Public route smoke tests — no auth required.
 *
 * These cover routes that should be reachable without a Supabase session:
 *   - /sign-in : magic-link form
 *   - /denied  : capability-denied page (with ?cap=… query)
 *   - /        : marketing/landing root (redirects to /dashboard when authed)
 */

test.describe("public routes", () => {
  test("/sign-in renders magic-link form", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="next"]')).toHaveAttribute("type", "hidden");
    await expect(page.getByRole("button", { name: /send magic link/i })).toBeEnabled();
  });

  test("/sign-in honors ?next= search param", async ({ page }) => {
    await page.goto("/sign-in?next=%2Fadmin");
    await expect(page.locator('input[name="next"]')).toHaveValue("/admin");
  });

  test("/denied renders capability message", async ({ page }) => {
    await page.goto("/denied?cap=grading.write%3Acohort");

    await expect(page.getByRole("heading", { name: /not authorized/i })).toBeVisible();
    await expect(page.getByText("grading.write:cohort")).toBeVisible();
    await expect(page.getByRole("link", { name: /back to dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
  });

  test("/denied without cap query still renders", async ({ page }) => {
    await page.goto("/denied");
    await expect(page.getByRole("heading", { name: /not authorized/i })).toBeVisible();
  });

  test("root path responds 200 or redirects", async ({ page }) => {
    const response = await page.goto("/");
    expect(response, "GET / should produce a response").not.toBeNull();
    const status = response!.status();
    expect([200, 301, 302, 307, 308]).toContain(status);
  });
});
