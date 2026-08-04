"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { BaguaWheel, Taiji } from "./Ornaments";
import { Button, Seal } from "./ui";

export type QianPhase = "idle" | "shaking" | "drawn" | "reveal";

export type QianResult = {
  qian?: string;
  text?: string;
  title?: string;
  level?: string;
  meaning?: string;
  tip?: string;
};

const RUNES = ["乾", "坤", "震", "巽", "坎", "离", "艮", "兑", "天", "机", "玄", "元"];

function MysticalField({ phase }: { phase: Exclude<QianPhase, "idle"> }) {
  return (
    <div className="qian-mystic" aria-hidden>
      {/* 远景八卦盘 */}
      <div className={clsx("qian-mystic-bagua", phase !== "shaking" && "is-slow")}>
        <BaguaWheel className="h-full w-full" spin showNames={false} muted />
      </div>
      <div className="qian-mystic-bagua qian-mystic-bagua--counter">
        <BaguaWheel className="h-full w-full" spin showNames={false} muted />
      </div>

      {/* 中心太极 */}
      <div className={clsx("qian-mystic-taiji", phase === "reveal" && "is-bright")}>
        <Taiji className="h-full w-full" spin={phase === "shaking"} />
      </div>

      {/* 能量环 */}
      <span className="qian-orbit qian-orbit-a" />
      <span className="qian-orbit qian-orbit-b" />
      <span className="qian-orbit qian-orbit-c" />

      {/* 浮游符文 */}
      {RUNES.map((ch, i) => (
        <span
          key={ch + i}
          className={clsx("qian-rune font-song", `qian-rune-${i % 8}`)}
          style={{ ["--ri" as string]: i }}
        >
          {ch}
        </span>
      ))}

      {/* 光柱 / 星屑 */}
      <div className={clsx("qian-beam", phase !== "shaking" && "is-on")} />
      <div className="qian-stars">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="qian-star" style={{ ["--si" as string]: i }} />
        ))}
      </div>

      {/* 墨烟 */}
      <span className="qian-ink qian-ink-a" />
      <span className="qian-ink qian-ink-b" />
      <span className="qian-ink qian-ink-c" />
    </div>
  );
}

function QianTubeVisual({
  phase,
  label,
  size = "lg",
}: {
  phase: Exclude<QianPhase, "idle">;
  label?: string;
  size?: "lg" | "md";
}) {
  const sticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const isShake = phase === "shaking";
  const isDrawn = phase === "drawn" || phase === "reveal";

  return (
    <div
      className={clsx(
        "qian-stage qian-stage--full",
        size === "lg" && "qian-stage--lg",
        isShake && "is-shaking",
        isDrawn && "is-drawn",
        phase === "reveal" && "is-reveal",
      )}
      aria-hidden
    >
      <div className="qian-glow qian-glow--core" />
      <div className="qian-glow qian-glow--outer" />
      <span className="qian-spark qian-spark-a" />
      <span className="qian-spark qian-spark-b" />
      <span className="qian-spark qian-spark-c" />
      <span className="qian-spark qian-spark-d" />
      <span className="qian-spark qian-spark-e" />

      <div className="qian-tube-wrap">
        {/* 筒底法阵 */}
        <div className={clsx("qian-mandala", isShake && "is-spin", isDrawn && "is-flare")} />

        <div className="qian-tube">
          <div className="qian-tube-rim" />
          <div className="qian-tube-body">
            <div className="qian-tube-sigil font-song">天机</div>
            <div className="qian-tube-band" />
            <div className="qian-sticks">
              {sticks.map((i) => (
                <span
                  key={i}
                  className={clsx("qian-stick", isDrawn && i === 4 && "is-winner")}
                  style={{ ["--i" as string]: i }}
                />
              ))}
            </div>
          </div>
          <div className="qian-tube-base" />
        </div>

        <div className={clsx("qian-flying", isDrawn && "is-out")}>
          <div className="qian-flying-trail" />
          <div className="qian-flying-stick">
            <span className="qian-flying-tip">{label?.slice(0, 2) || "签"}</span>
          </div>
          <div className="qian-flying-ring" />
          <div className="qian-flying-ring qian-flying-ring--delay" />
        </div>
      </div>
    </div>
  );
}

/**
 * 全屏摇签：玄幻光场 + 签筒 + 揭晓
 */
export function QianFullscreen({
  open,
  phase,
  label,
  result,
  onClose,
}: {
  open: boolean;
  phase: QianPhase;
  label?: string;
  result?: QianResult | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && phase === "reveal") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, onClose]);

  if (!open || phase === "idle") return null;
  if (typeof document === "undefined") return null;

  const showResult = phase === "reveal";
  const animPhase = phase as "shaking" | "drawn" | "reveal";

  return createPortal(
    <div
      className={clsx(
        "qian-fullscreen",
        phase === "shaking" && "is-shaking",
        phase === "drawn" && "is-drawn",
        phase === "reveal" && "is-reveal",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="摇签"
      aria-live="polite"
    >
      <div className="qian-fullscreen-bg" />
      <div className="qian-fullscreen-veil" />
      <div className="qian-fullscreen-mist" />
      <MysticalField phase={animPhase} />

      <div className="qian-fullscreen-inner">
        <div className="qian-fullscreen-header">
          <Seal className="qian-fullscreen-seal h-11 min-w-11 border-white/40 text-xs text-white/90">
            天机
          </Seal>
          <p className="qian-fullscreen-eyebrow font-song">
            {phase === "shaking"
              ? "静心 · 签筒轻摇 · 玄机未显"
              : phase === "drawn"
                ? "灵签破空 · 一念已定"
                : "心有所问 · 签有所答"}
          </p>
        </div>

        <QianTubeVisual
          phase={animPhase}
          label={showResult ? label : "签"}
          size="lg"
        />

        {showResult ? (
          <div className="qian-fullscreen-result qian-result is-enter">
            <div className="qian-fullscreen-result-aura" />
            {result?.level ? (
              <span className="qian-fullscreen-level font-song">
                {result.level}签
                {result.title ? ` · ${result.title}` : ""}
              </span>
            ) : null}
            <p className="qian-fullscreen-poem font-kai">
              {result?.qian || "…"}
            </p>
            <div className="qian-fullscreen-divider" aria-hidden />
            <p className="qian-fullscreen-text">{result?.text || ""}</p>
            {result?.tip ? (
              <p className="qian-fullscreen-tip font-song">「{result.tip}」</p>
            ) : null}
            {result?.meaning ? (
              <p className="qian-fullscreen-meaning">{result.meaning}</p>
            ) : null}

            <div className="qian-fullscreen-actions">
              <Button type="button" variant="primary" onClick={onClose}>
                收入通书
              </Button>
            </div>
          </div>
        ) : (
          <p className="qian-fullscreen-status font-song">
            {phase === "shaking" ? "莫问吉凶 · 先观此心 · 灵台空明" : "签落定音 · 玄光收敛…"}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** @deprecated 使用 QianFullscreen */
export function QianTube(props: {
  phase: QianPhase;
  label?: string;
  className?: string;
}) {
  if (props.phase === "idle") return null;
  return (
    <div className={props.className}>
      <QianTubeVisual phase={props.phase} label={props.label} size="md" />
    </div>
  );
}
