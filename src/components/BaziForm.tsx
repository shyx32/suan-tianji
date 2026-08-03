"use client";

import { useState } from "react";
import type { BaziChart } from "@/domain/bazi/types";
import { pollHistory, readJson } from "@/lib/api-client";
import { ChartPanel } from "./ChartPanel";
import { MarkdownReport } from "./MarkdownReport";
import { Alert, Button, Card, CardBody, CardHeader, Field, Input, Select, Textarea } from "./ui";

const FOCUS = ["事业", "财运", "感情", "健康", "家庭", "人际", "开运"] as const;

export function BaziForm({ onSaved }: { onSaved?: () => void }) {
  const [focus, setFocus] = useState<string[]>(["事业", "财运", "感情"]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);

  function toggle(f: string) {
    setFocus((prev) => {
      if (prev.includes(f)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== f);
      }
      return [...prev, f];
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setPending(false);
    setError(null);
    setMarkdown(null);
    setChart(null);

    const fd = new FormData(e.currentTarget);
    const birth = String(fd.get("birth") || "");
    const time = String(fd.get("time") || "12:00");
    const [y, m, d] = birth.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);

    try {
      const res = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") || "") || undefined,
          gender: String(fd.get("gender") || "male"),
          year: y,
          month: m,
          day: d,
          hour: Number.isFinite(hh) ? hh : 12,
          minute: Number.isFinite(mm) ? mm : 0,
          birthplace: String(fd.get("birthplace") || "").trim() || undefined,
          focus,
          note: String(fd.get("note") || "").trim() || undefined,
        }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || `算命失败（HTTP ${res.status}）`);
      if (!data.chart) throw new Error("返回数据不完整");
      setChart(data.chart);
      if (data.reading && data.status !== "pending") {
        setMarkdown(data.reading);
        setLoading(false);
        onSaved?.();
        return;
      }
      if (!data.id) throw new Error("未返回任务 id");
      setPending(true);
      setLoading(false);
      await pollHistory(data.id, (rec) => {
        if (rec.chart) setChart(rec.chart as BaziChart);
        if (rec.resultMarkdown) setMarkdown(rec.resultMarkdown);
        if (rec.status === "error") {
          setError(rec.error || "报告生成失败");
        }
      });
      setPending(false);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "算命失败");
      setLoading(false);
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          eyebrow="BAZI ENGINE"
          title="生辰八字排盘"
          subtitle="填写出生信息与关心维度。先出结构化命盘，再异步生成详批报告（性格 · 学业 · 事业财运感情 · 健康家庭 · 大运流年 · 开运边界）。"
        />
        <CardBody>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="姓名（可选）">
                <Input name="name" maxLength={40} placeholder="例如：张三" />
              </Field>
              <Field label="性别">
                <Select name="gender" defaultValue="male">
                  <option value="male">男</option>
                  <option value="female">女</option>
                </Select>
              </Field>
              <Field label="出生地" hint="城市越具体，地域提示越准">
                <Input name="birthplace" placeholder="例如：杭州" />
              </Field>
              <Field label="出生日期（公历）">
                <Input name="birth" type="date" required defaultValue="1990-05-15" />
              </Field>
              <Field
                label="出生时间"
                hint="不确定分钟选整点；子时按 23:00–00:59"
              >
                <Input name="time" type="time" required defaultValue="10:00" />
              </Field>
            </div>

            <div>
              <div className="cn-label mb-2">
                所问维度 · 已选 {focus.length} 项 · 至少 1 项
              </div>
              <div className="flex flex-wrap gap-2">
                {FOCUS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={focus.includes(f) ? "cn-chip cn-chip-on" : "cn-chip cn-chip-off"}
                    onClick={() => toggle(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <Field label="补充说明（可选）">
              <Textarea
                name="note"
                maxLength={500}
                rows={3}
                placeholder="例如：目前工作与感情情况，纠结是否跳槽…"
              />
            </Field>

            <Button type="submit" className="w-full" disabled={loading || pending}>
              {loading ? "排盘中…" : pending ? "详批推演中…" : "起卦推演"}
            </Button>
          </form>
          {error ? (
            <div className="mt-4">
              <Alert>{error}</Alert>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {chart ? <ChartPanel chart={chart} /> : null}
      {pending ? (
        <Alert tone="info">详批生成中，正在轮询任务状态（通常数秒内完成）…</Alert>
      ) : null}
      {markdown ? (
        <Card>
          <CardHeader
            eyebrow="REPORT"
            title="详批报告"
            subtitle="由结构化命盘扩写 · 仅供文化娱乐参考"
          />
          <CardBody>
            <MarkdownReport content={markdown} />
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
