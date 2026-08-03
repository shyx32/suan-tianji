"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  visits: { today: number; total: number };
  calculated: { today: number; total: number };
}

export function SiteFooter() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [now, setNow] = useState("");

  useEffect(() => {
    setNow(new Date().toLocaleString("zh-CN", { hour12: false }));
    let visit = false;
    try {
      if (!sessionStorage.getItem("sf-visited")) {
        sessionStorage.setItem("sf-visited", "1");
        visit = true;
      }
    } catch {
      visit = true;
    }
    void fetch(`/api/stats${visit ? "?visit=1" : ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setStats(d);
      })
      .catch(() => undefined);
  }, []);

  const cells = [
    { label: "今日访问", value: stats?.visits.today },
    { label: "总访问", value: stats?.visits.total },
    { label: "今日测算", value: stats?.calculated.today },
    { label: "总测算", value: stats?.calculated.total },
  ];

  return (
    <footer className="border-t border-daiqing/8 bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {cells.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-daiqing/8 bg-porcelain px-3 py-3 text-center"
            >
              <div className="text-[10px] font-semibold tracking-[0.14em] text-faint">
                {c.label}
              </div>
              <div className="cn-tabular mt-1 text-xl font-bold text-daiqing">
                {c.value ?? "…"}
              </div>
            </div>
          ))}
        </div>
        <p className="cn-tabular mt-6 text-center text-xs text-muted">
          当前时间 {now || "…"}
        </p>
        <p className="mt-3 text-center text-xs font-semibold text-daiqing">
          公益 AI 算命 · 本站内容仅供文化娱乐参考
        </p>
        <p className="mx-auto mt-2.5 max-w-2xl text-center text-[11px] leading-relaxed text-faint">
          免责声明：测算结果由规则引擎与 AI 生成，不构成医疗、投资、婚恋、法律等专业建议；请勿据此做出重大决定。
        </p>
        <p className="mt-4 text-center text-[11px] text-faint">
          © {new Date().getFullYear()} 妙算天机 · UI v3 白瓷黛青 · Postgres
          {" · "}
          <Link href="/admin" className="font-semibold text-daiqing hover:underline">
            管理员登录
          </Link>
        </p>
      </div>
    </footer>
  );
}
