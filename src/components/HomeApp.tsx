"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlmanacPanel } from "./AlmanacPanel";
import {
  BAGUA,
  CloudMotif,
  Taiji,
  TrigramGlyph,
  WuxingDots,
} from "./Ornaments";
import { SiteChrome } from "./SiteChrome";
import { SiteFooter } from "./SiteFooter";
import { Button, Seal, StepPill } from "./ui";
import { SERVICE_HIGHLIGHTS, SERVICES } from "@/lib/services";

type HomeSection = "hero" | "almanac" | "about";

const HEADER_OFFSET = 72;

function getScrollY() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

export function HomeApp() {
  const router = useRouter();
  const [section, setSection] = useState<HomeSection>("hero");
  const lockRef = useRef(false);
  const lockTimer = useRef<number | null>(null);

  const goSection = useCallback((id: HomeSection) => {
    setSection(id);
    lockRef.current = true;
    if (lockTimer.current) window.clearTimeout(lockTimer.current);
    lockTimer.current = window.setTimeout(() => {
      lockRef.current = false;
    }, 700);

    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + getScrollY() - HEADER_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "section-almanac") {
        requestAnimationFrame(() => goSection("almanac"));
      } else if (hash === "section-about") {
        requestAnimationFrame(() => goSection("about"));
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [goSection]);

  useEffect(() => {
    const onScroll = () => {
      if (lockRef.current) return;
      const y = getScrollY();
      const probe = y + HEADER_OFFSET + 48;
      let current: HomeSection = "hero";
      for (const id of ["hero", "almanac", "about"] as const) {
        const el = document.getElementById(`section-${id}`);
        if (!el) continue;
        if (el.offsetTop <= probe) current = id;
      }
      setSection((prev) => (prev === current ? prev : current));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
    };
  }, []);

  const measureTabs = SERVICES.filter((t) => t.id !== "history");

  return (
    <SiteChrome homeSection={section}>
      <section id="section-hero" className="cn-section cn-section-hero" aria-label="开篇">
        <div className="cn-container">
          <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Seal className="h-8 w-8 text-[10px]">天机</Seal>
                <p className="font-song text-[11px] font-semibold tracking-[0.16em] text-rose">
                  白瓷 · 黛青 · 八卦
                </p>
                <WuxingDots className="hidden sm:flex" />
              </div>

              <h1 className="font-song text-[1.85rem] font-extrabold leading-[1.2] tracking-[0.04em] text-daiqing sm:text-4xl lg:text-[2.75rem]">
                把生辰讲清楚
                <span className="mt-1.5 block font-bold text-ink-2">把选择留给自己</span>
              </h1>

              <div className="cn-cloud-divider my-4 max-w-md" aria-hidden>
                <Taiji className="h-5 w-5 shrink-0 text-daiqing/50" />
              </div>

              <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-[0.95rem]">
                结构化命盘与异步详批。通书观气、测算起卦——仅供文化娱乐参考。
              </p>

              <div className="mt-4 hidden flex-wrap gap-1.5 sm:flex" aria-label="后天八卦">
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

              <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
                <StepPill n="一" label="看通书" />
                <StepPill n="二" label="选测算" />
                <StepPill n="三" label="读结构" />
                <StepPill n="四" label="阅详批" />
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <div className="grid grid-cols-2 gap-2 sm:contents">
                  <Button
                    type="button"
                    className="!w-full sm:!w-auto"
                    onClick={() => router.push("/bazi")}
                  >
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
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="!w-full sm:!w-auto"
                  onClick={() => router.push("/hepan")}
                >
                  双盘合参
                </Button>
              </div>
            </div>

            <div className="lg:col-span-6 xl:col-span-5">
              <div className="cn-frame-full cn-dao-glow relative overflow-hidden rounded-paper border border-daiqing/20 p-4 text-white shadow-glow sm:p-5">
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 text-white/25"
                  aria-hidden
                >
                  <Taiji className="h-full w-full opacity-40" spin />
                </div>
                <CloudMotif className="pointer-events-none absolute bottom-3 right-3 h-9 w-24 text-white/20" />

                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Taiji className="h-6 w-6 text-white/90" spin />
                    <div>
                      <p className="font-song text-xs font-semibold tracking-[0.16em] text-white/80">
                        今日可测
                      </p>
                      <p className="text-[10px] text-white/50">点选进入专页</p>
                    </div>
                  </div>
                  <Seal className="h-8 min-w-8 border-white/50 bg-white/5 text-[10px] text-white/90">
                    可测
                  </Seal>
                </div>

                <ul className="relative mt-3 space-y-1.5 text-sm">
                  {measureTabs.map((t) => {
                    const gua = BAGUA[t.gua];
                    return (
                      <li key={t.id}>
                        <Link
                          href={t.href}
                          className="flex w-full items-center justify-between gap-2 rounded-paper border border-white/12 bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/10 active:bg-white/15"
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
                          <span className="shrink-0 text-[10px] text-white/45">{gua.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="cn-tile-grid cn-tile-grid-4 mt-8">
            {SERVICE_HIGHLIGHTS.map((h) => (
              <div key={h.title} className="cn-tile">
                <div className="cn-tile-title">{h.title}</div>
                <p className="cn-tile-desc">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="section-almanac"
        className="cn-section cn-section-band"
        aria-labelledby="almanac-heading"
      >
        <div className="cn-container">
          <div className="mb-5 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-song text-[11px] font-semibold tracking-[0.18em] text-rose">
                今日气象
              </p>
              <h2
                id="almanac-heading"
                className="mt-0.5 font-song text-xl font-bold tracking-[0.08em] text-daiqing sm:text-2xl"
              >
                通书与签文
              </h2>
              <p className="mt-1 text-xs text-muted sm:text-sm">
                宜忌、冲煞与签文。点「再摇一签」可全屏摇签。
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-3 !w-full sm:mt-0 sm:!w-auto"
              onClick={() => router.push("/bazi")}
            >
              去测算起卦
            </Button>
          </div>

          <AlmanacPanel />
        </div>
      </section>

      <section id="section-about" className="cn-section cn-section-band pb-4" aria-label="关于">
        <div className="cn-container">
          <div className="mb-5 text-center">
            <p className="font-song text-[11px] font-semibold tracking-[0.18em] text-rose">
              站务纪要
            </p>
            <h2 className="mt-0.5 font-song text-xl font-bold tracking-[0.08em] text-daiqing sm:text-2xl">
              关于 · 服务 · 统计
            </h2>
            <p className="mx-auto mt-1 max-w-lg text-xs text-muted sm:text-sm">
              说明、服务与访问统计
            </p>
          </div>
          <SiteFooter embedded />
        </div>
      </section>
    </SiteChrome>
  );
}
