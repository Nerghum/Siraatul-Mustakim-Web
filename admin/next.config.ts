import type { NextConfig } from "next";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// Derive backend origin (without /api path) from the API base URL
const BACKEND_ORIGIN = NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "files.siraatulummah.com",
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
      {
        source: "/files/:path*",
        destination: `${BACKEND_ORIGIN}/files/:path*`,
      },
    ];
  },
};

export default nextConfig;
