import { NextResponse } from "next/server";
import { getPool } from "@/adapters/node/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const r = await getPool().query("SELECT 1 AS ok");
    return NextResponse.json({
      ok: true,
      db: r.rows[0]?.ok === 1,
      runtime: process.env.RUNTIME || "node",
      llmMode: process.env.LLM_MODE || "test",
      engine: "postgres",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "db error",
      },
      { status: 500 },
    );
  }
}
