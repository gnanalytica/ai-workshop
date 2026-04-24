// Faculty tab router. Each tab is a module exporting a render function
// that takes { state, container }.

import { renderStream } from './faculty/stream.js';
import { renderFacultyPeople } from './faculty/people-tab.js';
import { renderAnalytics } from './faculty/analytics-tab.js';
import { renderGuide } from './faculty/guide.js';
import { renderAgenda } from './faculty/agenda-tab.js';
import { renderTraining } from './faculty/training-tab.js';

const TABS = {
  stream: renderStream,
  agenda: renderAgenda,
  people: renderFacultyPeople,
  grades: renderAnalytics,
  training: renderTraining,
  guide: renderGuide,
  handbook: renderGuide,
  // Legacy hashes (faculty.html normalizes these, but deep links may still hit the router)
  today: renderStream,
  'my-pod': renderFacultyPeople,
  cohort: renderFacultyPeople,
  analytics: renderAnalytics,
  guide: renderGuide,
};

export async function mountFacultyTab(tab, ctx) {
  const fn = TABS[tab] || TABS.stream;
  try {
    await fn(ctx);
  } catch (e) {
    console.error('Faculty tab error', tab, e);
    ctx.container.innerHTML = `<div class="empty-state" style="color:#ffa0a0">Failed to load: ${String(e.message || e)}</div>`;
  }
}
