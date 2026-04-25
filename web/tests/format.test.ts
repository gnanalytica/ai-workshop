import { describe, expect, it } from "vitest";
import { esc } from "@/lib/format/esc";
import { fmtDate, isoDate } from "@/lib/format/date";

describe("esc", () => {
  it("escapes HTML metacharacters", () => {
    expect(esc("<script>&\"'")).toBe("&lt;script&gt;&amp;&quot;&#39;");
  });
  it("returns empty string for nullish", () => {
    expect(esc(null)).toBe("");
    expect(esc(undefined)).toBe("");
  });
});

describe("date", () => {
  it("isoDate produces YYYY-MM-DD", () => {
    expect(isoDate(new Date("2026-04-25T12:34:56Z"))).toBe("2026-04-25");
  });
  it("fmtDate handles bad input gracefully", () => {
    expect(fmtDate("not a date")).toBe("");
    expect(fmtDate(null)).toBe("");
  });
});
