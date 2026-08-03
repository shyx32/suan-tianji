import type { AppRuntime } from "@/ports";
import { createHttpLlmProvider } from "@/adapters/llm/http-provider";
import { readingRepo, sessionRepo, statsRepo } from "./repos";
import { createS3Storage } from "./storage";
import { createPgJobQueue } from "./queue";
import { createMemoryRateLimiter } from "./rate-limit";
import { processReadingById } from "@/server/jobs";

let singleton: AppRuntime | null = null;

export function createNodeRuntime(): AppRuntime {
  if (singleton) return singleton;
  const llm = createHttpLlmProvider();
  const runtime: AppRuntime = {
    kind: "node",
    sessions: sessionRepo,
    readings: readingRepo,
    stats: statsRepo,
    storage: createS3Storage(),
    queue: createPgJobQueue(async (id) => {
      await processReadingById(runtime, id);
    }),
    rateLimiter: createMemoryRateLimiter(),
    llm,
  };
  singleton = runtime;
  return runtime;
}
