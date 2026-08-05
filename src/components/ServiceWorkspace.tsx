"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { BAGUA, TrigramGlyph } from "./Ornaments";
import { getService, SERVICES, type ServiceId } from "@/lib/services";
import { BaziForm } from "./BaziForm";
import { HepanForm } from "./HepanForm";
import { HistoryPanel } from "./HistoryPanel";
import { NamingForm } from "./NamingForm";
import { PalmForm } from "./PalmForm";
import { SiteChrome } from "./SiteChrome";

export function ServiceWorkspace({ serviceId }: { serviceId: ServiceId }) {
  const [historyKey, setHistoryKey] = useState(0);
  const active = getService(serviceId);

  const onSaved = useCallback(() => {
    setHistoryKey((k) => k + 1);
  }, []);

  return (
    <SiteChrome>
      <section className="cn-section cn-section-service" aria-labelledby="service-heading">
        <div className="cn-container">
          <div className="mb-4">
            <p className="font-song text-[11px] font-semibold tracking-[0.18em] text-rose">
              云机测算
            </p>
            <h1
              id="service-heading"
              className="mt-0.5 font-song text-xl font-bold tracking-[0.08em] text-daiqing sm:text-2xl"
            >
              {active.label}
            </h1>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              {BAGUA[active.gua].name}卦 · {active.desc} · {active.blurb}
            </p>
          </div>

          <div
            className="cn-workspace-tabs mb-4 rounded-paper border border-daiqing/10 bg-porcelain-card p-1 shadow-card"
            role="navigation"
            aria-label="测算类型"
          >
            <div className="cn-workspace-tabs-scroller flex gap-1">
              {SERVICES.map((t) => {
                const gua = BAGUA[t.gua];
                const on = serviceId === t.id;
                return (
                  <Link
                    key={t.id}
                    href={t.href}
                    aria-current={on ? "page" : undefined}
                    title={t.blurb}
                    className={
                      on
                        ? "cn-chip cn-chip-on shrink-0 justify-center gap-1 px-3"
                        : "cn-chip cn-chip-off shrink-0 justify-center gap-1 px-3"
                    }
                  >
                    <TrigramGlyph
                      lines={gua.lines}
                      className={`h-3 w-4 ${on ? "text-white" : "text-daiqing/50"}`}
                    />
                    <span className="sm:hidden">{t.short}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div key={serviceId} className="cn-panel-in">
            {serviceId === "bazi" ? <BaziForm onSaved={onSaved} /> : null}
            {serviceId === "hepan" ? <HepanForm onSaved={onSaved} /> : null}
            {serviceId === "naming" ? <NamingForm onSaved={onSaved} /> : null}
            {serviceId === "palm" ? <PalmForm onSaved={onSaved} /> : null}
            {serviceId === "history" ? (
              <HistoryPanel refreshKey={historyKey} />
            ) : null}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
