import type { Metadata } from "next";
import { ServiceWorkspace } from "@/components/ServiceWorkspace";

export const metadata: Metadata = {
  title: "宝宝取名 · 妙算天机",
  description: "结合生辰与风格偏好，给出音形义与五行提示。仅供文化娱乐参考。",
};

export default function NamingPage() {
  return <ServiceWorkspace serviceId="naming" />;
}
