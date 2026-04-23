// Grouped sidebar nav for admin/faculty pages. Call wrapAdminMainLayout() after setting #adminNav innerHTML.

export const ADMIN_PAGES = [
  { href: 'admin-home.html', label: 'Home', group: 'cohort' },
  { href: 'admin-schedule.html', label: 'Schedule', group: 'cohort' },
  { href: 'admin-content.html', label: 'Content', group: 'classwork' },
  { href: 'admin.html', label: 'Registrations', group: 'people' },
  { href: 'admin-teams.html', label: 'Teams', group: 'people' },
  { href: 'admin-pods.html', label: 'Pods', group: 'people' },
  { href: 'admin-faculty.html', label: 'Faculty', group: 'people', adminOnly: true },
  { href: 'admin-orgs.html', label: 'Orgs & codes', group: 'people', adminOnly: true },
  { href: 'admin-student.html', label: 'Student work', group: 'work' },
  { href: 'admin-attendance.html', label: 'Attendance', group: 'work' },
  { href: 'admin-stuck.html', label: 'Stuck queue', group: 'work' },
  { href: 'admin-analytics.html', label: 'Analytics', group: 'insights' },
  { href: 'admin-faculty-lms.html', label: 'Faculty LMS', group: 'insights', adminOnly: true },
];

const GROUP_LABEL = {
  cohort: 'Cohort',
  classwork: 'Classwork',
  people: 'People',
  work: 'Work',
  insights: 'Insights',
};

/** Move all siblings after #adminNav into .admin-main and mark #panel as admin-shell. */
export function wrapAdminMainLayout() {
  const panel = document.getElementById('panel');
  if (!panel || panel.dataset.adminShell === '1') return;
  const nav = document.getElementById('adminNav');
  if (!nav || nav.parentElement !== panel) return;
  const wrap = document.createElement('div');
  wrap.className = 'admin-main';
  while (nav.nextSibling) {
    wrap.appendChild(nav.nextSibling);
  }
  panel.appendChild(wrap);
  panel.classList.add('admin-shell');
  panel.dataset.adminShell = '1';
}

export function renderAdminNav(active, opts = {}) {
  const { role = 'admin' } = opts;
  const alsoFaculty =
    typeof opts.alsoFaculty === 'boolean'
      ? opts.alsoFaculty
      : Array.isArray(window.facultyCohortIds) && window.facultyCohortIds.length > 0;
  const pages = ADMIN_PAGES.filter((p) => !p.adminOnly || role === 'admin');

  const byGroup = {};
  pages.forEach((p) => {
    const g = p.group || 'cohort';
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(p);
  });

  const groupOrder = ['cohort', 'classwork', 'people', 'work', 'insights'];
  const navBlocks = groupOrder
    .filter((g) => byGroup[g]?.length)
    .map((g) => {
      const links = byGroup[g]
        .map((p) => {
          const isActive = p.href === active;
          return `<a href="${p.href}" class="admin-nav-link${isActive ? ' admin-nav-link--active' : ''}">${p.label}</a>`;
        })
        .join('');
      return `<div class="admin-nav-group">
        <div class="admin-nav-group__label">${GROUP_LABEL[g] || g}</div>
        ${links}
      </div>`;
    })
    .join('');

  const badge =
    role === 'faculty'
      ? `<span class="admin-nav-badge">Faculty</span>`
      : '';
  const switcher =
    role === 'admin' && alsoFaculty
      ? `<a href="faculty.html" class="admin-nav-switch">Faculty view →</a>`
      : '';

  return `<aside class="admin-nav-aside" aria-label="Admin navigation">
    ${navBlocks}
    <div class="admin-nav-footer">${badge}${switcher}</div>
  </aside>`;
}
