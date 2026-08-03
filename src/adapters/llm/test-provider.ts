import type { LlmProvider } from "@/ports";
import type { BaziChart } from "@/domain/bazi/types";
import type { HepanStructure } from "@/domain/hepan/engine";
import type { NamingStructure } from "@/domain/naming/engine";

function baziMarkdown(chart: BaziChart, focus: string[] = []): string {
  const pillars = [chart.year, chart.month, chart.day, chart.time];
  const focusLine = (focus.length ? focus : chart.focus || ["综合"]).join("、");
  const dayun = chart.daYun
    .map(
      (d) =>
        `| ${d.ganZhi} | ${d.startYear}–${d.endYear} | ${d.startAge}–${d.endAge}岁 | ${d.current ? "当前" : ""} |`,
    )
    .join("\n");

  return `# 八字命盘分析

## 基本信息
- **求测人**：${chart.name || "匿名"}（${chart.gender === "male" ? "男" : "女"}）
- **出生时间**：公历 ${chart.solarLabel}（农历 ${chart.lunar}）
- **生肖**：${chart.shengXiao}
- **出生地**：${chart.birthplace || "未填"}
- **分析年份**：${chart.analysisYear}
- **核心关注**：${focusLine}
- **时辰提示**：${chart.timePeriodHint}

---

## 一、命盘总览

### 四柱排盘

| 柱别 | 十神 | 天干 | 地支 | 藏干十神 | 十二长生 | 空亡 | 纳音 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **年柱** | ${chart.year.shiShenGan} | ${chart.year.gan} | ${chart.year.zhi} | ${chart.year.shiShenZhi.join("、")} | ${chart.year.diShi} | ${chart.year.xunKong} | ${chart.year.naYin} |
| **月柱** | ${chart.month.shiShenGan} | ${chart.month.gan} | ${chart.month.zhi} | ${chart.month.shiShenZhi.join("、")} | ${chart.month.diShi} | ${chart.month.xunKong} | ${chart.month.naYin} |
| **日柱** | **日主** | **${chart.day.gan}** | ${chart.day.zhi} | ${chart.day.shiShenZhi.join("、")} | ${chart.day.diShi} | **${chart.day.xunKong}** | ${chart.day.naYin} |
| **时柱** | ${chart.time.shiShenGan} | ${chart.time.gan} | ${chart.time.zhi} | ${chart.time.shiShenZhi.join("、")} | ${chart.time.diShi} | ${chart.time.xunKong} | ${chart.time.naYin} |

### 日主与格局

1. **日主**：${chart.dayMaster}（${chart.dayMasterWuXing}），四柱为 ${pillars.map((p) => p.ganZhi).join(" ")}。
2. **起运**：${chart.yunStart}；大运方向：${chart.yunForward ? "顺行" : "逆行"}。
3. **宫位**：胎元 ${chart.taiYuan} · 胎息 ${chart.taiXi} · 命宫 ${chart.mingGong} · 身宫 ${chart.shenGong}。
4. **摘要**：${chart.summary}

### 大运一览

| 大运 | 起止年份 | 虚岁 | 标记 |
| :--- | :--- | :--- | :--- |
${dayun}

### 白话速解
日主 ${chart.dayMaster}${chart.dayMasterWuXing}，年柱 ${chart.year.ganZhi}（${chart.year.naYin}）奠定出身底色，月柱 ${chart.month.ganZhi} 为格局提纲，日支 ${chart.day.zhi} 为配偶宫与内心底色，时柱 ${chart.time.ganZhi} 关乎晚运与子女。当前分析年 ${chart.analysisYear}${chart.currentDaYun ? `，正值 ${chart.currentDaYun.ganZhi} 大运（${chart.currentDaYun.startYear}–${chart.currentDaYun.endYear}）` : ""}。

### 韵文点睛
四柱罗列有经纬，日主为枢自权衡；大运推移观气象，流年起伏慎度量。

## 二、性格与心性

### 白话速解
以日主 ${chart.dayMaster} 为中心，十神组合显示其人外在风度与内在张力。年干 ${chart.year.shiShenGan}、月干 ${chart.month.shiShenGan}、时干 ${chart.time.shiShenGan} 共同塑造处事节奏：宜扬长避短，勿过度消耗。

### 韵文点睛
性由日主见真章，十神来往细端详；能收能放方为妙，过刚易折过柔伤。

## 三、学业与资质

### 白话速解
印星与食伤结构影响学习路径。若关注学业，宜结合 ${chart.dayMasterWuXing} 喜用，选择能持续积累的方向，忌三天打鱼两天晒网。

### 韵文点睛
书山有路勤为径，印食相生志可承；莫待流年空过尽，寸阴是惜胜千金。

## 四、事业

### 白话速解
${focus.includes("事业") || !focus.length ? `事业为关注重点。官杀与食伤分布提示适合的职场角色：可在与出生地「${chart.birthplace || "本地"}」相关的产业节奏中寻找定位。当前大运阶段宜稳中求进，重大跳槽宜避开冲动。` : "事业维度可作辅助参考，宜以当下现实能力为基。"}

### 韵文点睛
功名路上有炎凉，把稳舵心自不忙；一艺傍身胜虚誉，脚踏实地是金刚。

## 五、财运

### 白话速解
${focus.includes("财运") || !focus.length ? "财星与比劫关系决定进财与守财能力。建议：正财稳健积累，偏财机会需风控；忌在情绪化时做大额决策。" : "财运作旁参，重在量入为出。"}

### 韵文点睛
财来财去本无常，守正方能细水长；投机取巧多波折，厚德载物自生光。

## 六、感情婚姻

### 白话速解
${focus.includes("感情") || !focus.length ? `夫妻宫在日支 ${chart.day.zhi}，结合年命生肖 ${chart.shengXiao} 看相处模式。宜坦诚沟通，识别消耗型关系。` : "感情维度略述：以尊重与边界为先。"}

### 韵文点睛
缘深缘浅各有时，日支一宫细寻思；真心换得真心在，强求反使两心迟。

## 七、健康

### 白话速解
${focus.includes("健康") || !focus.length ? `五行 ${chart.dayMasterWuXing} 日主，注意与之对应的脏腑作息平衡，作息与运动比进补更重要。` : "健康以体检与作息为准，命理仅文化参考。"}

### 韵文点睛
身安方能万事兴，五行偏颇在调平；饮食睡眠为基础，小疾早治勿因循。

## 八、家庭与人际

### 白话速解
年柱关乎六亲，月柱同事环境，时柱晚辈与部属。人际上贵人多为能补自身短板之人。

### 韵文点睛
家和邻睦路自宽，言行有度少波澜；敬上恤下常怀德，君子之交淡亦欢。

## 九、开运边界

1. 本报告由结构化命盘 + 生成模型扩写，**仅供文化娱乐参考**。
2. 不构成医疗、投资、婚恋、法律等专业建议。
3. 重大决策请咨询持证专业人士与现实条件。
4. 开运建议仅限：作息、学习、沟通、审美与心态层面的温和调整。

---

*测试模式报告 · model=test-provider · ${new Date().toISOString()}*
`;
}

function hepanMarkdown(h: HepanStructure): string {
  return `# 双盘合参报告

## 缘分摘要
${h.summary}

## 甲盘
- 姓名：${h.personA.name || "甲"}
- 四柱：${h.personA.year.ganZhi} ${h.personA.month.ganZhi} ${h.personA.day.ganZhi} ${h.personA.time.ganZhi}
- 日主：${h.personA.dayMaster}${h.personA.dayMasterWuXing}

## 乙盘
- 姓名：${h.personB.name || "乙"}
- 四柱：${h.personB.year.ganZhi} ${h.personB.month.ganZhi} ${h.personB.day.ganZhi} ${h.personB.time.ganZhi}
- 日主：${h.personB.dayMaster}${h.personB.dayMasterWuXing}

## 关系要点
- 缘分指数（规则启发）：**${h.relationCounts.scoreHint}**
- 天干关系：${h.relationCounts.ganRelations.join("、") || "无明显同气"}
- 地支合冲：${h.relationCounts.zhiRelations.join("、") || "整体平和"}
- 五行互补位：${h.relationCounts.wuxingComplement.join("、") || "较为均衡"}

### 白话速解
双方日主一为 ${h.personA.dayMasterWuXing}、一为 ${h.personB.dayMasterWuXing}，相处宜求互补而非同质竞争。合则珍惜，冲则沟通；指数仅供娱乐参考。

### 韵文点睛
双盘对参看性情，合处生暖冲处明；知己知彼可长久，强扭之瓜不可成。

## 边界与免责
本合盘结果仅供文化娱乐，不构成婚恋或人际关系专业建议。

*测试模式报告 · ${new Date().toISOString()}*
`;
}

function namingMarkdown(n: NamingStructure): string {
  const rows = n.candidates
    .map(
      (c, i) =>
        `| ${i + 1} | **${c.fullName}** | ${c.givenName} | ${c.wuxingHint} | ${c.meaning} | ${c.styleTags.join("、") || "—"} |`,
    )
    .join("\n");
  return `# 宝宝取名方案

## 条件摘要
${n.summary}

## 五行补益倾向
${n.lackWuxing.join("、") || "相对均衡"}

${n.chart ? `## 参考命盘\n日主 ${n.chart.dayMaster}${n.chart.dayMasterWuXing}，四柱 ${n.chart.year.ganZhi} ${n.chart.month.ganZhi} ${n.chart.day.ganZhi} ${n.chart.time.ganZhi}\n` : ""}

## 推荐用名

| # | 全名 | 名 | 五行提示 | 寓意 | 风格 |
| :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

### 选用建议
1. 先读音顺口，再看字形结构与家族辈分。
2. 可与户口、学校系统生僻字限制交叉核对。
3. 最终命名权在家长，本方案仅文化参考。

## 免责
取名结果由规则引擎与文案生成，不保证任何运势效力。

*测试模式报告 · ${new Date().toISOString()}*
`;
}

export function createTestLlmProvider(): LlmProvider {
  return {
    async generateReport(input) {
      let markdown: string;
      if (input.kind === "bazi") {
        markdown = baziMarkdown(input.structure as BaziChart, input.focus);
      } else if (input.kind === "hepan") {
        markdown = hepanMarkdown(input.structure as HepanStructure);
      } else if (input.kind === "naming") {
        markdown = namingMarkdown(input.structure as NamingStructure);
      } else {
        markdown = `# 报告\n\n${input.title}\n\n（测试模式通用报告）\n`;
      }
      // ensure substantial length for bazi
      return {
        markdown,
        model: "test-provider",
        tokensIn: 0,
        tokensOut: markdown.length,
      };
    },
    async analyzePalm({ name }) {
      const markdown = `# 手相观掌解读

## 求测
${name ? `姓名：${name}` : "未留名"}（图像已接收）

## 总体印象
掌形舒展、纹路深浅有致（基于上传图像的视觉描述模板）。以下为文化娱乐向掌纹学解说，**非医疗诊断**。

## 生命线
生命线弧度适中，提示体力节奏整体稳定；注意作息，避免长期透支。

## 智慧线
智慧线走向清晰，思绪较敏锐，适合需要分析与表达的事务；压力大时宜放松双眼与颈椎。

## 感情线
感情线起伏有度，重真诚沟通；感情决策宜慢不宜躁。

## 事业线 / 辅助纹
若可见事业线，提示对成就有自我要求；贵人多为能直言相劝者。

## 开运小建议（生活向）
1. 保持手腕与手掌活动，避免长时间同一姿势。
2. 重要决定写下利弊再睡一晚。
3. 本解读仅供文化娱乐参考。

*测试模式 · vision-stub · ${new Date().toISOString()}*
`;
      return { markdown, model: "test-vision", tokensOut: markdown.length };
    },
  };
}
