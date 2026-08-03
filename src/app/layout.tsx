import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "妙算天机 · 云机一测",
  description:
    "生辰八字排盘、双盘合参、宝宝取名、手相观掌与今日运势。结构化命盘与异步详批，仅供文化娱乐参考。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-porcelain text-ink antialiased">{children}</body>
    </html>
  );
}
