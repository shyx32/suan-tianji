export type Gender = "male" | "female";

export interface BaziInput {
  name?: string;
  gender: Gender;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  birthplace?: string;
  focus?: string[];
  note?: string;
}

export interface Pillar {
  ganZhi: string;
  gan: string;
  zhi: string;
  wuXing: string;
  naYin: string;
  shiShenGan: string;
  shiShenZhi: string[];
  diShi: string;
  xun: string;
  xunKong: string;
  hideGan: string[];
}

export interface DaYunItem {
  ganZhi: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  current: boolean;
}

export interface BaziChart {
  solar: string;
  solarLabel: string;
  lunar: string;
  lunarDetail: string;
  gender: Gender;
  name?: string;
  birthplace?: string;
  focus?: string[];
  note?: string;
  year: Pillar;
  month: Pillar;
  day: Pillar;
  time: Pillar;
  taiYuan: string;
  taiXi: string;
  mingGong: string;
  shenGong: string;
  dayMaster: string;
  dayMasterWuXing: string;
  dayXunKong: string;
  shengXiao: string;
  yunStart: string;
  yunForward: boolean;
  daYun: DaYunItem[];
  currentDaYun: DaYunItem | null;
  analysisYear: number;
  timePeriodHint: string;
  summary: string;
}
