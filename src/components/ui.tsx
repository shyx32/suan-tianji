import { clsx } from "clsx";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={clsx("cn-card overflow-hidden", className)}>{children}</div>;
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
    <div className="border-b border-daiqing/8 px-5 py-4 sm:px-6">
      <div className="flex items-start gap-3">
        {icon}
        <div className="min-w-0">
          {eyebrow ? (
            <div className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-rose">
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

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx("cn-input", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx("cn-input", props.className)} />;
}

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

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="cn-label">{label}</div>
      {children}
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
      className={clsx(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed",
        tone === "error"
          ? "border-rose/25 bg-rose/10 text-rose"
          : "border-daiqing/15 bg-daiqing/5 text-daiqing",
      )}
    >
      {children}
    </div>
  );
}

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

export function Seal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <BrandMark className={className}>{children}</BrandMark>;
}

export function StepPill({ n, label }: { n: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-daiqing/10 bg-white px-3 py-1 text-xs text-muted shadow-sm">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-daiqing text-[10px] font-bold text-white">
        {n}
      </span>
      {label}
    </span>
  );
}
