/**
 * Lexical retrieval over the workshop handbook + curriculum.
 *
 * No vector DB — just a tiny BM25-like score (term frequency + inverse-doc
 * frequency + title-match boost) over an in-memory corpus assembled at first
 * call. The corpus is small (~tens of chunks) so this stays well under 50ms.
 *
 * Sources merged into the index:
 *   - `faculty_pretraining_modules` rows (faculty-only, DB-backed handbook)
 *   - Static admin/student handbook copy → `help-corpus.ts`
 *   - Curriculum days (`web/content/day-XX.mdx`) — visible to everyone
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseService } from "@/lib/supabase/service";
import { STATIC_HANDBOOK_CORPUS } from "./help-corpus";
import type { Persona } from "@/lib/auth/persona";

export type CorpusPersona = Persona | "all";

export interface CorpusChunk {
  slug: string;
  /** Citation tag used in the assistant's response: `[handbook:slug]` or `[day-N]`. */
  citation: string;
  source: "faculty_handbook" | "admin_handbook" | "student_handbook" | "curriculum";
  persona: CorpusPersona;
  title: string;
  /** Best snippet for UI display (kept short — first ~400 chars). */
  snippet: string;
  /** Full text used for scoring (may be longer than `snippet`). */
  text: string;
  /** Anchor link in the app (handbook tab, day page, etc.). */
  href: string;
}

export interface RetrievedChunk {
  slug: string;
  anchor: string;
  snippet: string;
  source: CorpusChunk["source"];
  citation: string;
  title: string;
  href: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const CHUNK_TARGET_CHARS = 400;
const STOPWORDS = new Set([
  "the","a","an","and","or","but","of","to","in","on","for","with","is","are",
  "be","by","at","as","it","this","that","you","your","we","our","i","my","do",
  "does","how","what","when","where","why","can","should","will","just","not",
  "if","so","from","into","about","than","then","also","more","less","one","two",
]);

let cachedIndex: Promise<CorpusChunk[]> | null = null;

/** Reset the in-memory index (used by tests). */
export function _resetHelpRetrievalCacheForTests() {
  cachedIndex = null;
}

async function buildIndex(): Promise<CorpusChunk[]> {
  const chunks: CorpusChunk[] = [];

  // 1) Static handbook (admin + student) — already chunked.
  for (const entry of STATIC_HANDBOOK_CORPUS) {
    chunks.push({
      slug: entry.slug,
      citation: `[handbook:${entry.slug}]`,
      source: entry.persona === "admin" ? "admin_handbook" : "student_handbook",
      persona: entry.persona,
      title: entry.title,
      snippet: trimSnippet(entry.text),
      text: `${entry.title}\n\n${entry.text}`,
      href: entry.href,
    });
  }

  // 2) Faculty handbook (DB-backed). Failures are non-fatal.
  try {
    const svc = getSupabaseService();
    const { data, error } = await svc
      .from("faculty_pretraining_modules")
      .select("slug, title, body_md, ordinal");
    if (!error && data) {
      for (const row of data as Array<{
        slug: string;
        title: string;
        body_md: string | null;
      }>) {
        const body = row.body_md ?? "";
        const paragraphs = splitParagraphs(body);
        paragraphs.forEach((para, i) => {
          const id = `${row.slug}#${i}`;
          chunks.push({
            slug: id,
            citation: `[handbook:${row.slug}]`,
            source: "faculty_handbook",
            persona: "faculty",
            title: row.title,
            snippet: trimSnippet(para),
            text: `${row.title}\n\n${para}`,
            href: `/faculty/handbook#${row.slug}`,
          });
        });
      }
    }
  } catch (err) {
    console.warn("[help-retrieval] faculty modules unavailable", err);
  }

  // 3) Curriculum days — read MDX files from disk.
  try {
    const entries = await fs.readdir(CONTENT_DIR);
    for (const name of entries.filter((n) => /^day-\d+\.mdx$/.test(n))) {
      const match = name.match(/^day-(\d+)\.mdx$/);
      if (!match) continue;
      const dayNum = Number(match[1]);
      const raw = await fs.readFile(path.join(CONTENT_DIR, name), "utf8");
      const { title, body } = stripFrontmatter(raw);
      const paragraphs = splitParagraphs(body);
      paragraphs.forEach((para, i) => {
        chunks.push({
          slug: `day-${dayNum}#${i}`,
          citation: `[day-${dayNum}]`,
          source: "curriculum",
          persona: "all",
          title: title ?? `Day ${dayNum}`,
          snippet: trimSnippet(para),
          text: `${title ?? `Day ${dayNum}`}\n\n${para}`,
          href: `/day/${dayNum}`,
        });
      });
    }
  } catch (err) {
    console.warn("[help-retrieval] curriculum unavailable", err);
  }

  return chunks;
}

function getIndex(): Promise<CorpusChunk[]> {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex;
}

/** Top-K chunks for `query`, scoped to chunks visible to `persona`. */
export async function retrieveHelp(
  query: string,
  persona: Persona,
  k = 5,
): Promise<RetrievedChunk[]> {
  const index = await getIndex();
  const visible = index.filter((c) => c.persona === "all" || c.persona === persona);
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  // Build doc-frequency map across the visible subset.
  const df = new Map<string, number>();
  for (const c of visible) {
    const seen = new Set<string>();
    for (const t of tokenize(c.text)) {
      if (!seen.has(t)) {
        seen.add(t);
        df.set(t, (df.get(t) ?? 0) + 1);
      }
    }
  }

  const N = visible.length || 1;
  const scored = visible.map((c) => {
    const docTokens = tokenize(c.text);
    const titleTokens = new Set(tokenize(c.title));
    let score = 0;
    for (const q of tokens) {
      const tf = docTokens.filter((t) => t === q).length;
      if (tf === 0) continue;
      const idf = Math.log(1 + N / (1 + (df.get(q) ?? 0)));
      score += (tf / (tf + 1.5)) * idf;
      if (titleTokens.has(q)) score += 1.0; // title boost
    }
    return { chunk: c, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ chunk }) => ({
      slug: chunk.slug,
      anchor: chunk.href,
      snippet: chunk.snippet,
      source: chunk.source,
      citation: chunk.citation,
      title: chunk.title,
      href: chunk.href,
    }));
}

// ---------- helpers ---------------------------------------------------------

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function splitParagraphs(text: string): string[] {
  const out: string[] = [];
  for (const block of text.split(/\n\s*\n/)) {
    const cleaned = block.replace(/\s+/g, " ").trim();
    if (!cleaned) continue;
    if (cleaned.length <= CHUNK_TARGET_CHARS * 1.5) {
      out.push(cleaned);
      continue;
    }
    // soft-wrap long blocks at sentence boundaries
    const sentences = cleaned.split(/(?<=[.!?])\s+/);
    let buf = "";
    for (const s of sentences) {
      if ((buf + " " + s).length > CHUNK_TARGET_CHARS && buf) {
        out.push(buf.trim());
        buf = s;
      } else {
        buf = buf ? `${buf} ${s}` : s;
      }
    }
    if (buf) out.push(buf.trim());
  }
  return out;
}

function trimSnippet(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= CHUNK_TARGET_CHARS) return flat;
  return flat.slice(0, CHUNK_TARGET_CHARS).trimEnd() + "…";
}

function stripFrontmatter(raw: string): { title: string | null; body: string } {
  let title: string | null = null;
  let body = raw;
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end > 0) {
      const fm = raw.slice(3, end);
      const m = fm.match(/^topic:\s*(.+)$/m) ?? fm.match(/^title:\s*(.+)$/m);
      if (m && m[1]) title = m[1].replace(/^["']|["']$/g, "").trim();
      body = raw.slice(end + 4).replace(/^\n/, "");
    }
  }
  return { title, body };
}
