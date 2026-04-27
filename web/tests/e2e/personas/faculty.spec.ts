import { expect, test } from "@playwright/test";

/**
 * Persona: Support / Executive Faculty
 * Stored in:  cohort_faculty.college_role IN ('support','executive')
 * Scope:      per cohort
 * Capabilities (support): grading.write:pod, attendance.mark:pod,
 *                         announcements.read:cohort, support.triage
 * Capabilities (executive): grading.read (no write), analytics.read:cohort
 *
 * Golden path (support):
 *   1. Sign in as support faculty assigned to a pod.
 *   2. /faculty redirects to /faculty/pod (pod-first default view).
 *   3. /faculty/pod — view assigned pod members and student activity.
 *   4. /faculty/student/[id] — inspect submissions, quiz/assignment outcomes,
 *      progress, and recent stuck history for a pod student.
 *   5. /faculty/stuck — view/triage only stuck items from assigned pod students.
 *   6. /faculty/handbook — verify MDX renders for content.read.
 *
 * Golden path (executive): same pod-scoped read flow without grading actions.
 */

test.describe("Support faculty golden path", () => {
  test.fixme(
    true,
    "Requires seeded Supabase + auth bypass — see RUNBOOK (tests/e2e/README.md)",
  );

  test("/faculty redirects to /faculty/pod", async ({ page }) => {
    await page.goto("/faculty");
    await page.waitForURL(/\/faculty\/pod$/, { timeout: 10_000 });
  });

  test("/faculty/pod lists assigned pod members", async ({ page }) => {
    await page.goto("/faculty/pod");
    // TODO: assert primary faculty marker, member count == seed.
  });

  test("/faculty/student/[id] shows student progress details", async ({ page }) => {
    // TODO: open a student from pod list and assert progress/submission cards.
    await page.goto("/faculty/pod");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("/faculty/stuck is pod-scoped", async ({ page }) => {
    await page.goto("/faculty/stuck");
    // TODO: assert all listed students belong to faculty-assigned pod(s).
  });

  test("/admin route is denied for faculty", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/denied|\/sign-in/, { timeout: 10_000 });
  });
});

test.describe("Executive faculty (read-only)", () => {
  test.fixme(
    true,
    "Requires seeded Supabase + auth bypass — see RUNBOOK (tests/e2e/README.md)",
  );

  test("/faculty/stuck opens with pod-scoped read/triage", async ({ page }) => {
    await page.goto("/faculty/stuck");
    // TODO: assert pod-scoped items visible and triage actions are available.
  });

  test("/faculty/student/[id] is readable without grading actions", async ({ page }) => {
    // TODO: open student drill-down and verify no grading publish controls.
    await page.goto("/faculty/pod");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
