// Shared sticky week/day navigator for student-facing pages.

import { DAYS, WEEK_TITLES } from './days.js';
import { COHORT_SLUG } from './supabase.js';

function escAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;');
}

/**
 * @param {HTMLElement | null} el
 * @param {{ activeDay?: number | null, scheduleMap?: Map<number, { is_unlocked?: boolean }> | null, doneSet?: Set<number> }} opts
 */
export function mountDayRail(el, { activeDay = null, scheduleMap = null, doneSet = new Set() } = {}) {
  if (!el) return;

  const weeks = [1, 2, 3, 4, 5, 6];
  const parts = [];
  for (const w of weeks) {
    const days = DAYS.filter((d) => d.w === w);
    const weekCells = days
      .map((d) => {
        const sched = scheduleMap?.get(d.n);
        const unlocked = scheduleMap == null ? true : sched?.is_unlocked !== false;
        const done = doneSet.has(d.n);
        const isCurrent = activeDay === d.n;
        const classes = ['gn-day-rail__day'];
        if (isCurrent) classes.push('gn-day-rail__day--current');
        if (done) classes.push('gn-day-rail__day--done');
        if (!unlocked) classes.push('gn-day-rail__day--locked');
        const title = `Day ${d.n} · ${d.title}`;
        return `<a href="day.html?n=${d.n}" class="${classes.join(' ')}" title="${escAttr(title)}">${d.n}</a>`;
      })
      .join('');
    parts.push(
      `<div class="gn-day-rail__week" role="group" aria-label="Week ${w}"><span class="gn-day-rail__wk" title="${escAttr(WEEK_TITLES[w] || '')}">W${w}</span><div class="gn-day-rail__days">${weekCells}</div></div>`,
    );
  }

  el.innerHTML = `
    <div class="gn-day-rail__bar">
      <div class="wrap gn-day-rail__wrap">
        <div class="gn-day-rail__scroll" tabindex="0" role="navigation" aria-label="Jump to lesson day by week">
          ${parts.join('')}
        </div>
      </div>
    </div>
    <div class="gn-day-rail__legend">
      <span class="gn-day-rail__lgd gn-day-rail__lgd--current">Current</span>
      <span class="gn-day-rail__lgd gn-day-rail__lgd--done">Done</span>
      <span class="gn-day-rail__lgd gn-day-rail__lgd--open">Open</span>
      <span class="gn-day-rail__lgd gn-day-rail__lgd--locked">Locked</span>
      <a href="dashboard.html#lessons" class="gn-day-rail__full">Full lessons view →</a>
    </div>`;

  requestAnimationFrame(() => {
    const cur = el.querySelector('.gn-day-rail__day--current');
    const sc = el.querySelector('.gn-day-rail__scroll');
    if (cur && sc) cur.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  });
}

/** Resolve cohort (registration-first) + schedule + completion; mirrors dashboard cohort logic. */
export async function loadDayRailState(supabase, userId) {
  let cohort = null;
  const { data: regRows } = await supabase
    .from('registrations')
    .select('cohort_id')
    .eq('user_id', userId)
    .eq('status', 'confirmed');
  if (regRows?.length) {
    const cohortIds = [...new Set(regRows.map((r) => r.cohort_id).filter(Boolean))];
    const { data: cohortList } = await supabase.from('cohorts').select('*').in('id', cohortIds);
    const byId = new Map((cohortList || []).map((c) => [c.id, c]));
    const pick = regRows.find((r) => byId.get(r.cohort_id)?.slug === COHORT_SLUG) || regRows[0];
    cohort = pick ? byId.get(pick.cohort_id) : null;
  }
  if (!cohort?.id) {
    const cr = await supabase.from('cohorts').select('*').eq('slug', COHORT_SLUG).maybeSingle();
    cohort = cr.data;
  }
  if (!cohort?.id) return null;

  const [{ data: allDays }, { data: allProg }] = await Promise.all([
    supabase.from('cohort_days').select('day_number,is_unlocked').eq('cohort_id', cohort.id),
    supabase.from('lab_progress').select('day_number').eq('user_id', userId).eq('cohort_id', cohort.id),
  ]);
  const scheduleMap = new Map((allDays || []).map((d) => [d.day_number, d]));
  const doneSet = new Set((allProg || []).map((p) => p.day_number));
  return { cohort, scheduleMap, doneSet };
}

export async function mountStudentDayRail(supabase, userId, host, activeDay) {
  if (!host) return;
  const state = await loadDayRailState(supabase, userId);
  if (!state) {
    host.style.display = 'none';
    host.innerHTML = '';
    host.setAttribute('aria-hidden', 'true');
    return;
  }
  host.style.display = 'block';
  host.removeAttribute('aria-hidden');
  mountDayRail(host, { activeDay: activeDay ?? null, scheduleMap: state.scheduleMap, doneSet: state.doneSet });
}
