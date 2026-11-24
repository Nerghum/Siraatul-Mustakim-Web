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
  async headers() {
    return [
      {
        source: "/downloads/:path*",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="siratul-mustakim.apk"',
          },
          {
            key: "Content-Type",
            value: "application/vnd.android.package-archive",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ["*.monkeycode-ai.live"],
};

export default nextConfig;
