// Faculty hub section router. Each section exports a render function(ctx) with { state, container }.

import { normalizeFacultyHash } from './faculty/section-registry.js';
import { renderStream } from './faculty/stream.js';
import { renderFacultyPeople } from './faculty/people-tab.js';
import { renderAnalytics } from './faculty/analytics-tab.js';
import { renderAgenda } from './faculty/agenda-tab.js';
import { renderTraining } from './faculty/training-tab.js';
import { renderHandbookSection } from './faculty/handbook-section.js';
import { renderStuckAttendance } from './faculty/stuck-attendance.js';
import { renderAssignmentStrip } from './faculty/assignments-review.js';

async function renderReview(ctx) {
  const { container } = ctx;
  container.innerHTML = '';
  const hostA = document.createElement('div');
  const hostB = document.createElement('div');
  hostB.style.marginTop = '14px';
  container.appendChild(hostA);
  container.appendChild(hostB);
  await renderAnalytics({ ...ctx, container: hostA });
  await renderAssignmentStrip({ ...ctx, container: hostB });
}

const SECTIONS = {
  today: renderStream,
  students: renderFacultyPeople,
  'stuck-attendance': renderStuckAttendance,
  schedule: renderAgenda,
  review: renderReview,
  handbook: renderHandbookSection,
  training: renderTraining,
};

/**
 * @param {string} sectionId - canonical id: today | students | stuck-attendance | schedule | review | handbook | training
 * @param {{ state: object, container: HTMLElement }} ctx
 */
export async function mountFacultySection(sectionId, ctx) {
  const fn = SECTIONS[sectionId] || SECTIONS.today;
  try {
    await fn(ctx);
  } catch (e) {
    console.error('Faculty section error', sectionId, e);
    ctx.container.innerHTML = `<div class="empty-state" style="color:#ffa0a0">Failed to load: ${String(e.message || e)}</div>`;
  }
}

/**
 * @deprecated Use mountFacultySection with normalized ids. Kept for legacy / docs.
 * @param {string} tab - old tab or hash name (e.g. stream, people, grades)
 * @param {{ state: object, container: HTMLElement }} ctx
 */
export async function mountFacultyTab(tab, ctx) {
  const sectionId = normalizeFacultyHash(`#${String(tab).replace(/^#/, '')}`);
  return mountFacultySection(sectionId, ctx);
}
