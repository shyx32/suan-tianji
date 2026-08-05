"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { CloudMotif, Taiji, TrigramGlyph, WuxingDots } from "./Ornaments";
import { QianFullscreen, type QianPhase } from "./QianDraw";
import { Button, Card, CardBody, Seal } from "./ui";

interface Almanac {
  solar: string;
  week: string;
  lunar: string;
  ganZhi: string;
  yi: string[];
  ji: string[];
  chong?: string;
  sha?: string;
  tianShen?: string;
}

const TIPS = [
  {
    title: "观宜忌",
    desc: "宜忌为民俗通书摘要，可作生活节奏参考，不必拘泥字面。",
  },
  {
    title: "读干支",
    desc: "年月日干支连读，能感知当日节气与五行气韵的大致偏向。",
  },
  {
    title: "摇签文",
    desc: "签文偏重心境提示。一念澄清，比执着吉凶更有用。",
  },
  {
    title: "冲煞向",
    desc: "冲煞为传统方位说，出行与安床等民俗活动或会参考。",
  },
];

type FortuneState = {
  qian: string;
  text: string;
  title?: string;
  level?: string;
  meaning?: string;
  advice?: string;
  tip?: string;
};

export function AlmanacPanel() {
  const [almanac, setAlmanac] = useState<Almanac | null>(null);
  const [fortune, setFortune] = useState<FortuneState | null>(null);
  const [salt, setSalt] = useState(0);
  const [phase, setPhase] = useState<QianPhase>("idle");
  const [resultKey, setResultKey] = useState(0);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const load = useCallback(async (s: number) => {
    const res = await fetch(`/api/almanac?salt=${s}`, { cache: "no-store" });
    const data = await res.json();
    if (data.ok) {
      setAlmanac(data.almanac);
      const f = data.fortune ?? {};
      setFortune({
        qian: f.qian ?? "",
        text: f.text ?? "",
        title: f.title,
        level: f.level,
        meaning: f.meaning,
        advice: f.advice,
        tip: f.tip,
      });
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load]);

  const prefersReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  async function drawQian() {
    if (phase === "shaking" || phase === "drawn") return;
    clearTimers();

    const next = salt + 1;
    setSalt(next);

    if (prefersReducedMotion()) {
      await load(next);
      setPhase("reveal");
      setResultKey((k) => k + 1);
      return;
    }

    setPhase("shaking");
    const fetchPromise = load(next);

    timers.current.push(
      window.setTimeout(() => {
        setPhase("drawn");
      }, 1200),
    );
    timers.current.push(
      window.setTimeout(() => {
        void fetchPromise.finally(() => {
          setPhase("reveal");
          setResultKey((k) => k + 1);
        });
      }, 1900),
    );
  }

  function closeQian() {
    clearTimers();
    setPhase("idle");
  }

  const drawing = phase === "shaking" || phase === "drawn" || phase === "reveal";
  const tipLabel =
    fortune?.level?.replace("签", "") || fortune?.title?.slice(0, 2) || "签";

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <Card>
          <CardBody className="relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
            <CloudMotif className="pointer-events-none absolute -right-2 top-2 h-12 w-32 text-daiqing/10" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="font-song text-xs font-semibold tracking-[0.2em] text-daiqing/70">
                  通书
                </div>
                <span className="text-daiqing/30" aria-hidden>
                  <TrigramGlyph lines={[1, 0, 1]} className="h-3 w-4" />
                </span>
              </div>
              <Seal className="h-8 min-w-8 text-[10px]">日</Seal>
            </div>

            <div className="cn-tabular relative mt-2 font-song text-3xl font-extrabold tracking-tight text-daiqing sm:text-4xl">
              {almanac?.solar ?? "— — —"}
            </div>
            <div className="relative mt-2 flex flex-wrap gap-2 text-sm text-muted">
              <span className="rounded-paper bg-porcelain-muted px-2.5 py-0.5 tracking-wide">
                {almanac?.week ?? "星期 …"}
              </span>
              <span>农历 {almanac?.lunar ?? "…"}</span>
            </div>
            <div className="relative mt-1.5 font-song text-sm tracking-wide text-ink-2">
              {almanac?.ganZhi ?? "推演中…"}
            </div>

            <div className="relative mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-paper border border-daiqing/10 bg-porcelain px-2.5 py-2">
                <div className="text-[10px] tracking-[0.14em] text-faint">冲</div>
                <div className="mt-0.5 font-song text-sm text-daiqing">
                  {almanac?.chong ?? "—"}
                </div>
              </div>
              <div className="rounded-paper border border-daiqing/10 bg-porcelain px-2.5 py-2">
                <div className="text-[10px] tracking-[0.14em] text-faint">煞</div>
                <div className="mt-0.5 font-song text-sm text-daiqing">
                  {almanac?.sha ?? "—"}
                </div>
              </div>
              <div className="rounded-paper border border-daiqing/10 bg-porcelain px-2.5 py-2">
                <div className="text-[10px] tracking-[0.14em] text-faint">日神</div>
                <div className="mt-0.5 font-song text-sm text-daiqing">
                  {almanac?.tianShen ?? "—"}
                </div>
              </div>
            </div>

            <div className="cn-cloud-divider my-3" aria-hidden>
              <Taiji className="h-4 w-4 shrink-0 text-daiqing/40" />
            </div>

            <div className="mt-1 grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-paper border border-sage/20 bg-sage/5 p-2.5 sm:p-3">
                <div className="flex items-center justify-between">
                  <div className="font-song text-xs font-bold tracking-[0.16em] text-sage">
                    宜
                  </div>
                  <TrigramGlyph lines={[1, 1, 1]} className="h-3 w-4 text-sage/50" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(almanac?.yi ?? ["—"]).map((x) => (
                    <span
                      key={x}
                      className="rounded-paper border border-sage/10 bg-porcelain-card px-2.5 py-0.5 text-xs text-ink-2 shadow-sm"
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-paper border border-rose/20 bg-rose/5 p-2.5 sm:p-3">
                <div className="flex items-center justify-between">
                  <div className="font-song text-xs font-bold tracking-[0.16em] text-rose">
                    忌
                  </div>
                  <TrigramGlyph lines={[0, 0, 0]} className="h-3 w-4 text-rose/50" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(almanac?.ji ?? ["—"]).map((x) => (
                    <span
                      key={x}
                      className="rounded-paper border border-rose/10 bg-porcelain-card px-2.5 py-0.5 text-xs text-ink-2 shadow-sm"
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mt-4 border-t border-daiqing/8 pt-3">
              <WuxingDots />
              <p className="mt-2 text-[11px] leading-relaxed text-faint">
                通书内容综合农历与民俗条目生成，侧重文化趣味，不作专业术数结论。
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-rose/20">
          <CardBody className="cn-corner-frame relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 text-rose/10"
              aria-hidden
            >
              <Taiji className="h-full w-full" spin />
            </div>
            <div className="relative flex items-center gap-3">
              <Seal className="h-10 w-10 text-sm sm:h-11 sm:w-11">签</Seal>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-song font-bold tracking-[0.1em] text-daiqing">
                    今日签文
                  </div>
                  {fortune?.level && !drawing ? (
                    <span className="rounded-seal border border-rose/30 bg-rose/10 px-1.5 py-0.5 font-song text-[10px] font-bold tracking-[0.14em] text-rose">
                      {fortune.level}签
                    </span>
                  ) : null}
                </div>
                <div className="text-xs tracking-wide text-faint">
                  {fortune?.title
                    ? `「${fortune.title}」· 摇一签 · 观阴阳消长`
                    : "摇一签 · 观阴阳消长"}
                </div>
              </div>
            </div>

            {/* 全屏摇签层 */}
            <QianFullscreen
              open={drawing}
              phase={phase}
              label={tipLabel}
              result={fortune}
              onClose={closeQian}
            />

            <div
              key={resultKey}
              className={clsx(
                "qian-result relative mt-4 flex flex-col",
                phase === "idle" && resultKey > 0 && "is-enter",
              )}
            >
              <p className="font-kai text-lg font-semibold leading-relaxed tracking-wide text-daiqing">
                {fortune?.qian || "…"}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {fortune?.text || "…"}
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <div className="rounded-paper border border-daiqing/10 bg-porcelain/90 px-3 py-2.5">
                  <div className="font-song text-[11px] font-bold tracking-[0.16em] text-daiqing/70">
                    签意
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-2 sm:text-[13px]">
                    {fortune?.meaning ||
                      "签文为文化趣味提示，结合自身处境细读即可，不必拘泥字面。"}
                  </p>
                </div>
                <div className="rounded-paper border border-sage/15 bg-sage/5 px-3 py-2.5">
                  <div className="font-song text-[11px] font-bold tracking-[0.16em] text-sage">
                    今日宜行
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-2 sm:text-[13px]">
                    {fortune?.advice || "宜静心安排日程，重要事写下来再行动。"}
                  </p>
                </div>
                <div className="rounded-paper border border-rose/12 bg-rose/5 px-3 py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-song text-[11px] font-bold tracking-[0.16em] text-rose">
                      心法
                    </span>
                    <span className="font-kai text-sm font-semibold tracking-wide text-daiqing">
                      {fortune?.tip || "心有所问，签有所答。"}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-faint">
                  心有所问，签有所答。若连摇数签，宜取最先触动你的一句；仅供文化娱乐，不作专业决断依据。
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              className="relative mt-3 w-full sm:mt-4"
              type="button"
              disabled={phase === "shaking" || phase === "drawn"}
              aria-busy={phase === "shaking" || phase === "drawn"}
              onClick={() => void drawQian()}
            >
              {phase === "shaking" || phase === "drawn" ? "摇签中…" : "再摇一签"}
            </Button>
          </CardBody>
        </Card>
      </div>

      <div className="cn-tile-grid cn-tile-grid-4">
        {TIPS.map((t) => (
          <div key={t.title} className="cn-tile">
            <div className="cn-tile-title">{t.title}</div>
            <p className="cn-tile-desc">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
