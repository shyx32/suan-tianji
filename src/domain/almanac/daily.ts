import { Solar } from "lunar-javascript";

export interface AlmanacDay {
  solar: string;
  week: string;
  lunar: string;
  ganZhi: string;
  yi: string[];
  ji: string[];
  chong: string;
  sha: string;
}

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];

const YI_POOL = [
  ["祈福", "出行", "订盟"],
  ["开市", "交易", "立券"],
  ["沐浴", "整手足甲", "扫舍"],
  ["会友", "定约", "学习"],
  ["栽种", "纳财", "修造"],
  ["祭祀", "开光", "安香"],
];

const JI_POOL = [
  ["动土", "破土"],
  ["安葬", "行丧"],
  ["诉讼", "词讼"],
  ["开仓", "出货财"],
  ["嫁娶", "纳采"],
  ["远行", "渡水"],
];

const FORTUNES = [
  "今日运势：工作顺利，财运不错，注意人际关系～",
  "今日运势：感情甜蜜，身体健康，注意饮食",
  "今日运势：宜静不宜躁，适合复盘与规划",
  "今日运势：贵人运佳，适合沟通协作",
  "今日运势：偏财有机，谨守本分更稳妥",
  "今日运势：创意涌现，适合学习与表达",
];

const QIAN = [
  "云开见月明，心静自然成。",
  "行稳方致远，积微以成著。",
  "一念生春意，万事可商量。",
  "舟行虽有浪，把舵自不迷。",
  "花重锦官城，善念自有邻。",
  "半亩方塘水，清源活水来。",
  "莫愁前路远，大步即天涯。",
  "守中得自在，进退皆从容。",
];

function daySeed(d: Date): number {
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

export function getAlmanac(date = new Date()): AlmanacDay {
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const lunar = solar.getLunar();
  const seed = daySeed(date);
  const yi = YI_POOL[seed % YI_POOL.length]!;
  // Use unsigned ops — `>>` on large hashes becomes negative and breaks index
  const ji = JI_POOL[Math.floor(seed / 8) % JI_POOL.length]!;

  let ganZhi = "";
  try {
    ganZhi = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`;
  } catch {
    ganZhi = lunar.toString();
  }

  return {
    solar: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    week: `星期${WEEK[date.getDay()]}`,
    lunar: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    ganZhi,
    yi: [...yi],
    ji: [...ji],
    chong: String(lunar.getDayChongDesc?.() ?? lunar.getDayChong?.() ?? "—"),
    sha: String(lunar.getDaySha?.() ?? "—"),
  };
}

export function drawFortune(date = new Date(), salt = 0): {
  text: string;
  qian: string;
  seed: number;
} {
  const seed = (daySeed(date) + salt * 9973) >>> 0;
  return {
    text: FORTUNES[seed % FORTUNES.length]!,
    qian: QIAN[Math.floor(seed / 4) % QIAN.length]!,
    seed,
  };
}
