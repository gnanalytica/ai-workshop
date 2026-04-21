// Nav search → find.html (glass pill, ⌘/Ctrl+K to focus).

function bindGlobalFindShortcut() {
  if (window.__gnNavFindShortcut) return;
  window.__gnNavFindShortcut = true;
  document.addEventListener(
    'keydown',
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key.toLowerCase() !== 'k') return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      const inp = document.getElementById('siteNavFindQ');
      if (!inp) return;
      e.preventDefault();
      inp.focus();
      if (typeof inp.select === 'function') inp.select();
    },
    true,
  );
}

export function prependNavFind(root = document) {
  const navIn = root.querySelector('nav .nav-in');
  if (!navIn) return;
  const right = navIn.children[navIn.children.length - 1];
  if (!right || right.querySelector('.site-search--nav')) return;
  const isMac = /Mac|iPhone|iPad/i.test(navigator.userAgent || '');
  const kbd = isMac ? '⌘K' : 'Ctrl K';
  right.insertAdjacentHTML(
    'afterbegin',
    `<form class="site-search site-search--nav" action="find.html" method="get" role="search" title="Search workshop (Enter). ${kbd} from anywhere.">
      <span class="site-search__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="m14 14 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </span>
      <label class="sr-only" for="siteNavFindQ">Search workshop</label>
      <input class="site-search__input" type="search" id="siteNavFindQ" name="q" placeholder="Search workshop…" autocomplete="off" maxlength="200" enterkeyhint="search" />
      <kbd class="site-search__kbd" aria-hidden="true">${kbd}</kbd>
    </form>`,
  );
  bindGlobalFindShortcut();
}
