"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, CardBody } from "./ui";

interface Almanac {
  solar: string;
  week: string;
  lunar: string;
  ganZhi: string;
  yi: string[];
  ji: string[];
}

export function AlmanacPanel() {
  const [almanac, setAlmanac] = useState<Almanac | null>(null);
  const [fortune, setFortune] = useState("");
  const [qian, setQian] = useState("");
  const [salt, setSalt] = useState(0);

  const load = useCallback(async (s: number) => {
    const res = await fetch(`/api/almanac?salt=${s}`, { cache: "no-store" });
    const data = await res.json();
    if (data.ok) {
      setAlmanac(data.almanac);
      setFortune(data.fortune.text);
      setQian(data.fortune.qian);
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardBody>
          <div className="text-xs font-semibold tracking-[0.16em] text-daiqing/70">
            通书
          </div>
          <div className="cn-tabular mt-2 text-3xl font-extrabold tracking-tight text-daiqing sm:text-4xl">
            {almanac?.solar ?? "— — —"}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
            <span className="rounded-full bg-porcelain-muted px-2.5 py-0.5">
              {almanac?.week ?? "星期 …"}
            </span>
            <span>农历 {almanac?.lunar ?? "…"}</span>
          </div>
          <div className="mt-2 text-sm text-ink-2">{almanac?.ganZhi ?? "推演中…"}</div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-sage/15 bg-sage/5 p-3">
              <div className="text-xs font-bold text-sage">宜</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(almanac?.yi ?? ["—"]).map((x) => (
                  <span
                    key={x}
                    className="rounded-full bg-white px-2.5 py-0.5 text-xs text-ink-2 shadow-sm"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-rose/15 bg-rose/5 p-3">
              <div className="text-xs font-bold text-rose">忌</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(almanac?.ji ?? ["—"]).map((x) => (
                  <span
                    key={x}
                    className="rounded-full bg-white px-2.5 py-0.5 text-xs text-ink-2 shadow-sm"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="border-rose/15">
        <CardBody className="flex h-full flex-col">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose/10 text-sm font-bold text-rose">
              签
            </span>
            <div>
              <div className="font-bold text-daiqing">今日签文</div>
              <div className="text-xs text-faint">摇一签，看今日气象</div>
            </div>
          </div>
          <p className="mt-5 flex-1 text-lg font-semibold leading-relaxed text-daiqing">
            {qian || "…"}
          </p>
          <p className="mt-2 text-sm text-muted">{fortune || "…"}</p>
          <Button
            variant="secondary"
            className="mt-5 w-full"
            type="button"
            onClick={() => {
              const next = salt + 1;
              setSalt(next);
              void load(next);
            }}
          >
            再摇一签
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
