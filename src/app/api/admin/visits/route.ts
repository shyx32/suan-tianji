import { NextResponse } from "next/server";
import { listAdminVisits } from "@/adapters/node/admin-repo";
import { requireAdmin } from "@/server/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1") || 1;
  const pageSize = Number(url.searchParams.get("pageSize") || "20") || 20;
  const q = url.searchParams.get("q") || "";
  const sessionId = url.searchParams.get("sessionId") || "";
  try {
    const data = await listAdminVisits(page, pageSize, { q, sessionId });
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "list visits failed" },
      { status: 500 },
    );
  }
}
