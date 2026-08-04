"use client";

/**
 * Element Plus 风格下拉选择（el-select）
 * React 实现，视觉与交互对齐 el-select，色板走项目黛青/纸本 token。
 */
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { clsx } from "clsx";

export type EleSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type EleSelectProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  /** 显式选项；也可用 children <option> */
  options?: EleSelectOption[];
  children?: ReactNode;
  /** 受控变更（推荐） */
  onValueChange?: (value: string) => void;
  /**
   * 兼容原生 select 的 onChange 用法：
   * onChange={(e) => setX(e.target.value)}
   */
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  size?: "default" | "small";
};

function parseOptionsFromChildren(children: ReactNode): EleSelectOption[] {
  const out: EleSelectOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type !== "option") return;
    const props = child.props as {
      value?: string | number;
      disabled?: boolean;
      children?: ReactNode;
    };
    const value = String(props.value ?? "");
    const label =
      typeof props.children === "string" || typeof props.children === "number"
        ? String(props.children)
        : value;
    out.push({ value, label, disabled: Boolean(props.disabled) });
  });
  return out;
}

export function EleSelect({
  id,
  name,
  value: valueProp,
  defaultValue = "",
  placeholder = "请选择",
  disabled = false,
  clearable = false,
  className,
  options: optionsProp,
  children,
  onValueChange,
  onChange,
  size = "default",
}: EleSelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const listboxId = `${selectId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [inner, setInner] = useState(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? String(valueProp) : inner;

  const options = useMemo(() => {
    if (optionsProp?.length) return optionsProp;
    return parseOptionsFromChildren(children);
  }, [optionsProp, children]);

  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? "";

  const commit = useCallback(
    (next: string) => {
      if (!controlled) setInner(next);
      onValueChange?.(next);
      onChange?.({ target: { value: next, name } });
    },
    [controlled, name, onChange, onValueChange],
  );

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    if (disabled) return;
    setOpen((o) => !o);
  }

  function pick(opt: EleSelectOption) {
    if (opt.disabled) return;
    commit(opt.value);
    setOpen(false);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    commit("");
  }

  return (
    <div
      ref={rootRef}
      className={clsx(
        "ele-select",
        open && "is-focus",
        disabled && "is-disabled",
        size === "small" && "ele-select--small",
        className,
      )}
    >
      {/* 表单提交兼容 */}
      {name ? <input type="hidden" name={name} value={value} /> : null}

      <div
        id={selectId}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-disabled={disabled || undefined}
        className="ele-select__wrapper"
        onClick={toggle}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span
          className={clsx(
            "ele-select__selection",
            !display && "is-placeholder",
          )}
        >
          {display || placeholder}
        </span>
        <span className="ele-select__suffix">
          {clearable && value && !disabled ? (
            <button
              type="button"
              className="ele-select__clear"
              aria-label="清空"
              onClick={clear}
            >
              ×
            </button>
          ) : null}
          <span className={clsx("ele-select__caret", open && "is-reverse")} aria-hidden>
            ▾
          </span>
        </span>
      </div>

      {open ? (
        <div className="ele-select__popper" role="presentation">
          <ul id={listboxId} role="listbox" className="ele-select__dropdown">
            {options.length === 0 ? (
              <li className="ele-select__empty">暂无数据</li>
            ) : (
              options.map((opt) => {
                const active = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={active}
                    aria-disabled={opt.disabled || undefined}
                    className={clsx(
                      "ele-select__option",
                      active && "is-selected",
                      opt.disabled && "is-disabled",
                    )}
                    onClick={() => pick(opt)}
                  >
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
