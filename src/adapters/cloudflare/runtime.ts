/**
 * Cloudflare adapter surface (OpenNext / Workers).
 * Uses Hyperdrive-backed Postgres, R2, KV, Queues — never SQLite/D1.
 *
 * Local Docker does not load this module for the main path; it documents
 * and implements the dual-deploy target for production CF.
 */
import type { AppRuntime, JobQueue, ObjectStorage, RateLimiter } from "@/ports";
import { createHttpLlmProvider } from "@/adapters/llm/http-provider";
import {
  readingRepo,
  sessionRepo,
  statsRepo,
  visitRepo,
} from "@/adapters/node/repos";

export interface CloudflareEnv {
  HYPERDRIVE?: { connectionString: string };
  MEDIA?: {
    put: (
      key: string,
      value: ArrayBuffer | Uint8Array | string,
      opts?: { httpMetadata?: { contentType?: string } },
    ) => Promise<unknown>;
    delete: (key: string) => Promise<unknown>;
  };
  CACHE?: {
    get: (key: string) => Promise<string | null>;
    put: (
      key: string,
      value: string,
      opts?: { expirationTtl?: number },
    ) => Promise<unknown>;
  };
  AI_JOBS?: { send: (body: unknown) => Promise<unknown> };
  DATABASE_URL?: string;
}

export function applyCloudflareEnv(env: CloudflareEnv) {
  if (env.HYPERDRIVE?.connectionString) {
    process.env.DATABASE_URL = env.HYPERDRIVE.connectionString;
  } else if (env.DATABASE_URL) {
    process.env.DATABASE_URL = env.DATABASE_URL;
  }
  if (/sqlite|d1/i.test(process.env.DATABASE_URL || "")) {
    throw new Error("Cloudflare adapter refuses SQLite/D1 business database");
  }
}

export function createR2Storage(env: CloudflareEnv): ObjectStorage {
  return {
    async put(key, body, contentType) {
      if (!env.MEDIA) throw new Error("R2 MEDIA binding missing");
      await env.MEDIA.put(key, body, {
        httpMetadata: { contentType },
      });
    },
    async delete(key) {
      if (!env.MEDIA) return;
      await env.MEDIA.delete(key);
    },
  };
}

export function createQueue(env: CloudflareEnv): JobQueue {
  return {
    async enqueueGenerate(readingId: string) {
      if (env.AI_JOBS) {
        await env.AI_JOBS.send({ readingId });
        return;
      }
      // fallback: pending row only (worker/cron must pick up)
      void readingId;
    },
  };
}

export function createKvRateLimiter(env: CloudflareEnv): RateLimiter {
  return {
    async hit(key, limit, windowSec) {
      if (!env.CACHE) {
        return { ok: true, remaining: limit };
      }
      const k = `rl:${key}`;
      const raw = await env.CACHE.get(k);
      const count = raw ? Number(raw) : 0;
      if (count >= limit) return { ok: false, remaining: 0 };
      await env.CACHE.put(k, String(count + 1), {
        expirationTtl: windowSec,
      });
      return { ok: true, remaining: limit - count - 1 };
    },
  };
}

export function createCloudflareRuntime(env: CloudflareEnv): AppRuntime {
  applyCloudflareEnv(env);
  return {
    kind: "cloudflare",
    sessions: sessionRepo,
    readings: readingRepo,
    stats: statsRepo,
    visits: visitRepo,
    storage: createR2Storage(env),
    queue: createQueue(env),
    rateLimiter: createKvRateLimiter(env),
    llm: createHttpLlmProvider(),
  };
}
