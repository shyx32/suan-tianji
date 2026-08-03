"use client";

import { useState } from "react";
import Link from "next/link";
import { AlmanacPanel } from "./AlmanacPanel";
import { BaziForm } from "./BaziForm";
import { HepanForm } from "./HepanForm";
import { HistoryPanel } from "./HistoryPanel";
import { NamingForm } from "./NamingForm";
import { PalmForm } from "./PalmForm";
import { SiteFooter } from "./SiteFooter";
import { BrandMark, Button, StepPill } from "./ui";

type Tab = "bazi" | "palm" | "hepan" | "naming" | "history";

const TABS: { id: Tab; label: string; desc: string }[] = [
  { id: "bazi", label: "生辰八字", desc: "详批命盘" },
  { id: "hepan", label: "双盘合参", desc: "缘分对照" },
  { id: "naming", label: "宝宝取名", desc: "名理建议" },
  { id: "palm", label: "手相观掌", desc: "图像解读" },
  { id: "history", label: "历史记录", desc: "本机会话" },
];

export function HomeApp() {
  const [tab, setTab] = useState<Tab>("bazi");
  const [historyKey, setHistoryKey] = useState(0);

  function go(t: Tab) {
    setTab(t);
    document
      .getElementById("workspace")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onSaved() {
    setHistoryKey((k) => k + 1);
  }

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="relative min-h-screen">
      {/* Top bar — clean light, not dark rail */}
      <header className="sticky top-0 z-40 border-b border-daiqing/8 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button
            type="button"
            className="flex items-center gap-3 text-left"
            onClick={() => go("bazi")}
          >
            <BrandMark>妙</BrandMark>
            <span>
              <span className="block text-base font-bold tracking-wide text-daiqing">
                妙算天机
              </span>
              <span className="block text-[11px] text-muted">云机一测 · 文化娱乐</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {TABS.slice(0, 4).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => go(t.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-daiqing text-white"
                    : "text-muted hover:bg-porcelain-muted hover:text-daiqing"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go("history")}
              className="hidden rounded-full px-3 py-1.5 text-sm text-muted hover:bg-porcelain-muted sm:inline"
            >
              历史
            </button>
            <Link
              href="/admin"
              className="rounded-full border border-daiqing/15 bg-white px-3 py-1.5 text-xs font-semibold text-daiqing shadow-sm hover:border-daiqing/30"
            >
              管理员登录
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — split layout magazine style */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold tracking-[0.2em] text-rose">
            白瓷 · 黛青 · v3
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-daiqing sm:text-5xl">
            把生辰讲清楚
            <span className="mt-2 block font-bold text-ink-2">
              把选择留给自己
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            全新浅色界面：顶栏导航、通书卡片、独立工作区。同步输出结构化命盘，异步生成详批长文。仅供文化娱乐参考，不构成专业建议。
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <StepPill n="1" label="看通书" />
            <StepPill n="2" label="选测算" />
            <StepPill n="3" label="读结构" />
            <StepPill n="4" label="阅详批" />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="button" onClick={() => go("bazi")}>
              起卦排盘
            </Button>
            <Button type="button" variant="secondary" onClick={() => go("hepan")}>
              双盘合参
            </Button>
            <Button type="button" variant="ghost" onClick={() => go("naming")}>
              宝宝取名
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-daiqing/10 bg-daiqing p-6 text-white shadow-glow sm:p-8">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-rose/30" />
            <p className="relative text-xs font-semibold tracking-[0.18em] text-white/70">
              今日可测
            </p>
            <ul className="relative mt-5 space-y-3 text-sm">
              {TABS.filter((t) => t.id !== "history").map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => go(t.id)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
                  >
                    <span className="font-semibold">{t.label}</span>
                    <span className="text-xs text-white/60">{t.desc}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Almanac */}
      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-rose">今日气象</p>
            <h2 className="mt-1 text-xl font-bold text-daiqing">通书与签文</h2>
          </div>
        </div>
        <AlmanacPanel />
      </section>

      {/* Workspace */}
      <section
        id="workspace"
        className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-16 sm:px-6"
      >
        <div className="mb-5 rounded-[1.5rem] border border-daiqing/8 bg-white p-2 shadow-card">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={
                  tab === t.id
                    ? "cn-chip cn-chip-on flex-1 min-w-[5.5rem] justify-center"
                    : "cn-chip cn-chip-off flex-1 min-w-[5.5rem] justify-center"
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-daiqing">{active.label}</h2>
          <p className="text-sm text-muted">{active.desc}</p>
        </div>

        {tab === "bazi" ? <BaziForm onSaved={onSaved} /> : null}
        {tab === "palm" ? <PalmForm onSaved={onSaved} /> : null}
        {tab === "hepan" ? <HepanForm onSaved={onSaved} /> : null}
        {tab === "naming" ? <NamingForm onSaved={onSaved} /> : null}
        {tab === "history" ? <HistoryPanel refreshKey={historyKey} /> : null}
      </section>

      <SiteFooter />
    </div>
  );
}
