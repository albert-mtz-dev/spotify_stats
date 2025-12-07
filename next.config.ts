import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["de0f29a3c51c.ngrok-free.app"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "*.spotifycdn.com",
      },
    ],
  },
};

export default nextConfig;
