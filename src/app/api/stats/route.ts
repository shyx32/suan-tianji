import {
  bumpCalculated,
  json,
  markVisitIfNew,
  withSession,
} from "@/server/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { runtime, sid, isNew } = await withSession();
  const url = new URL(request.url);
  // First page load passes ?visit=1 once per browser session (client uses sessionStorage)
  if (url.searchParams.get("visit") === "1" || isNew) {
    await markVisitIfNew(runtime, true, request, sid);
  }
  const snap = await runtime.stats.snapshot();
  return json({ ok: true, ...snap }, { sid });
}

// allow tests to bump calculated manually if needed
export async function POST() {
  const { runtime, sid } = await withSession();
  await bumpCalculated(runtime);
  const snap = await runtime.stats.snapshot();
  return json({ ok: true, ...snap }, { sid });
}
