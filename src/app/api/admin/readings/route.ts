import { NextResponse } from "next/server";
import { listAdminReadings } from "@/adapters/node/admin-repo";
import { requireAdmin } from "@/server/admin-auth";
import type { ReadingStatus, ReadingType } from "@/ports/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = (url.searchParams.get("status") || "all") as ReadingStatus | "all";
  const type = (url.searchParams.get("type") || "all") as ReadingType | "all";
  const q = url.searchParams.get("q") || undefined;
  const page = Number(url.searchParams.get("page") || "1") || 1;
  const pageSize = Number(url.searchParams.get("pageSize") || "20") || 20;

  try {
    const data = await listAdminReadings({ status, type, q, page, pageSize });
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "list failed" },
      { status: 500 },
    );
  }
}
