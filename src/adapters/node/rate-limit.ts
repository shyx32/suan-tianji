import type { RateLimiter } from "@/ports";

/** In-memory rate limiter for single-node Docker/local. CF adapter uses KV. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function createMemoryRateLimiter(): RateLimiter {
  return {
    async hit(key, limit, windowSec) {
      const now = Date.now();
      const cur = buckets.get(key);
      if (!cur || cur.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
        return { ok: true, remaining: limit - 1 };
      }
      if (cur.count >= limit) {
        return { ok: false, remaining: 0 };
      }
      cur.count += 1;
      return { ok: true, remaining: limit - cur.count };
    },
  };
}
