export type ServiceId = "bazi" | "hepan" | "naming" | "palm" | "history";

export const SERVICES: {
  id: ServiceId;
  href: `/${ServiceId}`;
  label: string;
  desc: string;
  short: string;
  gua: number;
  blurb: string;
}[] = [
  {
    id: "bazi",
    href: "/bazi",
    label: "生辰八字",
    desc: "详批命盘",
    short: "八字",
    gua: 3,
    blurb: "四柱排盘，同步结构，异步长文详批。",
  },
  {
    id: "hepan",
    href: "/hepan",
    label: "双盘合参",
    desc: "缘分对照",
    short: "合参",
    gua: 0,
    blurb: "双方八字对照，看合冲与相处节奏。",
  },
  {
    id: "naming",
    href: "/naming",
    label: "宝宝取名",
    desc: "名理建议",
    short: "取名",
    gua: 6,
    blurb: "音形义与五行提示，给出候选名理。",
  },
  {
    id: "palm",
    href: "/palm",
    label: "手相观掌",
    desc: "图像解读",
    short: "手相",
    gua: 4,
    blurb: "上传掌纹，模型解读意象仅供娱乐。",
  },
  {
    id: "history",
    href: "/history",
    label: "历史记录",
    desc: "本机会话",
    short: "历史",
    gua: 5,
    blurb: "回看本机已完成的测算与详批。",
  },
];

export const SERVICE_HIGHLIGHTS = [
  {
    title: "结构先行",
    desc: "先出四柱、大运、纳音等可读结构，再等详批长文，信息层次清楚。",
  },
  {
    title: "异步详批",
    desc: "长文走任务队列，页面可继续浏览通书或切换其他测算，无需干等。",
  },
  {
    title: "八卦意象",
    desc: "太极八卦与朱印纸本仅作文化装帧，不替代专业判断与现实选择。",
  },
  {
    title: "本机历史",
    desc: "会话内可回看记录，方便对照多次推演；请勿提交敏感隐私。",
  },
];

export function getService(id: ServiceId) {
  return SERVICES.find((s) => s.id === id)!;
}

export function isServicePath(pathname: string): boolean {
  return SERVICES.some((s) => s.href === pathname);
}
