"use client";

import { useState } from "react";
import type { NamingStructure } from "@/domain/naming/engine";
import { pollHistory, readJson } from "@/lib/api-client";
import { MarkdownReport } from "./MarkdownReport";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Field,
  Input,
  Select,
  Textarea,
} from "./ui";

const STYLES = ["清雅古典", "大气端正", "温润如玉", "现代简约"];

export function NamingForm({ onSaved }: { onSaved?: () => void }) {
  const [styles, setStyles] = useState<string[]>(["清雅古典", "大气端正"]);
  const [birthStatus, setBirthStatus] = useState<"born" | "expected">("born");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [naming, setNaming] = useState<NamingStructure | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMarkdown(null);
    setNaming(null);
    const fd = new FormData(e.currentTarget);
    const birth = String(fd.get("birth") || "");
    const time = String(fd.get("time") || "12:00");
    const [y, m, d] = birth.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);

    try {
      const res = await fetch("/api/naming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surname: String(fd.get("surname") || "").trim(),
          gender: String(fd.get("gender") || "unknown"),
          birthStatus,
          year: birthStatus === "born" ? y : undefined,
          month: birthStatus === "born" ? m : undefined,
          day: birthStatus === "born" ? d : undefined,
          hour: birthStatus === "born" ? hh : undefined,
          minute: birthStatus === "born" ? mm : undefined,
          expectedDate:
            birthStatus === "expected"
              ? String(fd.get("expectedDate") || "")
              : undefined,
          birthplace: String(fd.get("birthplace") || "").trim() || undefined,
          givenNameLength: String(fd.get("givenNameLength") || "two"),
          styles,
          generationCharacter:
            String(fd.get("generationCharacter") || "").trim() || undefined,
          preferredCharacters:
            String(fd.get("preferredCharacters") || "").trim() || undefined,
          avoidCharacters:
            String(fd.get("avoidCharacters") || "").trim() || undefined,
          wishes: String(fd.get("wishes") || "").trim() || undefined,
          note: String(fd.get("note") || "").trim() || undefined,
        }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "取名失败");
      setNaming(data.naming);
      setPending(true);
      setLoading(false);
      await pollHistory(data.id, (rec) => {
        if (rec.naming) setNaming(rec.naming as NamingStructure);
        if (rec.resultMarkdown) setMarkdown(rec.resultMarkdown);
      });
      setPending(false);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "取名失败");
      setLoading(false);
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          eyebrow="名理取名"
          title="宝宝取名"
          subtitle="姓氏、风格与生辰（可选）综合给出候选名与释义。"
        />
        <CardBody>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="姓氏">
                <Input name="surname" required maxLength={8} placeholder="例如：林" defaultValue="林" />
              </Field>
              <Field label="性别">
                <Select name="gender" defaultValue="unknown">
                  <option value="unknown">不限</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                </Select>
              </Field>
              <Field label="名的字数">
                <Select name="givenNameLength" defaultValue="two">
                  <option value="one">单字名</option>
                  <option value="two">双字名</option>
                </Select>
              </Field>
              <Field label="出生状态">
                <Select
                  value={birthStatus}
                  onValueChange={(v) =>
                    setBirthStatus(v as "born" | "expected")
                  }
                >
                  <option value="born">已出生</option>
                  <option value="expected">预产期</option>
                </Select>
              </Field>
              {birthStatus === "born" ? (
                <>
                  <Field label="公历生日">
                    <Input name="birth" type="date" defaultValue="2024-06-01" />
                  </Field>
                  <Field label="出生时间">
                    <Input name="time" type="time" defaultValue="10:00" />
                  </Field>
                </>
              ) : (
                <Field label="预产期">
                  <Input name="expectedDate" type="date" />
                </Field>
              )}
              <Field label="出生地（可选）">
                <Input name="birthplace" placeholder="城市" />
              </Field>
              <Field label="辈分字（可选）">
                <Input name="generationCharacter" maxLength={2} placeholder="如：子" />
              </Field>
              <Field label="喜用字（可选）">
                <Input name="preferredCharacters" placeholder="如：清言" />
              </Field>
              <Field label="避用字（可选）">
                <Input name="avoidCharacters" placeholder="如：病死" />
              </Field>
            </div>

            <div>
              <div className="cn-label mb-2">风格</div>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <Chip
                    key={s}
                    active={styles.includes(s)}
                    onClick={() =>
                      setStyles((prev) =>
                        prev.includes(s)
                          ? prev.filter((x) => x !== s)
                          : [...prev, s],
                      )
                    }
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            </div>

            <Field label="心愿寄语（可选）">
              <Textarea name="wishes" rows={2} placeholder="例如：温厚聪慧、一生平安" />
            </Field>
            <Field label="补充说明（可选）">
              <Textarea name="note" rows={2} />
            </Field>
            <Button type="submit" className="w-full" disabled={loading || pending}>
              {loading ? "整理条件…" : pending ? "取名方案生成中…" : "开始取名"}
            </Button>
          </form>
          {error ? (
            <div className="mt-4">
              <Alert>{error}</Alert>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {naming ? (
        <Card>
          <CardHeader title="取名条件已整理" subtitle={naming.summary} />
          <CardBody>
            <div className="grid gap-2 sm:grid-cols-2">
              {naming.candidates.slice(0, 6).map((c) => (
                <div
                  key={c.fullName}
                  className="rounded-paper border border-daiqing/10 bg-porcelain px-3 py-3"
                >
                  <div className="font-song text-xl font-extrabold tracking-wider text-daiqing">
                    {c.fullName}
                  </div>
                  <div className="mt-1 text-sm text-muted">{c.meaning}</div>
                  <div className="mt-1 text-xs text-faint">五行 {c.wuxingHint}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {markdown ? (
        <Card>
          <CardHeader title="取名方案详解" />
          <CardBody>
            <MarkdownReport content={markdown} />
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
