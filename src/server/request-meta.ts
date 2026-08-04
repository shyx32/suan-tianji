/**
 * 从 HTTP Request 提取访问基本信息（IP / UA / Referer 等）
 * 兼容反向代理与 Cloudflare 头。
 */

export type RequestMeta = {
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  path: string | null;
  method: string | null;
  acceptLanguage: string | null;
  /** 可能来自 CDN 的国家代码 */
  country: string | null;
};

function firstForwardedIp(xff: string | null): string | null {
  if (!xff) return null;
  const first = xff.split(",")[0]?.trim();
  return first || null;
}

export function extractRequestMeta(request: Request): RequestMeta {
  const h = request.headers;
  const ip =
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    firstForwardedIp(h.get("x-forwarded-for")) ||
    h.get("x-client-ip") ||
    null;

  let path: string | null = null;
  try {
    path = new URL(request.url).pathname + new URL(request.url).search;
  } catch {
    path = null;
  }

  const ua = h.get("user-agent");
  const referer = h.get("referer") || h.get("referrer");
  const acceptLanguage = h.get("accept-language");
  const country =
    h.get("cf-ipcountry") || h.get("x-vercel-ip-country") || h.get("x-country") || null;

  return {
    ip: ip ? ip.slice(0, 64) : null,
    userAgent: ua ? ua.slice(0, 512) : null,
    referer: referer ? referer.slice(0, 512) : null,
    path: path ? path.slice(0, 512) : null,
    method: request.method || null,
    acceptLanguage: acceptLanguage ? acceptLanguage.slice(0, 128) : null,
    country: country ? country.slice(0, 8) : null,
  };
}

/** 轻量 hash（会话表兼容旧字段，非强安全） */
export async function hashText(text: string | null | undefined): Promise<string | null> {
  if (!text) return null;
  try {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 32);
  } catch {
    // Node 环境 fallback
    const { createHash } = await import("crypto");
    return createHash("sha256").update(text).digest("hex").slice(0, 32);
  }
}

/** 粗解析 UA 为可读摘要 */
export function summarizeUserAgent(ua: string | null): string {
  if (!ua) return "—";
  const s = ua;
  let browser = "浏览器";
  if (/Edg\//i.test(s)) browser = "Edge";
  else if (/Chrome\//i.test(s) && !/Edg\//i.test(s)) browser = "Chrome";
  else if (/Firefox\//i.test(s)) browser = "Firefox";
  else if (/Safari\//i.test(s) && !/Chrome\//i.test(s)) browser = "Safari";
  else if (/MicroMessenger/i.test(s)) browser = "微信";

  let os = "";
  if (/iPhone|iPad/i.test(s)) os = "iOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/Mac OS X/i.test(s)) os = "macOS";
  else if (/Windows/i.test(s)) os = "Windows";
  else if (/Linux/i.test(s)) os = "Linux";

  return os ? `${browser} · ${os}` : browser;
}
