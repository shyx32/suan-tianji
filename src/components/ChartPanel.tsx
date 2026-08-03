"use client";

import type { BaziChart } from "@/domain/bazi/types";
import { Card, CardBody, CardHeader } from "./ui";

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
      />
      <CardBody className="space-y-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {pillars.map(({ key, p }) => (
            <div
              key={key}
              className="rounded-2xl border border-daiqing/8 bg-porcelain px-3 py-3 text-center"
            >
              <div className="text-[11px] font-semibold tracking-[0.16em] text-faint">
                {key}柱
              </div>
              <div className="mt-1.5 text-2xl font-extrabold tracking-[0.18em] text-daiqing">
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

        <div className="grid gap-2 sm:grid-cols-3">
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
          <div>
            <div className="mb-2 text-xs font-semibold tracking-wide text-muted">
              大运一览
            </div>
            <div className="flex flex-wrap gap-2">
              {chart.daYun.map((d) => (
                <span
                  key={`${d.ganZhi}-${d.startYear}`}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    d.current
                      ? "border-daiqing bg-daiqing font-semibold text-white"
                      : "border-daiqing/10 bg-porcelain text-muted"
                  }`}
                >
                  {d.ganZhi} · {d.startYear}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <p className="rounded-2xl border border-rose/10 bg-rose/5 px-3 py-2.5 text-sm leading-relaxed text-ink-2">
          {chart.summary}
        </p>
      </CardBody>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-daiqing/8 bg-porcelain px-3 py-2">
      <div className="text-[11px] tracking-wide text-faint">{label}</div>
      <div className="mt-0.5 text-sm text-ink-2">{value}</div>
    </div>
  );
}
