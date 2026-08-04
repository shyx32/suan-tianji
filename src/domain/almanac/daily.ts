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
  /** 黄道日神（若库可提供） */
  tianShen?: string;
}

export interface FortuneDraw {
  /** 签诗 */
  qian: string;
  /** 签题 */
  title: string;
  /** 吉凶档位 */
  level: "上上" | "上" | "中上" | "中" | "中下";
  /** 运势短句 */
  text: string;
  /** 签意解读 */
  meaning: string;
  /** 今日宜行提示 */
  advice: string;
  /** 心法一句 */
  tip: string;
  seed: number;
}

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];

/** 农历库不可用时的兜底宜忌（真实数据优先走 lunar-javascript） */
const YI_FALLBACK = [
  ["祈福", "出行", "订盟"],
  ["开市", "交易", "立券"],
  ["沐浴", "整手足甲", "扫舍"],
  ["会友", "定约", "学习"],
  ["栽种", "纳财", "修造"],
  ["祭祀", "开光", "安香"],
  ["安床", "入宅", "移徙"],
  ["冠笄", "裁衣", "会亲友"],
];

const JI_FALLBACK = [
  ["动土", "破土"],
  ["安葬", "行丧"],
  ["诉讼", "词讼"],
  ["开仓", "出货财"],
  ["嫁娶", "纳采"],
  ["远行", "渡水"],
  ["造桥", "掘井"],
  ["安门", "作灶"],
];

const FORTUNES = [
  "今日运势：工作顺利，财运平稳，注意人际关系。",
  "今日运势：感情和暖，身体尚可，饮食宜清淡。",
  "今日运势：宜静不宜躁，适合复盘与规划。",
  "今日运势：贵人运佳，适合沟通协作。",
  "今日运势：偏财有机，谨守本分更稳妥。",
  "今日运势：创意涌现，适合学习与表达。",
  "今日运势：节奏偏紧，先完成一件再开下一件。",
  "今日运势：人际顺遂，适合拜访与致谢。",
  "今日运势：心绪易散，减少多线并行。",
  "今日运势：小事可成，大事宜拆步推进。",
  "今日运势：口才得用，提案与讲解有利。",
  "今日运势：财来财去，记账比冲动消费更重要。",
  "今日运势：家务与健康可安排，忌硬撑。",
  "今日运势：合作有回响，单打独斗易费力。",
  "今日运势：旧案可清，新局宜缓。",
  "今日运势：灵感在傍晚更活跃，白天打好基础。",
  "今日运势：情绪起伏，先安己再安人。",
  "今日运势：出行顺利，路线与时间预留余量。",
  "今日运势：学习运开，适合补课与考证。",
  "今日运势：守成为上，冒险宜小步试错。",
  "今日运势：文书契约需细读，忌仓促落笔。",
  "今日运势：贵人在侧，开口求助比硬扛有效。",
  "今日运势：居家安宁，适合整顿空间与作息。",
  "今日运势：偏利表达与创作，少卷入是非。",
];

/** 签诗 + 结构化释义（与 FORTUNES 按 seed 组合，扩大「再摇」差异感） */
const QIAN_POOL: Omit<FortuneDraw, "text" | "seed">[] = [
  {
    qian: "云开见月明，心静自然成。",
    title: "云开月明",
    level: "上上",
    meaning:
      "阴霾将散，本相自现。此刻不必强求结果，先把心安放平稳，局面往往比想象更清晰。",
    advice: "适合收尾旧事、当面沟通、整理思路；重大决策可在心定后再拍板。",
    tip: "静则明，躁则迷。",
  },
  {
    qian: "行稳方致远，积微以成著。",
    title: "行稳致远",
    level: "上",
    meaning:
      "路途不在一时之快，而在步步扎实。小进步叠加，比一次冒进更靠得住。",
    advice: "宜拆分目标、复盘细节、打磨作品；忌好高骛远、半途改道。",
    tip: "慢即是快，细即是成。",
  },
  {
    qian: "一念生春意，万事可商量。",
    title: "一念春生",
    level: "上",
    meaning:
      "转机常起于态度的松动。先换个角度看问题，人情与事务都有回旋余地。",
    advice: "适合约谈、和解、提案与学习新知；把「硬碰」改成「商量」。",
    tip: "念转则境转。",
  },
  {
    qian: "舟行虽有浪，把舵自不迷。",
    title: "把舵不迷",
    level: "中上",
    meaning:
      "波折难免，关键在方向感。守住原则与节奏，浪再大也不致偏航。",
    advice: "外部有变时先稳住主线；少被杂讯带节奏，重要事写下来再做。",
    tip: "手稳，心不慌。",
  },
  {
    qian: "花重锦官城，善念自有邻。",
    title: "善念有邻",
    level: "上上",
    meaning:
      "美景与人缘相互成就。心怀善意，容易遇见同频的人与机会。",
    advice: "宜拜访、合作、表达感谢；把善意落在具体行动，而非空谈。",
    tip: "德不孤，必有邻。",
  },
  {
    qian: "半亩方塘水，清源活水来。",
    title: "清源活水",
    level: "中上",
    meaning:
      "源头清澈，下游自活。今日宜回到基本功与初心，资源会重新流动。",
    advice: "适合学习、健身、清理空间与账户；从「源头」处下功夫。",
    tip: "问渠哪得清如许。",
  },
  {
    qian: "莫愁前路远，大步即天涯。",
    title: "大步天涯",
    level: "中",
    meaning:
      "路远不可怕，怕的是迟疑。跨出第一步，边界会随着行动后移。",
    advice: "宜启动搁置已久的计划；先做最小可行一步，再谈完美。",
    tip: "行则将至。",
  },
  {
    qian: "守中得自在，进退皆从容。",
    title: "守中自在",
    level: "中上",
    meaning:
      "不偏不倚，进退都有余地。今日宜中道而行，少走极端，反而轻松。",
    advice: "谈判取中、日程留白、情绪不过载；不必事事争先。",
    tip: "中则正，正则安。",
  },
  {
    qian: "灯火可亲夜，书声可暖窗。",
    title: "灯火书声",
    level: "上",
    meaning:
      "安静的积累最有后劲。今日偏利向内用力，知识与手艺会成为你的底气。",
    advice: "宜阅读、练习、备课与复盘；减少无谓应酬与夜谈是非。",
    tip: "厚积而薄发。",
  },
  {
    qian: "雨过苔仍绿，风来竹自青。",
    title: "雨过竹青",
    level: "中上",
    meaning:
      "经历扰动之后，本色仍在。不必因一时风雨否定自己的根基。",
    advice: "适合修复关系、补漏洞、做维护型工作；忌因挫败全盘推翻。",
    tip: "本色不改，风雨自过。",
  },
  {
    qian: "路转溪桥忽见，柳暗花明又村。",
    title: "柳暗花明",
    level: "上上",
    meaning:
      "看似尽头处常有转机。换一条路径或换一位对话人，局面可能豁然开朗。",
    advice: "宜尝试新渠道、新组合；旧路不通时及时转弯，不必硬撞。",
    tip: "转念即生路。",
  },
  {
    qian: "秤砣虽小压千斤，一诺千金重。",
    title: "一诺千金",
    level: "上",
    meaning:
      "信用是今日的杠杆。说到做到的小事，会换来更大的信任与资源。",
    advice: "宜履约、交付、兑现承诺；忌空口许诺与拖延交付。",
    tip: "信立则事立。",
  },
  {
    qian: "山高自有客行路，水深自有渡船人。",
    title: "山高有路",
    level: "中上",
    meaning:
      "难题自有解法与帮手。不必把全部重量扛在一人肩上。",
    advice: "宜请教、协作、寻找专业支持；忌闭门硬扛到力竭。",
    tip: "求助亦是能力。",
  },
  {
    qian: "落红不是无情物，化作春泥更护花。",
    title: "落红护花",
    level: "中",
    meaning:
      "结束也是滋养。放下过时的执念，能为新的生长腾出空间。",
    advice: "宜断舍离、归档旧案、做交接；忌纠缠已无解的旧局。",
    tip: "有舍才有得。",
  },
  {
    qian: "纸上得来终觉浅，绝知此事要躬行。",
    title: "躬行得真",
    level: "中上",
    meaning:
      "理论与计划已够，缺的是上手一试。行动会纠正偏差，空想只会放大焦虑。",
    advice: "宜动手做原型、小范围试点；忌只讨论不落地。",
    tip: "做了才知道。",
  },
  {
    qian: "海内存知己，天涯若比邻。",
    title: "知己比邻",
    level: "上",
    meaning:
      "情谊与网络是今日的顺风。远方与近处的连接都能带来暖意与机会。",
    advice: "宜联络旧友、远程协作、分享进展；忌冷落真心相助之人。",
    tip: "情通则事通。",
  },
  {
    qian: "欲穷千里目，更上一层楼。",
    title: "更上层楼",
    level: "上",
    meaning:
      "视野决定答案。站高一层看问题，许多纠缠会自动松绑。",
    advice: "宜做战略复盘、向更高标准对齐；忌困在细节里打转。",
    tip: "站高，才能望远。",
  },
  {
    qian: "梅须逊雪三分白，雪却输梅一段香。",
    title: "各擅胜场",
    level: "中",
    meaning:
      "不必处处争第一。认清自己的长板，与他人形成互补，反而更从容。",
    advice: "宜发挥专长、做差异化；忌盲目攀比与全能焦虑。",
    tip: "扬长，不必求全。",
  },
  {
    qian: "千淘万漉虽辛苦，吹尽狂沙始到金。",
    title: "淘尽见金",
    level: "中上",
    meaning:
      "筛选与坚持终有回报。过程辛苦，是因为杂质正在被去掉。",
    advice: "宜精炼方案、过滤干扰；忌因过程漫长而半途而废。",
    tip: "耐得住，才见金。",
  },
  {
    qian: "春蚕到死丝方尽，蜡炬成灰泪始干。",
    title: "持志不移",
    level: "中",
    meaning:
      "深情与专注都有力量，也需边界。全情投入时，记得为自己留一点余地。",
    advice: "宜完成关键交付、守护重要关系；忌耗尽自己去填无底洞。",
    tip: "尽心，也要留力。",
  },
  {
    qian: "采得百花成蜜后，为谁辛苦为谁甜。",
    title: "成蜜问心",
    level: "中下",
    meaning:
      "付出需要被看见，也需要自我确认。今日宜厘清「为谁而做」。",
    advice: "宜谈清分工与回报、设定边界；忌一味奉献却从不沟通。",
    tip: "问心，再用力。",
  },
  {
    qian: "长风破浪会有时，直挂云帆济沧海。",
    title: "长风破浪",
    level: "上上",
    meaning:
      "时机正在靠近。准备充分的人，会在风起时最先扬帆。",
    advice: "宜完善装备与方案、蓄势待发；忌临阵磨枪或空等风来。",
    tip: "备好，风至可起。",
  },
  {
    qian: "不畏浮云遮望眼，自缘身在最高层。",
    title: "不畏浮云",
    level: "上",
    meaning:
      "杂音再多，也不改你的判断高度。站在原则之上，谣言与干扰会自行散去。",
    advice: "宜坚持既定方向、少刷嘈杂信息；忌被舆论带节奏。",
    tip: "站得高，心自定。",
  },
  {
    qian: "山重水复疑无路，柳暗花明又一村。",
    title: "疑路又村",
    level: "中上",
    meaning:
      "卡住往往是转折前奏。再往前试半步，或换个出口，就会看见新村。",
    advice: "宜多方案并行试探；忌在单一死胡同里反复撞击。",
    tip: "再试半步。",
  },
  {
    qian: "纸鸢有线风中稳，人心无锚易飘零。",
    title: "有线风稳",
    level: "中",
    meaning:
      "约束有时是保护。今日宜给自己定规则、定锚点，而不是追求无限自由。",
    advice: "宜立计划、设截止、固定作息；忌放任情绪与时间被掏空。",
    tip: "有锚，才稳。",
  },
  {
    qian: "一花一叶一如来，寸心寸步寸光阴。",
    title: "寸心寸步",
    level: "中上",
    meaning:
      "微小处见真章。把当下这一寸做好，整体自然成形。",
    advice: "宜处理一件具体小事到完美；忌眼高手低、只谈宏大。",
    tip: "寸积尺累。",
  },
  {
    qian: "潮落沙滩露出金，时退未必是亏空。",
    title: "潮落露金",
    level: "中",
    meaning:
      "退潮显出真实家底。收缩期不是失败，是看清与重整的窗口。",
    advice: "宜盘点资产与能力、削减冗余；忌在退潮时盲目加杠杆。",
    tip: "退潮见真章。",
  },
  {
    qian: "门前有客心先暖，案上无尘事自清。",
    title: "客暖尘清",
    level: "上",
    meaning:
      "内外整洁带来好运气。人来人往的温暖，与环境的清爽，相互成全。",
    advice: "宜待客、整理、开窗通风；忌杂乱环境中做重要决定。",
    tip: "境清则心清。",
  },
];

function daySeed(d: Date): number {
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

function asStringList(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof v === "string" && v.trim()) {
    return v
      .split(/[、,，\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function getAlmanac(date = new Date()): AlmanacDay {
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  // lunar-javascript 类型声明不完整，运行时有 getDayYi / getDayJi 等
  const lunar = solar.getLunar() as {
    getDayYi?: () => unknown;
    getDayJi?: () => unknown;
    getDayTianShen?: () => unknown;
    getDayChongDesc?: () => unknown;
    getDayChong?: () => unknown;
    getDaySha?: () => unknown;
    getYearInGanZhi: () => string;
    getMonthInGanZhi: () => string;
    getDayInGanZhi: () => string;
    getMonthInChinese: () => string;
    getDayInChinese: () => string;
    toString: () => string;
  };
  const seed = daySeed(date);

  let yi = asStringList(
    typeof lunar.getDayYi === "function" ? lunar.getDayYi() : null,
  );
  let ji = asStringList(
    typeof lunar.getDayJi === "function" ? lunar.getDayJi() : null,
  );

  if (yi.length === 0) {
    yi = [...(YI_FALLBACK[seed % YI_FALLBACK.length] ?? ["祈福"])];
  }
  if (ji.length === 0) {
    ji = [...(JI_FALLBACK[Math.floor(seed / 8) % JI_FALLBACK.length] ?? ["动土"])];
  }

  let ganZhi = "";
  try {
    ganZhi = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`;
  } catch {
    ganZhi = lunar.toString();
  }

  let tianShen: string | undefined;
  try {
    const ts =
      typeof lunar.getDayTianShen === "function" ? lunar.getDayTianShen() : "";
    if (ts) tianShen = String(ts);
  } catch {
    tianShen = undefined;
  }

  return {
    solar: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    week: `星期${WEEK[date.getDay()]}`,
    lunar: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    ganZhi,
    yi,
    ji,
    chong: String(lunar.getDayChongDesc?.() ?? lunar.getDayChong?.() ?? "—"),
    sha: String(lunar.getDaySha?.() ?? "—"),
    tianShen,
  };
}

export function drawFortune(date = new Date(), salt = 0): FortuneDraw {
  const seed = (daySeed(date) + salt * 9973) >>> 0;
  const entry = QIAN_POOL[Math.floor(seed / 4) % QIAN_POOL.length]!;
  return {
    ...entry,
    text: FORTUNES[seed % FORTUNES.length]!,
    seed,
  };
}

/** 供测试与监控：数据池规模 */
export function getContentPoolStats() {
  return {
    qian: QIAN_POOL.length,
    fortunes: FORTUNES.length,
    yiFallback: YI_FALLBACK.length,
    jiFallback: JI_FALLBACK.length,
    // 签 × 运势 理论组合上界（再摇时的差异感）
    fortuneCombos: QIAN_POOL.length * FORTUNES.length,
  };
}
