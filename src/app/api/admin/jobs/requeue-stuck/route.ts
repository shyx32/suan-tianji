import { NextResponse } from "next/server";
import { requeueStuckProcessing } from "@/adapters/node/admin-repo";
import { requireAdmin } from "@/server/admin-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    const count = await requeueStuckProcessing();
    return NextResponse.json({ ok: true, requeued: count });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 500 },
    );
  }
}
