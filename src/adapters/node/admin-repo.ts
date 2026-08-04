import { query } from "./db";
import type { ReadingRow, ReadingStatus, ReadingType } from "@/ports/types";

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

export interface AdminDashboard {
  stats: {
    visits: { today: number; total: number };
    calculated: { today: number; total: number };
  };
  readingsByStatus: Record<string, number>;
  readingsByType: Record<string, number>;
  recentErrors: Array<{
    id: string;
    title: string;
    type: string;
    error_message: string | null;
    created_at: string;
  }>;
  stuckProcessing: number;
  tokens: { in: number; out: number };
  sessions: { total: number; active24h: number };
  system: {
    runtime: string;
    llmMode: string;
    llmModel: string;
    nodeEnv: string;
  };
}

export interface AdminListQuery {
  status?: ReadingStatus | "all";
  type?: ReadingType | "all";
  q?: string;
  page?: number;
  pageSize?: number;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
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

  const byStatus = await query(
    `SELECT status, COUNT(*)::int AS c FROM readings GROUP BY status`,
  );
  const readingsByStatus: Record<string, number> = {
    pending: 0,
    processing: 0,
    ready: 0,
    error: 0,
  };
  for (const row of byStatus.rows) {
    readingsByStatus[String(row.status)] = Number(row.c) || 0;
  }

  const byType = await query(
    `SELECT type, COUNT(*)::int AS c FROM readings GROUP BY type`,
  );
  const readingsByType: Record<string, number> = {};
  for (const row of byType.rows) {
    readingsByType[String(row.type)] = Number(row.c) || 0;
  }

  const errors = await query(
    `SELECT id, title, type, error_message, created_at
     FROM readings WHERE status = 'error'
     ORDER BY created_at DESC LIMIT 10`,
  );

  const stuck = await query(
    `SELECT COUNT(*)::int AS c FROM readings
     WHERE status = 'processing' AND created_at < now() - interval '10 minutes'`,
  );

  const tokens = await query(
    `SELECT COALESCE(SUM(tokens_in),0)::int AS tin, COALESCE(SUM(tokens_out),0)::int AS tout FROM readings`,
  );

  const sessions = await query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE last_seen_at > now() - interval '24 hours')::int AS active24h
     FROM sessions`,
  );

  return {
    stats: {
      visits: { today: Number(d.visits) || 0, total: Number(t.visits) || 0 },
      calculated: {
        today: Number(d.calculated) || 0,
        total: Number(t.calculated) || 0,
      },
    },
    readingsByStatus,
    readingsByType,
    recentErrors: errors.rows.map((r) => ({
      id: String(r.id),
      title: String(r.title),
      type: String(r.type),
      error_message: (r.error_message as string) || null,
      created_at: new Date(r.created_at as string).toISOString(),
    })),
    stuckProcessing: Number(stuck.rows[0]?.c) || 0,
    tokens: {
      in: Number(tokens.rows[0]?.tin) || 0,
      out: Number(tokens.rows[0]?.tout) || 0,
    },
    sessions: {
      total: Number(sessions.rows[0]?.total) || 0,
      active24h: Number(sessions.rows[0]?.active24h) || 0,
    },
    system: {
      runtime: process.env.RUNTIME || "node",
      llmMode: process.env.LLM_MODE || "test",
      llmModel: process.env.LLM_MODEL || "",
      nodeEnv: process.env.NODE_ENV || "development",
    },
  };
}

export async function listAdminReadings(q: AdminListQuery) {
  const page = Math.max(1, q.page || 1);
  const pageSize = Math.min(100, Math.max(1, q.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const where: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (q.status && q.status !== "all") {
    where.push(`status = $${i++}`);
    params.push(q.status);
  }
  if (q.type && q.type !== "all") {
    where.push(`type = $${i++}`);
    params.push(q.type);
  }
  if (q.q?.trim()) {
    where.push(
      `(title ILIKE $${i} OR id::text ILIKE $${i} OR session_id::text ILIKE $${i} OR COALESCE(error_message,'') ILIKE $${i})`,
    );
    params.push(`%${q.q.trim()}%`);
    i++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countRes = await query(
    `SELECT COUNT(*)::int AS c FROM readings ${whereSql}`,
    params,
  );
  const total = Number(countRes.rows[0]?.c) || 0;

  const listRes = await query(
    `SELECT id, session_id, type, status, title, error_message, model,
            tokens_in, tokens_out, created_at, ready_at,
            LEFT(COALESCE(result_markdown,''), 120) AS preview
     FROM readings
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${i++} OFFSET $${i++}`,
    [...params, pageSize, offset],
  );

  return {
    total,
    page,
    pageSize,
    records: listRes.rows.map((r) => ({
      id: String(r.id),
      sessionId: String(r.session_id),
      type: String(r.type),
      status: String(r.status),
      title: String(r.title),
      errorMessage: (r.error_message as string) || null,
      model: (r.model as string) || null,
      tokensIn: r.tokens_in as number | null,
      tokensOut: r.tokens_out as number | null,
      createdAt: new Date(r.created_at as string).toISOString(),
      readyAt: r.ready_at ? new Date(r.ready_at as string).toISOString() : null,
      preview: (r.preview as string) || null,
    })),
  };
}

export async function getAdminReading(id: string) {
  const res = await query(`SELECT * FROM readings WHERE id = $1`, [id]);
  if (!res.rows[0]) return null;
  const row = mapReading(res.rows[0]);
  return {
    ...row,
    createdAt: row.created_at.toISOString(),
    readyAt: row.ready_at?.toISOString() ?? null,
  };
}

export async function requeueReading(id: string): Promise<boolean> {
  const res = await query(
    `UPDATE readings SET
       status = 'pending',
       error_message = NULL,
       result_markdown = NULL,
       ready_at = NULL,
       model = NULL,
       tokens_in = NULL,
       tokens_out = NULL
     WHERE id = $1 AND status IN ('error','processing','ready')
     RETURNING id`,
    [id],
  );
  return (res.rowCount ?? 0) > 0;
}

export async function requeueStuckProcessing(): Promise<number> {
  const res = await query(
    `UPDATE readings SET status = 'pending', error_message = 'auto-requeue stuck processing'
     WHERE status = 'processing' AND created_at < now() - interval '10 minutes'
     RETURNING id`,
  );
  return res.rowCount ?? 0;
}

export async function forceErrorReading(
  id: string,
  message: string,
): Promise<boolean> {
  const res = await query(
    `UPDATE readings SET status = 'error', error_message = $2, ready_at = now()
     WHERE id = $1
     RETURNING id`,
    [id, message || "admin marked error"],
  );
  return (res.rowCount ?? 0) > 0;
}

export async function deleteReadingAdmin(id: string): Promise<{
  ok: boolean;
  imageKey: string | null;
}> {
  const cur = await query(`SELECT image_key FROM readings WHERE id = $1`, [id]);
  if (!cur.rows[0]) return { ok: false, imageKey: null };
  const imageKey = (cur.rows[0].image_key as string) || null;
  const res = await query(`DELETE FROM readings WHERE id = $1`, [id]);
  return { ok: (res.rowCount ?? 0) > 0, imageKey };
}

export async function listAdminSessions(page = 1, pageSize = 20) {
  const p = Math.max(1, page);
  const size = Math.min(100, Math.max(1, pageSize));
  const offset = (p - 1) * size;
  const count = await query(`SELECT COUNT(*)::int AS c FROM sessions`);
  const res = await query(
    `SELECT s.id, s.created_at, s.last_seen_at,
            s.last_ip, s.last_ua, s.last_path, s.visit_count,
            COUNT(r.id)::int AS readings
     FROM sessions s
     LEFT JOIN readings r ON r.session_id = s.id
     GROUP BY s.id
     ORDER BY s.last_seen_at DESC
     LIMIT $1 OFFSET $2`,
    [size, offset],
  );
  return {
    total: Number(count.rows[0]?.c) || 0,
    page: p,
    pageSize: size,
    records: res.rows.map((r) => ({
      id: String(r.id),
      createdAt: new Date(r.created_at as string).toISOString(),
      lastSeenAt: new Date(r.last_seen_at as string).toISOString(),
      readings: Number(r.readings) || 0,
      lastIp: (r.last_ip as string) || null,
      lastUa: (r.last_ua as string) || null,
      lastPath: (r.last_path as string) || null,
      visitCount: Number(r.visit_count) || 0,
    })),
  };
}

export async function listAdminVisits(
  page = 1,
  pageSize = 20,
  opts?: { q?: string; sessionId?: string },
) {
  const p = Math.max(1, page);
  const size = Math.min(100, Math.max(1, pageSize));
  const offset = (p - 1) * size;
  const q = (opts?.q || "").trim();
  const sessionId = (opts?.sessionId || "").trim();

  const where: string[] = [];
  const params: unknown[] = [];
  if (sessionId) {
    params.push(sessionId);
    where.push(`session_id = $${params.length}::uuid`);
  }
  if (q) {
    params.push(`%${q}%`);
    const i = params.length;
    where.push(
      `(ip ILIKE $${i} OR user_agent ILIKE $${i} OR path ILIKE $${i} OR referer ILIKE $${i} OR country ILIKE $${i})`,
    );
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const count = await query(
    `SELECT COUNT(*)::int AS c FROM visit_logs ${whereSql}`,
    params,
  );
  params.push(size, offset);
  const res = await query(
    `SELECT id, session_id, created_at, ip, user_agent, referer, path, method, accept_language, country
     FROM visit_logs
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return {
    total: Number(count.rows[0]?.c) || 0,
    page: p,
    pageSize: size,
    records: res.rows.map((r) => ({
      id: String(r.id),
      sessionId: r.session_id ? String(r.session_id) : null,
      createdAt: new Date(r.created_at as string).toISOString(),
      ip: (r.ip as string) || null,
      userAgent: (r.user_agent as string) || null,
      referer: (r.referer as string) || null,
      path: (r.path as string) || null,
      method: (r.method as string) || null,
      acceptLanguage: (r.accept_language as string) || null,
      country: (r.country as string) || null,
    })),
  };
}

export async function deleteSessionAdmin(id: string): Promise<boolean> {
  // readings cascade
  const res = await query(`DELETE FROM sessions WHERE id = $1`, [id]);
  return (res.rowCount ?? 0) > 0;
}
