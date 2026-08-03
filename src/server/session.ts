import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";
import type { AppRuntime } from "@/ports";

export const SESSION_COOKIE = "ai_fortune_sid";

/**
 * Cookie Secure only when the site is actually served over HTTPS,
 * or when COOKIE_SECURE is explicitly forced.
 * Local Docker Compose uses http://localhost — Secure must stay off
 * so browsers accept the session cookie.
 */
export function shouldUseSecureCookie(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.COOKIE_SECURE === "true" || env.COOKIE_SECURE === "1") return true;
  if (env.COOKIE_SECURE === "false" || env.COOKIE_SECURE === "0") return false;
  // Explicit public HTTPS origin (production CF / reverse proxy)
  const appUrl = env.APP_URL || env.NEXT_PUBLIC_APP_URL || "";
  if (/^https:\/\//i.test(appUrl)) return true;
  // Never force Secure solely because NODE_ENV=production (Docker HTTP uses that).
  return false;
}

export async function getOrCreateSessionId(
  runtime: AppRuntime,
  opts?: { countVisit?: boolean },
): Promise<string> {
  const jar = await cookies();
  let sid = jar.get(SESSION_COOKIE)?.value;
  if (!sid || !/^[0-9a-f-]{36}$/i.test(sid)) {
    sid = uuid();
    jar.set(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      secure: shouldUseSecureCookie(),
    });
    await runtime.sessions.ensure(sid);
    if (opts?.countVisit !== false) {
      const day = new Date().toISOString().slice(0, 10);
      await runtime.stats.bumpVisit(day);
    }
  } else {
    await runtime.sessions.ensure(sid);
    await runtime.sessions.touch(sid);
  }
  return sid;
}

/** For Route Handlers that need to set cookie on NextResponse */
export function sessionCookieHeader(sid: string): string {
  const secure = shouldUseSecureCookie() ? "; Secure" : "";
  return `${SESSION_COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`;
}

export async function readSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}
