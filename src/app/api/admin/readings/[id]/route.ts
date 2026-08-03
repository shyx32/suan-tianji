import { NextResponse } from "next/server";
import {
  deleteReadingAdmin,
  forceErrorReading,
  getAdminReading,
  requeueReading,
} from "@/adapters/node/admin-repo";
import { getRuntime } from "@/server/runtime";
import { requireAdmin } from "@/server/admin-auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const row = await getAdminReading(id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, record: row });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const runtime = getRuntime();
  const result = await deleteReadingAdmin(id);
  if (!result.ok) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (result.imageKey) {
    try {
      await runtime.storage.delete(result.imageKey);
    } catch {
      /* ignore storage errors */
    }
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    message?: string;
  };
  const action = body.action || "";

  if (action === "retry" || action === "requeue") {
    const ok = await requeueReading(id);
    if (!ok) {
      return NextResponse.json(
        { error: "无法重试（记录不存在或状态不允许）" },
        { status: 400 },
      );
    }
    // worker will pick up pending
    return NextResponse.json({ ok: true, status: "pending" });
  }

  if (action === "error" || action === "mark_error") {
    const ok = await forceErrorReading(
      id,
      body.message || "管理员标记为失败",
    );
    if (!ok) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, status: "error" });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
