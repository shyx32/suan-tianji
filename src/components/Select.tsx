"use client";

/**
 * 基于 Ant Design Select（全站统一 UI 库）
 * 保留 name / option 子节点 / onValueChange 等业务兼容 API。
 */
import {
  Children,
  isValidElement,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Select as AntSelect } from "antd";
import { clsx } from "clsx";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  options?: SelectOption[];
  children?: ReactNode;
  onValueChange?: (value: string) => void;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  size?: "default" | "small";
  allowClear?: boolean;
};

/** @deprecated */
export type EleSelectOption = SelectOption;
/** @deprecated */
export type EleSelectProps = SelectProps;

function parseOptionsFromChildren(children: ReactNode): SelectOption[] {
  const out: SelectOption[] = [];
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

export function Select({
  id,
  name,
  value: valueProp,
  defaultValue,
  placeholder = "请选择",
  disabled = false,
  className,
  options: optionsProp,
  children,
  onValueChange,
  onChange,
  size = "default",
  allowClear = false,
}: SelectProps) {
  const controlled = valueProp !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const value = controlled ? String(valueProp ?? "") : inner;

  const options = useMemo(() => {
    if (optionsProp?.length) return optionsProp;
    return parseOptionsFromChildren(children);
  }, [optionsProp, children]);

  const commit = useCallback(
    (next: string) => {
      if (!controlled) setInner(next);
      onValueChange?.(next);
      onChange?.({ target: { value: next, name } });
    },
    [controlled, name, onChange, onValueChange],
  );

  return (
    <div className={clsx("cn-antd-select w-full", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <AntSelect
        id={id}
        className="w-full"
        style={{ width: "100%" }}
        size={size === "small" ? "small" : "middle"}
        disabled={disabled}
        placeholder={placeholder}
        allowClear={allowClear}
        value={value === "" ? undefined : value}
        defaultValue={
          controlled || !defaultValue ? undefined : defaultValue
        }
        options={options.map((o) => ({
          value: o.value,
          label: o.label,
          disabled: o.disabled,
        }))}
        onChange={(v) => commit(v == null ? "" : String(v))}
        getPopupContainer={(node) => node.parentElement || document.body}
      />
    </div>
  );
}

/** @deprecated 使用 Select */
export const EleSelect = Select;
