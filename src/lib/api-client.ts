export async function readJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(res.ok ? "服务返回异常" : `HTTP ${res.status}`);
  }
}

export async function pollHistory(
  id: string,
  onUpdate: (record: {
    status: string;
    resultMarkdown?: string | null;
    chart?: unknown;
    hepan?: unknown;
    naming?: unknown;
    error?: string | null;
  }) => void,
  opts?: { intervalMs?: number; timeoutMs?: number },
) {
  const intervalMs = opts?.intervalMs ?? 2000;
  const timeoutMs = opts?.timeoutMs ?? 120000;
  const start = Date.now();

  for (;;) {
    const res = await fetch(`/api/history?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const data = await readJson(res);
    const record = data.record;
    if (record) {
      onUpdate(record);
      if (record.status === "ready" || record.status === "error") return record;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error("报告生成时间较长，请到「历史记录」稍后查看");
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
