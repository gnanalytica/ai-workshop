// Full faculty handbook and public lab setup — embedded in faculty.html (same origin, shared auth).

/**
 * @param {{ container: HTMLElement }} ctx
 */
export async function renderFacultyHandbookEmbed({ container }) {
  container.innerHTML = `
  <div class="add-card" style="padding:0;overflow:hidden">
    <p class="muted" style="font-size:13px;padding:12px 16px;margin:0;border-bottom:1px solid var(--line);line-height:1.5">
      Program handbook, triage, contacts, and pre-session checklist (same as <a href="faculty-guide.html" target="_blank" rel="noopener">faculty-guide.html</a>).
    </p>
    <iframe
      id="facHandbookFrame"
      class="fac-doc-embed"
      title="Faculty program handbook"
      src="faculty-guide.html"
      loading="lazy"
    ></iframe>
  </div>`;
}

/**
 * @param {{ container: HTMLElement }} ctx
 */
export async function renderLabSetupEmbed({ container }) {
  container.innerHTML = `
  <div class="add-card" style="padding:0;overflow:hidden">
    <p class="muted" style="font-size:13px;padding:12px 16px;margin:0;border-bottom:1px solid var(--line);line-height:1.5">
      Public Windows lab install steps (same as <a href="setup-guide.html" target="_blank" rel="noopener">setup-guide.html</a> for a standalone window).
    </p>
    <iframe
      id="facLabSetupFrame"
      class="fac-doc-embed"
      title="Lab setup guide"
      src="setup-guide.html"
      loading="lazy"
    ></iframe>
  </div>`;
}
