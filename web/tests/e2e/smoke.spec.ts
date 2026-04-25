import { expect, test } from "@playwright/test";

test("landing page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("30 days");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});
