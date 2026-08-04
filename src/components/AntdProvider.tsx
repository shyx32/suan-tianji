"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import type { ReactNode } from "react";

/**
 * 全站唯一 UI 组件库：Ant Design 5
 * 主题对齐「白瓷 · 黛青 · 朱印」，保证交互与浏览器兼容性。
 */
export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: "#1a3a52",
            colorInfo: "#1a3a52",
            colorSuccess: "#3d7a62",
            colorWarning: "#8a7348",
            colorError: "#b54a3c",
            colorLink: "#1a3a52",
            colorText: "#1a2332",
            colorTextSecondary: "#5a6b7d",
            colorBorder: "rgba(26, 58, 82, 0.18)",
            colorBorderSecondary: "rgba(26, 58, 82, 0.1)",
            colorBgContainer: "#fffcf7",
            colorBgElevated: "#fffcf7",
            colorBgLayout: "#f6f3ec",
            borderRadius: 6,
            borderRadiusLG: 8,
            borderRadiusSM: 4,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
            controlHeight: 40,
            controlHeightSM: 32,
          },
          components: {
            Button: {
              primaryShadow: "0 8px 20px -10px rgba(181, 74, 60, 0.45)",
              defaultBorderColor: "rgba(26, 58, 82, 0.2)",
              defaultColor: "#1a3a52",
              fontWeight: 600,
            },
            Select: {
              optionSelectedBg: "rgba(26, 58, 82, 0.08)",
              optionActiveBg: "rgba(26, 58, 82, 0.06)",
            },
            Input: {
              activeBorderColor: "rgba(26, 58, 82, 0.55)",
              hoverBorderColor: "rgba(26, 58, 82, 0.35)",
            },
            Upload: {
              colorFillAlter: "rgba(246, 243, 236, 0.65)",
            },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
