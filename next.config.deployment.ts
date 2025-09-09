import type { NextConfig } from "next";

// Configuration for static export (if needed for basic hosting)
const nextConfig: NextConfig = {
  // Uncomment the lines below for static export to Hostinger basic hosting
  // output: 'export',
  // trailingSlash: true,
  // images: {
  //   unoptimized: true
  // },
  
  // Keep these for all deployments
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
