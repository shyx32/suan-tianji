declare module "lunar-javascript" {
  export class Solar {
    static fromYmdHms(
      y: number,
      m: number,
      d: number,
      h: number,
      mi: number,
      s: number,
    ): Solar;
    static fromYmd(y: number, m: number, d: number): Solar;
    getLunar(): Lunar;
  }

  export class Lunar {
    getEightChar(): EightChar;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getDayChongDesc(): string;
    getDayChong(): string;
    getDaySha(): string;
    toString(): string;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYun(gender: number): Yun;
  }

  export class Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    isForward(): boolean;
    getDaYun(n?: number): DaYun[];
  }

  export class DaYun {
    getGanZhi(): string;
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
  }
}
