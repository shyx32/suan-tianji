"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlmanacPanel } from "./AlmanacPanel";
import { BaziForm } from "./BaziForm";
import { HepanForm } from "./HepanForm";
import { HistoryPanel } from "./HistoryPanel";
import { NamingForm } from "./NamingForm";
import {
  BaguaWheel,
  BaguaWatermark,
  CloudMotif,
  Taiji,
  TrigramGlyph,
  WuxingDots,
  BAGUA,
} from "./Ornaments";
import { PalmForm } from "./PalmForm";
import { SiteFooter } from "./SiteFooter";
import { BrandMark, Button, Seal, StepPill } from "./ui";

type Tab = "bazi" | "palm" | "hepan" | "naming" | "history";
type SectionId = "hero" | "almanac" | "workspace" | "about";

const SECTIONS: { id: SectionId; label: string; full: string }[] = [
  { id: "hero", label: "启", full: "开篇" },
  { id: "almanac", label: "书", full: "通书" },
  { id: "workspace", label: "测", full: "测算" },
  { id: "about", label: "记", full: "关于" },
];

const TABS: {
  id: Tab;
  label: string;
  desc: string;
  short: string;
  gua: number;
  blurb: string;
}[] = [
  {
    id: "bazi",
    label: "生辰八字",
    desc: "详批命盘",
    short: "八字",
    gua: 3,
    blurb: "四柱排盘，同步结构，异步长文详批。",
  },
  {
    id: "hepan",
    label: "双盘合参",
    desc: "缘分对照",
    short: "合参",
    gua: 0,
    blurb: "双方八字对照，看合冲与相处节奏。",
  },
  {
    id: "naming",
    label: "宝宝取名",
    desc: "名理建议",
    short: "取名",
    gua: 6,
    blurb: "音形义与五行提示，给出候选名理。",
  },
  {
    id: "palm",
    label: "手相观掌",
    desc: "图像解读",
    short: "手相",
    gua: 4,
    blurb: "上传掌纹，模型解读意象仅供娱乐。",
  },
  {
    id: "history",
    label: "历史记录",
    desc: "本机会话",
    short: "历史",
    gua: 5,
    blurb: "回看本机已完成的测算与详批。",
  },
];

const HIGHLIGHTS = [
  {
    title: "结构先行",
    desc: "先出四柱、大运、纳音等可读结构，再等详批长文，信息层次清楚。",
  },
  {
    title: "异步详批",
    desc: "长文走任务队列，页面可继续浏览通书或切换其他测算，无需干等。",
  },
  {
    title: "八卦意象",
    desc: "太极八卦与朱印纸本仅作文化装帧，不替代专业判断与现实选择。",
  },
  {
    title: "本机历史",
    desc: "会话内可回看记录，方便对照多次推演；请勿提交敏感隐私。",
  },
];

const WORKFLOW = [
  { n: "一", t: "通书", d: "先观当日宜忌与签文气韵" },
  { n: "二", t: "选题", d: "八字 / 合参 / 取名 / 手相" },
  { n: "三", t: "排盘", d: "填写生辰信息，同步得结构" },
  { n: "四", t: "详批", d: "异步生成长文，可稍后回看" },
];

const MOBILE_MQ = "(max-width: 767px)";

function ScrollHint({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="cn-scroll-hint cn-bounce-soft" onClick={onClick}>
      <span>{label}</span>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 10l6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return mobile;
}

export function HomeApp() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>("bazi");
  const [historyKey, setHistoryKey] = useState(0);
  const [section, setSection] = useState<SectionId>("hero");
  const [visible, setVisible] = useState<Record<SectionId, boolean>>({
    hero: true,
    almanac: false,
    workspace: false,
    about: false,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelKey = tab;

  const goSection = useCallback(
    (id: SectionId) => {
      setSection(id);
      setVisible((v) => ({ ...v, [id]: true }));
      if (isMobile) {
        // 手机：整页切换，滚回顶部
        window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" as ScrollBehavior : "auto" });
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
        return;
      }
      const el = document.getElementById(`screen-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [isMobile],
  );

  const goTab = useCallback(
    (t: Tab) => {
      setTab(t);
      goSection("workspace");
    },
    [goSection],
  );

  function onSaved() {
    setHistoryKey((k) => k + 1);
  }

  // 桌面：滚动吸附 + IntersectionObserver
  useEffect(() => {
    if (isMobile) {
      setVisible({ hero: true, almanac: true, workspace: true, about: true });
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    const nodes = SECTIONS.map((s) => document.getElementById(`screen-${s.id}`)).filter(
      Boolean,
    ) as HTMLElement[];

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.replace("screen-", "") as SectionId;
          if (entry.isIntersecting) {
            setVisible((v) => (v[id] ? v : { ...v, [id]: true }));
            if (entry.intersectionRatio >= 0.4) setSection(id);
          }
        }
      },
      { root, threshold: [0.3, 0.5, 0.65] },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [isMobile]);

  const active = TABS.find((t) => t.id === tab)!;
  const on = (id: SectionId) =>
    isMobile || visible[id] ? "cn-reveal is-in" : "cn-reveal";

  const show = (id: SectionId) => !isMobile || section === id;

  return (
    <div
      ref={rootRef}
      className={isMobile ? "cn-mobile-root relative" : "cn-snap-root relative"}
    >
      {!isMobile ? (
        <>
          <BaguaWatermark className="pointer-events-none fixed -right-[12%] top-[8%] z-0 h-[min(72vw,28rem)] w-[min(72vw,28rem)]" />
          <BaguaWatermark className="pointer-events-none fixed -left-[18%] bottom-[4%] z-0 h-[min(60vw,22rem)] w-[min(60vw,22rem)] opacity-70" />
        </>
      ) : (
        <BaguaWatermark className="pointer-events-none fixed right-[-20%] top-[20%] z-0 h-56 w-56 opacity-60" />
      )}

      <header className="cn-app-header fixed inset-x-0 top-0 z-40 border-b border-daiqing/10 bg-porcelain-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-2.5">
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 text-left"
            onClick={() => goSection("hero")}
            aria-label="回到首页"
          >
            <span className="relative shrink-0">
              <BrandMark className="h-8 w-8 text-sm sm:h-9 sm:w-9">妙</BrandMark>
              <span className="absolute -bottom-1 -right-1 h-3 w-3 text-daiqing" aria-hidden>
                <Taiji className="h-full w-full opacity-80" />
              </span>
            </span>
            <span className="min-w-0">
              <span className="block truncate font-song text-sm font-bold tracking-[0.12em] text-daiqing sm:text-base sm:tracking-[0.16em]">
                妙算天机
              </span>
              <span className="hidden text-[10px] tracking-[0.12em] text-muted sm:block">
                云机一测 · 八卦推演
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="分屏导航">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goSection(s.id)}
                aria-current={section === s.id ? "true" : undefined}
                className={`rounded-paper px-3 py-1.5 text-sm font-medium tracking-wide transition ${
                  section === s.id
                    ? "bg-daiqing text-white shadow-sm"
                    : "text-muted hover:bg-porcelain-muted hover:text-daiqing"
                }`}
              >
                {s.full}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => goTab("history")}
              className="rounded-paper px-2.5 py-1.5 text-xs tracking-wide text-muted hover:bg-porcelain-muted sm:px-3 sm:text-sm"
            >
              历史
            </button>
            <Link
              href="/admin"
              className="rounded-paper border border-daiqing/15 bg-porcelain-card px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-daiqing shadow-sm sm:px-3 sm:text-xs"
            >
              管理
            </Link>
          </div>
        </div>
      </header>

      {/* 桌面侧点；手机隐藏 */}
      <nav className="cn-section-dots" aria-label="页面分屏">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="cn-section-dot"
            aria-current={section === s.id ? "true" : undefined}
            aria-label={s.full}
            onClick={() => goSection(s.id)}
          >
            <span className="label font-song">{s.label}</span>
            <span className="dot" />
          </button>
        ))}
      </nav>

      {/* —— 开篇 —— */}
      {show("hero") ? (
        <section
          id="screen-hero"
          className={isMobile ? "cn-mobile-page" : "cn-screen"}
          aria-label="开篇"
        >
          <div className={isMobile ? "cn-mobile-inner" : "cn-screen-inner cn-screen-fill"}>
            <div
              className={
                isMobile
                  ? "flex flex-col gap-4"
                  : "cn-fill-body cn-screen-scroll gap-4 sm:gap-5 lg:gap-6"
              }
            >
              <div className="grid items-start gap-4 lg:grid-cols-12 lg:items-center lg:gap-8">
                <div className="lg:col-span-7">
                  <div
                    className={`${on("hero")} cn-reveal-delay-1 mb-2 flex flex-wrap items-center gap-2`}
                  >
                    <Seal className="h-8 w-8 text-[10px]">天机</Seal>
                    <p className="font-song text-[11px] font-semibold tracking-[0.16em] text-rose">
                      白瓷 · 黛青 · 八卦
                    </p>
                    <WuxingDots className="hidden sm:flex" />
                  </div>
                  <h1
                    className={`${on("hero")} cn-reveal-delay-2 font-song text-[1.65rem] font-extrabold leading-tight tracking-[0.04em] text-daiqing sm:text-4xl lg:text-5xl`}
                  >
                    把生辰讲清楚
                    <span className="mt-1.5 block font-bold text-ink-2">
                      把选择留给自己
                    </span>
                  </h1>
                  <div
                    className={`${on("hero")} cn-reveal-delay-3 cn-cloud-divider my-3 max-w-md`}
                    aria-hidden
                  >
                    <Taiji className="h-5 w-5 shrink-0 text-daiqing/50" />
                  </div>
                  <p
                    className={`${on("hero")} cn-reveal-delay-3 max-w-xl text-sm leading-relaxed text-muted`}
                  >
                    结构化命盘与异步详批。通书观气、测算起卦——仅供文化娱乐参考。
                  </p>

                  <div
                    className={`${on("hero")} cn-reveal-delay-4 mt-3 hidden flex-wrap gap-1.5 sm:flex`}
                    aria-label="后天八卦"
                  >
                    {BAGUA.map((g) => (
                      <span
                        key={g.name}
                        className="inline-flex items-center gap-1 rounded-paper border border-daiqing/10 bg-porcelain-card/80 px-2 py-1 text-daiqing/70"
                      >
                        <TrigramGlyph lines={g.lines} className="h-3 w-4" />
                        <span className="font-song text-[10px] tracking-widest">{g.name}</span>
                      </span>
                    ))}
                  </div>

                  <div
                    className={`${on("hero")} cn-reveal-delay-4 mt-3 hidden flex-wrap gap-2 sm:flex`}
                  >
                    <StepPill n="一" label="看通书" />
                    <StepPill n="二" label="选测算" />
                    <StepPill n="三" label="读结构" />
                    <StepPill n="四" label="阅详批" />
                  </div>

                  <div
                    className={`${on("hero")} cn-reveal-delay-5 mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3`}
                  >
                    <Button type="button" className="!w-full sm:!w-auto" onClick={() => goTab("bazi")}>
                      起卦排盘
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="!w-full sm:!w-auto"
                      onClick={() => goSection("almanac")}
                    >
                      先看通书
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="col-span-2 !w-full sm:col-span-1 sm:!w-auto"
                      onClick={() => goTab("hepan")}
                    >
                      双盘合参
                    </Button>
                  </div>
                </div>

                <div className={`${on("hero")} cn-reveal-delay-3 lg:col-span-5`}>
                  <div className="cn-frame-full cn-dao-glow relative overflow-hidden rounded-paper border border-daiqing/20 p-3.5 text-white shadow-glow sm:p-5">
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 text-white/25"
                      aria-hidden
                    >
                      <BaguaWheel className="h-full w-full" spin showNames={false} />
                    </div>
                    <CloudMotif className="pointer-events-none absolute bottom-3 right-3 h-9 w-24 text-white/20" />

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Taiji className="h-6 w-6 text-white/90" spin />
                        <div>
                          <p className="font-song text-xs font-semibold tracking-[0.16em] text-white/80">
                            今日可测
                          </p>
                          <p className="text-[10px] text-white/50">点选进入测算</p>
                        </div>
                      </div>
                      <Seal className="h-8 min-w-8 border-white/50 bg-white/5 text-[10px] text-white/90">
                        可测
                      </Seal>
                    </div>

                    <ul className="relative mt-3 space-y-1.5 text-sm">
                      {TABS.filter((t) => t.id !== "history").map((t) => {
                        const gua = BAGUA[t.gua];
                        return (
                          <li key={t.id}>
                            <button
                              type="button"
                              onClick={() => goTab(t.id)}
                              className="flex w-full items-center justify-between gap-2 rounded-paper border border-white/12 bg-white/5 px-3 py-2.5 text-left active:bg-white/15"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-seal border border-white/20 bg-white/5">
                                  <TrigramGlyph
                                    lines={gua.lines}
                                    className="h-3.5 w-5 text-white/90"
                                  />
                                </span>
                                <span className="min-w-0">
                                  <span className="block font-song font-semibold tracking-wide">
                                    {t.label}
                                  </span>
                                  <span className="block truncate text-[10px] text-white/50">
                                    {t.blurb}
                                  </span>
                                </span>
                              </span>
                              <span className="shrink-0 text-[10px] text-white/45">
                                {gua.name}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              <div
                className={`${on("hero")} cn-reveal-delay-5 cn-tile-grid cn-tile-grid-4 cn-mobile-hide-tight`}
              >
                {HIGHLIGHTS.map((h) => (
                  <div key={h.title} className="cn-tile">
                    <div className="cn-tile-title">{h.title}</div>
                    <p className="cn-tile-desc">{h.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {!isMobile ? (
              <div className="mt-2 flex shrink-0 justify-center sm:mt-3">
                <ScrollHint label="下滑通书" onClick={() => goSection("almanac")} />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="!w-full"
                  onClick={() => goSection("almanac")}
                >
                  去通书
                </Button>
                <Button type="button" className="!w-full" onClick={() => goSection("workspace")}>
                  去测算
                </Button>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* —— 通书 —— */}
      {show("almanac") ? (
        <section
          id="screen-almanac"
          className={isMobile ? "cn-mobile-page" : "cn-screen"}
          aria-labelledby="almanac-heading"
        >
          <div className={isMobile ? "cn-mobile-inner" : "cn-screen-inner cn-screen-fill"}>
            <div className={`${on("almanac")} cn-reveal-delay-1 mb-3`}>
              <p className="font-song text-[11px] font-semibold tracking-[0.18em] text-rose">
                今日气象
              </p>
              <h2
                id="almanac-heading"
                className="mt-0.5 font-song text-lg font-bold tracking-[0.08em] text-daiqing sm:text-xl"
              >
                通书与签文
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                宜忌、冲煞与签文。点「再摇一签」可全屏摇签。
              </p>
            </div>

            <div className={`${on("almanac")} cn-reveal-delay-2 ${isMobile ? "" : "cn-fill-body cn-screen-scroll"}`}>
              <AlmanacPanel compact />
            </div>

            {isMobile ? (
              <div className="mt-4">
                <Button
                  type="button"
                  className="!w-full"
                  onClick={() => goSection("workspace")}
                >
                  去测算起卦
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex shrink-0 justify-center sm:mt-3">
                <ScrollHint label="进入测算" onClick={() => goSection("workspace")} />
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* —— 测算 —— */}
      {show("workspace") ? (
        <section
          id="screen-workspace"
          className={isMobile ? "cn-mobile-page" : "cn-screen"}
          aria-labelledby="workspace-heading"
        >
          <div
            className={
              isMobile
                ? "cn-mobile-inner"
                : "cn-screen-inner cn-screen-fill pb-[4.75rem] md:pb-4"
            }
          >
            <div className={`${on("workspace")} cn-reveal-delay-1 mb-2`}>
              <p className="font-song text-[11px] font-semibold tracking-[0.18em] text-rose">
                云机测算
              </p>
              <h2
                id="workspace-heading"
                className="mt-0.5 font-song text-lg font-bold tracking-[0.08em] text-daiqing sm:text-xl"
              >
                {active.label}
              </h2>
              <p className="text-xs text-muted sm:text-sm">
                {BAGUA[active.gua].name}卦 · {active.desc}
              </p>
            </div>

            {!isMobile ? (
              <div
                className={`${on("workspace")} cn-reveal-delay-1 cn-hide-short mb-2 hidden grid-cols-4 gap-1.5 sm:grid`}
              >
                {WORKFLOW.map((w) => (
                  <div
                    key={w.n}
                    className="rounded-paper border border-daiqing/10 bg-porcelain-card/90 px-2 py-1.5 text-center"
                  >
                    <div className="font-song text-[10px] font-bold tracking-[0.16em] text-rose">
                      {w.n} · {w.t}
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted">{w.d}</div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* 测算类型：手机横向可滑 */}
            <div
              className={`${on("workspace")} cn-reveal-delay-2 cn-mobile-tabs mb-3 rounded-paper border border-daiqing/10 bg-porcelain-card p-1 shadow-card`}
              role="tablist"
              aria-label="测算类型"
            >
              <div className="cn-mobile-tabs-scroller flex gap-1">
                {TABS.map((t) => {
                  const gua = BAGUA[t.gua];
                  const activeTab = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={activeTab}
                      id={`tab-${t.id}`}
                      title={t.blurb}
                      onClick={() => setTab(t.id)}
                      className={
                        activeTab
                          ? "cn-chip cn-chip-on shrink-0 justify-center gap-1 px-3"
                          : "cn-chip cn-chip-off shrink-0 justify-center gap-1 px-3"
                      }
                    >
                      <TrigramGlyph
                        lines={gua.lines}
                        className={`h-3 w-4 ${activeTab ? "text-white" : "text-daiqing/50"}`}
                      />
                      <span className="sm:hidden">{t.short}</span>
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`${on("workspace")} cn-reveal-delay-3 ${isMobile ? "" : "cn-fill-body cn-screen-scroll"}`}>
              <div className="mb-3 rounded-paper border border-daiqing/10 bg-gradient-to-r from-porcelain-muted/60 to-transparent px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-seal border border-daiqing/15 bg-porcelain-card text-daiqing">
                    <TrigramGlyph lines={BAGUA[active.gua].lines} className="h-4 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-song text-sm font-bold text-daiqing">
                      本次：{active.label}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">
                      {active.blurb}
                    </p>
                  </div>
                </div>
              </div>

              <div
                key={panelKey}
                className="cn-panel-in"
                role="tabpanel"
                aria-labelledby={`tab-${tab}`}
              >
                {tab === "bazi" ? <BaziForm onSaved={onSaved} /> : null}
                {tab === "palm" ? <PalmForm onSaved={onSaved} /> : null}
                {tab === "hepan" ? <HepanForm onSaved={onSaved} /> : null}
                {tab === "naming" ? <NamingForm onSaved={onSaved} /> : null}
                {tab === "history" ? <HistoryPanel refreshKey={historyKey} /> : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* —— 关于 —— */}
      {show("about") ? (
        <section
          id="screen-about"
          className={isMobile ? "cn-mobile-page" : "cn-screen"}
          aria-label="关于"
        >
          <div className={isMobile ? "cn-mobile-inner" : "cn-screen-inner cn-screen-fill"}>
            <div className={`${on("about")} cn-reveal-delay-1 mb-3 text-center`}>
              <p className="font-song text-[11px] font-semibold tracking-[0.18em] text-rose">
                站务纪要
              </p>
              <h2 className="mt-0.5 font-song text-lg font-bold tracking-[0.08em] text-daiqing sm:text-xl">
                关于 · 服务 · 统计
              </h2>
              <p className="mx-auto mt-1 max-w-lg text-xs text-muted">
                说明、服务与访问统计
              </p>
            </div>
            <div className={`${on("about")} cn-reveal-delay-2 ${isMobile ? "" : "cn-fill-body cn-screen-scroll"}`}>
              <SiteFooter embedded />
            </div>
          </div>
        </section>
      ) : null}

      {/* 手机底栏：整页切换，不用强制吸附滚动 */}
      <nav className="cn-bottom-nav fixed inset-x-0 bottom-0 z-50 md:hidden" aria-label="底部导航">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-0.5 px-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5">
          {SECTIONS.map((s) => {
            const activeSec = section === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goSection(s.id)}
                aria-current={activeSec ? "page" : undefined}
                className={`flex min-h-[3.1rem] flex-col items-center justify-center gap-0.5 rounded-paper px-1 py-1 text-[11px] font-semibold tracking-wide transition active:scale-[0.98] ${
                  activeSec ? "bg-rose/8 text-rose" : "text-muted"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-seal border font-song text-[12px] ${
                    activeSec
                      ? "border-rose/45 bg-rose/12 text-rose shadow-sm"
                      : "border-daiqing/12 bg-porcelain text-daiqing/65"
                  }`}
                >
                  {s.label}
                </span>
                {s.full}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
