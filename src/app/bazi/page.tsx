import type { Metadata } from "next";
import { ServiceWorkspace } from "@/components/ServiceWorkspace";

export const metadata: Metadata = {
  title: "生辰八字 · 妙算天机",
  description: "四柱排盘、同步结构与异步详批。仅供文化娱乐参考。",
};

export default function BaziPage() {
  return <ServiceWorkspace serviceId="bazi" />;
}
