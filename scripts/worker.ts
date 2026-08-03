/**
 * Local / Docker async job consumer.
 * Polls Postgres for pending readings and generates Markdown reports.
 * Cloudflare production would use Queues consumer with the same processReading().
 */
import { createNodeRuntime } from "../src/adapters/node/runtime";
import { processNextPending } from "../src/server/jobs";

const pollMs = Number(process.env.WORKER_POLL_MS || 1500);

async function loop() {
  const runtime = createNodeRuntime();
  console.log(`[worker] started poll=${pollMs}ms llm=${process.env.LLM_MODE || "test"}`);

  for (;;) {
    try {
      const did = await processNextPending(runtime);
      if (!did) {
        await sleep(pollMs);
      }
    } catch (err) {
      console.error("[worker] error", err);
      await sleep(pollMs);
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

loop();
