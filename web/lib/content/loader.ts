import { promises as fs } from "node:fs";
import path from "node:path";
import { dayFrontmatterSchema, type DayFrontmatter } from "./schema";

export interface LoadedDay {
  meta: DayFrontmatter;
  body: string;
  raw: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Split YAML frontmatter (`--- ... ---`) from a markdown source. */
export function splitFrontmatter(source: string): { meta: unknown; body: string } {
  if (!source.startsWith("---")) return { meta: {}, body: source };
  const end = source.indexOf("\n---", 3);
  if (end < 0) return { meta: {}, body: source };
  const yaml = source.slice(3, end).trim();
  const body = source.slice(end + 4).replace(/^\n/, "");
  return { meta: parseYamlSubset(yaml), body };
}

/**
 * Tiny YAML parser supporting the subset used in our day frontmatter:
 * key: value, key: "string", nested objects (one level), arrays of scalars,
 * arrays of inline objects ({ name: x, url: y }), booleans, numbers.
 *
 * We avoid a full YAML dependency because the format is well-controlled.
 */
function parseYamlSubset(yaml: string): Record<string, unknown> {
  const lines = yaml.split("\n");
  const out: Record<string, unknown> = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }
    const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
    if (!match) {
      i++;
      continue;
    }
    const indent = match[1]?.length ?? 0;
    const key = (match[2] ?? "").trim();
    const value = (match[3] ?? "").trim();

    if (indent === 0) {
      if (value === "") {
        // nested block: collect indented children
        const children: string[] = [];
        i++;
        while (i < lines.length && (lines[i] ?? "").startsWith("  ")) {
          children.push(lines[i] as string);
          i++;
        }
        out[key] = parseBlock(children);
      } else {
        out[key] = parseScalarOrInline(value);
        i++;
      }
    } else {
      i++;
    }
  }

  return out;
}

function parseBlock(lines: string[]): unknown {
  if (lines.length === 0) return null;
  const first = (lines[0] ?? "").trim();
  if (first.startsWith("- ")) {
    return lines
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- "))
      .map((l) => parseScalarOrInline(l.slice(2).trim()));
  }
  // nested object: parse key: value pairs
  const obj: Record<string, unknown> = {};
  for (const l of lines) {
    const m = l.match(/^\s+([^:]+):\s*(.*)$/);
    if (m) obj[(m[1] ?? "").trim()] = parseScalarOrInline((m[2] ?? "").trim());
  }
  return obj;
}

function parseScalarOrInline(value: string): unknown {
  if (value === "" || value === "null" || value === "~") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (/^-?\d+\.\d+$/.test(value)) return Number(value);
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  if (value.startsWith("[") && value.endsWith("]")) return parseInlineArray(value);
  if (value.startsWith("{") && value.endsWith("}")) return parseInlineObject(value);
  return value;
}

function parseInlineArray(value: string): unknown[] {
  const inner = value.slice(1, -1).trim();
  if (!inner) return [];
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let inString: '"' | "'" | null = null;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (inString) {
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") inString = ch;
    else if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(inner.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(inner.slice(start).trim());
  return parts.map(parseScalarOrInline);
}

function parseInlineObject(value: string): Record<string, unknown> {
  const inner = value.slice(1, -1).trim();
  const obj: Record<string, unknown> = {};
  if (!inner) return obj;
  const items = parseInlineArrayLike(inner);
  for (const it of items) {
    const m = it.match(/^([^:]+):\s*(.*)$/);
    if (m) obj[(m[1] ?? "").trim()] = parseScalarOrInline((m[2] ?? "").trim());
  }
  return obj;
}

function parseInlineArrayLike(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let inString: '"' | "'" | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") inString = ch;
    else if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

// MDX curriculum is static at runtime — bundled with the deployment and never
// edited after server start. Memoize at module scope so each Node worker reads
// each file once for the lifetime of the process. Keys store Promises so
// concurrent requests during cold start don't trigger duplicate fs reads.
const dayCache = new Map<number, Promise<LoadedDay | null>>();
let listDaysPromise: Promise<DayFrontmatter[]> | null = null;

export async function loadDay(dayNumber: number): Promise<LoadedDay | null> {
  const cached = dayCache.get(dayNumber);
  if (cached) return cached;
  const p = (async () => {
    const file = path.join(CONTENT_DIR, `day-${String(dayNumber).padStart(2, "0")}.mdx`);
    let raw: string;
    try {
      raw = await fs.readFile(file, "utf8");
    } catch {
      return null;
    }
    const { meta, body } = splitFrontmatter(raw);
    const parsed = dayFrontmatterSchema.parse(meta);
    return { meta: parsed, body, raw };
  })();
  dayCache.set(dayNumber, p);
  // Drop the cache entry on failure so transient errors aren't sticky.
  p.catch(() => dayCache.delete(dayNumber));
  return p;
}

export async function listDays(): Promise<DayFrontmatter[]> {
  if (listDaysPromise) return listDaysPromise;
  listDaysPromise = (async () => {
    const entries = await fs.readdir(CONTENT_DIR);
    const files = entries.filter((n) => n.endsWith(".mdx"));
    const out = await Promise.all(
      files.map(async (name) => {
        const raw = await fs.readFile(path.join(CONTENT_DIR, name), "utf8");
        const { meta } = splitFrontmatter(raw);
        return dayFrontmatterSchema.parse(meta);
      }),
    );
    return out.sort((a, b) => a.day - b.day);
  })();
  listDaysPromise.catch(() => {
    listDaysPromise = null;
  });
  return listDaysPromise;
}
