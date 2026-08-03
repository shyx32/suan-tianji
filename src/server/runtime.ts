import type { AppRuntime } from "@/ports";
import { createNodeRuntime } from "@/adapters/node/runtime";

/**
 * Resolve runtime by RUNTIME env.
 * cloudflare path is wired when OpenNext injects bindings (see adapters/cloudflare).
 */
export function getRuntime(): AppRuntime {
  const kind = (process.env.RUNTIME || "node").toLowerCase();
  if (kind === "cloudflare") {
    // Bindings should set DATABASE_URL via Hyperdrive before this runs.
    // For build-time safety, fall through to node adapter shape with CF env applied externally.
    return createNodeRuntime();
  }
  return createNodeRuntime();
}
