"use client";

import type { BaziChart } from "@/domain/bazi/types";
import { BaguaWheel, Taiji, TrigramGlyph } from "./Ornaments";
import { Card, CardBody, CardHeader } from "./ui";

/** 粗略：按柱位映射卦象装饰（年乾、月巽、日离、时坎） */
const PILLAR_GUA: Record<string, readonly [number, number, number]> = {
  年: [1, 1, 1],
  月: [1, 1, 0],
  日: [1, 0, 1],
  时: [0, 1, 0],
};

export function ChartPanel({ chart }: { chart: BaziChart }) {
  const pillars = [
    { key: "年", p: chart.year },
    { key: "月", p: chart.month },
    { key: "日", p: chart.day },
    { key: "时", p: chart.time },
  ];

  return (
    <Card>
      <CardHeader
        eyebrow="结构化结果"
        title="命盘总览"
        subtitle={`${chart.solarLabel} · ${chart.lunar} · 日主 ${chart.dayMaster}${chart.dayMasterWuXing}`}
        icon={
          <span className="flex h-10 w-10 items-center justify-center rounded-seal border border-daiqing/15 bg-porcelain text-daiqing">
            <Taiji className="h-7 w-7" />
          </span>
        }
      />
      <CardBody className="relative space-y-5 overflow-hidden">
        <div
          className="pointer-events-none absolute -right-8 top-0 h-36 w-36 text-daiqing"
          aria-hidden
        >
          <BaguaWheel
            className="h-full w-full opacity-[0.06]"
            spin
            muted
            showNames={false}
          />
        </div>

        <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-4">
          {pillars.map(({ key, p }) => (
            <div key={key} className="cn-pillar px-3 py-3">
              <div className="flex items-center justify-center gap-1.5">
                <TrigramGlyph
                  lines={PILLAR_GUA[key]}
                  className="h-2.5 w-3.5 text-daiqing/40"
                />
                <div className="text-[11px] font-semibold tracking-[0.18em] text-faint">
                  {key}柱
                </div>
              </div>
              <div className="mt-1.5 font-song text-2xl font-extrabold tracking-[0.2em] text-daiqing">
                {p.ganZhi}
              </div>
              <div className="mt-1 text-xs text-muted">
                {p.shiShenGan} · {p.naYin}
              </div>
              <div className="mt-0.5 text-[11px] text-faint">
                {p.diShi} · 空亡 {p.xunKong}
              </div>
            </div>
          ))}
        </div>

        <div className="relative grid gap-2 sm:grid-cols-3">
          <Meta label="生肖" value={chart.shengXiao} />
          <Meta label="起运" value={chart.yunStart} />
          <Meta
            label="当前大运"
            value={
              chart.currentDaYun
                ? `${chart.currentDaYun.ganZhi}（${chart.currentDaYun.startYear}–${chart.currentDaYun.endYear}）`
                : "—"
            }
          />
          <Meta label="胎元" value={chart.taiYuan} />
          <Meta label="命宫" value={chart.mingGong} />
          <Meta label="身宫" value={chart.shenGong} />
        </div>

        {chart.daYun.length > 0 ? (
          <div className="relative">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-muted">
              <span className="inline-block h-px w-4 bg-daiqing/20" aria-hidden />
              大运一览
            </div>
            <div className="flex flex-wrap gap-2">
              {chart.daYun.map((d) => (
                <span
                  key={`${d.ganZhi}-${d.startYear}`}
                  className={`rounded-paper border px-2.5 py-1 text-xs tracking-wide ${
                    d.current
                      ? "border-daiqing bg-daiqing font-semibold text-white"
                      : "border-daiqing/12 bg-porcelain text-muted"
                  }`}
                >
                  {d.ganZhi} · {d.startYear}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <p className="relative rounded-paper border border-rose/15 bg-rose/5 px-3 py-2.5 font-kai text-sm leading-relaxed text-ink-2">
          {chart.summary}
        </p>
      </CardBody>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-paper border border-daiqing/10 bg-porcelain px-3 py-2">
      <div className="text-[11px] tracking-[0.12em] text-faint">{label}</div>
      <div className="mt-0.5 font-song text-sm text-ink-2">{value}</div>
    </div>
  );
}
