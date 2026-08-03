import { v4 as uuid } from "uuid";
import {
  bumpCalculated,
  json,
  withSession,
} from "@/server/api-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { runtime, sid } = await withSession();
    const form = await request.formData();
    const photo = form.get("photo");
    const name = String(form.get("name") || "") || undefined;

    if (!photo || !(photo instanceof File)) {
      return json({ error: "请先选择手掌照片" }, { status: 400, sid });
    }
    if (photo.size > 2.5 * 1024 * 1024) {
      return json({ error: "图片请小于 2.5MB" }, { status: 400, sid });
    }
    const type = photo.type || "image/jpeg";
    if (!type.startsWith("image/")) {
      return json({ error: "仅支持图片文件" }, { status: 400, sid });
    }

    const buf = Buffer.from(await photo.arrayBuffer());
    const id = uuid();
    const key = `palm/${sid}/${id}.jpg`;
    try {
      await runtime.storage.put(key, buf, type);
    } catch {
      // MinIO may be unavailable in unit-only runs; still allow stub reading
    }

    const result = await runtime.llm.analyzePalm!({
      imageBytes: buf,
      contentType: type,
      name,
    });

    await runtime.readings.create({
      id,
      sessionId: sid,
      type: "palm",
      title: `${name || "掌纹"} · 手相观掌`,
      input: { name, size: photo.size, type },
      structure: { lines: ["生命线", "智慧线", "感情线"] },
      status: "ready",
      imageKey: key,
    });
    // store markdown directly
    await runtime.readings.markReady(id, result.markdown, {
      model: result.model,
      tokensOut: result.tokensOut,
    });
    await bumpCalculated(runtime);

    return json(
      {
        ok: true,
        id,
        status: "ready",
        reading: result.markdown,
      },
      { sid },
    );
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "解读失败" },
      { status: 500 },
    );
  }
}
