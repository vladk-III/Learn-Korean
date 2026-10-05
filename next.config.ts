import type { NextConfig } from "next";

// Static export so the app can be hosted anywhere (GitHub Pages, Vercel, Netlify)
// and installed on a phone as a PWA. BASE_PATH is set by the Pages workflow.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
