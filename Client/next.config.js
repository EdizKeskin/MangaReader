/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "motionbgs.com",
      "www.turkanime.co",
      "monomanga.com",
      "storage.googleapis.com",
      "monomanga.7108c887db85882602a558daa1896428.r2.cloudflarestorage.com",
      "7108c887db85882602a558daa1896428.r2.cloudflarestorage.com",
      "cdn.monomanga.com.tr",
    ],
  },
  experimental: {
    serverActions: true,
  },
  swcMinify: true,
  reactStrictMode: true,
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable experimental features that might be causing issues
  outputFileTracing: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
