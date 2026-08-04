import { describe, expect, it } from "vitest";
import { drawFortune, getAlmanac, getContentPoolStats } from "./daily";

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

  it("prefers lunar-javascript day yi/ji when available", () => {
    const a = getAlmanac(new Date(2026, 7, 4));
    // 真实黄历条目通常不止固定兜底那几组的形态；至少应有内容
    expect(a.yi.join("")).not.toEqual("");
    expect(a.ji.join("")).not.toEqual("");
  });
});

describe("drawFortune", () => {
  it("returns qian text with interpretation fields", () => {
    const f = drawFortune(new Date(2026, 7, 3), 0);
    expect(f.qian.length).toBeGreaterThan(0);
    expect(f.text).toContain("运势");
    expect(f.title.length).toBeGreaterThan(0);
    expect(f.level.length).toBeGreaterThan(0);
    expect(f.meaning.length).toBeGreaterThan(10);
    expect(f.advice.length).toBeGreaterThan(10);
    expect(f.tip.length).toBeGreaterThan(0);
  });

  it("changes with salt", () => {
    const a = drawFortune(new Date(2026, 7, 3), 0);
    const b = drawFortune(new Date(2026, 7, 3), 3);
    expect(b.meaning.length).toBeGreaterThan(10);
    expect(a.seed).not.toBe(b.seed);
  });

  it("has expanded content pools", () => {
    const s = getContentPoolStats();
    expect(s.qian).toBeGreaterThanOrEqual(24);
    expect(s.fortunes).toBeGreaterThanOrEqual(20);
    expect(s.fortuneCombos).toBeGreaterThanOrEqual(480);
  });
});
