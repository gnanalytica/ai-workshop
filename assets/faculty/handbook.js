// Handbook tab — static collapsible content for faculty.

export async function renderHandbook(ctx) {
  ctx.container.innerHTML = `
  <section class="add-card">
    <details open><summary><b>What you can track</b></summary>
      <p>Submissions, attendance, stuck-queue items, peer-review activity, and day-by-day lab progress for every student in your cohort. Drill into any student from the <b>My pod</b> or <b>Whole cohort</b> tabs.</p>
    </details>
    <details><summary><b>Pre-session</b></summary>
      <ul><li>Read the student <code>day.html</code> page for today’s objective and activities.</li><li>Open <b>Today</b> and review completion and stuck signals for your pod.</li><li>Queue the day’s polls in the admin polls tool (request access from an admin if needed).</li></ul>
    </details>
    <details><summary><b>In-session</b></summary>
      <ul><li>Monitor the stuck queue; triage in real time or assign to a TA per pod policy.</li><li>Launch polls at the scheduled agenda points.</li><li>Run breakouts in Meet or pair in chat as the trainer specifies.</li></ul>
    </details>
    <details><summary><b>Post-session</b></summary>
      <ul><li>Resolve or reassign open stuck items from your pod.</li><li>Grade pending submissions via the rubric on the student row (trainers may own final scores).</li><li>Post the next session’s prep link in the cohort channel if the runbook requires it.</li></ul>
    </details>
    <details><summary><b>Grading rubric summary</b></summary>
      <p>Assignments use structured rubrics (see admin Content for the canonical definition). Each rubric item has a criterion, max points, and an optional comment. Total equals the sum of item scores; the student sees your feedback once a submission is marked <code>graded</code>.</p>
    </details>
    <details><summary><b>Escalation</b></summary>
      <p>For scheduling changes, enrollment issues, or anything a student needs admin action on, post in the faculty Slack channel or email your cohort lead.</p>
    </details>
    <details><summary><b>FAQ</b></summary>
      <p><b>Can I see students in other pods?</b> Yes — use the <b>Whole cohort</b> view under Students. Trainers own grading; you can triage and document blockers in cohort.</p>
      <p><b>Can I transfer my pod to another faculty?</b> Yes — ask an admin to run the Handoff on <code>admin-pods.html</code>. The audit log records every add/remove/handoff.</p>
      <p><b>Where do I find my pod's Meet link?</b> Today section, top card.</p>
    </details>
  </section>`;
}
