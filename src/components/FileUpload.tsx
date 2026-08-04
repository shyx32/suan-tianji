"use client";

/**
 * 基于 Ant Design Upload（picture-card）
 */
import { useEffect, useMemo, useState } from "react";
import { Upload, type UploadFile, type UploadProps as AntUploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { clsx } from "clsx";

export type FileUploadFile = {
  uid: string;
  name: string;
  url: string;
  raw: File;
  status: "ready" | "success" | "fail";
};

export type FileUploadProps = {
  file?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  tip?: string;
  className?: string;
  listType?: "picture-card" | "picture" | "text";
  drag?: boolean;
};

export function FileUpload({
  file,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/*",
  maxSizeMb = 2.5,
  disabled = false,
  tip = "支持 jpg / png / webp，建议掌心朝上、光线充足",
  className,
  listType = "picture-card",
}: FileUploadProps) {
  const [err, setErr] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const fileList: UploadFile[] = useMemo(() => {
    if (!file) return [];
    return [
      {
        uid: "palm-1",
        name: file.name,
        status: "done",
        url: previewUrl || undefined,
        originFileObj: file as UploadFile["originFileObj"],
      },
    ];
  }, [file, previewUrl]);

  const beforeUpload: AntUploadProps["beforeUpload"] = (f) => {
    setErr(null);
    if (!f.type.startsWith("image/")) {
      setErr("只能上传图片文件");
      onChange?.(null);
      return Upload.LIST_IGNORE;
    }
    if (f.size > maxSizeMb * 1024 * 1024) {
      setErr(`图片大小不能超过 ${maxSizeMb}MB`);
      onChange?.(null);
      return Upload.LIST_IGNORE;
    }
    onChange?.(f);
    return false;
  };

  return (
    <div className={clsx("cn-antd-upload", className)}>
      <Upload
        accept={accept}
        listType={listType === "text" ? "text" : "picture-card"}
        maxCount={1}
        disabled={disabled}
        fileList={fileList}
        beforeUpload={beforeUpload}
        onRemove={() => {
          onChange?.(null);
          setErr(null);
        }}
      >
        {!file ? (
          <div className="flex flex-col items-center justify-center text-muted">
            <PlusOutlined />
            <span className="mt-1 text-xs tracking-wide">上传手掌照片</span>
          </div>
        ) : null}
      </Upload>
      {tip ? <p className="mt-2 text-xs leading-relaxed text-faint">{tip}</p> : null}
      {err ? (
        <p className="mt-1 text-xs text-rose" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}
