import type { BaziChart } from "@/domain/bazi/types";
import type { HepanStructure } from "@/domain/hepan/engine";
import type { NamingStructure } from "@/domain/naming/engine";
import { json, withSession } from "@/server/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { runtime, sid } = await withSession();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    const row = await runtime.readings.getByIdForSession(id, sid);
    if (!row) {
      return json({ ok: true, record: null }, { sid });
    }
    const structure = row.structure_json as Record<string, unknown> | null;
    return json(
      {
        ok: true,
        record: {
          id: row.id,
          type: row.type,
          title: row.title,
          resultMarkdown: row.result_markdown,
          imagePath: row.image_key,
          createdAt: row.created_at.toISOString(),
          status: row.status,
          chart: row.type === "bazi" ? (structure as unknown as BaziChart) : null,
          hepan:
            row.type === "hepan" ? (structure as unknown as HepanStructure) : null,
          naming:
            row.type === "naming" ? (structure as unknown as NamingStructure) : null,
          error: row.error_message,
        },
      },
      { sid },
    );
  }

  const records = await runtime.readings.listBySession(sid);
  return json({ ok: true, records }, { sid });
}

export async function DELETE(request: Request) {
  const { runtime, sid } = await withSession();
  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return json({ error: "缺少 id" }, { status: 400, sid });
  }
  const row = await runtime.readings.getByIdForSession(body.id, sid);
  if (row?.image_key) {
    try {
      await runtime.storage.delete(row.image_key);
    } catch {
      /* ignore */
    }
  }
  const ok = await runtime.readings.deleteForSession(body.id, sid);
  return json({ ok }, { sid });
}
