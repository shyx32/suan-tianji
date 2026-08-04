"use client";

import { useState } from "react";
import { readJson } from "@/lib/api-client";
import { MarkdownReport } from "./MarkdownReport";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  FileUpload,
  Input,
} from "./ui";

export function PalmForm({ onSaved }: { onSaved?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("请先上传手掌照片");
      return;
    }
    setLoading(true);
    setError(null);
    setReading(null);
    const fd = new FormData(e.currentTarget);
    fd.set("photo", file);
    try {
      const res = await fetch("/api/palm", { method: "POST", body: fd });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "解读失败");
      setReading(data.reading);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "解读失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          eyebrow="手相观掌"
          title="手相观掌"
          subtitle="请上传清晰手掌照片，掌心朝上、光线充足。"
        />
        <CardBody>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="姓名（可选）">
              <Input name="name" maxLength={40} placeholder="可选" />
            </Field>
            <Field label="手掌照片">
              <FileUpload
                file={file}
                onChange={setFile}
                listType="picture-card"
                drag
                maxSizeMb={2.5}
                tip="支持 jpg / png / webp，不超过 2.5MB"
                disabled={loading}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={loading || !file}>
              {loading ? "观掌中…" : "开始解读"}
            </Button>
          </form>
          {error ? (
            <div className="mt-4">
              <Alert>{error}</Alert>
            </div>
          ) : null}
        </CardBody>
      </Card>
      {reading ? (
        <Card>
          <CardHeader title="手相结果" subtitle="仅供文化娱乐，不构成医疗建议" />
          <CardBody>
            <MarkdownReport content={reading} />
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
