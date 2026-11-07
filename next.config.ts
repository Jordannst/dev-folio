import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  experimental: { globalNotFound: true },
};

export default nextConfig;
