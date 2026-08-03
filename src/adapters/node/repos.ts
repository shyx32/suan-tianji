import type {
  ReadingRepo,
  SessionRepo,
  StatsRepo,
} from "@/ports";
import type {
  CreateReadingInput,
  ReadingRow,
  ReadingSummary,
  StatsSnapshot,
} from "@/ports/types";
import { query } from "./db";

function mapReading(r: Record<string, unknown>): ReadingRow {
  return {
    id: String(r.id),
    session_id: String(r.session_id),
    type: r.type as ReadingRow["type"],
    status: r.status as ReadingRow["status"],
    title: String(r.title),
    input_json: r.input_json,
    structure_json: r.structure_json,
    result_markdown: r.result_markdown as string | null,
    image_key: r.image_key as string | null,
    error_message: r.error_message as string | null,
    model: r.model as string | null,
    tokens_in: r.tokens_in as number | null,
    tokens_out: r.tokens_out as number | null,
    created_at: new Date(r.created_at as string),
    ready_at: r.ready_at ? new Date(r.ready_at as string) : null,
  };
}

export const sessionRepo: SessionRepo = {
  async ensure(sessionId, meta) {
    await query(
      `INSERT INTO sessions (id, ua_hash, ip_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET last_seen_at = now()`,
      [sessionId, meta?.uaHash ?? null, meta?.ipHash ?? null],
    );
  },
  async touch(sessionId) {
    await query(`UPDATE sessions SET last_seen_at = now() WHERE id = $1`, [
      sessionId,
    ]);
  },
};

export const readingRepo: ReadingRepo = {
  async create(input: CreateReadingInput) {
    const status = input.status ?? "pending";
    const res = await query(
      `INSERT INTO readings
        (id, session_id, type, status, title, input_json, structure_json, image_key)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8)
       RETURNING *`,
      [
        input.id,
        input.sessionId,
        input.type,
        status,
        input.title,
        JSON.stringify(input.input),
        input.structure == null ? null : JSON.stringify(input.structure),
        input.imageKey ?? null,
      ],
    );
    return mapReading(res.rows[0]!);
  },

  async getByIdForSession(id, sessionId) {
    const res = await query(
      `SELECT * FROM readings WHERE id = $1 AND session_id = $2`,
      [id, sessionId],
    );
    return res.rows[0] ? mapReading(res.rows[0]) : null;
  },

  async getById(id) {
    const res = await query(`SELECT * FROM readings WHERE id = $1`, [id]);
    return res.rows[0] ? mapReading(res.rows[0]) : null;
  },

  async listBySession(sessionId) {
    const res = await query(
      `SELECT id, type, title, status, created_at, result_markdown, image_key
       FROM readings WHERE session_id = $1
       ORDER BY created_at DESC LIMIT 50`,
      [sessionId],
    );
    return res.rows.map((r): ReadingSummary => ({
      id: String(r.id),
      type: r.type as ReadingSummary["type"],
      title: String(r.title),
      status: r.status as ReadingSummary["status"],
      createdAt: new Date(r.created_at as string).toISOString(),
      preview: r.result_markdown
        ? String(r.result_markdown).slice(0, 180)
        : null,
      imagePath: (r.image_key as string) || null,
    }));
  },

  async deleteForSession(id, sessionId) {
    const res = await query(
      `DELETE FROM readings WHERE id = $1 AND session_id = $2`,
      [id, sessionId],
    );
    return (res.rowCount ?? 0) > 0;
  },

  async claimNextPending() {
    const client = await (await import("./db")).getPool().connect();
    try {
      await client.query("BEGIN");
      const res = await client.query(
        `SELECT id FROM readings
         WHERE status = 'pending'
         ORDER BY created_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT 1`,
      );
      if (!res.rows[0]) {
        await client.query("COMMIT");
        return null;
      }
      // Atomically flip to processing so other workers cannot claim the same row.
      const upd = await client.query(
        `UPDATE readings SET status = 'processing'
         WHERE id = $1 AND status = 'pending'
         RETURNING *`,
        [res.rows[0].id],
      );
      await client.query("COMMIT");
      return upd.rows[0] ? mapReading(upd.rows[0]) : null;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async markReady(id, markdown, meta) {
    await query(
      `UPDATE readings SET
         status = 'ready',
         result_markdown = $2,
         model = $3,
         tokens_in = $4,
         tokens_out = $5,
         ready_at = now(),
         error_message = NULL
       WHERE id = $1 AND status IN ('pending','processing')`,
      [id, markdown, meta.model, meta.tokensIn ?? null, meta.tokensOut ?? null],
    );
  },

  async markError(id, message) {
    await query(
      `UPDATE readings SET status = 'error', error_message = $2, ready_at = now()
       WHERE id = $1 AND status IN ('pending','processing')`,
      [id, message],
    );
  },
};

export const statsRepo: StatsRepo = {
  async bumpVisit(day) {
    await query(
      `INSERT INTO stats_daily (day, visits, calculated)
       VALUES ($1::date, 1, 0)
       ON CONFLICT (day) DO UPDATE SET visits = stats_daily.visits + 1`,
      [day],
    );
  },
  async bumpCalculated(day) {
    await query(
      `INSERT INTO stats_daily (day, visits, calculated)
       VALUES ($1::date, 0, 1)
       ON CONFLICT (day) DO UPDATE SET calculated = stats_daily.calculated + 1`,
      [day],
    );
  },
  async snapshot(): Promise<StatsSnapshot> {
    const today = new Date().toISOString().slice(0, 10);
    const dayRes = await query(
      `SELECT visits, calculated FROM stats_daily WHERE day = $1::date`,
      [today],
    );
    const totalRes = await query(
      `SELECT COALESCE(SUM(visits),0)::int AS visits, COALESCE(SUM(calculated),0)::int AS calculated FROM stats_daily`,
    );
    const d = dayRes.rows[0] || { visits: 0, calculated: 0 };
    const t = totalRes.rows[0] || { visits: 0, calculated: 0 };
    return {
      visits: { today: Number(d.visits) || 0, total: Number(t.visits) || 0 },
      calculated: {
        today: Number(d.calculated) || 0,
        total: Number(t.calculated) || 0,
      },
    };
  },
};
