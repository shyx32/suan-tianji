import { v4 as uuid } from "uuid";
import { ZodError } from "zod";
import { buildBaziChart, chartTitle } from "@/domain/bazi/engine";
import { baziBodySchema } from "@/domain/bazi/schema";
import {
  bumpCalculated,
  json,
  withSession,
  zodErrorResponse,
} from "@/server/api-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = baziBodySchema.parse(body);
    const { runtime, sid } = await withSession();

    const limit = await runtime.rateLimiter.hit(`bazi:${sid}`, 30, 86400);
    if (!limit.ok) {
      return json({ error: "今日测算次数已达上限，请明日再来" }, { status: 429, sid });
    }

    const chart = buildBaziChart(input);
    const id = uuid();
    const title = chartTitle(chart);

    await runtime.readings.create({
      id,
      sessionId: sid,
      type: "bazi",
      title,
      input,
      structure: chart,
      status: "pending",
    });
    await bumpCalculated(runtime);
    await runtime.queue.enqueueGenerate(id);

    return json(
      {
        ok: true,
        id,
        chart,
        status: "pending",
        reading: null,
        createdAt: new Date().toISOString(),
      },
      { sid },
    );
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    return json(
      { error: err instanceof Error ? err.message : "算命失败" },
      { status: 500 },
    );
  }
}
