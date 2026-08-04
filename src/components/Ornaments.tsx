"use client";

import { clsx } from "clsx";

/** 后天八卦：上南下北，顺时针 离→坤→兑→乾→坎→艮→震→巽 */
export const BAGUA = [
  { name: "离", nature: "火", lines: [1, 0, 1] as const },
  { name: "坤", nature: "土", lines: [0, 0, 0] as const },
  { name: "兑", nature: "金", lines: [0, 1, 1] as const },
  { name: "乾", nature: "金", lines: [1, 1, 1] as const },
  { name: "坎", nature: "水", lines: [0, 1, 0] as const },
  { name: "艮", nature: "土", lines: [1, 0, 0] as const },
  { name: "震", nature: "木", lines: [0, 0, 1] as const },
  { name: "巽", nature: "木", lines: [1, 1, 0] as const },
] as const;

/** 单卦三爻：1=阳（实线），0=阴（断线） */
export function TrigramGlyph({
  lines,
  className,
  stroke = "currentColor",
}: {
  lines: readonly [number, number, number];
  className?: string;
  stroke?: string;
}) {
  const y = [4, 12, 20];
  return (
    <svg
      viewBox="0 0 32 24"
      className={clsx("inline-block", className)}
      aria-hidden
    >
      {lines.map((yang, i) =>
        yang ? (
          <line
            key={i}
            x1="2"
            y1={y[i]}
            x2="30"
            y2={y[i]}
            stroke={stroke}
            strokeWidth="2.4"
            strokeLinecap="square"
          />
        ) : (
          <g key={i}>
            <line
              x1="2"
              y1={y[i]}
              x2="13"
              y2={y[i]}
              stroke={stroke}
              strokeWidth="2.4"
              strokeLinecap="square"
            />
            <line
              x1="19"
              y1={y[i]}
              x2="30"
              y2={y[i]}
              stroke={stroke}
              strokeWidth="2.4"
              strokeLinecap="square"
            />
          </g>
        ),
      )}
    </svg>
  );
}

/** 太极阴阳鱼 */
export function Taiji({
  className,
  spin = false,
}: {
  className?: string;
  spin?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={clsx(spin && "cn-spin-slow", className)}
      aria-hidden
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <path
        d="M50 2a48 48 0 0 1 0 96 24 24 0 0 0 0-48 24 24 0 0 1 0-48A48 48 0 0 1 50 2z"
        fill="currentColor"
      />
      <path
        d="M50 2a48 48 0 0 0 0 96 24 24 0 0 1 0-48 24 24 0 0 0 0-48A48 48 0 0 0 50 2z"
        fill="currentColor"
        opacity="0.14"
      />
      <circle cx="50" cy="26" r="7.5" fill="currentColor" opacity="0.14" />
      <circle cx="50" cy="74" r="7.5" fill="currentColor" />
      <circle cx="50" cy="26" r="2.6" fill="currentColor" />
      <circle cx="50" cy="74" r="2.6" fill="currentColor" opacity="0.14" />
    </svg>
  );
}

/**
 * 八卦盘：中心太极 + 八方卦象。
 * 轻量 SVG，可用作 Hero 装饰或水印。
 */
export function BaguaWheel({
  className,
  spin = false,
  showNames = true,
  muted = false,
}: {
  className?: string;
  spin?: boolean;
  showNames?: boolean;
  muted?: boolean;
}) {
  const rOuter = 46;
  const rGua = 34;
  return (
    <svg
      viewBox="0 0 120 120"
      className={clsx(spin && "cn-spin-slow", className)}
      aria-hidden
    >
      <circle
        cx="60"
        cy="60"
        r={rOuter}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity={muted ? 0.25 : 0.45}
      />
      <circle
        cx="60"
        cy="60"
        r="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity={muted ? 0.18 : 0.3}
      />
      {/* 八卦方位线 */}
      {BAGUA.map((_, i) => {
        const deg = (i * 45 - 90) * (Math.PI / 180);
        const x2 = 60 + Math.cos(deg) * rOuter;
        const y2 = 60 + Math.sin(deg) * rOuter;
        return (
          <line
            key={`ray-${i}`}
            x1="60"
            y1="60"
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.4"
            opacity={muted ? 0.12 : 0.2}
          />
        );
      })}
      {/* 八个卦象 */}
      {BAGUA.map((g, i) => {
        const deg = (i * 45 - 90) * (Math.PI / 180);
        const cx = 60 + Math.cos(deg) * rGua;
        const cy = 60 + Math.sin(deg) * rGua;
        const rot = i * 45;
        return (
          <g key={g.name} transform={`translate(${cx},${cy}) rotate(${rot})`}>
            <g transform="translate(-8,-6) scale(0.5)">
              {g.lines.map((yang, li) => {
                const yy = 2 + li * 5;
                if (yang) {
                  return (
                    <line
                      key={li}
                      x1="0"
                      y1={yy}
                      x2="16"
                      y2={yy}
                      stroke="currentColor"
                      strokeWidth="1.6"
                      opacity={muted ? 0.45 : 0.85}
                    />
                  );
                }
                return (
                  <g key={li}>
                    <line
                      x1="0"
                      y1={yy}
                      x2="6.2"
                      y2={yy}
                      stroke="currentColor"
                      strokeWidth="1.6"
                      opacity={muted ? 0.45 : 0.85}
                    />
                    <line
                      x1="9.8"
                      y1={yy}
                      x2="16"
                      y2={yy}
                      stroke="currentColor"
                      strokeWidth="1.6"
                      opacity={muted ? 0.45 : 0.85}
                    />
                  </g>
                );
              })}
            </g>
            {showNames ? (
              <text
                y="12"
                textAnchor="middle"
                fill="currentColor"
                fontSize="5.5"
                fontFamily="serif"
                opacity={muted ? 0.4 : 0.7}
                transform={`rotate(${-rot})`}
              >
                {g.name}
              </text>
            ) : null}
          </g>
        );
      })}
      {/* 中心太极 */}
      <g transform="translate(60,60) scale(0.18)">
        <circle cx="0" cy="0" r="48" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <path
          d="M0-48a48 48 0 0 1 0 96 24 24 0 0 0 0-48 24 24 0 0 1 0-48A48 48 0 0 1 0-48z"
          fill="currentColor"
          opacity={muted ? 0.35 : 0.9}
        />
        <path
          d="M0-48a48 48 0 0 0 0 96 24 24 0 0 1 0-48 24 24 0 0 0 0-48A48 48 0 0 0 0-48z"
          fill="currentColor"
          opacity="0.12"
        />
        <circle cx="0" cy="-24" r="7" fill="currentColor" opacity="0.12" />
        <circle cx="0" cy="24" r="7" fill="currentColor" opacity={muted ? 0.35 : 0.9} />
      </g>
    </svg>
  );
}

/** 道教祥云（简笔） */
export function CloudMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden fill="none">
      <path
        d="M10 28c4-10 14-14 22-10 3-8 14-12 22-6 6-8 18-8 24 0 8-4 18 0 20 8 8 0 14 6 12 12H12c-4-2-6-4-2-4z"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.55"
      />
      <path
        d="M28 30c3-6 10-8 16-5 2-5 10-8 16-4 4-5 12-5 16 0 5-2 12 1 13 6"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.35"
      />
    </svg>
  );
}

/** 页面背景用水印八卦（大而淡）；定位由 className 控制 */
export function BaguaWatermark({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "pointer-events-none z-0 select-none text-daiqing",
        className,
      )}
      aria-hidden
    >
      <BaguaWheel
        className="h-full w-full opacity-[0.05]"
        spin
        muted
        showNames={false}
      />
    </div>
  );
}

/** 五行小标：木火土金水 */
export function WuxingDots({ className }: { className?: string }) {
  const items = [
    { label: "木", color: "bg-sage" },
    { label: "火", color: "bg-rose" },
    { label: "土", color: "bg-gold" },
    { label: "金", color: "bg-daiqing-mid" },
    { label: "水", color: "bg-daiqing" },
  ];
  return (
    <div
      className={clsx("flex items-center gap-2", className)}
      aria-hidden
    >
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1">
          <span className={clsx("h-1.5 w-1.5 rounded-full", it.color)} />
          <span className="font-song text-[10px] tracking-widest text-faint">
            {it.label}
          </span>
        </span>
      ))}
    </div>
  );
}
