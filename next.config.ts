import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    '*': ['vendor/paper-repository/papers/*/paper.pdf'],
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
