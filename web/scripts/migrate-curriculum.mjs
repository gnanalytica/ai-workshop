#!/usr/bin/env node
/**
 * One-shot migration: copy ../content/day-XX.md → ./content/day-XX.mdx.
 *
 * The file is mostly compatible — both are markdown with YAML frontmatter.
 * The only fixups we need:
 *   • escape stray `<` characters in body that would parse as JSX in MDX
 *   • escape `{` / `}` in body that would be treated as expressions
 *
 * We're conservative: only escape things that are clearly text (e.g.
 * "<5 minutes" or "{your name}"), not legit HTML/JSX (e.g. "<a>", "<br/>").
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "../../content");
const DST = path.resolve(__dirname, "../content");

function escapeBodyForMdx(body) {
  // Skip fenced code blocks — leave them alone.
  const out = [];
  const lines = body.split("\n");
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    let safe = line;
    // Escape `<` followed by digit or whitespace: "<5 minutes", "< 100"
    safe = safe.replace(/<(?=\s|\d)/g, "&lt;");
    // Escape `{...}` placeholders that aren't valid JS expressions.
    safe = safe.replace(/\{([^{}\n]*?[^a-zA-Z0-9_.\s][^{}\n]*?)\}/g, (m) => {
      // If it looks like a code-y identifier, leave it; otherwise escape.
      return m.startsWith("{`") ? m : m.replaceAll("{", "&#123;").replaceAll("}", "&#125;");
    });
    out.push(safe);
  }
  return out.join("\n");
}

async function main() {
  await fs.mkdir(DST, { recursive: true });
  const files = (await fs.readdir(SRC)).filter((f) => /^day-\d{2}\.md$/.test(f));
  files.sort();
  let count = 0;
  for (const name of files) {
    const src = await fs.readFile(path.join(SRC, name), "utf8");
    const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
    let frontmatter = "";
    let body = src;
    if (m) {
      frontmatter = m[0];
      body = src.slice(m[0].length);
    }
    const safeBody = escapeBodyForMdx(body);
    const dstName = name.replace(/\.md$/, ".mdx");
    await fs.writeFile(path.join(DST, dstName), `${frontmatter}${safeBody}`, "utf8");
    count++;
  }
  console.log(`Migrated ${count} curriculum files → ${DST}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
