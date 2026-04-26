import { expect, test } from "@playwright/test";

/**
 * Smoke tests — verify the dev server boots and serves expected status codes
 * for the most-trafficked entry points. These are intentionally lightweight:
 * no DB assertions, no auth, just confirms the build artifact is wired up.
 */

const ENTRY_PATHS = ["/", "/sign-in", "/denied"] as const;

for (const path of ENTRY_PATHS) {
  test(`smoke: GET ${path} returns 2xx or 3xx`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response, `expected response for ${path}`).not.toBeNull();
    const status = response!.status();
    expect(
      status >= 200 && status < 400,
      `expected 2xx/3xx for ${path}, got ${status}`,
    ).toBe(true);
  });
}

test("smoke: protected route redirects unauthenticated user to /sign-in", async ({ page }) => {
  await page.goto("/dashboard");
  // Middleware/server gate should bounce us to /sign-in (with optional ?next=).
  await page.waitForURL(/\/sign-in/, { timeout: 10_000 });
  expect(page.url()).toMatch(/\/sign-in/);
});
