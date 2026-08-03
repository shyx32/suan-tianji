import { describe, expect, it } from "vitest";
import { buildNaming } from "./engine";

describe("buildNaming", () => {
  it("returns surname candidates", () => {
    const n = buildNaming({
      surname: "林",
      gender: "female",
      birthStatus: "born",
      year: 2024,
      month: 6,
      day: 1,
      hour: 10,
      givenNameLength: "two",
      styles: ["清雅古典", "温润如玉"],
    });
    expect(n.candidates.length).toBeGreaterThan(0);
    expect(n.candidates[0]!.fullName.startsWith("林")).toBe(true);
    expect(n.lackWuxing.length).toBeGreaterThan(0);
  });

  it("summary candidate count matches returned candidates length", () => {
    const n = buildNaming({
      surname: "林",
      gender: "female",
      birthStatus: "born",
      year: 2024,
      month: 6,
      day: 1,
      hour: 10,
      givenNameLength: "two",
      styles: ["清雅古典", "温润如玉"],
    });
    expect(n.summary).toContain(`候选 ${n.candidates.length} 个`);
    expect(n.candidates.length).toBeLessThanOrEqual(8);
  });
});

