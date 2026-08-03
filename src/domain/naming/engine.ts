import { buildBaziChart } from "@/domain/bazi/engine";
import type { BaziChart, Gender } from "@/domain/bazi/types";
import { GAN_WUXING, type TianGan } from "@/domain/bazi/ganzhi";

export type BirthStatus = "born" | "expected";

export interface NamingInput {
  surname: string;
  gender: Gender | "unknown";
  birthStatus: BirthStatus;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  expectedDate?: string;
  birthplace?: string;
  givenNameLength: "one" | "two";
  styles: string[];
  generationCharacter?: string;
  preferredCharacters?: string;
  avoidCharacters?: string;
  wishes?: string;
  note?: string;
}

export interface NameCandidate {
  fullName: string;
  givenName: string;
  meaning: string;
  wuxingHint: string;
  styleTags: string[];
}

export interface NamingStructure {
  input: NamingInput;
  chart?: BaziChart;
  lackWuxing: string[];
  candidates: NameCandidate[];
  summary: string;
}

const POOL: Array<{ char: string; wx: string; meaning: string; styles: string[] }> = [
  { char: "清", wx: "水", meaning: "澄澈高远", styles: ["清雅古典", "温润如玉"] },
  { char: "言", wx: "金", meaning: "言信行果", styles: ["大气端正", "清雅古典"] },
  { char: "安", wx: "土", meaning: "安然笃定", styles: ["温润如玉", "大气端正"] },
  { char: "然", wx: "金", meaning: "自然从容", styles: ["清雅古典", "现代简约"] },
  { char: "予", wx: "土", meaning: "予人温暖", styles: ["温润如玉"] },
  { char: "宁", wx: "火", meaning: "宁静致远", styles: ["清雅古典", "温润如玉"] },
  { char: "泽", wx: "水", meaning: "润物无声", styles: ["大气端正", "清雅古典"] },
  { char: "楷", wx: "木", meaning: "楷模端方", styles: ["大气端正"] },
  { char: "轩", wx: "土", meaning: "气宇轩昂", styles: ["大气端正", "现代简约"] },
  { char: "沐", wx: "水", meaning: "沐光而生", styles: ["现代简约", "清雅古典"] },
  { char: "辰", wx: "土", meaning: "星辰可摘", styles: ["清雅古典", "现代简约"] },
  { char: "逸", wx: "土", meaning: "超逸出尘", styles: ["清雅古典"] },
  { char: "知", wx: "火", meaning: "知行合一", styles: ["大气端正"] },
  { char: "远", wx: "土", meaning: "志存高远", styles: ["大气端正", "现代简约"] },
  { char: "禾", wx: "木", meaning: "嘉禾丰稔", styles: ["清雅古典", "温润如玉"] },
  { char: "璟", wx: "火", meaning: "玉光璀璨", styles: ["清雅古典"] },
  { char: "辞", wx: "金", meaning: "文辞斐然", styles: ["清雅古典"] },
  { char: "衡", wx: "土", meaning: "权衡稳健", styles: ["大气端正"] },
  { char: "澄", wx: "水", meaning: "澄怀观道", styles: ["清雅古典", "温润如玉"] },
  { char: "予", wx: "土", meaning: "给予善意", styles: ["温润如玉"] },
  { char: "一", wx: "土", meaning: "守一抱朴", styles: ["现代简约"] },
  { char: "朗", wx: "火", meaning: "朗澈明达", styles: ["大气端正", "现代简约"] },
  { char: "书", wx: "金", meaning: "诗书继世", styles: ["清雅古典"] },
  { char: "鸣", wx: "火", meaning: "一鸣惊人", styles: ["大气端正"] },
  { char: "若", wx: "木", meaning: "若谷虚怀", styles: ["清雅古典", "温润如玉"] },
  { char: "初", wx: "金", meaning: "初心不改", styles: ["现代简约", "温润如玉"] },
  { char: "予", wx: "土", meaning: "温润予人", styles: ["温润如玉"] },
  { char: "昭", wx: "火", meaning: "昭明德馨", styles: ["大气端正", "清雅古典"] },
  { char: "予", wx: "土", meaning: "温厚", styles: ["温润如玉"] },
  { char: "乔", wx: "木", meaning: "乔木参天", styles: ["大气端正"] },
  { char: "予", wx: "土", meaning: "—", styles: [] },
  { char: "禾", wx: "木", meaning: "嘉实", styles: ["清雅古典"] },
  { char: "予", wx: "土", meaning: "—", styles: [] },
  { char: "桐", wx: "木", meaning: "梧桐栖凤", styles: ["清雅古典"] },
  { char: "煜", wx: "火", meaning: "煜煜生辉", styles: ["大气端正"] },
  { char: "琛", wx: "金", meaning: "珍宝满怀", styles: ["清雅古典"] },
  { char: "澈", wx: "水", meaning: "澄澈见底", styles: ["清雅古典", "现代简约"] },
  { char: "岩", wx: "土", meaning: "磐岩可依", styles: ["大气端正"] },
  { char: "舒", wx: "金", meaning: "舒卷自如", styles: ["温润如玉", "现代简约"] },
  { char: "予", wx: "土", meaning: "—", styles: [] },
  { char: "晚", wx: "水", meaning: "晚照温润", styles: ["清雅古典"] },
  { char: "晴", wx: "火", meaning: "晴光万里", styles: ["现代简约", "温润如玉"] },
  { char: "野", wx: "土", meaning: "野趣天成", styles: ["现代简约"] },
  { char: "舟", wx: "金", meaning: "轻舟济海", styles: ["清雅古典", "现代简约"] },
];

function uniquePool() {
  const seen = new Set<string>();
  return POOL.filter((p) => {
    if (!p.char || p.meaning === "—" || seen.has(p.char)) return false;
    seen.add(p.char);
    return true;
  });
}

function inferLack(chart?: BaziChart): string[] {
  if (!chart) return ["水", "木"];
  const count: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const p of [chart.year, chart.month, chart.day, chart.time]) {
    const a = p.wuXing[0]!;
    const b = p.wuXing[1]!;
    if (count[a] !== undefined) count[a]!++;
    if (count[b] !== undefined) count[b]!++;
  }
  // day master needs support
  const dm = chart.dayMasterWuXing;
  return Object.entries(count)
    .sort((x, y) => x[1] - y[1])
    .slice(0, 2)
    .map(([k]) => k)
    .concat(dm === "水" ? ["金"] : [])
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 2);
}

export function buildNaming(input: NamingInput): NamingStructure {
  const surname = input.surname.trim();
  if (!surname) throw new Error("姓氏不能为空");

  let chart: BaziChart | undefined;
  if (
    input.birthStatus === "born" &&
    input.year &&
    input.month &&
    input.day &&
    input.hour !== undefined
  ) {
    chart = buildBaziChart({
      gender: input.gender === "unknown" ? "male" : input.gender,
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute ?? 0,
      birthplace: input.birthplace,
    });
  }

  const lack = inferLack(chart);
  const avoid = new Set((input.avoidCharacters || "").split("").filter(Boolean));
  const preferred = (input.preferredCharacters || "").split("").filter(Boolean);
  const gen = input.generationCharacter?.trim();
  const styles = input.styles?.length ? input.styles : ["清雅古典"];
  const pool = uniquePool();

  const scored = pool
    .filter((p) => !avoid.has(p.char))
    .map((p) => {
      let score = 0;
      if (lack.includes(p.wx)) score += 5;
      if (p.styles.some((s) => styles.includes(s))) score += 3;
      if (preferred.includes(p.char)) score += 8;
      if (chart && GAN_WUXING[chart.dayMaster as TianGan] === p.wx) score += 1;
      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score);

  const candidates: NameCandidate[] = [];
  const len = input.givenNameLength === "one" ? 1 : 2;

  for (let i = 0; i < scored.length && candidates.length < 10; i++) {
    if (len === 1) {
      const c = scored[i]!;
      const given = gen ? `${gen}${c.char}` : c.char;
      // if gen provided with one-length, treat as single char without gen unless specified
      const g = input.generationCharacter
        ? `${input.generationCharacter}${c.char}`.slice(0, 2)
        : c.char;
      candidates.push({
        fullName: `${surname}${g}`,
        givenName: g,
        meaning: c.meaning,
        wuxingHint: c.wx,
        styleTags: c.styles.filter((s) => styles.includes(s)).slice(0, 2),
      });
    } else {
      const a = scored[i]!;
      const b = scored[(i + 3) % scored.length]!;
      if (a.char === b.char) continue;
      let given = `${a.char}${b.char}`;
      if (gen) given = `${gen}${a.char}`.slice(0, 2);
      candidates.push({
        fullName: `${surname}${given}`,
        givenName: given,
        meaning: `${a.meaning}；${b.meaning}`,
        wuxingHint: `${a.wx}${b.wx}`,
        styleTags: [...new Set([...a.styles, ...b.styles])].filter((s) =>
          styles.includes(s),
        ),
      });
    }
  }

  // dedupe full names
  const uniq: NameCandidate[] = [];
  const seen = new Set<string>();
  for (const c of candidates) {
    if (seen.has(c.fullName)) continue;
    seen.add(c.fullName);
    uniq.push(c);
  }

  const finalCandidates = uniq.slice(0, 8);
  return {
    input,
    chart,
    lackWuxing: lack,
    candidates: finalCandidates,
    summary: `姓${surname}；补益倾向 ${lack.join("、") || "均衡"}；风格 ${styles.join("、")}；候选 ${finalCandidates.length} 个`,
  };
}

export function namingTitle(n: NamingStructure): string {
  return `${n.input.surname}姓 · 宝宝取名`;
}
