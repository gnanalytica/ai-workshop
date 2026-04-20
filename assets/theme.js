// Theme manager: dark (default) <-> light. Preference stored in localStorage.theme.
// The <html data-theme="..."> attribute drives CSS variables in app.css.

export function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.dataset.theme = saved;
}

export function getTheme() {
  return document.documentElement.dataset.theme || 'dark';
}

export function setTheme(next) {
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
}

export function toggleTheme() {
  const current = getTheme();
  setTheme(current === 'dark' ? 'light' : 'dark');
}

// Icon convention: show the icon representing the state we'd switch TO.
// In dark mode, show the SUN (click to go light).
// In light mode, show the MOON (click to go dark).
const MOON_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const SUN_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

export function renderThemeToggle() {
  return `<button class="theme-toggle" id="themeToggle" title="Toggle light/dark" aria-label="Toggle theme"></button>`;
}

function paintIcon(btn) {
  const theme = getTheme();
  btn.innerHTML = theme === 'dark' ? SUN_SVG : MOON_SVG;
  btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
}

export function wireThemeToggle(root = document) {
  const btn = root.getElementById ? root.getElementById('themeToggle') : document.getElementById('themeToggle');
  if (!btn) return;
  paintIcon(btn);
  btn.addEventListener('click', () => {
    toggleTheme();
    paintIcon(btn);
  });
  document.addEventListener('themechange', () => paintIcon(btn));
}

// Auto-init on import so data-theme is correct before paint (when imported early).
initTheme();

// Flash-of-unauthenticated-content (FOUC-auth) guard.
// Pages keep body hidden (via `html:not(.ready) body { visibility:hidden }` in app.css)
// until Supabase auth settles. We import supabase here lazily so this module
// stays lightweight for pages that don't need auth.
(async function markReady() {
  const reveal = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.documentElement.classList.add('ready');
    }));
  };
  // Failsafe: reveal no later than 900ms regardless of auth state.
  const failsafe = setTimeout(reveal, 900);
  try {
    const { supabase } = await import('./supabase.js');
    await supabase.auth.getSession();
  } catch (_) {}
  clearTimeout(failsafe);
  reveal();
})();
