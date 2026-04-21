export const ADMIN_PAGES = [
  { href: 'admin-home.html',       label: 'Home' },
  { href: 'admin.html',            label: 'Registrations' },
  { href: 'admin-schedule.html',   label: 'Schedule' },
  { href: 'admin-content.html',    label: 'Content' },
  { href: 'admin-teams.html',      label: 'Teams' },
  { href: 'admin-attendance.html', label: 'Attendance' },
  { href: 'admin-orgs.html',       label: 'Orgs & codes', adminOnly: true },
  { href: 'admin-analytics.html',  label: 'Analytics' },
  { href: 'admin-activity.html',   label: 'Activity' },
  { href: 'admin-stuck.html',      label: 'Stuck queue' },
  { href: 'admin-polls.html',      label: 'Polls' },
  { href: 'admin-announcements.html', label: 'Announcements' },
  { href: 'admin-student.html',    label: 'Student work' },
  { href: 'admin-faculty.html',    label: 'Faculty', adminOnly: true },
  { href: 'admin-pods.html',       label: 'Pods' },
];

export function renderAdminNav(active, opts = {}) {
  const { role = 'admin' } = opts; // 'admin' | 'faculty'
  // alsoFaculty: caller can pass it explicitly; otherwise infer from
  // window.facultyCohortIds (set by checkAdminOrFaculty).
  const alsoFaculty = typeof opts.alsoFaculty === 'boolean'
    ? opts.alsoFaculty
    : Array.isArray(window.facultyCohortIds) && window.facultyCohortIds.length > 0;
  const pages = ADMIN_PAGES.filter(p => !p.adminOnly || role === 'admin');
  const items = pages.map(p => {
    const isActive = p.href === active;
    return `<a href="${p.href}" style="padding:8px 14px;border-radius:999px;font-size:13px;${isActive ? 'background:var(--accent);color:var(--cta-ink);font-weight:600' : 'color:var(--muted);border:1px solid var(--line)'}">${p.label}</a>`;
  }).join('');
  const badge = role === 'faculty'
    ? `<span style="padding:4px 10px;border-radius:999px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;background:rgba(120,170,255,.12);color:#7aa7ff;border:1px solid rgba(120,170,255,.3)">Faculty</span>`
    : '';
  // Switcher: only when the signed-in user has BOTH roles.
  const switcher = (role === 'admin' && alsoFaculty)
    ? `<a href="faculty.html" class="view-switch" style="padding:6px 12px;border-radius:999px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;background:rgba(120,170,255,.12);color:#7aa7ff;border:1px solid rgba(120,170,255,.3);text-decoration:none;font-weight:600">Faculty view →</a>`
    : '';
  const trailing = (badge || switcher)
    ? `<span style="margin-left:auto;display:flex;gap:8px;align-items:center">${badge}${switcher}</span>`
    : '';
  return `<div class="admin-nav-wrap" style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">${items}${trailing}</div>`;
}
