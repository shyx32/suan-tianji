import type { JobQueue } from "@/ports";

/**
 * Local queue: jobs are claimed by the worker process via Postgres pending rows.
 * enqueueGenerate is a no-op marker (status already pending); worker polls DB.
 * Optional JOBS_INLINE triggers immediate processing in-process for dev.
 */
export function createPgJobQueue(onInline?: (id: string) => void): JobQueue {
  return {
    async enqueueGenerate(readingId: string) {
      if (process.env.JOBS_INLINE === "true" && onInline) {
        // fire and forget
        setTimeout(() => onInline(readingId), 0);
      }
      // Worker path: reading already inserted as pending — nothing else to push.
      void readingId;
    },
  };
}
