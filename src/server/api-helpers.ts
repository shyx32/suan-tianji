import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { ZodError } from "zod";
import type { AppRuntime } from "@/ports";
import { SESSION_COOKIE, sessionCookieHeader } from "./session";
import { getRuntime } from "./runtime";

export function json(
  data: unknown,
  init?: { status?: number; sid?: string },
) {
  const res = NextResponse.json(data, { status: init?.status ?? 200 });
  if (init?.sid) {
    res.headers.set("Set-Cookie", sessionCookieHeader(init.sid));
  }
  return res;
}

export function zodErrorResponse(err: ZodError) {
  return json(
    {
      error: "参数无效",
      details: err.flatten(),
    },
    { status: 400 },
  );
}

export async function withSession(runtime?: AppRuntime): Promise<{
  runtime: AppRuntime;
  sid: string;
  isNew: boolean;
}> {
  const rt = runtime ?? getRuntime();
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  let sid = jar.get(SESSION_COOKIE)?.value;
  let isNew = false;
  if (!sid || !/^[0-9a-f-]{36}$/i.test(sid)) {
    sid = uuid();
    isNew = true;
    await rt.sessions.ensure(sid);
  } else {
    await rt.sessions.ensure(sid);
    await rt.sessions.touch(sid);
  }
  return { runtime: rt, sid, isNew };
}

/**
 * 记录一次访问：统计 + visit_logs + 会话最近 IP/UA
 * @param countDaily 是否计入每日 visits（通常由客户端 ?visit=1 或新会话触发）
 */
export async function markVisitIfNew(
  runtime: AppRuntime,
  countDaily: boolean,
  request: Request,
  sessionId?: string,
) {
  const { extractRequestMeta, hashText } = await import("./request-meta");
  const meta = extractRequestMeta(request);
  const [uaHash, ipHash] = await Promise.all([
    hashText(meta.userAgent),
    hashText(meta.ip),
  ]);

  if (sessionId) {
    await runtime.sessions.ensure(sessionId, {
      uaHash: uaHash ?? undefined,
      ipHash: ipHash ?? undefined,
      lastIp: meta.ip,
      lastUa: meta.userAgent,
      lastPath: meta.path,
    });
    if (runtime.sessions.recordAccess) {
      await runtime.sessions.recordAccess(sessionId, {
        ip: meta.ip,
        userAgent: meta.userAgent,
        path: meta.path,
        uaHash,
        ipHash,
      });
    }
  }

  // 明细日志：每次被标记为「访问」时写入
  if (countDaily) {
    const { v4: uuid } = await import("uuid");
    await runtime.visits.create({
      id: uuid(),
      sessionId: sessionId ?? null,
      ip: meta.ip,
      userAgent: meta.userAgent,
      referer: meta.referer,
      path: meta.path,
      method: meta.method,
      acceptLanguage: meta.acceptLanguage,
      country: meta.country,
    });
    const day = new Date().toISOString().slice(0, 10);
    await runtime.stats.bumpVisit(day);
  }
}

export async function bumpCalculated(runtime: AppRuntime) {
  const day = new Date().toISOString().slice(0, 10);
  await runtime.stats.bumpCalculated(day);
}
