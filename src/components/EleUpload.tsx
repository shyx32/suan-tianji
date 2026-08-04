"use client";

/**
 * Element Plus 风格上传组件（el-upload picture-card）
 * 本项目为 React/Next，无法直接使用 Vue 的 element-plus；
 * 此组件对齐 el-upload 的 picture-card / 拖拽交互与视觉规范。
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { clsx } from "clsx";

export type EleUploadFile = {
  uid: string;
  name: string;
  url: string;
  raw: File;
  status: "ready" | "success" | "fail";
};

export type EleUploadProps = {
  /** 受控：当前选中的文件（单文件模式） */
  file?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  /** 最大体积 MB，默认 2.5 */
  maxSizeMb?: number;
  disabled?: boolean;
  tip?: string;
  className?: string;
  /** list-type: picture-card | picture | text — 默认 picture-card（与 el-upload 一致） */
  listType?: "picture-card" | "picture" | "text";
  drag?: boolean;
};

function uid() {
  return `ele-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function EleUpload({
  file,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/*",
  maxSizeMb = 2.5,
  disabled = false,
  tip = "支持 jpg / png / webp，建议掌心朝上、光线充足",
  className,
  listType = "picture-card",
  drag = true,
}: EleUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [item, setItem] = useState<EleUploadFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // sync external file → preview item
  useEffect(() => {
    if (!file) {
      setItem((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return null;
      });
      return;
    }
    setItem((prev) => {
      if (prev?.raw === file) return prev;
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return {
        uid: uid(),
        name: file.name,
        url: URL.createObjectURL(file),
        raw: file,
        status: "success",
      };
    });
  }, [file]);

  useEffect(() => {
    return () => {
      if (item?.url) URL.revokeObjectURL(item.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = useCallback(
    (f: File): string | null => {
      if (!f.type.startsWith("image/")) return "只能上传图片文件";
      if (f.size > maxSizeMb * 1024 * 1024) {
        return `图片大小不能超过 ${maxSizeMb}MB`;
      }
      return null;
    },
    [maxSizeMb],
  );

  const pick = useCallback(
    (f: File | null) => {
      setErr(null);
      if (!f) {
        onChange?.(null);
        return;
      }
      const msg = validate(f);
      if (msg) {
        setErr(msg);
        onChange?.(null);
        return;
      }
      onChange?.(f);
    },
    [onChange, validate],
  );

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    pick(f);
    // allow re-select same file
    e.target.value = "";
  }

  function clear() {
    pick(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function openPicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0] || null;
    pick(f);
  }

  const showCard = listType === "picture-card";

  return (
    <div className={clsx("ele-upload", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="ele-upload__input"
        disabled={disabled}
        onChange={onInputChange}
      />

      {showCard ? (
        <div className="ele-upload__card-list">
          {item ? (
            <div className="ele-upload__card ele-upload__card--filled">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.name} className="ele-upload__thumb" />
              <div className="ele-upload__card-mask">
                <button
                  type="button"
                  className="ele-upload__icon-btn"
                  title="预览"
                  onClick={() => window.open(item.url, "_blank")}
                >
                  👁
                </button>
                <button
                  type="button"
                  className="ele-upload__icon-btn"
                  title="删除"
                  disabled={disabled}
                  onClick={clear}
                >
                  🗑
                </button>
              </div>
            </div>
          ) : null}

          {!item ? (
            <div
              role="button"
              tabIndex={0}
              className={clsx(
                "ele-upload__card ele-upload__card--trigger",
                dragOver && "is-dragover",
                disabled && "is-disabled",
              )}
              onClick={openPicker}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openPicker();
              }}
              onDragOver={(e) => {
                if (!drag || disabled) return;
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={drag ? onDrop : undefined}
            >
              <span className="ele-upload__plus">+</span>
              <span className="ele-upload__trigger-text">上传手掌照片</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={clsx(
            "ele-upload__dragger",
            dragOver && "is-dragover",
            disabled && "is-disabled",
          )}
          onClick={openPicker}
          onDragOver={(e) => {
            if (!drag || disabled) return;
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={drag ? onDrop : undefined}
        >
          <div className="ele-upload__dragger-icon">⇪</div>
          <div className="ele-upload__dragger-text">
            将文件拖到此处，或 <em>点击上传</em>
          </div>
          {item ? (
            <div className="ele-upload__file-name">
              {item.name}
              <button type="button" className="ele-upload__link" onClick={(e) => { e.stopPropagation(); clear(); }}>
                移除
              </button>
            </div>
          ) : null}
        </div>
      )}

      {tip ? <p className="ele-upload__tip">{tip}</p> : null}
      {err ? (
        <p className="ele-upload__error" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}
