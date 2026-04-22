// People tab — whole cohort or my pod (scope chip).

import { renderMyPod } from './my-pod.js';
import { renderCohort } from './cohort.js';

const SCOPE_KEY = 'faculty_people_scope';

export async function renderFacultyPeople(ctx) {
  const { state, container } = ctx;
  if (!state.cohortId) {
    container.innerHTML = '<div class="empty-state">Pick a cohort above.</div>';
    return;
  }
  const scope = sessionStorage.getItem(SCOPE_KEY) === 'pod' ? 'pod' : 'all';

  const bar = document.createElement('div');
  bar.className = 'add-card';
  bar.style.padding = '10px 14px';
  bar.style.marginBottom = '14px';
  bar.style.display = 'flex';
  bar.style.flexWrap = 'wrap';
  bar.style.gap = '10px';
  bar.style.alignItems = 'center';
  bar.innerHTML = `
    <span class="muted" style="font-size:12.5px">View</span>
    <button type="button" class="btn-sm ${scope === 'all' ? 'active' : ''}" data-fscope="all">Whole cohort</button>
    <button type="button" class="btn-sm ${scope === 'pod' ? 'active' : ''}" data-fscope="pod">My pod only</button>`;

  const body = document.createElement('div');
  container.innerHTML = '';
  container.appendChild(bar);
  container.appendChild(body);

  if (scope === 'pod') await renderMyPod({ ...ctx, container: body });
  else await renderCohort({ ...ctx, container: body });

  bar.querySelectorAll('[data-fscope]').forEach((btn) => {
    btn.addEventListener('click', () => {
      sessionStorage.setItem(SCOPE_KEY, btn.getAttribute('data-fscope') || 'all');
      renderFacultyPeople(ctx);
    });
  });
}
