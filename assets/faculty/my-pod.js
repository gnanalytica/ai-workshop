// "My pod" tab — list the faculty's pods in this cohort and their students.

import { supabase } from '../supabase.js';
import { loadStudentSignals } from './signals.js';
import { renderStudentRow } from './student-row.js';
import { openDrawer } from '../student-drawer.js';

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}

export async function renderMyPod({ state, container }) {
  if (!state.cohortId) { container.innerHTML = '<div class="empty-state">Pick a cohort.</div>'; return; }
  container.innerHTML = '<div class="empty-state">Loading…</div>';

  const { data: pods } = await supabase.from('pod_faculty')
    .select('pod_id,is_primary,cohort_pods!inner(id,name,cohort_id)')
    .eq('faculty_user_id', state.user.id)
    .eq('cohort_pods.cohort_id', state.cohortId);

  const podIds = (pods || []).map(p => p.pod_id);
  if (!podIds.length) {
    container.innerHTML = `<div class="empty-state">You don't own any pods in this cohort yet.</div>`;
    return;
  }

  const { data: members } = await supabase.from('pod_members')
    .select('pod_id,student_user_id')
    .in('pod_id', podIds);

  const byPod = new Map();
  podIds.forEach(id => byPod.set(id, []));
  (members || []).forEach(m => byPod.get(m.pod_id)?.push(m.student_user_id));

  const allIds = [...new Set((members || []).map(m => m.student_user_id))];
  const [{ data: profs }, signals] = await Promise.all([
    allIds.length ? supabase.from('profiles').select('id,full_name,college').in('id', allIds) : Promise.resolve({ data: [] }),
    loadStudentSignals(state.cohortId, allIds),
  ]);
  const profById = new Map((profs || []).map(p => [p.id, p]));

  container.innerHTML = pods.map(p => {
    const uids = byPod.get(p.pod_id) || [];
    const rows = uids.map(uid => renderStudentRow(profById.get(uid) || { id: uid }, signals.get(uid), { tagMine: true })).join('');
    const primaryTag = p.is_primary ? '<span class="kicker-tag" style="margin-left:8px">primary</span>' : '';
    return `
      <details open class="add-card" style="padding:12px 14px">
        <summary><b>${esc(p.cohort_pods.name)}</b>${primaryTag} <span class="muted">(${uids.length})</span></summary>
        <div style="overflow-x:auto;margin-top:10px">
          <table>
            <thead><tr><th>Name</th><th>Progress</th><th>Subs</th><th>Att</th><th>Stuck</th><th>Peer</th><th>Last</th><th>Risk</th><th></th></tr></thead>
            <tbody>${rows || `<tr><td colspan="9" class="muted" style="padding:10px">Empty pod.</td></tr>`}</tbody>
          </table>
        </div>
      </details>`;
  }).join('');

  container.querySelectorAll('button[data-open-drawer]').forEach(b => {
    b.addEventListener('click', () => openDrawer(b.dataset.openDrawer, { cohortId: state.cohortId }));
  });
}
