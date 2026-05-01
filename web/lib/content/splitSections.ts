/**
 * Split a markdown body by top-level `## ` headings into named sections.
 *
 * The lesson MDX files use `##` for the major beats of a phase ("Today's
 * objective", "Pre-class · ~20 min", etc). The reader renders one section at
 * a time so students aren't staring at a textbook scroll.
 *
 * Behavior:
 *  - Content before the first `## ` becomes a section titled `null` (intro).
 *  - Each `## ` line starts a new section; its title is the rest of the line.
 *  - If the body has zero `## ` headings, returns a single null-titled section.
 */

export interface MdSection {
  /** The H2 line text without the leading "## ", or null for a pre-heading intro chunk. */
  title: string | null;
  /** Markdown body for this section (does NOT include the heading line itself). */
  body: string;
}

const H2_LINE = /^## +(.+?)\s*$/;

export function splitByH2(source: string): MdSection[] {
  if (!source || !source.trim()) return [];
  const lines = source.split(/\r?\n/);
  const sections: MdSection[] = [];
  let currentTitle: string | null = null;
  let buf: string[] = [];

  const flush = () => {
    const body = buf.join("\n").trim();
    if (currentTitle != null || body.length > 0) {
      sections.push({ title: currentTitle, body });
    }
    buf = [];
  };

  for (const line of lines) {
    const m = H2_LINE.exec(line);
    if (m) {
      flush();
      currentTitle = (m[1] ?? "").trim();
    } else {
      buf.push(line);
    }
  }
  flush();

  return sections;
}
