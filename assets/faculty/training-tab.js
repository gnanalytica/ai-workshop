function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function renderTraining({ state, container }) {
  const cohort = state?.cohorts?.find((c) => c.id === state?.cohortId) || null;
  container.innerHTML = `
    <div class="add-card">
      <div class="kicker">Training</div>
      <h2 style="margin:0 0 8px;font-size:22px">Faculty pre-training hub</h2>
      <p class="muted" style="font-size:13.5px;line-height:1.6;margin:0 0 14px">
        Use this before live sessions for script, triage, setup, and readiness checks.
        ${cohort ? `Current cohort: <strong>${esc(cohort.name)}</strong>.` : ''}
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <a class="btn-sm" href="faculty-guide.html#day-of" style="text-decoration:none">Session walkthrough</a>
        <a class="btn-sm" href="faculty-guide.html#open-script" style="text-decoration:none">Opening script</a>
        <a class="btn-sm" href="faculty-guide.html#triage" style="text-decoration:none">Triage flow</a>
        <a class="btn-sm" href="faculty-guide.html#checklist" style="text-decoration:none">Checklist</a>
        <a class="btn-sm" href="faculty-guide.html#artifacts" style="text-decoration:none">Slides/recording</a>
        <a class="btn-sm" href="setup-guide.html" style="text-decoration:none">Lab setup guide</a>
      </div>
    </div>
    <div class="add-card">
      <div class="kicker">Support</div>
      <h3 style="margin:0 0 8px;font-size:16px">When something is blocked</h3>
      <p class="muted" style="font-size:13px;line-height:1.6;margin:0 0 10px">
        If a setup issue is repeated across students, post it to the community board with tag
        <code>setup</code> so fixes become searchable.
      </p>
      <a class="btn-sm" href="board.html" style="text-decoration:none">Open community board →</a>
    </div>
  `;
}
