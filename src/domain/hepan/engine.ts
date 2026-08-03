import { buildBaziChart } from "@/domain/bazi/engine";
import type { BaziChart, BaziInput, Gender } from "@/domain/bazi/types";
import { GAN_WUXING, type TianGan } from "@/domain/bazi/ganzhi";

export interface PersonInput {
  name?: string;
  gender: Gender;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  birthplace?: string;
}

export interface HepanStructure {
  personA: BaziChart;
  personB: BaziChart;
  focus?: string[];
  relationCounts: {
    sameDayMasterWx: boolean;
    wuxingComplement: string[];
    ganRelations: string[];
    zhiRelations: string[];
    scoreHint: number;
  };
  summary: string;
}

function zhiRelation(a: string, b: string): string | null {
  const liuHe: Record<string, string> = {
    子: "丑",
    丑: "子",
    寅: "亥",
    亥: "寅",
    卯: "戌",
    戌: "卯",
    辰: "酉",
    酉: "辰",
    巳: "申",
    申: "巳",
    午: "未",
    未: "午",
  };
  const chong: Record<string, string> = {
    子: "午",
    午: "子",
    丑: "未",
    未: "丑",
    寅: "申",
    申: "寅",
    卯: "酉",
    酉: "卯",
    辰: "戌",
    戌: "辰",
    巳: "亥",
    亥: "巳",
  };
  if (liuHe[a] === b) return `${a}${b}六合`;
  if (chong[a] === b) return `${a}${b}相冲`;
  return null;
}

export function buildHepan(
  personA: PersonInput,
  personB: PersonInput,
  focus?: string[],
): HepanStructure {
  const a = buildBaziChart(personA as BaziInput);
  const b = buildBaziChart(personB as BaziInput);

  const ganRelations: string[] = [];
  const zhiRelations: string[] = [];

  for (const [ga, gb] of [
    [a.day.gan, b.day.gan],
    [a.year.gan, b.year.gan],
  ] as const) {
    if (ga === gb) ganRelations.push(`天干同 ${ga}`);
    else {
      const wa = GAN_WUXING[ga as TianGan];
      const wb = GAN_WUXING[gb as TianGan];
      if (wa && wb && wa === wb) ganRelations.push(`天干同五行 ${wa}`);
    }
  }

  for (const zPair of [
    [a.day.zhi, b.day.zhi],
    [a.year.zhi, b.year.zhi],
    [a.month.zhi, b.month.zhi],
    [a.time.zhi, b.time.zhi],
  ] as const) {
    const rel = zhiRelation(zPair[0], zPair[1]);
    if (rel) zhiRelations.push(rel);
  }

  const wuxingComplement: string[] = [];
  const setA = new Set(
    [a.year, a.month, a.day, a.time].flatMap((p) => [p.wuXing[0]!, p.wuXing[1]!]),
  );
  const setB = new Set(
    [b.year, b.month, b.day, b.time].flatMap((p) => [p.wuXing[0]!, p.wuXing[1]!]),
  );
  for (const wx of ["木", "火", "土", "金", "水"]) {
    if (setA.has(wx) !== setB.has(wx)) wuxingComplement.push(wx);
  }

  let score = 60;
  score += zhiRelations.filter((r) => r.includes("合")).length * 8;
  score -= zhiRelations.filter((r) => r.includes("冲")).length * 6;
  score += ganRelations.length * 3;
  score = Math.max(35, Math.min(95, score));

  const sameDayMasterWx = a.dayMasterWuXing === b.dayMasterWuXing;
  const summary = `甲${a.dayMaster}${a.dayMasterWuXing}/乙${b.dayMaster}${b.dayMasterWuXing}；合冲提示 ${zhiRelations.join("、") || "平和"}；缘分指数约 ${score}`;

  return {
    personA: a,
    personB: b,
    focus,
    relationCounts: {
      sameDayMasterWx,
      wuxingComplement,
      ganRelations,
      zhiRelations,
      scoreHint: score,
    },
    summary,
  };
}

export function hepanTitle(h: HepanStructure): string {
  const na = h.personA.name || "甲";
  const nb = h.personB.name || "乙";
  return `${na} × ${nb} · 双盘合参`;
}
