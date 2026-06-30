import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  distDir: process.env.DIST_DIR || '.next',

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    // Media is served from the Bunny CDN in production (see redirects() below).
    // Disabling the Next.js image optimizer makes <Image> emit plain
    // /assets/* URLs, so the production redirect to Bunny applies uniformly to
    // <Image>, <img> and <video> alike. In dev the files are served locally.
    unoptimized: true,
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
    qualities: [75, 85, 100],
  },

  // In production, all site media lives on the Bunny CDN (the public/assets
  // files are intentionally kept out of the repo). Redirect every /assets/*
  // request to Bunny. In development the local files under public/assets are
  // served as-is, so no redirect is applied.
  async redirects() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    const cdn = process.env.ASSET_CDN_BASE || 'https://ameraiot.b-cdn.net';
    return [
      {
        source: '/assets/:path*',
        destination: `${cdn}/assets/:path*`,
        permanent: false,
      },
    ];
  },

  async headers() {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};
export default nextConfig;