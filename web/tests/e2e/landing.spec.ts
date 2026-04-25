import { expect, test } from "@playwright/test";

test("landing renders and links exist", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("30 days");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});

test("sign-in form submits", async ({ page }) => {
  await page.goto("/sign-in");
  await page.fill('input[name="email"]', "test@example.com");
  await page.click('button[type="submit"]');
  // After submit either success message or validation; just confirm form responded
  await page.waitForLoadState("networkidle");
});

test("denied page renders cap", async ({ page }) => {
  await page.goto("/denied?cap=grading.write%3Acohort");
  await expect(page.getByText("grading.write:cohort")).toBeVisible();
});
