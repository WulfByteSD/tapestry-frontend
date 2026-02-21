import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@tapestry/api-client", "@tapestry/rules"]
};

export default nextConfig;
