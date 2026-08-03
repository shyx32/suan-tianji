import { NextResponse } from "next/server";
import {
  adminCookieHeader,
  createAdminToken,
  verifyAdminPassword,
} from "@/server/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = String(body.password || "");
    if (!password) {
      return NextResponse.json({ error: "请输入密码" }, { status: 400 });
    }
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }
    const token = createAdminToken();
    const res = NextResponse.json({
      ok: true,
      message: "登录成功",
    });
    res.headers.set("Set-Cookie", adminCookieHeader(token));
    return res;
  } catch {
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
