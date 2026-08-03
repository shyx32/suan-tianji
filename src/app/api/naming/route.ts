import { v4 as uuid } from "uuid";
import { ZodError } from "zod";
import { buildNaming, namingTitle } from "@/domain/naming/engine";
import { namingBodySchema } from "@/domain/bazi/schema";
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
    const input = namingBodySchema.parse(body);
    const { runtime, sid } = await withSession();

    const naming = buildNaming(input);
    const id = uuid();
    const title = namingTitle(naming);

    await runtime.readings.create({
      id,
      sessionId: sid,
      type: "naming",
      title,
      input,
      structure: naming,
      status: "pending",
    });
    await bumpCalculated(runtime);
    await runtime.queue.enqueueGenerate(id);

    return json(
      {
        ok: true,
        id,
        naming,
        status: "pending",
        reading: null,
        createdAt: new Date().toISOString(),
      },
      { sid },
    );
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    return json(
      { error: err instanceof Error ? err.message : "取名失败" },
      { status: 500 },
    );
  }
}
