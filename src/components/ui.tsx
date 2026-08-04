"use client";

/**
 * 全站 UI 出口：交互控件统一 Ant Design，装饰/布局保留国风 cn-*。
 */
import { clsx } from "clsx";
import {
  Button as AntButton,
  Input as AntInput,
  Tag,
} from "antd";
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
import { Select as SelectImpl, type SelectProps } from "./Select";

export type { SelectProps, SelectOption } from "./Select";
/** @deprecated */
export { EleSelect } from "./Select";
export type { EleSelectOption, EleSelectProps } from "./Select";

export {
  FileUpload,
  type FileUploadFile,
  type FileUploadProps,
} from "./FileUpload";
/** @deprecated */
export { FileUpload as EleUpload } from "./FileUpload";
export type {
  FileUploadFile as EleUploadFile,
  FileUploadProps as EleUploadProps,
} from "./FileUpload";

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

/** Ant Design Input */
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const {
    className,
    type,
    value,
    defaultValue,
    onChange,
    disabled,
    id,
    name,
    placeholder,
    required,
    maxLength,
    autoComplete,
    autoFocus,
    onKeyDown,
    ...rest
  } = props;

  // date/time 保留原生控件（antd DatePicker 会改 API）
  if (type === "date" || type === "time" || type === "datetime-local") {
    return (
      <input
        {...rest}
        id={id}
        name={name}
        type={type}
        className={clsx("cn-input", className)}
        value={value as string | number | readonly string[] | undefined}
        defaultValue={defaultValue as string | number | readonly string[] | undefined}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
      />
    );
  }

  if (type === "password") {
    return (
      <AntInput.Password
        id={id}
        name={name}
        className={className}
        value={value as string | undefined}
        defaultValue={defaultValue as string | undefined}
        onChange={onChange as never}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown as never}
        required={required}
      />
    );
  }

  return (
    <AntInput
      id={id}
      name={name}
      type={type}
      className={className}
      value={value as string | undefined}
      defaultValue={defaultValue as string | undefined}
      onChange={onChange as never}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={maxLength}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown as never}
      required={required}
    />
  );
}

/** Ant Design Select 包装 */
export function Select(props: SelectProps) {
  return <SelectImpl {...props} />;
}

/** Ant Design TextArea */
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const {
    className,
    value,
    defaultValue,
    onChange,
    disabled,
    id,
    name,
    placeholder,
    required,
    maxLength,
    rows,
  } = props;
  return (
    <AntInput.TextArea
      id={id}
      name={name}
      className={className}
      value={value as string | undefined}
      defaultValue={defaultValue as string | undefined}
      onChange={onChange as never}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      rows={rows ?? 3}
      autoSize={rows ? undefined : { minRows: 3, maxRows: 8 }}
    />
  );
}

/** Ant Design Button + 国风主色变体 */
export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
  },
) {
  const { variant = "primary", className, type, children, disabled, onClick, ...rest } =
    props;
  const htmlType = type === "submit" || type === "reset" ? type : "button";

  if (variant === "primary") {
    return (
      <AntButton
        type="primary"
        htmlType={htmlType}
        className={clsx("cn-antd-btn-primary", className)}
        disabled={disabled}
        onClick={onClick as never}
        style={{
          background: "linear-gradient(165deg, #c45a4c 0%, #b54a3c 48%, #8f382c 100%)",
          borderColor: "rgba(143, 56, 44, 0.35)",
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
        block={className?.includes("w-full")}
      >
        {children}
      </AntButton>
    );
  }

  if (variant === "secondary") {
    return (
      <AntButton
        htmlType={htmlType}
        className={className}
        disabled={disabled}
        onClick={onClick as never}
        block={className?.includes("w-full")}
      >
        {children}
      </AntButton>
    );
  }

  return (
    <AntButton
      type="text"
      htmlType={htmlType}
      className={className}
      disabled={disabled}
      onClick={onClick as never}
      block={className?.includes("w-full")}
      {...(rest as object)}
    >
      {children}
    </AntButton>
  );
}

/** 可切换芯片：antd CheckableTag */
export function Chip({
  active,
  children,
  className,
  type = "button",
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <Tag.CheckableTag
      checked={Boolean(active)}
      onChange={() => {
        // CheckableTag 用 onChange(boolean)；映射到 button click
        onClick?.({} as never);
      }}
      className={clsx(
        "!m-0 !rounded-[0.3rem] !px-3 !py-1.5 !text-xs !font-semibold !tracking-wide",
        active
          ? "!border !border-daiqing/30 !bg-daiqing !text-white"
          : "!border !border-daiqing/15 !bg-porcelain-card !text-muted",
        className,
      )}
      {...(rest as object)}
    >
      {children}
    </Tag.CheckableTag>
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
