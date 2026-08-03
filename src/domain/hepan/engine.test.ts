import { describe, expect, it } from "vitest";
import { buildHepan } from "./engine";

describe("buildHepan", () => {
  it("builds dual charts and relation summary", () => {
    const h = buildHepan(
      {
        name: "甲",
        gender: "male",
        year: 1990,
        month: 5,
        day: 15,
        hour: 10,
      },
      {
        name: "乙",
        gender: "female",
        year: 1992,
        month: 8,
        day: 20,
        hour: 14,
      },
      ["感情"],
    );
    expect(h.personA.day.ganZhi).toBeTruthy();
    expect(h.personB.day.ganZhi).toBeTruthy();
    expect(h.relationCounts.scoreHint).toBeGreaterThan(0);
    expect(h.summary).toContain("甲");
  });
});
