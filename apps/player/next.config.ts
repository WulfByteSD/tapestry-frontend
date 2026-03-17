import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@tapestry/api-client", "@tapestry/rules", "@tapestry/ui"],
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY:
      "BHzWdQAaEufFGtn0zj0hNc_BXDwN98t6NO8-2Hk77y3hFTGZdpxX406RIgg85p9Pc5pwLQDNG2MCknrwb0oP4s8",
    NEXT_PUBLIC_API_ORIGIN:
      process.env.NEXT_PUBLIC_API_ORIGIN ||
      (process.env.NODE_ENV === "production" ? "https://api.tapestry-ttrpg.com" : "http://localhost:5000"),
    NEXT_PUBLIC_VERSION: process.env.npm_package_version,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
