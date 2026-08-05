import type { Metadata } from "next";
import { ServiceWorkspace } from "@/components/ServiceWorkspace";

export const metadata: Metadata = {
  title: "双盘合参 · 妙算天机",
  description: "双方八字对照，梳理合冲刑害与相处节奏。仅供文化娱乐参考。",
};

export default function HepanPage() {
  return <ServiceWorkspace serviceId="hepan" />;
}
