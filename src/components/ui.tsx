"use client";

import { clsx } from "clsx";
import {
  cloneElement,
  isValidElement,
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { EleSelect, type EleSelectProps } from "./EleSelect";

export { EleSelect } from "./EleSelect";
export type { EleSelectOption, EleSelectProps } from "./EleSelect";
export { EleUpload } from "./EleUpload";
export type { EleUploadFile, EleUploadProps } from "./EleUpload";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("cn-card overflow-hidden", className)}>{children}</div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="border-b border-daiqing/10 bg-gradient-to-r from-porcelain-muted/40 to-transparent px-5 py-4 sm:px-6">
      <div className="flex items-start gap-3">
        {icon}
        <div className="min-w-0">
          {eyebrow ? (
            <div className="mb-1 font-song text-[11px] font-semibold tracking-[0.2em] text-rose">
              {eyebrow}
            </div>
          ) : null}
          <h3 className="cn-section-title">{title}</h3>
          {subtitle ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={clsx("px-5 py-5 sm:px-6", className)}>{children}</div>;
}

export function Label({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="cn-label" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

/** Element 风格输入框（el-input） */
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx("cn-input", props.className)} />;
}

/**
 * Element 风格下拉（el-select）
 * 支持 children <option> 或 options 数组；表单可用 name + defaultValue。
 */
export function Select(props: EleSelectProps) {
  return <EleSelect {...props} />;
}

/** Element 风格多行输入（el-textarea） */
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={clsx("cn-input min-h-[88px]", props.className)} />
  );
}

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
  },
) {
  const { variant = "primary", className, ...rest } = props;
  const v =
    variant === "primary"
      ? "cn-btn-primary"
      : variant === "secondary"
        ? "cn-btn-secondary"
        : "cn-btn-ghost";
  return <button {...rest} className={clsx(v, className)} />;
}

/** 筛选/维度芯片（统一 cn-chip） */
export function Chip({
  active,
  children,
  className,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type={type}
      className={clsx(
        active ? "cn-chip cn-chip-on" : "cn-chip cn-chip-off",
        className,
      )}
      aria-pressed={active}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  /** 显式指定关联控件 id；省略时自动注入 */
  htmlFor?: string;
}) {
  const autoId = useId();
  const fieldId = htmlFor ?? autoId;

  let control = children;
  if (isValidElement(children)) {
    const el = children as ReactElement<{ id?: string }>;
    if (el.props.id == null) {
      control = cloneElement(el, { id: fieldId });
    } else {
      return (
        <div className="space-y-1.5">
          <label className="cn-label" htmlFor={el.props.id}>
            {label}
          </label>
          {children}
          {hint ? <p className="text-xs text-faint">{hint}</p> : null}
        </div>
      );
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="cn-label" htmlFor={fieldId}>
        {label}
      </label>
      {control}
      {hint ? <p className="text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

export function Alert({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "info";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={clsx(
        "rounded-paper border px-4 py-3 text-sm leading-relaxed",
        tone === "error"
          ? "border-rose/25 bg-rose/10 text-rose"
          : "border-daiqing/15 bg-daiqing/5 text-daiqing",
      )}
    >
      {children}
    </div>
  );
}

/** 实心朱印品牌标 */
export function BrandMark({
  children = "妙",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span className={clsx("cn-mark h-10 w-10 text-sm", className)}>{children}</span>
  );
}

/** 空心双框朱砂印章 */
export function Seal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "cn-seal min-h-10 min-w-10 px-1.5 text-xs tracking-seal",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StepPill({ n, label }: { n: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-paper border border-daiqing/12 bg-porcelain-card px-3 py-1 text-xs text-muted shadow-sm">
      <span className="flex h-5 w-5 items-center justify-center rounded-seal bg-daiqing font-song text-[10px] font-bold text-white">
        {n}
      </span>
      <span className="tracking-wide">{label}</span>
    </span>
  );
}

/** 区块小标题：朱砂眉批 + 宋体主标 */
export function SectionLead({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="font-song text-xs font-semibold tracking-[0.22em] text-rose">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={clsx(
          "font-song text-xl font-bold tracking-[0.1em] text-daiqing",
          eyebrow ? "mt-1" : undefined,
        )}
      >
        {title}
      </h2>
    </div>
  );
}
