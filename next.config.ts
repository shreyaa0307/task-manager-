import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
