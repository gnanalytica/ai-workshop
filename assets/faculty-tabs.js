// Faculty tab router. Each tab is a module exporting a render function
// that takes { state, container }.

import { renderToday } from './faculty/today.js';
import { renderHandbook } from './faculty/handbook.js';
import { renderMyPod } from './faculty/my-pod.js';
import { renderCohort } from './faculty/cohort.js';
import { renderAnalytics } from './faculty/analytics-tab.js';

const TABS = {
  'today': renderToday,
  'my-pod': renderMyPod,
  'cohort': renderCohort,
  'analytics': renderAnalytics,
  'handbook': renderHandbook,
};

export async function mountFacultyTab(tab, ctx) {
  const fn = TABS[tab] || TABS['today'];
  try {
    await fn(ctx);
  } catch (e) {
    console.error('Faculty tab error', tab, e);
    ctx.container.innerHTML = `<div class="empty-state" style="color:#ffa0a0">Failed to load: ${String(e.message || e)}</div>`;
  }
}
