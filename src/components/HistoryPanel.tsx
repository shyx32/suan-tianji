"use client";

import { useCallback, useEffect, useState } from "react";
import { readJson } from "@/lib/api-client";
import { MarkdownReport } from "./MarkdownReport";
import { Alert, Button, Card, CardBody, CardHeader } from "./ui";

interface Summary {
  id: string;
  type: string;
  title: string;
  status: string;
  createdAt: string;
  preview: string | null;
}

interface Detail {
  id: string;
  title: string;
  resultMarkdown?: string | null;
  status: string;
  type?: string;
}

const TYPE_LABEL: Record<string, string> = {
  bazi: "八字",
  hepan: "合盘",
  naming: "取名",
  palm: "手相",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "排队中",
  processing: "推演中",
  ready: "已完成",
  error: "失败",
};

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "ready"
      ? "border-sage/25 bg-sage/10 text-sage"
      : status === "error"
        ? "border-rose/25 bg-rose/10 text-rose"
        : status === "processing"
          ? "border-daiqing/20 bg-daiqing/8 text-daiqing"
          : "border-daiqing/10 bg-porcelain text-muted";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone}`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function HistoryPanel({ refreshKey }: { refreshKey: number }) {
  const [records, setRecords] = useState<Summary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Detail | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history", { cache: "no-store" });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "加载失败");
      setRecords(data.records || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function openOne(id: string) {
    const res = await fetch(`/api/history?id=${encodeURIComponent(id)}`);
    const data = await readJson(res);
    if (data.record) {
      setActive({
        id: data.record.id,
        title: data.record.title,
        resultMarkdown: data.record.resultMarkdown,
        status: data.record.status,
        type: data.record.type,
      });
    }
  }

  async function remove(id: string) {
    const res = await fetch("/api/history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setError("删除失败，请稍后重试");
      return;
    }
    setActive((a) => (a?.id === id ? null : a));
    await load();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          eyebrow="本机会话"
          title="历史记录"
          subtitle="基于浏览器 Cookie，仅本机可见；换设备不会同步。"
        />
        <CardBody className="space-y-3">
          {error ? <Alert>{error}</Alert> : null}
          {loading ? (
            <p className="text-sm text-muted">加载中…</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted">暂无记录，先去排一盘吧。</p>
          ) : (
            records.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-2 rounded-2xl border border-daiqing/8 bg-porcelain px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-daiqing">{r.title}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-0.5 text-xs text-faint">
                    {TYPE_LABEL[r.type] || r.type} ·{" "}
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="ghost" onClick={() => void openOne(r.id)}>
                    查看
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => void remove(r.id)}>
                    删除
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {active ? (
        <Card>
          <CardHeader
            title={active.title}
            subtitle={`状态：${STATUS_LABEL[active.status] || active.status}`}
          />
          <CardBody>
            {active.resultMarkdown ? (
              <MarkdownReport content={active.resultMarkdown} />
            ) : (
              <p className="text-sm text-muted">
                {active.status === "pending" || active.status === "processing"
                  ? "报告生成中，请稍后刷新查看。"
                  : "报告尚未就绪或生成失败。"}
              </p>
            )}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
