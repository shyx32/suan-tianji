import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  // Avoid bundling native/server-only packages incorrectly
  serverExternalPackages: ["pg", "lunar-javascript"],
};

export default nextConfig;
