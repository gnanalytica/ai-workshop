// Shared admin/faculty auth helper.
// Exposes checkAdminOrFaculty(user, supabase) -> { isAdmin, isFaculty, facultyCohortIds }
// and scopeCohortsQuery(query, state) to restrict cohorts for faculty.

import { supabase } from './supabase.js';

/** Cohort staff without is_admin: in-room support only (not curriculum, grading, or roster ops). */
export function isSupportFacultyOnly(isAdmin, isFaculty) {
  return Boolean(isFaculty && !isAdmin);
}

export async function checkAdminOrFaculty(user) {
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  const { data: facRows } = await supabase.from('cohort_faculty').select('cohort_id').eq('user_id', user.id);
  const isAdmin = !!profile?.is_admin;
  const facultyCohortIds = (facRows || []).map(r => r.cohort_id);
  const isFaculty = facultyCohortIds.length > 0;
  window.isAdmin = isAdmin;
  window.facultyCohortIds = facultyCohortIds;
  return { isAdmin, isFaculty, facultyCohortIds };
}

// -----------------------------------------------------------------
// New role model (see docs/superpowers/specs/2026-04-24-role-reorg-*).
// Additive — does not replace checkAdminOrFaculty. Plan 2 migrates
// call sites one by one and eventually removes the old helper.
// -----------------------------------------------------------------

/**
 * resolveRoles — single source of truth for what the current user can do.
 * @param {Object} user - Supabase auth user (from getSession().data.session.user)
 * @param {string|null} cohortId - currently selected cohort, or null for platform-wide pages
 * @returns {Promise<{
 *   user: Object,
 *   staffRoles: Set<string>,
 *   collegeRole: ('support'|'executive'|null),
 *   facultyCohortIds: string[],
 *   executiveCohortIds: string[],
 *   can: Object
 * }>}
 */
export async function resolveRoles(user, cohortId = null) {
  if (!user) {
    return { user: null, staffRoles: new Set(), collegeRole: null,
      facultyCohortIds: [], executiveCohortIds: [], can: computeCaps(new Set(), null) };
  }
  const [{ data: profile }, { data: facRows }] = await Promise.all([
    supabase.from('profiles').select('staff_roles, is_admin').eq('id', user.id).maybeSingle(),
    supabase.from('cohort_faculty').select('cohort_id, college_role').eq('user_id', user.id),
  ]);
  const staffRoles = new Set(Array.isArray(profile?.staff_roles) ? profile.staff_roles : []);
  // Bridge: if staff_roles wasn't backfilled for this user (shouldn't happen
  // post-migration, but guard anyway), fall back to is_admin.
  if (staffRoles.size === 0 && profile?.is_admin) {
    staffRoles.add('admin'); staffRoles.add('trainer');
  }
  const rows = facRows || [];
  const facultyCohortIds = rows.map(r => r.cohort_id);
  const executiveCohortIds = rows.filter(r => r.college_role === 'executive').map(r => r.cohort_id);
  const collegeRole = cohortId
    ? (rows.find(r => r.cohort_id === cohortId)?.college_role || null)
    : null;
  return {
    user, staffRoles, collegeRole, facultyCohortIds, executiveCohortIds,
    can: computeCaps(staffRoles, collegeRole),
  };
}

/** Role-to-capability map. UI gates MUST read from can.*, not role names. */
function computeCaps(staffRoles, collegeRole) {
  const isAdmin = staffRoles.has('admin');
  const isTrainer = staffRoles.has('trainer');
  const isTech = staffRoles.has('tech_support');
  const isSupport = collegeRole === 'support';
  const isExec = collegeRole === 'executive';
  return {
    // Platform
    managePlatform: isAdmin,
    manageUsers: isAdmin,
    // Content
    editContent: isAdmin || isTrainer,
    // Grading (cohort-scoped — null cohortId -> false)
    grade: isAdmin || isTrainer || isSupport,
    gradeAnyPod: isAdmin || isTrainer,
    // Attendance
    markAttendance: isAdmin || isTrainer || isSupport,
    markAttendanceAnyPod: isAdmin || isTrainer,
    // Announcements
    postAnnouncement: isAdmin || isTrainer || isExec,
    deleteOwnAnnouncement: true,  // anyone who posted can soft-delete their own
    // Analytics
    viewCohortAnalytics: isAdmin || isTrainer || isExec,
    exportCohortData: isAdmin || isTrainer || isExec,
    // Pods
    managePods: isAdmin || isTrainer,
    // Stuck queue
    respondStuckTech: isAdmin || isTrainer || isTech,
    respondStuckAny: isAdmin || isTrainer || isSupport,
    // Board (Plan 3 — shipped here so gates exist when board lands)
    postOnBoard: true,
    moderateBoard: isAdmin || isTrainer || isTech,
  };
}

export function applyFacultyBrandLabel(isAdmin, isFaculty) {
  if (!isAdmin && isFaculty) {
    const brand = document.querySelector('.brand');
    if (brand && brand.lastChild) brand.lastChild.textContent = ' Gnanalytica · Faculty';
  }
}

// Returns the "no cohort" HTML message.
export const NO_COHORT_MSG = `<div style="padding:40px;text-align:center;color:var(--muted)">You're not assigned to any cohort yet — ask an admin.</div>`;

// Renders a small view-switcher pill for users who are BOTH admin and faculty.
// currentView is 'admin' (on any admin-*.html page) or 'faculty' (on faculty.html).
// Returns '' for users who only have one role.
export function renderViewSwitcher(isAdmin, isFaculty, currentView) {
  if (!(isAdmin && isFaculty)) return '';
  const target = currentView === 'admin' ? 'faculty.html' : 'admin-home.html';
  const label = currentView === 'admin' ? 'Faculty view →' : 'Admin view →';
  return `<a href="${target}" class="view-switch" style="padding:6px 12px;border-radius:999px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;background:rgba(120,170,255,.12);color:#7aa7ff;border:1px solid rgba(120,170,255,.3);text-decoration:none;font-weight:600">${label}</a>`;
}

/** Dropdown body: admin↔faculty switch (if both) + sign out. Used on faculty.html nav account menu. */
export function renderAccountMenuHtml(isAdmin, isFaculty, currentView) {
  const switcher = renderViewSwitcher(isAdmin, isFaculty, currentView);
  const sw = switcher
    ? `<div style="padding:4px 0;border-bottom:1px solid var(--line);margin-bottom:4px">${switcher.replace(
        'class="view-switch"',
        'class="view-switch" style="display:block;text-align:center;padding:8px 10px"',
      )}</div>`
    : '';
  return `${sw}<button type="button" id="facAcctSignout" style="width:100%;text-align:left;padding:10px 12px;border:none;background:transparent;font:inherit;cursor:pointer;color:var(--ink);border-radius:10px">Sign out</button>`;
}

// Post-sign-in router: send faculty-only users to faculty.html.
// Admins and students are left alone so existing flows (admin index, dashboard)
// keep their current behavior. Returns true if a redirect was initiated.
export async function routeAfterSignIn(user) {
  if (!user) return false;
  try {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    if (profile?.is_admin) return false;
    const { data: fac } = await supabase.from('cohort_faculty').select('cohort_id').eq('user_id', user.id).limit(1);
    if (fac && fac.length) {
      // Avoid redirect loop if we're already on faculty.html.
      if (!/faculty\.html(\?|#|$)/.test(window.location.pathname + window.location.search + window.location.hash)) {
        window.location.href = 'faculty.html';
        return true;
      }
    }
  } catch (_) { /* non-critical */ }
  return false;
}
