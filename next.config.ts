import type { NextConfig } from "next";

// Check if we're building for Capacitor (mobile) or web deployment
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  // Only use static export for Capacitor builds
  ...(isCapacitorBuild && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  }),
  
  // For web deployment, use standard Next.js
  ...(!isCapacitorBuild && {
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
    }
  }),
  
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
