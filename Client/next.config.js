/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    appDir: true,
  },
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
  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
