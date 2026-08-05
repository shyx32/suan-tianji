import type { Metadata } from "next";
import { ServiceWorkspace } from "@/components/ServiceWorkspace";

export const metadata: Metadata = {
  title: "手相观掌 · 妙算天机",
  description: "上传掌纹图像，由模型解读纹路意象。仅供文化娱乐参考。",
};

export default function PalmPage() {
  return <ServiceWorkspace serviceId="palm" />;
}
