"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { BaguaWheel, CloudMotif, Taiji, TrigramGlyph, WuxingDots, BAGUA } from "./Ornaments";
import { Seal } from "./ui";

interface Stats {
  visits: { today: number; total: number };
  calculated: { today: number; total: number };
}

type LoadState = "loading" | "ok" | "error";

const SERVICES = [
  {
    title: "生辰八字",
    desc: "四柱排盘 + 结构化命盘 + 异步详批，覆盖性格、事业、感情等维度。",
    lines: [1, 1, 1] as const,
  },
  {
    title: "双盘合参",
    desc: "双方八字对照，梳理合冲刑害与关系倾向，辅助理解互动节奏。",
    lines: [1, 0, 1] as const,
  },
  {
    title: "宝宝取名",
    desc: "结合生辰与风格偏好，给出音形义与五行提示的候选名理。",
    lines: [0, 0, 1] as const,
  },
  {
    title: "手相观掌",
    desc: "上传掌纹图像，由模型解读纹路意象，仅作趣味文化参考。",
    lines: [0, 1, 0] as const,
  },
];

const FAQS = [
  {
    q: "结果是否专业建议？",
    a: "否。本站为公益文化娱乐项目，结果由规则引擎与 AI 生成，不构成医疗、投资、婚恋或法律建议。",
  },
  {
    q: "数据会保存吗？",
    a: "测算记录保存在本机会话维度，便于回看历史；请勿提交敏感隐私信息。",
  },
  {
    q: "详批为何要等待？",
    a: "命盘结构同步生成，长文详批走异步任务队列，通常数十秒内可完成。",
  },
  {
    q: "如何开始？",
    a: "先阅通书感受当日气韵，再进入「测算」选择项目，填写信息后起卦即可。",
  },
];

export function SiteFooter({ embedded = false }: { embedded?: boolean }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [now, setNow] = useState("");

  const loadStats = useCallback(async (countVisit: boolean) => {
    setLoadState("loading");
    try {
      const res = await fetch(`/api/stats${countVisit ? "?visit=1" : ""}`, {
        cache: "no-store",
      });
      const d = await res.json();
      if (!res.ok || !d?.ok) {
        setLoadState("error");
        return;
      }
      setStats({
        visits: d.visits,
        calculated: d.calculated,
      });
      setLoadState("ok");
    } catch {
      setLoadState("error");
    }
  }, []);

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
    void loadStats(visit);
  }, [loadStats]);

  const cells = [
    { label: "今日访问", value: stats?.visits.today },
    { label: "总访问", value: stats?.visits.total },
    { label: "今日测算", value: stats?.calculated.today },
    { label: "总测算", value: stats?.calculated.total },
  ];

  function displayValue(value: number | undefined) {
    if (loadState === "ok" && typeof value === "number") return value;
    if (loadState === "error") return "—";
    return "…";
  }

  return (
    <footer
      className={clsx(
        "relative overflow-hidden",
        embedded
          ? "rounded-paper border border-daiqing/10 bg-porcelain-card px-3 py-4 shadow-card sm:px-5 sm:py-5 lg:px-6 lg:py-6"
          : "border-t border-daiqing/10 bg-porcelain-card px-4 py-10 sm:px-6",
      )}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-3 h-32 w-32 -translate-x-1/2 text-daiqing sm:h-40 sm:w-40"
        aria-hidden
      >
        <BaguaWheel
          className="h-full w-full opacity-[0.04]"
          spin
          muted
          showNames={false}
        />
      </div>
      <CloudMotif className="pointer-events-none absolute left-3 top-4 h-9 w-24 text-daiqing/10 sm:left-4 sm:top-6 sm:h-10 sm:w-28" />
      <CloudMotif className="pointer-events-none absolute bottom-4 right-4 h-9 w-24 scale-x-[-1] text-daiqing/10 sm:bottom-6 sm:right-6 sm:h-10 sm:w-28" />

      <div
        className={clsx(
          "relative flex flex-col gap-4 sm:gap-5",
          embedded ? "" : "mx-auto max-w-6xl",
        )}
      >
        {/* 品牌 + 统计 */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <Taiji className="h-5 w-5 text-daiqing/50 sm:h-6 sm:w-6" />
            <Seal className="h-9 min-w-9 text-xs sm:h-10 sm:min-w-10">天机</Seal>
            <Taiji className="h-5 w-5 text-daiqing/50 sm:h-6 sm:w-6" />
          </div>
          <div className="cn-cloud-divider w-40 sm:w-48" aria-hidden>
            <span className="font-song text-[10px] tracking-[0.28em] text-daiqing/40">
              阴阳合德
            </span>
          </div>
          <p className="max-w-xl text-center text-xs leading-relaxed text-muted sm:text-sm">
            妙算天机以传统文化意象为壳，用规则引擎与大模型提供趣味排盘与详批。
            把生辰讲清楚，把选择留给自己。
          </p>
          <WuxingDots />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
          {cells.map((c) => (
            <div
              key={c.label}
              className="rounded-paper border border-daiqing/10 bg-porcelain px-2.5 py-2.5 text-center transition hover:-translate-y-0.5 hover:border-daiqing/20 hover:shadow-sm sm:px-3 sm:py-3"
            >
              <div className="text-[10px] font-semibold tracking-[0.16em] text-faint">
                {c.label}
              </div>
              <div className="cn-tabular mt-1 font-song text-lg font-bold text-daiqing sm:text-xl">
                {displayValue(c.value)}
              </div>
            </div>
          ))}
        </div>
        {loadState === "error" ? (
          <p className="text-center text-[11px] text-faint">
            统计暂不可用（数据库未连接）
            <button
              type="button"
              className="ml-2 font-semibold text-daiqing underline-offset-2 hover:underline"
              onClick={() => void loadStats(false)}
            >
              重试
            </button>
          </p>
        ) : null}

        {/* 服务 + FAQ 双列撑满 */}
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          <div className="rounded-paper border border-daiqing/10 bg-porcelain/70 p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-song text-sm font-bold tracking-[0.12em] text-daiqing">
                可测服务
              </h3>
              <span className="text-[10px] tracking-widest text-faint">四象</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <div
                  key={s.title}
                  className="rounded-paper border border-daiqing/8 bg-porcelain-card px-2.5 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <TrigramGlyph lines={s.lines} className="h-3 w-4 text-daiqing/50" />
                    <span className="font-song text-sm font-semibold text-daiqing">
                      {s.title}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted sm:text-xs">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-paper border border-daiqing/10 bg-porcelain/70 p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-song text-sm font-bold tracking-[0.12em] text-daiqing">
                常见问答
              </h3>
              <span className="text-[10px] tracking-widest text-faint">FAQ</span>
            </div>
            <div className="grid gap-2">
              {FAQS.map((f) => (
                <div
                  key={f.q}
                  className="rounded-paper border border-daiqing/8 bg-porcelain-card px-2.5 py-2.5"
                >
                  <div className="font-song text-xs font-semibold tracking-wide text-daiqing sm:text-sm">
                    {f.q}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted sm:text-xs">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 八卦条 + 页脚文案 */}
        <div className="hidden flex-wrap justify-center gap-1.5 sm:flex" aria-hidden>
          {BAGUA.map((g) => (
            <span
              key={g.name}
              className="inline-flex items-center gap-1 rounded-paper border border-daiqing/8 bg-porcelain px-2 py-0.5 text-daiqing/55"
            >
              <TrigramGlyph lines={g.lines} className="h-2.5 w-3.5" />
              <span className="font-song text-[10px] tracking-widest">{g.name}</span>
            </span>
          ))}
        </div>

        <div className="space-y-1.5 text-center">
          <p className="cn-tabular text-xs tracking-wide text-muted">
            当前时间 {now || "…"}
          </p>
          <p className="font-song text-xs font-semibold tracking-[0.12em] text-daiqing">
            公益 AI 算命 · 本站内容仅供文化娱乐参考
          </p>
          <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-faint">
            免责声明：测算结果由规则引擎与 AI 生成，不构成医疗、投资、婚恋、法律等专业建议；请勿据此做出重大决定。
          </p>
          <p className="text-[11px] text-faint">
            © {new Date().getFullYear()} 妙算天机 · UI v3.7 路由分页 · Postgres
            {" · "}
            <Link
              href="/admin"
              className="font-semibold tracking-wide text-daiqing hover:underline"
            >
              管理员登录
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
