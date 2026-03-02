import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // resvg-js and sharp need native modules — mark them as external
  serverExternalPackages: ['@resvg/resvg-js', 'sharp'],
};

export default nextConfig;
