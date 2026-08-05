"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BaguaWatermark, Taiji } from "./Ornaments";
import { BrandMark } from "./ui";
import { SERVICES, isServicePath } from "@/lib/services";

type ChromeNav = "home" | "almanac" | "service" | "history";

const MOBILE_NAV: {
  id: ChromeNav;
  label: string;
  full: string;
  href: string;
}[] = [
  { id: "home", label: "启", full: "首页", href: "/" },
  { id: "almanac", label: "书", full: "通书", href: "/#section-almanac" },
  { id: "service", label: "测", full: "测算", href: "/bazi" },
  { id: "history", label: "记", full: "历史", href: "/history" },
];

function resolveNav(pathname: string): ChromeNav {
  if (pathname === "/history") return "history";
  if (isServicePath(pathname)) return "service";
  return "home";
}

export function SiteChrome({
  children,
  homeSection,
}: {
  children: ReactNode;
  /** 首页内滚动时高亮「通书」 */
  homeSection?: "hero" | "almanac" | "about";
}) {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const routeNav = resolveNav(pathname);

  const activeNav: ChromeNav =
    pathname === "/" && homeSection === "almanac"
      ? "almanac"
      : pathname === "/" && homeSection === "about"
        ? "home"
        : routeNav === "home" && homeSection === "hero"
          ? "home"
          : routeNav;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setScrolled(y > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const desktopLinks = [
    {
      href: "/",
      label: "首页",
      match: (p: string) => p === "/" && activeNav !== "almanac",
    },
    {
      href: "/#section-almanac",
      label: "通书",
      match: () => activeNav === "almanac",
    },
    ...SERVICES.filter((s) => s.id !== "history").map((s) => ({
      href: s.href,
      label: s.short,
      match: (p: string) => p === s.href,
    })),
  ];

  return (
    <div className="cn-shell relative min-h-dvh">
      <BaguaWatermark className="pointer-events-none fixed -right-[14%] top-[6%] z-0 hidden h-[min(70vw,26rem)] w-[min(70vw,26rem)] opacity-80 md:block" />
      <BaguaWatermark className="pointer-events-none fixed -left-[16%] bottom-[8%] z-0 hidden h-[min(56vw,20rem)] w-[min(56vw,20rem)] opacity-55 md:block" />
      <BaguaWatermark className="pointer-events-none fixed right-[-28%] top-[18%] z-0 h-48 w-48 opacity-50 md:hidden" />

      <header
        className={`cn-app-header fixed inset-x-0 top-0 z-40 border-b transition-[background,box-shadow,border-color] duration-200 ${
          scrolled
            ? "border-daiqing/12 bg-porcelain-card/95 shadow-sm backdrop-blur-md"
            : "border-transparent bg-porcelain-card/80 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-left"
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
          </Link>

          <nav
            className="hidden items-center gap-0.5 lg:flex"
            aria-label="页面导航"
          >
            {desktopLinks.map((item) => {
              const on = item.match(pathname);
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={`rounded-paper px-2.5 py-1.5 text-sm font-medium tracking-wide transition ${
                    on
                      ? "bg-daiqing text-white shadow-sm"
                      : "text-muted hover:bg-porcelain-muted hover:text-daiqing"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/history"
              aria-current={pathname === "/history" ? "page" : undefined}
              className={`rounded-paper px-2.5 py-1.5 text-xs tracking-wide sm:px-3 sm:text-sm ${
                pathname === "/history"
                  ? "bg-daiqing/10 font-semibold text-daiqing"
                  : "text-muted hover:bg-porcelain-muted"
              }`}
            >
              历史
            </Link>
            <Link
              href="/admin"
              className="rounded-paper border border-daiqing/15 bg-porcelain-card px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-daiqing shadow-sm sm:px-3 sm:text-xs"
            >
              管理
            </Link>
          </div>
        </div>
      </header>

      <main className="cn-shell-main relative z-10">{children}</main>

      <nav
        className="cn-bottom-nav fixed inset-x-0 bottom-0 z-50 md:hidden"
        aria-label="底部导航"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-0.5 px-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5">
          {MOBILE_NAV.map((s) => {
            const on = activeNav === s.id;
            return (
              <Link
                key={s.id}
                href={s.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-[3.1rem] flex-col items-center justify-center gap-0.5 rounded-paper px-1 py-1 text-[11px] font-semibold tracking-wide transition active:scale-[0.98] ${
                  on ? "bg-rose/8 text-rose" : "text-muted"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-seal border font-song text-[12px] ${
                    on
                      ? "border-rose/45 bg-rose/12 text-rose shadow-sm"
                      : "border-daiqing/12 bg-porcelain text-daiqing/65"
                  }`}
                >
                  {s.label}
                </span>
                {s.full}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
