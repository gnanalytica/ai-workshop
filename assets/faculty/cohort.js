// "Whole cohort" tab — all confirmed students in the cohort with signals.

import { supabase } from '../supabase.js';
import { loadStudentSignals } from './signals.js';
import { renderStudentRow } from './student-row.js';
import { openDrawer } from '../student-drawer.js';

export async function renderCohort({ state, container }) {
  if (!state.cohortId) { container.innerHTML = '<div class="empty-state">Pick a cohort.</div>'; return; }
  container.innerHTML = '<div class="empty-state">Loading…</div>';

  // Enrolled students (confirmed only).
  const { data: regs } = await supabase.from('registrations')
    .select('user_id, profiles:profiles!inner(id,full_name,college)')
    .eq('cohort_id', state.cohortId)
    .eq('status', 'confirmed');
  const profs = (regs || []).map(r => r.profiles).filter(Boolean);
  const ids = profs.map(p => p.id);

  // Which of these are in the viewing faculty's pods?
  const { data: myPods } = await supabase.from('pod_faculty')
    .select('pod_id,cohort_pods!inner(cohort_id)')
    .eq('faculty_user_id', state.user.id)
    .eq('cohort_pods.cohort_id', state.cohortId);
  const myPodIds = (myPods || []).map(p => p.pod_id);
  let mineSet = new Set();
  if (myPodIds.length) {
    const { data: myMembers } = await supabase.from('pod_members')
      .select('student_user_id').in('pod_id', myPodIds);
    mineSet = new Set((myMembers || []).map(m => m.student_user_id));
  }

  const signals = await loadStudentSignals(state.cohortId, ids);

  container.innerHTML = `
    <div class="add-card" style="padding:10px 14px">
      <div style="overflow-x:auto">
        <table>
          <thead><tr><th>Name</th><th>Progress</th><th>Subs</th><th>Att</th><th>Stuck</th><th>Peer</th><th>Last</th><th>Risk</th><th></th></tr></thead>
          <tbody>${profs.map(p => renderStudentRow(p, signals.get(p.id), { tagMine: mineSet.has(p.id) })).join('') || '<tr><td colspan="9" class="muted" style="padding:10px">No enrolled students.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;

  container.querySelectorAll('button[data-open-drawer]').forEach(b => {
    b.addEventListener('click', () => openDrawer(b.dataset.openDrawer, { cohortId: state.cohortId }));
  });
}
