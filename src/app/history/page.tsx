import type { Metadata } from "next";
import { ServiceWorkspace } from "@/components/ServiceWorkspace";

export const metadata: Metadata = {
  title: "历史记录 · 妙算天机",
  description: "回看本机会话内的测算与详批记录。",
};

export default function HistoryPage() {
  return <ServiceWorkspace serviceId="history" />;
}
