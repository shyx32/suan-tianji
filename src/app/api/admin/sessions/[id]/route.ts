import { NextResponse } from "next/server";
import { deleteSessionAdmin } from "@/adapters/node/admin-repo";
import { requireAdmin } from "@/server/admin-auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const ok = await deleteSessionAdmin(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
