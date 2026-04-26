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
 *   2. /faculty/today — see today's pod schedule + attendance roster.
 *   3. /faculty/review — open review queue; can_grade(submission)=true
 *      ONLY for submissions whose student shares_pod_with(faculty).
 *   4. Grade a submission; verify status flips and audit row written.
 *   5. /faculty/pod — view assigned pod; mark attendance for whole pod.
 *   6. /faculty/handbook — verify MDX renders for content.read.
 *
 * Golden path (executive): same /faculty/review surface but write attempts
 * must fail with capability denied.
 */

test.describe("Support faculty golden path", () => {
  test.fixme(
    true,
    "Requires seeded Supabase + auth bypass — see RUNBOOK (tests/e2e/README.md)",
  );

  test("/faculty/today shows pod schedule", async ({ page }) => {
    await page.goto("/faculty/today");
    // TODO: expect today's date, pod list, attendance widget.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("/faculty/review queue is scoped to pod members", async ({ page }) => {
    await page.goto("/faculty/review");
    // TODO: assert ReviewQueueClient renders only submissions where
    // shares_pod_with(student, cohort) is true.
  });

  test("can grade a submission inside the pod", async ({ page }) => {
    await page.goto("/faculty/review");
    // TODO: open first submission, set score+feedback, submit, expect status badge.
  });

  test("/faculty/pod lists assigned pod members", async ({ page }) => {
    await page.goto("/faculty/pod");
    // TODO: assert primary faculty marker, member count == seed.
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

  test("/faculty/review opens but grading controls are disabled", async ({ page }) => {
    await page.goto("/faculty/review");
    // TODO: assert submission rows visible, "Grade" button disabled / hidden.
  });

  test("attempting to grade returns capability denial", async ({ page }) => {
    // TODO: POST directly to grading server action; expect /denied?cap=grading.write...
    await page.goto("/faculty/review");
  });
});
