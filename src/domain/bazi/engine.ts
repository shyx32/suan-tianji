/**
 * Deterministic Bazi chart engine built on lunar-javascript.
 * Pure function: same input → same chart (no I/O).
 */
import { Solar } from "lunar-javascript";
import type { BaziChart, BaziInput, DaYunItem, Pillar } from "./types";
import {
  DI_ZHI,
  GAN_WUXING,
  HIDE_GAN,
  SHENG_XIAO,
  TIAN_GAN,
  ZHI_WUXING,
  diShi,
  ganZhiIndex,
  naYinOf,
  shiShen,
  timePeriodHint,
  xunKong,
  type DiZhi,
  type TianGan,
} from "./ganzhi";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildPillar(
  ganZhi: string,
  dayMaster: string,
  isDay = false,
): Pillar {
  const gan = ganZhi[0] as TianGan;
  const zhi = ganZhi[1] as DiZhi;
  const hide = HIDE_GAN[zhi] || [];
  const xk = xunKong(ganZhi);
  return {
    ganZhi,
    gan,
    zhi,
    wuXing: `${GAN_WUXING[gan] || "?"}${ZHI_WUXING[zhi] || "?"}`,
    naYin: naYinOf(gan, zhi),
    shiShenGan: isDay ? "日主" : shiShen(dayMaster, gan),
    shiShenZhi: hide.map((g) => shiShen(dayMaster, g)),
    diShi: diShi(dayMaster, zhi),
    xun: xk.xun,
    xunKong: xk.kong,
    hideGan: [...hide],
  };
}

function nextGanZhi(ganZhi: string, steps: number): string {
  const gan = ganZhi[0]!;
  const zhi = ganZhi[1]!;
  let idx = ganZhiIndex(gan, zhi);
  if (idx < 0) return ganZhi;
  idx = (idx + steps + 600) % 60;
  return `${TIAN_GAN[idx % 10]}${DI_ZHI[idx % 12]}`;
}

function prevGanZhi(ganZhi: string, steps: number): string {
  return nextGanZhi(ganZhi, -steps);
}

/** 胎元：月干进一位，月支进三位 */
function calcTaiYuan(monthGanZhi: string): string {
  const g = monthGanZhi[0] as TianGan;
  const z = monthGanZhi[1] as DiZhi;
  const gi = (TIAN_GAN.indexOf(g) + 1) % 10;
  const zi = (DI_ZHI.indexOf(z) + 3) % 12;
  return `${TIAN_GAN[gi]}${DI_ZHI[zi]}`;
}

/** 胎息：日柱干支对冲（+6） */
function calcTaiXi(dayGanZhi: string): string {
  return nextGanZhi(dayGanZhi, 6);
}

/**
 * 命宫：寅起正月逆数至生月，再从子时顺数至生时（简化通用法）
 * 用 lunar-javascript 的 EightChar 若可用则优先。
 */
function calcMingGong(monthZhi: string, hourZhi: string): string {
  // 口诀：从子上起正月，逆行至生月；从该宫起子时顺数至生时
  // 简化：月支序 + 时支序 推算
  const monthIdx = DI_ZHI.indexOf(monthZhi as DiZhi);
  const hourIdx = DI_ZHI.indexOf(hourZhi as DiZhi);
  // 寅=2 为正月
  const yin = 2;
  const monthNum = ((monthIdx - yin + 12) % 12) + 1; // 1..12
  // 从寅宫起正月，逆数 monthNum-1
  let palace = (yin - (monthNum - 1) + 120) % 12;
  // 从该宫起子时，顺数 hourIdx
  palace = (palace + hourIdx) % 12;
  // 天干：五虎遁，以年干起寅月干再映射 — 此处用简化：仅返回地支宫 + 配干稍后补
  return DI_ZHI[palace]!;
}

function mingGongGanZhi(yearGan: string, mingGongZhi: string): string {
  // 五虎遁：甲己之年丙作首...
  const startMap: Record<string, number> = {
    甲: 2,
    己: 2, // 丙寅
    乙: 4,
    庚: 4, // 戊寅
    丙: 6,
    辛: 6, // 庚寅
    丁: 8,
    壬: 8, // 壬寅
    戊: 0,
    癸: 0, // 甲寅
  };
  const yinGanIdx = startMap[yearGan] ?? 2;
  const zhiIdx = DI_ZHI.indexOf(mingGongZhi as DiZhi);
  const yinIdx = 2;
  const offset = (zhiIdx - yinIdx + 12) % 12;
  const gan = TIAN_GAN[(yinGanIdx + offset) % 10]!;
  return `${gan}${mingGongZhi}`;
}

function calcShenGong(monthZhi: string, hourZhi: string, yearGan: string): string {
  // 身宫：寅起正月顺数至生月，再从子时顺数
  const monthIdx = DI_ZHI.indexOf(monthZhi as DiZhi);
  const hourIdx = DI_ZHI.indexOf(hourZhi as DiZhi);
  const yin = 2;
  const monthNum = ((monthIdx - yin + 12) % 12) + 1;
  let palace = (yin + (monthNum - 1)) % 12;
  palace = (palace + hourIdx) % 12;
  return mingGongGanZhi(yearGan, DI_ZHI[palace]!);
}

function solarLabel(y: number, m: number, d: number, h: number, mi: number): string {
  const period =
    h < 6 ? "凌晨" : h < 12 ? "上午" : h < 13 ? "中午" : h < 18 ? "下午" : "晚上";
  return `${y}年${m}月${d}日 ${period}（${pad(h)}:${pad(mi)}）`;
}

export function buildBaziChart(input: BaziInput): BaziChart {
  const minute = input.minute ?? 0;
  const { year, month, day, hour } = input;
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    hour < 0 ||
    hour > 23
  ) {
    throw new Error("出生时间无效");
  }

  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  const yearGZ = String(ec.getYear());
  const monthGZ = String(ec.getMonth());
  const dayGZ = String(ec.getDay());
  const timeGZ = String(ec.getTime());

  const dayMaster = dayGZ[0]!;
  const yearP = buildPillar(yearGZ, dayMaster);
  const monthP = buildPillar(monthGZ, dayMaster);
  const dayP = buildPillar(dayGZ, dayMaster, true);
  const timeP = buildPillar(timeGZ, dayMaster);

  const yun = ec.getYun(input.gender === "male" ? 1 : 0);
  // 起运
  let yunStart = "起运信息未知";
  let yunForward = true;
  try {
    const startYear = yun.getStartYear?.() ?? 0;
    const startMonth = yun.getStartMonth?.() ?? 0;
    const startDay = yun.getStartDay?.() ?? 0;
    yunStart = `出生后约 ${startYear}年${startMonth}月${startDay}天起运`;
    yunForward = Boolean(yun.isForward?.() ?? true);
  } catch {
    // fallback below
  }

  // 大运
  const analysisYear = new Date().getFullYear();
  const daYun: DaYunItem[] = [];
  try {
    const daYunList = yun.getDaYun(10) || [];
    for (const item of daYunList) {
      const gz = String(item.getGanZhi?.() ?? item.getGanZhi?.() ?? "");
      // lunar-javascript DaYun API
      const startYear = Number(item.getStartYear?.() ?? 0);
      const endYear = Number(item.getEndYear?.() ?? startYear + 9);
      const startAge = Number(item.getStartAge?.() ?? 0);
      const endAge = Number(item.getEndAge?.() ?? startAge + 9);
      const ganZhi = gz || String(item);
      if (!ganZhi || ganZhi === "undefined") continue;
      // skip 小运/起运 before first 大运 with empty? keep all with years
      daYun.push({
        ganZhi: String(item.getGanZhi()),
        startYear,
        endYear,
        startAge,
        endAge,
        current: analysisYear >= startYear && analysisYear <= endYear,
      });
    }
  } catch {
    // manual fallback from month pillar
    const base = monthGZ;
    for (let i = 1; i <= 9; i++) {
      const gz = yunForward ? nextGanZhi(base, i) : prevGanZhi(base, i);
      const startAge = i * 10 - 9;
      const startYear = year + startAge - 1;
      daYun.push({
        ganZhi: gz,
        startYear,
        endYear: startYear + 9,
        startAge,
        endAge: startAge + 9,
        current: analysisYear >= startYear && analysisYear <= startYear + 9,
      });
    }
  }

  // Filter out empty first 运 sometimes returned
  const filteredDaYun = daYun.filter((d) => d.ganZhi && d.ganZhi.length >= 2);
  const currentDaYun = filteredDaYun.find((d) => d.current) || null;

  const mingZhi = calcMingGong(monthP.zhi, timeP.zhi);
  const mingGong = mingGongGanZhi(yearP.gan, mingZhi);
  const shenGong = calcShenGong(monthP.zhi, timeP.zhi, yearP.gan);
  const taiYuan = calcTaiYuan(monthGZ);
  const taiXi = calcTaiXi(dayGZ);
  const dayXk = xunKong(dayGZ);

  const lunarDayCn = `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
  const lunarDetail = `${yearGZ}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()} · ${monthGZ}月 · ${dayGZ}日 · ${timeGZ}时`;

  const naYins = [yearP.naYin, monthP.naYin, dayP.naYin, timeP.naYin].join("/");
  const summary = `日主${dayMaster}（${GAN_WUXING[dayMaster as TianGan] || "?"}）；四柱 ${yearGZ} ${monthGZ} ${dayGZ} ${timeGZ}；出生地 ${input.birthplace || "未填"}；纳音 ${naYins}；胎元${taiYuan} · 命宫${mingGong} · 身宫${shenGong}`;

  return {
    solar: `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`,
    solarLabel: solarLabel(year, month, day, hour, minute),
    lunar: lunarDayCn,
    lunarDetail,
    gender: input.gender,
    name: input.name,
    birthplace: input.birthplace,
    focus: input.focus,
    note: input.note,
    year: yearP,
    month: monthP,
    day: dayP,
    time: timeP,
    taiYuan,
    taiXi,
    mingGong,
    shenGong,
    dayMaster,
    dayMasterWuXing: GAN_WUXING[dayMaster as TianGan] || "?",
    dayXunKong: dayXk.kong,
    shengXiao: SHENG_XIAO[yearP.zhi as DiZhi] || "?",
    yunStart,
    yunForward,
    daYun: filteredDaYun.slice(0, 9),
    currentDaYun,
    analysisYear,
    timePeriodHint: timePeriodHint(hour),
    summary,
  };
}

export function chartTitle(chart: BaziChart): string {
  const name = chart.name || "匿名";
  const place = chart.birthplace ? ` · ${chart.birthplace}` : "";
  return `${name}${place} · 八字命盘`;
}
