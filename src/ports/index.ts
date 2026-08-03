import type {
  CreateReadingInput,
  LlmGenerateInput,
  LlmGenerateResult,
  ReadingRow,
  ReadingSummary,
  StatsSnapshot,
} from "./types";

export interface ReadingRepo {
  create(input: CreateReadingInput): Promise<ReadingRow>;
  getByIdForSession(id: string, sessionId: string): Promise<ReadingRow | null>;
  getById(id: string): Promise<ReadingRow | null>;
  listBySession(sessionId: string): Promise<ReadingSummary[]>;
  deleteForSession(id: string, sessionId: string): Promise<boolean>;
  claimNextPending(): Promise<ReadingRow | null>;
  markReady(
    id: string,
    markdown: string,
    meta: { model: string; tokensIn?: number; tokensOut?: number },
  ): Promise<void>;
  markError(id: string, message: string): Promise<void>;
}

export interface SessionRepo {
  ensure(sessionId: string, meta?: { uaHash?: string; ipHash?: string }): Promise<void>;
  touch(sessionId: string): Promise<void>;
}

export interface StatsRepo {
  bumpVisit(day: string): Promise<void>;
  bumpCalculated(day: string): Promise<void>;
  snapshot(): Promise<StatsSnapshot>;
}

export interface ObjectStorage {
  put(key: string, body: Buffer | Uint8Array, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface JobQueue {
  enqueueGenerate(readingId: string): Promise<void>;
}

export interface RateLimiter {
  hit(
    key: string,
    limit: number,
    windowSec: number,
  ): Promise<{ ok: boolean; remaining: number }>;
}

export interface LlmProvider {
  generateReport(input: LlmGenerateInput): Promise<LlmGenerateResult>;
  analyzePalm?(params: {
    imageBytes: Buffer;
    contentType: string;
    name?: string;
  }): Promise<LlmGenerateResult>;
}

export interface AppRuntime {
  kind: "node" | "cloudflare";
  sessions: SessionRepo;
  readings: ReadingRepo;
  stats: StatsRepo;
  storage: ObjectStorage;
  queue: JobQueue;
  rateLimiter: RateLimiter;
  llm: LlmProvider;
}

export type * from "./types";
