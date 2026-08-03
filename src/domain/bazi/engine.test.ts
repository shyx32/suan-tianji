import { describe, expect, it } from "vitest";
import { buildBaziChart } from "./engine";
import { baziBodySchema } from "./schema";
import { shiShen, naYinOf, diShi } from "./ganzhi";

describe("baziBodySchema", () => {
  it("rejects missing year", () => {
    const r = baziBodySchema.safeParse({
      gender: "male",
      month: 1,
      day: 1,
      hour: 12,
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.year).toBeTruthy();
    }
  });

  it("accepts valid payload", () => {
    const r = baziBodySchema.safeParse({
      gender: "female",
      year: 1995,
      month: 8,
      day: 20,
      hour: 14,
      minute: 30,
      birthplace: "上海",
      focus: ["感情", "健康"],
      name: "测试",
    });
    expect(r.success).toBe(true);
  });
});

describe("ganzhi helpers", () => {
  it("shiShen day master is 比肩 for self", () => {
    expect(shiShen("壬", "壬")).toBe("比肩");
  });

  it("naYin of 甲子 is 海中金", () => {
    expect(naYinOf("甲", "子")).toBe("海中金");
  });

  it("diShi returns known stage", () => {
    const s = diShi("甲", "亥");
    expect(s).toBe("长生");
  });
});

describe("buildBaziChart", () => {
  it("returns four pillars and day master for 1990-05-15 10:00", () => {
    const chart = buildBaziChart({
      gender: "male",
      year: 1990,
      month: 5,
      day: 15,
      hour: 10,
      minute: 0,
      birthplace: "北京",
      focus: ["事业", "财运"],
    });

    expect(chart.year.ganZhi).toMatch(/^[\u4e00-\u9fff]{2}$/);
    expect(chart.month.ganZhi).toMatch(/^[\u4e00-\u9fff]{2}$/);
    expect(chart.day.ganZhi).toMatch(/^[\u4e00-\u9fff]{2}$/);
    expect(chart.time.ganZhi).toMatch(/^[\u4e00-\u9fff]{2}$/);
    expect(chart.dayMaster).toBe(chart.day.gan);
    expect(chart.dayMasterWuXing).toBeTruthy();
    expect(chart.daYun.length).toBeGreaterThan(0);
    expect(chart.summary).toContain("日主");
    expect(chart.solar).toContain("1990-05-15");
  });

  it("is deterministic", () => {
    const input = {
      gender: "female" as const,
      year: 1988,
      month: 3,
      day: 8,
      hour: 9,
      minute: 0,
      birthplace: "杭州",
    };
    const a = buildBaziChart(input);
    const b = buildBaziChart(input);
    expect(a.year.ganZhi).toBe(b.year.ganZhi);
    expect(a.day.ganZhi).toBe(b.day.ganZhi);
    expect(a.time.ganZhi).toBe(b.time.ganZhi);
    expect(a.dayMaster).toBe(b.dayMaster);
  });

  it("known sample 1988-03-08 09:00 has 壬 day master structure", () => {
    const chart = buildBaziChart({
      gender: "male",
      year: 1988,
      month: 3,
      day: 8,
      hour: 9,
      minute: 0,
    });
    // 1988-03-08 is 戊辰年 乙卯月 壬戌日 region; day master 壬
    expect(chart.day.gan).toBe("壬");
    expect(chart.dayMaster).toBe("壬");
    expect(chart.year.ganZhi).toBe("戊辰");
  });
});
