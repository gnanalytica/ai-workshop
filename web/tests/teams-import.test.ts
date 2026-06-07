import { describe, it, expect } from "vitest";
import { parseTeamsCsv, splitCsvLine } from "@/lib/teams/parse-import";

describe("splitCsvLine", () => {
  it("splits plain comma fields", () => {
    expect(splitCsvLine("1, Team A, x")).toEqual(["1", "Team A", "x"]);
  });

  it("keeps commas inside quotes", () => {
    expect(splitCsvLine('1,"a,b,c",x')).toEqual(["1", "a,b,c", "x"]);
  });

  it("handles escaped double-quotes", () => {
    expect(splitCsvLine('1,"say ""hi""",x')).toEqual(["1", 'say "hi"', "x"]);
  });
});

describe("parseTeamsCsv", () => {
  it("parses a basic row with semicolon-separated rolls and ideas", () => {
    const { rows, errors } = parseTeamsCsv(
      '1, Neural Ninjas, "23BCE1001;23BCE1002;23BCE1003", Idea A, Idea B, Idea C',
    );
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      team_number: 1,
      name: "Neural Ninjas",
      roll_numbers: ["23BCE1001", "23BCE1002", "23BCE1003"],
      ideas: ["Idea A", "Idea B", "Idea C"],
    });
  });

  it("skips a header row", () => {
    const { rows } = parseTeamsCsv(
      [
        "team_number,team_name,roll_numbers,idea_1",
        "2, Pixel Pirates, 23BCE2001;23BCE2002, Idea X",
      ].join("\n"),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.name).toBe("Pixel Pirates");
  });

  it("accepts | as a roll separator and a missing team number", () => {
    const { rows } = parseTeamsCsv(", Solo Squad, 23BCE3001|23BCE3002");
    expect(rows[0]!.team_number).toBeNull();
    expect(rows[0]!.roll_numbers).toEqual(["23BCE3001", "23BCE3002"]);
    expect(rows[0]!.ideas).toEqual([]);
  });

  it("reports rows with no roll numbers and no team name", () => {
    const { rows, errors } = parseTeamsCsv(
      ["3, No Rolls Team, ", ", , Idea only"].join("\n"),
    );
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toMatch(/no roll numbers/);
    expect(errors[1]).toMatch(/missing team name/);
  });
});
