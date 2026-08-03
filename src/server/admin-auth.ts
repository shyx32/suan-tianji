import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { shouldUseSecureCookie } from "./session";

export const ADMIN_COOKIE = "suan_admin_sid";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function adminSecret(): string {
  return (
    process.env.ADMIN_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "dev-admin-change-me"
  );
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET);
}

function sign(payloadB64: string): string {
  return createHmac("sha256", adminSecret())
    .update(payloadB64)
    .digest("base64url");
}

export function createAdminToken(ttlMs = TOKEN_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const payloadB64 = Buffer.from(
    JSON.stringify({ exp, role: "admin", v: 1 }),
    "utf8",
  ).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token || !token.includes(".")) return false;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;
  const expected = sign(payloadB64);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const data = JSON.parse(json) as { exp?: number; role?: string };
    if (data.role !== "admin") return false;
    if (!data.exp || Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    if (a.length !== b.length) {
      // still do a dummy compare to reduce timing leaks slightly
      timingSafeEqual(Buffer.alloc(b.length), b);
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function adminCookieHeader(token: string, maxAgeSec = TOKEN_TTL_MS / 1000): string {
  const secure = shouldUseSecureCookie() ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(maxAgeSec)}${secure}`;
}

export function clearAdminCookieHeader(): string {
  const secure = shouldUseSecureCookie() ? "; Secure" : "";
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function readAdminToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value ?? null;
}

export async function requireAdmin(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  const token = await readAdminToken();
  if (!verifyAdminToken(token)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "未登录或会话已过期" }, { status: 401 }),
    };
  }
  return { ok: true };
}

export function requireAdminFromRequest(request: Request): boolean {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`${ADMIN_COOKIE}=([^;]+)`));
  const token = match?.[1] ? decodeURIComponent(match[1]) : null;
  return verifyAdminToken(token);
}
