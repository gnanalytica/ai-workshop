// Handbook tab — static collapsible content for faculty.

export async function renderHandbook(ctx) {
  ctx.container.innerHTML = `
  <section class="add-card">
    <details open><summary><b>What you can track</b></summary>
      <p>Submissions, attendance, stuck-queue items, peer-review activity, and day-by-day lab progress for every student in your cohort. Drill into any student from the <b>My pod</b> or <b>Whole cohort</b> tabs.</p>
    </details>
    <details><summary><b>Before class</b></summary>
      <ul><li>Skim today's lesson content page.</li><li>Open the <b>Today</b> section and review at-risk students in your pod.</li><li>Queue the day's polls from the admin polls page (ask an admin if you don't have access).</li></ul>
    </details>
    <details><summary><b>During class</b></summary>
      <ul><li>Watch the stuck queue badge; respond in real time or hand items to a TA.</li><li>Launch polls at the marked moments.</li><li>Run breakouts if in Meet; otherwise pair students in chat.</li></ul>
    </details>
    <details><summary><b>After class</b></summary>
      <ul><li>Close any open stuck items from your pod.</li><li>Grade pending submissions. Use the rubric drawer on the student row.</li><li>Optional: post a pod note for tomorrow.</li></ul>
    </details>
    <details><summary><b>Grading rubric summary</b></summary>
      <p>Assignments use structured rubrics (see admin Content for the canonical definition). Each rubric item has a criterion, max points, and an optional comment. Total equals the sum of item scores; the student sees your feedback once a submission is marked <code>graded</code>.</p>
    </details>
    <details><summary><b>Escalation</b></summary>
      <p>For scheduling changes, enrollment issues, or anything a student needs admin action on, post in the faculty Slack channel or email your cohort lead.</p>
    </details>
    <details><summary><b>FAQ</b></summary>
      <p><b>Can I see students in other pods?</b> Yes — use the <b>Whole cohort</b> view under Students. Trainers handle grading; you can triage and support in cohort.</p>
      <p><b>Can I transfer my pod to another faculty?</b> Yes — ask an admin to run the Handoff on <code>admin-pods.html</code>. The audit log records every add/remove/handoff.</p>
      <p><b>Where do I find my pod's Meet link?</b> Today section, top card.</p>
    </details>
  </section>`;
}
