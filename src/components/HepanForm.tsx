"use client";

import { useState } from "react";
import type { HepanStructure } from "@/domain/hepan/engine";
import { pollHistory, readJson } from "@/lib/api-client";
import { MarkdownReport } from "./MarkdownReport";
import { Alert, Button, Card, CardBody, CardHeader, Field, Input, Select } from "./ui";

function PersonFields({ prefix, label }: { prefix: string; label: string }) {
  return (
    <div className="rounded-2xl border border-daiqing/10 bg-porcelain p-4">
      <div className="mb-3 text-sm font-bold tracking-[0.08em] text-daiqing">
        {label}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="姓名（可选）">
          <Input name={`${prefix}.name`} maxLength={40} placeholder="例如：张三" />
        </Field>
        <Field label="性别">
          <Select name={`${prefix}.gender`} defaultValue={prefix === "personA" ? "male" : "female"}>
            <option value="male">男</option>
            <option value="female">女</option>
          </Select>
        </Field>
        <Field label="出生地">
          <Input name={`${prefix}.birthplace`} placeholder="城市" />
        </Field>
        <Field label="公历生日">
          <Input
            name={`${prefix}.birth`}
            type="date"
            required
            defaultValue={prefix === "personA" ? "1990-05-15" : "1992-08-20"}
          />
        </Field>
        <Field label="出生时间">
          <Input
            name={`${prefix}.time`}
            type="time"
            required
            defaultValue={prefix === "personA" ? "10:00" : "14:30"}
          />
        </Field>
      </div>
    </div>
  );
}

function parsePerson(fd: FormData, prefix: string) {
  const birth = String(fd.get(`${prefix}.birth`) || "");
  const time = String(fd.get(`${prefix}.time`) || "12:00");
  const [y, m, d] = birth.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return {
    name: String(fd.get(`${prefix}.name`) || "").trim() || undefined,
    gender: String(fd.get(`${prefix}.gender`) || "male"),
    year: y,
    month: m,
    day: d,
    hour: Number.isFinite(hh) ? hh : 12,
    minute: Number.isFinite(mm) ? mm : 0,
    birthplace: String(fd.get(`${prefix}.birthplace`) || "").trim() || undefined,
  };
}

export function HepanForm({ onSaved }: { onSaved?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hepan, setHepan] = useState<HepanStructure | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMarkdown(null);
    setHepan(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/hepan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personA: parsePerson(fd, "personA"),
          personB: parsePerson(fd, "personB"),
          focus: ["感情", "人际"],
        }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "合盘失败");
      setHepan(data.hepan);
      setPending(true);
      setLoading(false);
      await pollHistory(data.id, (rec) => {
        if (rec.hepan) setHepan(rec.hepan as HepanStructure);
        if (rec.resultMarkdown) setMarkdown(rec.resultMarkdown);
      });
      setPending(false);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "合盘失败");
      setLoading(false);
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          eyebrow="COMPAT"
          title="双盘合参"
          subtitle="输入甲乙双方生辰，先得结构关系提示，再生成缘分解读。"
        />
        <CardBody>
          <form className="space-y-4" onSubmit={onSubmit}>
            <PersonFields prefix="personA" label="甲 · 求测人" />
            <PersonFields prefix="personB" label="乙 · 对方" />
            <Button type="submit" className="w-full" disabled={loading || pending}>
              {loading ? "排盘中…" : pending ? "合参推演中…" : "合盘推演"}
            </Button>
          </form>
          {error ? (
            <div className="mt-4">
              <Alert>{error}</Alert>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {hepan ? (
        <Card>
          <CardHeader eyebrow="MATRIX" title="合盘结构" subtitle={hepan.summary} />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-daiqing/10 bg-porcelain p-3">
              <div className="text-xs text-faint">甲盘四柱</div>
              <div className="mt-1 text-lg font-bold tracking-wider text-daiqing">
                {hepan.personA.year.ganZhi} {hepan.personA.month.ganZhi}{" "}
                {hepan.personA.day.ganZhi} {hepan.personA.time.ganZhi}
              </div>
            </div>
            <div className="rounded-2xl border border-daiqing/10 bg-porcelain p-3">
              <div className="text-xs text-faint">乙盘四柱</div>
              <div className="mt-1 text-lg font-bold tracking-wider text-daiqing">
                {hepan.personB.year.ganZhi} {hepan.personB.month.ganZhi}{" "}
                {hepan.personB.day.ganZhi} {hepan.personB.time.ganZhi}
              </div>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-rose/15 bg-rose/5 px-3 py-2 text-sm text-ink-2">
              缘分指数约{" "}
              <strong className="text-rose">{hepan.relationCounts.scoreHint}</strong> ·
              合冲：{hepan.relationCounts.zhiRelations.join("、") || "平和"}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {markdown ? (
        <Card>
          <CardHeader title="合盘报告" />
          <CardBody>
            <MarkdownReport content={markdown} />
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
