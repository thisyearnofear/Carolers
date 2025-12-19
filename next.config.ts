import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
  images: {
    domains: ['img.clerk.com', 'lh3.googleusercontent.com', 'cdn.discordapp.com'],
  },
};

export default nextConfig;