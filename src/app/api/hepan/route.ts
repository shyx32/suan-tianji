import { v4 as uuid } from "uuid";
import { ZodError } from "zod";
import { buildHepan, hepanTitle } from "@/domain/hepan/engine";
import { hepanBodySchema } from "@/domain/bazi/schema";
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
    const input = hepanBodySchema.parse(body);
    const { runtime, sid } = await withSession();

    const hepan = buildHepan(input.personA, input.personB, input.focus);
    const id = uuid();
    const title = hepanTitle(hepan);

    await runtime.readings.create({
      id,
      sessionId: sid,
      type: "hepan",
      title,
      input,
      structure: hepan,
      status: "pending",
    });
    await bumpCalculated(runtime);
    await runtime.queue.enqueueGenerate(id);

    return json(
      {
        ok: true,
        id,
        hepan,
        status: "pending",
        reading: null,
        createdAt: new Date().toISOString(),
      },
      { sid },
    );
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    return json(
      { error: err instanceof Error ? err.message : "合盘失败" },
      { status: 500 },
    );
  }
}
