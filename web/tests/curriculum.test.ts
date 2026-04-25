import { describe, expect, it } from "vitest";
import { loadDay, listDays } from "@/lib/content/loader";

describe("curriculum loader", () => {
  it("loads all 30 days", async () => {
    const all = await listDays();
    expect(all.length).toBe(30);
    expect(all[0]?.day).toBe(1);
    expect(all[29]?.day).toBe(30);
  });
  it("parses day 1 frontmatter", async () => {
    const d = await loadDay(1);
    expect(d?.meta.topic).toMatch(/AI/i);
    expect(d?.meta.tools_hands_on?.length).toBeGreaterThan(0);
    expect(d?.body.length).toBeGreaterThan(50);
  });
  it("parses day 25 (complex frontmatter)", async () => {
    const d = await loadDay(25);
    expect(d?.meta.tools_hands_on?.[0]?.name).toBe("Ollama");
    expect(d?.meta.objective?.end_goal).toContain("eval");
  });
});
