import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.siraatulmustaqim.com",
        pathname: "/**",
      },
    ],
  },
  allowedDevOrigins: ["*.monkeycode-ai.live"],
};

export default nextConfig;
