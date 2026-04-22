// Faculty tab router. Each tab is a module exporting a render function
// that takes { state, container }.

import { renderStream } from './faculty/stream.js';
import { renderHandbook } from './faculty/handbook.js';
import { renderFacultyPeople } from './faculty/people-tab.js';
import { renderAnalytics } from './faculty/analytics-tab.js';

const TABS = {
  stream: renderStream,
  people: renderFacultyPeople,
  grades: renderAnalytics,
  handbook: renderHandbook,
  // Legacy hashes (faculty.html normalizes these, but deep links may still hit the router)
  today: renderStream,
  'my-pod': renderFacultyPeople,
  cohort: renderFacultyPeople,
  analytics: renderAnalytics,
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
