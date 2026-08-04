import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";
import { AntdProvider } from "@/components/AntdProvider";
import "./globals.css";

const song = Noto_Serif_SC({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-song",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "妙算天机 · 云机一测",
  description:
    "生辰八字排盘、双盘合参、宝宝取名、手相观掌与今日运势。结构化命盘与异步详批，仅供文化娱乐参考。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`h-full antialiased ${song.variable}`}>
      <body className="min-h-full bg-porcelain font-sans text-ink antialiased">
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
