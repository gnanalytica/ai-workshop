// Pure CSV parsing for the admin "import teams" flow. Kept framework-free so it
// can be unit-tested in isolation (see web/tests/teams-import.test.ts).

export interface ParsedTeamRow {
  team_number: number | null;
  name: string;
  roll_numbers: string[];
  ideas: string[];
}

export interface ParseResult {
  rows: ParsedTeamRow[];
  errors: string[];
}

/** Split a single CSV line, honoring double-quoted fields and "" escapes. */
export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

/**
 * Parse the pasted spreadsheet into team rows.
 * Columns: team_number, team_name, "roll1;roll2;roll3", idea_1, idea_2, idea_3.
 * A header row (first line mentioning "team" + "roll") is skipped. Roll numbers
 * may be separated by `;` or `|`.
 */
export function parseTeamsCsv(text: string): ParseResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const errors: string[] = [];
  const rows: ParsedTeamRow[] = [];

  for (const [idx, line] of lines.entries()) {
    const cells = splitCsvLine(line);
    if (idx === 0 && /team/i.test(cells[0] ?? "") && cells.some((c) => /roll/i.test(c))) {
      continue; // header
    }
    const [numRaw, name, rollsRaw, ...ideaCells] = cells;
    if (!name) {
      errors.push(`Line ${idx + 1}: missing team name`);
      continue;
    }
    const team_number = numRaw && /^\d+$/.test(numRaw) ? Number(numRaw) : null;
    const roll_numbers = (rollsRaw ?? "")
      .split(/[;|]/)
      .map((r) => r.trim())
      .filter(Boolean);
    if (roll_numbers.length === 0) {
      errors.push(`Line ${idx + 1} (${name}): no roll numbers`);
      continue;
    }
    const ideas = ideaCells.map((c) => c.trim()).filter(Boolean);
    rows.push({ team_number, name, roll_numbers, ideas });
  }

  return { rows, errors };
}
