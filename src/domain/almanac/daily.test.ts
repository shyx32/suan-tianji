import { describe, expect, it } from "vitest";
import { drawFortune, getAlmanac } from "./daily";

describe("getAlmanac", () => {
  it("returns yi/ji arrays for any date (no negative index)", () => {
    // large hash days that previously broke signed >>
    for (const d of [
      new Date(2026, 7, 3),
      new Date(1990, 0, 1),
      new Date(2030, 11, 31),
    ]) {
      const a = getAlmanac(d);
      expect(Array.isArray(a.yi)).toBe(true);
      expect(a.yi.length).toBeGreaterThan(0);
      expect(Array.isArray(a.ji)).toBe(true);
      expect(a.ji.length).toBeGreaterThan(0);
      expect(a.solar).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("drawFortune", () => {
  it("returns qian text", () => {
    const f = drawFortune(new Date(2026, 7, 3), 0);
    expect(f.qian.length).toBeGreaterThan(0);
    expect(f.text).toContain("运势");
  });
});
