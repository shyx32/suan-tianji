import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理员登录 · 妙算天机",
  description: "妙算天机管理员控制台（单管理员，无 RBAC）",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-porcelain text-ink antialiased">{children}</div>
  );
}
