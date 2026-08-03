import { NextResponse } from "next/server";
import { readAdminToken, verifyAdminToken } from "@/server/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await readAdminToken();
  const ok = verifyAdminToken(token);
  return NextResponse.json({
    ok,
    authenticated: ok,
  });
}
