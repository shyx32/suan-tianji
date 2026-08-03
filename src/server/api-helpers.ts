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

export async function markVisitIfNew(
  runtime: AppRuntime,
  isNew: boolean,
  request: Request,
) {
  // Also count visit when client asks via header / first stats call
  void request;
  if (isNew) {
    const day = new Date().toISOString().slice(0, 10);
    await runtime.stats.bumpVisit(day);
  }
}

export async function bumpCalculated(runtime: AppRuntime) {
  const day = new Date().toISOString().slice(0, 10);
  await runtime.stats.bumpCalculated(day);
}
