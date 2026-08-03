/** Heavenly stems & earthly branches constants */

export const TIAN_GAN = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
] as const;

export const DI_ZHI = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

export type TianGan = (typeof TIAN_GAN)[number];
export type DiZhi = (typeof DI_ZHI)[number];

export const GAN_WUXING: Record<TianGan, string> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

export const ZHI_WUXING: Record<DiZhi, string> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

export const SHENG_XIAO: Record<DiZhi, string> = {
  子: "鼠",
  丑: "牛",
  寅: "虎",
  卯: "兔",
  辰: "龙",
  巳: "蛇",
  午: "马",
  未: "羊",
  申: "猴",
  酉: "鸡",
  戌: "狗",
  亥: "猪",
};

/** 藏干 */
export const HIDE_GAN: Record<DiZhi, TianGan[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

/** 纳音 sixty cycle starting 甲子 */
export const NA_YIN: string[] = [
  "海中金",
  "炉中火",
  "大林木",
  "路旁土",
  "剑锋金",
  "山头火",
  "涧下水",
  "城头土",
  "白蜡金",
  "杨柳木",
  "泉中水",
  "屋上土",
  "霹雳火",
  "松柏木",
  "长流水",
  "砂中金",
  "山下火",
  "平地木",
  "壁上土",
  "金箔金",
  "覆灯火",
  "天河水",
  "大驿土",
  "钗钏金",
  "桑柘木",
  "大溪水",
  "砂中土",
  "天上火",
  "石榴木",
  "大海水",
];

export function ganZhiIndex(gan: string, zhi: string): number {
  const gi = TIAN_GAN.indexOf(gan as TianGan);
  const zi = DI_ZHI.indexOf(zhi as DiZhi);
  if (gi < 0 || zi < 0) return -1;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === gi && i % 12 === zi) return i;
  }
  return -1;
}

export function naYinOf(gan: string, zhi: string): string {
  const idx = ganZhiIndex(gan, zhi);
  if (idx < 0) return "未知";
  return NA_YIN[Math.floor(idx / 2)]!;
}

/** 十神 relative to day master */
const SHI_SHEN_TABLE: Record<string, string[]> = {
  // same wuxing yin/yang: 比肩/劫财; generate: 食神/伤官; wealth: 偏财/正财; kill: 七杀/正官; imprint: 偏印/正印
};

function sameYang(a: TianGan, b: TianGan): boolean {
  return TIAN_GAN.indexOf(a) % 2 === TIAN_GAN.indexOf(b) % 2;
}

/** 五行生克：我生、生我、我克、克我、同我 */
function relation(dayWx: string, otherWx: string): "same" | "sheng" | "ke" | "sheng_me" | "ke_me" {
  const order = ["木", "火", "土", "金", "水"];
  const di = order.indexOf(dayWx);
  const oi = order.indexOf(otherWx);
  if (di < 0 || oi < 0) return "same";
  if (di === oi) return "same";
  if ((di + 1) % 5 === oi) return "sheng"; // 我生
  if ((di + 2) % 5 === oi) return "ke"; // 我克
  if ((di + 3) % 5 === oi) return "ke_me"; // 克我
  return "sheng_me"; // 生我
}

export function shiShen(dayGan: string, otherGan: string): string {
  const d = dayGan as TianGan;
  const o = otherGan as TianGan;
  if (!GAN_WUXING[d] || !GAN_WUXING[o]) return "未知";
  if (d === o) return "比肩";
  const rel = relation(GAN_WUXING[d], GAN_WUXING[o]);
  const same = sameYang(d, o);
  switch (rel) {
    case "same":
      return same ? "比肩" : "劫财";
    case "sheng":
      return same ? "食神" : "伤官";
    case "ke":
      return same ? "偏财" : "正财";
    case "ke_me":
      return same ? "七杀" : "正官";
    case "sheng_me":
      return same ? "偏印" : "正印";
  }
}

/** 十二长生 starting from 长生 position for each day master */
const CHANG_SHENG_START: Record<TianGan, number> = {
  甲: 11, // 亥
  乙: 6, // 午
  丙: 2, // 寅
  丁: 9, // 酉
  戊: 2, // 寅
  己: 9, // 酉
  庚: 5, // 巳
  辛: 0, // 子
  壬: 8, // 申
  癸: 3, // 卯
};

const DI_SHI_FORWARD = [
  "长生",
  "沐浴",
  "冠带",
  "临官",
  "帝旺",
  "衰",
  "病",
  "死",
  "墓",
  "绝",
  "胎",
  "养",
];

const DI_SHI_REVERSE = [
  "长生",
  "养",
  "胎",
  "绝",
  "墓",
  "死",
  "病",
  "衰",
  "帝旺",
  "临官",
  "冠带",
  "沐浴",
];

export function diShi(dayGan: string, zhi: string): string {
  const g = dayGan as TianGan;
  const zi = DI_ZHI.indexOf(zhi as DiZhi);
  if (zi < 0 || !(g in CHANG_SHENG_START)) return "未知";
  const start = CHANG_SHENG_START[g];
  const yang = TIAN_GAN.indexOf(g) % 2 === 0;
  const offset = (zi - start + 12) % 12;
  return yang ? DI_SHI_FORWARD[offset]! : DI_SHI_REVERSE[offset]!;
}

/** 旬空 */
export function xunKong(dayGanZhi: string): { xun: string; kong: string } {
  const gan = dayGanZhi[0]!;
  const zhi = dayGanZhi[1]!;
  const idx = ganZhiIndex(gan, zhi);
  if (idx < 0) return { xun: "未知", kong: "未知" };
  const xunStart = Math.floor(idx / 10) * 10;
  const xunGan = TIAN_GAN[xunStart % 10]!;
  const xunZhi = DI_ZHI[xunStart % 12]!;
  const kong1 = DI_ZHI[(xunStart + 10) % 12]!;
  const kong2 = DI_ZHI[(xunStart + 11) % 12]!;
  return { xun: `${xunGan}${xunZhi}`, kong: `${kong1}${kong2}` };
}

export function hourBranch(hour: number): DiZhi {
  // 23-1 子, 1-3 丑, ...
  const h = ((hour % 24) + 24) % 24;
  if (h === 23) return "子";
  const idx = Math.floor((h + 1) / 2);
  return DI_ZHI[idx % 12]!;
}

export function timePeriodHint(hour: number): string {
  const zhi = hourBranch(hour);
  const ranges: Record<string, string> = {
    子: "23:00–00:59",
    丑: "01:00–02:59",
    寅: "03:00–04:59",
    卯: "05:00–06:59",
    辰: "07:00–08:59",
    巳: "09:00–10:59",
    午: "11:00–12:59",
    未: "13:00–14:59",
    申: "15:00–16:59",
    酉: "17:00–18:59",
    戌: "19:00–20:59",
    亥: "21:00–22:59",
  };
  return `${zhi}时（约 ${ranges[zhi]}）`;
}

void SHI_SHEN_TABLE;
