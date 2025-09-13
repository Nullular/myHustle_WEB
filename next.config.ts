import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly NOT using static export
  output: undefined,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https', 
        hostname: 'lh3.googleusercontent.com',
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
