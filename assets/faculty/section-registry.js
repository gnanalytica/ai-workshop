/**
 * Task-based faculty hub: canonical section ids, legacy hash mapping, and nav sync.
 * Used by faculty.html (single-page sections + deep links from admin-home, etc.).
 */

/** Public section ids (order = left-to-right in task nav) */
export const SECTION_ORDER = [
  'today',
  'students',
  'stuck-attendance',
  'schedule',
  'review',
  'handbook',
  'training',
];

/** Map old tab / bookmark hashes to canonical section ids */
const LEGACY_ALIASES = {
  stream: 'today',
  today: 'today',
  people: 'students',
  'my-pod': 'students',
  cohort: 'students',
  agenda: 'schedule',
  grades: 'review',
  analytics: 'review',
  guide: 'handbook',
  handbook: 'handbook',
  // self
  'stuck-attendance': 'stuck-attendance',
  stuck: 'stuck-attendance',
};

/**
 * @param {string} [rawHash] - e.g. location.hash "#people" or "#"
 * @returns {string} canonical section id
 */
export function normalizeFacultyHash(rawHash) {
  let h = String(rawHash || '').trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (!h) return 'today';
  const first = h.split(/[=&]/)[0];
  if (LEGACY_ALIASES[first] != null) return LEGACY_ALIASES[first];
  if (SECTION_ORDER.includes(first)) return first;
  return 'today';
}

/**
 * @param {string} sectionId
 * @param {{ replace?: boolean }} [opts]
 */
export function setFacultyHash(sectionId, opts = {}) {
  if (!SECTION_ORDER.includes(sectionId)) return;
  const { replace = false } = opts;
  const next = `#${sectionId}`;
  if (replace) {
    const u = new URL(window.location.href);
    u.hash = next;
    history.replaceState(null, '', `${u.pathname}${u.search}${u.hash}`);
  } else {
    if (window.location.hash !== next) {
      window.location.hash = next;
    }
  }
}

/**
 * Update .fac-hub-nav a.fac-hub-nav__link--active to match `sectionId`.
 * @param {string} sectionId
 */
export function setActiveFacultyNav(sectionId) {
  document.querySelectorAll('[data-fac-section]').forEach((el) => {
    const id = el.getAttribute('data-fac-section');
    const on = id === sectionId;
    if (el.tagName === 'A') {
      el.setAttribute('aria-current', on ? 'true' : 'false');
      el.classList.toggle('fac-hub-nav__link--active', on);
    }
  });
}

/**
 * @param {string} sectionId
 * @param {{ behavior?: ScrollBehavior }} [opts]
 */
export function scrollToFacultySection(sectionId, opts = {}) {
  const el = document.getElementById(`fac-sec-${sectionId}`);
  if (el) el.scrollIntoView({ behavior: opts.behavior || 'smooth', block: 'start' });
}
