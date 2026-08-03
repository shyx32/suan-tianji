import { NextResponse } from "next/server";
import { getAdminDashboard } from "@/adapters/node/admin-repo";
import { requireAdmin } from "@/server/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    const data = await getAdminDashboard();
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "dashboard failed" },
      { status: 500 },
    );
  }
}
