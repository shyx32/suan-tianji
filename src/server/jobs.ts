import type { AppRuntime } from "@/ports";
import type { ReadingType } from "@/ports/types";

export async function processReadingById(
  runtime: AppRuntime,
  id: string,
): Promise<void> {
  const row = await runtime.readings.getById(id);
  // Claimed jobs are `processing`; inline enqueue may still be `pending`.
  if (!row || (row.status !== "pending" && row.status !== "processing")) return;

  try {
    if (row.type === "palm") {
      // palm usually written synchronously; if pending, mark stub
      const result = await runtime.llm.analyzePalm?.({
        imageBytes: Buffer.from([]),
        contentType: "image/jpeg",
      });
      await runtime.readings.markReady(
        id,
        result?.markdown || "# 手相\n\n暂无图像分析。",
        { model: result?.model || "unknown" },
      );
      return;
    }

    const gen = await runtime.llm.generateReport({
      kind: row.type as ReadingType,
      title: row.title,
      structure: row.structure_json,
      focus: extractFocus(row.structure_json),
    });
    await runtime.readings.markReady(id, gen.markdown, {
      model: gen.model,
      tokensIn: gen.tokensIn,
      tokensOut: gen.tokensOut,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "报告生成失败";
    await runtime.readings.markError(id, msg);
  }
}

function extractFocus(structure: unknown): string[] | undefined {
  if (!structure || typeof structure !== "object") return undefined;
  const s = structure as { focus?: string[]; personA?: { focus?: string[] } };
  if (Array.isArray(s.focus)) return s.focus;
  return undefined;
}

export async function processNextPending(
  runtime: AppRuntime,
): Promise<boolean> {
  const row = await runtime.readings.claimNextPending();
  if (!row) return false;
  await processReadingById(runtime, row.id);
  return true;
}
