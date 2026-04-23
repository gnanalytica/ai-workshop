// Coursera-style vertical course outline (sidebar on most pages; embedded in lesson aside on day.html).

import { DAYS, WEEK_TITLES } from './days.js';
import { COHORT_SLUG } from './supabase.js';

let courseNavAbort = null;

function escAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;');
}

function shortTitle(s, max = 48) {
  const t = String(s ?? '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/** Remove fixed sidebar chrome (burger, backdrop, body padding hook). */
export function teardownCourseNavUI() {
  document.body.classList.remove('gn-has-course-nav', 'gn-course-nav-drawer-open');
  document.body.style.overflow = '';
  document.getElementById('gnCourseNavTrigger')?.remove();
  document.getElementById('gnCourseNavBackdrop')?.remove();
  const railHost = document.getElementById('gnDayRailHost');
  if (railHost) delete railHost.dataset.gnDrawerInit;
  if (courseNavAbort) {
    courseNavAbort.abort();
    courseNavAbort = null;
  }
}

function syncCourseWeekOpenState(activeDay) {
  const wide = window.matchMedia('(min-width: 900px)').matches;
  document.querySelectorAll('.gn-course-week').forEach((det) => {
    const wk = det.dataset.week;
    if (wide) {
      det.setAttribute('open', '');
    } else if (activeDay == null) {
      det.toggleAttribute('open', wk === '1');
    } else if (det.querySelector('.gn-course-nav__day--current')) {
      det.setAttribute('open', '');
    } else {
      det.removeAttribute('open');
    }
  });
}

function initCourseNavDrawer(host) {
  if (!host || host.dataset.gnDrawerInit === '1') return;
  host.dataset.gnDrawerInit = '1';

  const navIn = document.querySelector('body > nav .nav-in');
  if (!navIn || document.getElementById('gnCourseNavTrigger')) return;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.id = 'gnCourseNavTrigger';
  trigger.className = 'gn-course-nav-trigger';
  trigger.setAttribute('aria-label', 'Open course outline');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'gnDayRailHost');
  trigger.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>';
  const brand = navIn.querySelector('.brand');
  if (brand) brand.insertAdjacentElement('beforebegin', trigger);
  else navIn.prepend(trigger);

  let backdrop = document.getElementById('gnCourseNavBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'gnCourseNavBackdrop';
    backdrop.className = 'gn-course-nav-backdrop';
    backdrop.tabIndex = -1;
    host.insertAdjacentElement('beforebegin', backdrop);
  }

  const close = () => {
    document.body.classList.remove('gn-course-nav-drawer-open');
    trigger.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('is-visible');
    document.body.style.overflow = '';
  };
  const open = () => {
    if (window.matchMedia('(min-width: 900px)').matches) return;
    document.body.classList.add('gn-course-nav-drawer-open');
    trigger.setAttribute('aria-expanded', 'true');
    backdrop.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  };

  trigger.addEventListener('click', () => {
    if (document.body.classList.contains('gn-course-nav-drawer-open')) close();
    else open();
  });
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  host.addEventListener('click', (e) => {
    if (e.target.closest('a') && window.matchMedia('(max-width: 899px)').matches) close();
  });
}

/**
 * @param {HTMLElement | null} el
 * @param {{ activeDay?: number | null, scheduleMap?: Map<number, { is_unlocked?: boolean }> | null, doneSet?: Set<number>, variant?: 'sidebar' | 'embedded' }} opts
 */
export function mountDayRail(
  el,
  { activeDay = null, scheduleMap = null, doneSet = new Set(), variant = 'sidebar' } = {},
) {
  if (!el) return;

  if (variant === 'sidebar') {
    teardownCourseNavUI();
    courseNavAbort = new AbortController();
  }

  const weeks = [1, 2, 3, 4, 5, 6];
  const weekBlocks = weeks
    .map((w) => {
      const days = DAYS.filter((d) => d.w === w);
      const weekLinks = days
        .map((d) => {
          const sched = scheduleMap?.get(d.n);
          const unlocked = scheduleMap == null ? true : sched?.is_unlocked !== false;
          const done = doneSet.has(d.n);
          const isCurrent = activeDay === d.n;
          const classes = ['gn-course-nav__day'];
          if (isCurrent) classes.push('gn-course-nav__day--current');
          if (done) classes.push('gn-course-nav__day--done');
          if (!unlocked) classes.push('gn-course-nav__day--locked');
          const title = `Day ${d.n} · ${d.title}`;
          return `<a href="day.html?n=${d.n}" class="${classes.join(' ')}" title="${escAttr(title)}">
          <span class="gn-course-nav__day-num">${String(d.n).padStart(2, '0')}</span>
          <span class="gn-course-nav__day-title">${escAttr(shortTitle(d.title, 50))}</span>
          <span class="gn-course-nav__day-status" aria-hidden="true">${done ? '✓' : ''}</span>
        </a>`;
        })
        .join('');
      return `<details class="gn-course-week" data-week="${w}">
      <summary class="gn-course-week__summary">
        <span class="gn-course-week__n">Week ${w}</span>
        <span class="gn-course-week__hint">${escAttr(shortTitle(WEEK_TITLES[w], 40))}</span>
      </summary>
      <div class="gn-course-week__list">${weekLinks}</div>
    </details>`;
    })
    .join('');

  const overviewActive = activeDay == null ? ' gn-course-nav__link--active' : '';

  el.innerHTML = `
    <div class="gn-course-nav-shell gn-course-nav-shell--${variant}">
      <nav class="gn-course-nav" aria-label="Course outline">
        <div class="gn-course-nav__head">
          <span class="gn-course-nav__kicker">Course</span>
          <button type="button" class="gn-course-nav-drawer-x" aria-label="Close outline">×</button>
        </div>
        <a href="dashboard.html#overview" class="gn-course-nav__link${overviewActive}">Overview</a>
        <a href="dashboard.html#lessons" class="gn-course-nav__link">Lessons</a>
        <a href="timeline.html" class="gn-course-nav__link gn-course-nav__link--sub">Timeline</a>
        <div class="gn-course-nav__divider" role="presentation"></div>
        ${weekBlocks}
        <div class="gn-course-nav__legend" aria-hidden="true">
          <span><i class="lgd lgd-cur"></i>Here</span>
          <span><i class="lgd lgd-done"></i>Done</span>
          <span><i class="lgd lgd-lock"></i>Locked</span>
        </div>
      </nav>
    </div>`;

  el.classList.remove('gn-day-rail-host--embedded', 'gn-day-rail-host--sidebar');
  el.classList.add(variant === 'embedded' ? 'gn-day-rail-host--embedded' : 'gn-day-rail-host--sidebar');

  const drawerX = el.querySelector('.gn-course-nav-drawer-x');
  drawerX?.addEventListener('click', () => {
    document.body.classList.remove('gn-course-nav-drawer-open');
    document.getElementById('gnCourseNavBackdrop')?.classList.remove('is-visible');
    document.getElementById('gnCourseNavTrigger')?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });

  if (variant === 'sidebar') {
    document.body.classList.add('gn-has-course-nav');
    syncCourseWeekOpenState(activeDay);
    window.addEventListener(
      'resize',
      () => {
        syncCourseWeekOpenState(activeDay);
        if (window.matchMedia('(min-width: 900px)').matches) {
          document.body.classList.remove('gn-course-nav-drawer-open');
          document.body.style.overflow = '';
          document.getElementById('gnCourseNavBackdrop')?.classList.remove('is-visible');
          document.getElementById('gnCourseNavTrigger')?.setAttribute('aria-expanded', 'false');
        }
      },
      { signal: courseNavAbort.signal },
    );
    initCourseNavDrawer(el);
    requestAnimationFrame(() => {
      el.querySelector('.gn-course-nav__day--current')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  } else {
    syncCourseWeekOpenState(activeDay);
  }
}

/** Same as named export; also on mountDayRail for pages that only import mountDayRail (avoids stale-cache named export issues). */
mountDayRail.teardownCourseNavUI = teardownCourseNavUI;

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
    teardownCourseNavUI();
    host.style.display = 'none';
    host.innerHTML = '';
    host.setAttribute('aria-hidden', 'true');
    return;
  }
  host.style.display = 'block';
  host.removeAttribute('aria-hidden');
  mountDayRail(host, { activeDay: activeDay ?? null, scheduleMap: state.scheduleMap, doneSet: state.doneSet, variant: 'sidebar' });
}
