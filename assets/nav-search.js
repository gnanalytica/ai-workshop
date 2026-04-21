// Compact nav search → find.html (lessons + shortcuts to people/admin surfaces).

export function prependNavFind(root = document) {
  const navIn = root.querySelector('nav .nav-in');
  if (!navIn) return;
  const right = navIn.children[navIn.children.length - 1];
  if (!right || right.querySelector('.site-nav-search')) return;
  right.insertAdjacentHTML(
    'afterbegin',
    `<form class="site-nav-search" action="find.html" method="get" role="search" title="Search lessons and jump to people tools">
      <label class="sr-only" for="siteNavFindQ">Search</label>
      <input type="search" id="siteNavFindQ" name="q" placeholder="Find…" autocomplete="off" maxlength="200" />
      <button type="submit" class="site-nav-search-btn" aria-label="Open search">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="m14 14 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    </form>`,
  );
}
